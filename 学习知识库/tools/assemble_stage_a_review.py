from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
from typing import Any


REQUIRED_TOP_LEVEL = (
    "review_id",
    "dossier_id",
    "subject",
    "unit_id",
    "scope",
    "template_id",
    "template_version",
    "accepted_at",
    "user_accuracy_confirmed",
    "user_archive_authorized",
    "segments",
)


def read_utf8_normalized(path: Path) -> str:
    raw = path.read_bytes().decode("utf-8-sig")
    return raw.replace("\r\n", "\n").replace("\r", "\n")


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def require_text(value: Any, field: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{field} must be a non-empty string")
    return value


def validate_draft(draft: dict[str, Any], base: Path) -> list[dict[str, Any]]:
    missing = [key for key in REQUIRED_TOP_LEVEL if key not in draft]
    if missing:
        raise ValueError(f"missing required fields: {', '.join(missing)}")
    if draft["user_accuracy_confirmed"] is not True:
        raise ValueError("user_accuracy_confirmed must be true")
    if draft["user_archive_authorized"] is not True:
        raise ValueError("user_archive_authorized must be true")

    segments = draft["segments"]
    if not isinstance(segments, list) or not segments:
        raise ValueError("segments must be a non-empty array")

    ordered = sorted(segments, key=lambda item: item.get("sequence", 0))
    expected = list(range(1, len(ordered) + 1))
    actual = [item.get("sequence") for item in ordered]
    if actual != expected:
        raise ValueError(f"segment sequence must be contiguous from 1; got {actual}")

    seen_identity: set[tuple[str, str]] = set()
    for item in ordered:
        revision = item.get("revision")
        if not isinstance(revision, int) or revision < 1:
            raise ValueError("every segment revision must be a positive integer")
        require_text(item.get("scope"), "segment.scope")
        turn_id = require_text(item.get("turn_id"), "segment.turn_id")
        item_id = require_text(item.get("item_id"), "segment.item_id")
        identity = (turn_id, item_id)
        if identity in seen_identity:
            raise ValueError(f"duplicate segment source: {turn_id}/{item_id}")
        seen_identity.add(identity)
        segment_path = Path(require_text(item.get("path"), "segment.path"))
        if not segment_path.is_absolute():
            segment_path = (base / segment_path).resolve()
        if not segment_path.is_file():
            raise ValueError(f"segment file does not exist: {segment_path}")
        item["_resolved_path"] = segment_path
    return ordered


def atomic_write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_name(f".{path.name}.tmp")
    temp.write_text(content, encoding="utf-8", newline="\n")
    os.replace(temp, path)


def build_artifact(draft_path: Path, review_path: Path, manifest_path: Path) -> None:
    draft = json.loads(read_utf8_normalized(draft_path))
    if not isinstance(draft, dict):
        raise ValueError("draft manifest must be a JSON object")
    for key in REQUIRED_TOP_LEVEL[:-3]:
        require_text(draft.get(key), key)
    ordered = validate_draft(draft, draft_path.parent)

    if review_path.exists() or manifest_path.exists():
        raise FileExistsError("refusing to overwrite an existing review or manifest")

    rendered_segments: list[str] = []
    manifest_segments: list[dict[str, Any]] = []
    normalized_bodies: list[str] = []
    for item in ordered:
        body = read_utf8_normalized(item["_resolved_path"])
        if not body.strip():
            raise ValueError(f"segment {item['sequence']} is empty")
        body_hash = sha256_text(body)
        normalized_bodies.append(body)
        rendered_segments.append(
            "\n".join(
                (
                    f"<!-- BEGIN ACCEPTED STAGE A SEGMENT {item['sequence']}/{len(ordered)} ",
                    f"scope={json.dumps(item['scope'], ensure_ascii=False)} ",
                    f"turn_id={json.dumps(item['turn_id'])} item_id={json.dumps(item['item_id'])} ",
                    f"sha256={body_hash} -->\n",
                    body,
                    f"\n<!-- END ACCEPTED STAGE A SEGMENT {item['sequence']}/{len(ordered)} -->",
                )
            )
        )
        manifest_segments.append(
            {
                "sequence": item["sequence"],
                "revision": item["revision"],
                "scope": item["scope"],
                "turn_id": item["turn_id"],
                "item_id": item["item_id"],
                "character_count": len(body),
                "normalized_sha256": body_hash,
            }
        )

    assembled_body = "\n\n".join(normalized_bodies)
    header = (
        f"# {draft['scope']}｜已接受完整复盘\n\n"
        f"> review_id：`{draft['review_id']}`  \n"
        f"> dossier_id：`{draft['dossier_id']}`  \n"
        f"> 接受时间：{draft['accepted_at']}  \n"
        f"> 正文状态：由 {len(ordered)} 个已验收会话段按原序拼接；段内正文未改写。\n"
    )
    review_content = header + "\n" + "\n\n".join(rendered_segments) + "\n"

    formal_manifest = {
        key: value
        for key, value in draft.items()
        if key not in {"segments", "user_accuracy_confirmed", "user_archive_authorized"}
    }
    formal_manifest.update(
        {
            "schema_version": "1.0",
            "frontend_contract_version": "1.0",
            "artifact_status": "exact-single" if len(ordered) == 1 else "exact-assembled",
            "user_accuracy_confirmed": True,
            "user_archive_authorized": True,
            "review_path": review_path.name,
            "segment_count": len(ordered),
            "segments": manifest_segments,
            "assembled_character_count": len(assembled_body),
            "assembled_normalized_sha256": sha256_text(assembled_body),
            "archived_file_sha256": sha256_text(review_content),
        }
    )

    atomic_write(review_path, review_content)
    try:
        atomic_write(
            manifest_path,
            json.dumps(formal_manifest, ensure_ascii=False, indent=2) + "\n",
        )
    except Exception:
        review_path.unlink(missing_ok=True)
        raise

    reread_review = read_utf8_normalized(review_path)
    reread_manifest = json.loads(read_utf8_normalized(manifest_path))
    if sha256_text(reread_review) != formal_manifest["archived_file_sha256"]:
        raise RuntimeError("review verification failed after write")
    if reread_manifest["assembled_normalized_sha256"] != sha256_text(assembled_body):
        raise RuntimeError("manifest verification failed after write")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Assemble accepted Stage A segments into one review and frontend manifest."
    )
    parser.add_argument("--draft-manifest", required=True, type=Path)
    parser.add_argument("--review-out", required=True, type=Path)
    parser.add_argument("--manifest-out", required=True, type=Path)
    args = parser.parse_args()

    review_path = args.review_out.resolve()
    manifest_path = args.manifest_out.resolve()
    if review_path.suffix.lower() != ".md":
        raise ValueError("--review-out must end in .md")
    if not manifest_path.name.endswith(".review-manifest.json"):
        raise ValueError("--manifest-out must end in .review-manifest.json")
    if review_path.parent != manifest_path.parent:
        raise ValueError("review and manifest must be written to the same directory")

    build_artifact(args.draft_manifest.resolve(), review_path, manifest_path)
    print(json.dumps({"review": str(review_path), "manifest": str(manifest_path)}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
