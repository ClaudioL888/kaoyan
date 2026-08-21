from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path
from typing import Any


REQUIRED_TEXT_FIELDS = (
    "schema_version",
    "frontend_contract_version",
    "review_id",
    "dossier_id",
    "subject",
    "unit_id",
    "scope",
    "template_id",
    "template_version",
    "accepted_at",
    "review_path",
    "assembled_normalized_sha256",
    "archived_file_sha256",
)
ALLOWED_STATUSES = {"exact-single", "exact-assembled"}
SHA256_RE = re.compile(r"^[0-9a-f]{64}$")


def normalized_text(path: Path) -> str:
    raw = path.read_bytes().decode("utf-8-sig")
    return raw.replace("\r\n", "\n").replace("\r", "\n")


def digest(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def text_field(manifest: dict[str, Any], key: str, errors: list[str]) -> str:
    value = manifest.get(key)
    if not isinstance(value, str) or not value.strip():
        errors.append(f"{key}: must be a non-empty string")
        return ""
    return value


def is_within(child: Path, parent: Path) -> bool:
    try:
        child.relative_to(parent)
        return True
    except ValueError:
        return False


def validate_manifest(path: Path, kb_root: Path) -> tuple[dict[str, Any] | None, list[str]]:
    errors: list[str] = []
    try:
        manifest = json.loads(normalized_text(path))
    except Exception as exc:
        return None, [f"invalid JSON: {exc}"]
    if not isinstance(manifest, dict):
        return None, ["manifest root must be an object"]

    for key in REQUIRED_TEXT_FIELDS:
        text_field(manifest, key, errors)
    review_id = manifest.get("review_id")

    if manifest.get("artifact_status") not in ALLOWED_STATUSES:
        errors.append("artifact_status: expected exact-single or exact-assembled")
    if manifest.get("user_accuracy_confirmed") is not True:
        errors.append("user_accuracy_confirmed: expected true")
    if manifest.get("user_archive_authorized") is not True:
        errors.append("user_archive_authorized: expected true")

    review_rel = manifest.get("review_path")
    if isinstance(review_rel, str) and review_rel:
        review_path = (path.parent / review_rel).resolve()
        expected_name = path.name.removesuffix(".review-manifest.json") + ".md"
        if Path(review_rel).name != review_rel or review_path.parent != path.parent.resolve():
            errors.append("review_path: must be a filename in the manifest directory")
        if review_path.name != expected_name:
            errors.append(f"review_path: expected same-stem file {expected_name}")
        if not is_within(review_path, kb_root.resolve()):
            errors.append("review_path: resolves outside knowledge-base root")
        elif not review_path.is_file():
            errors.append(f"review_path: file does not exist: {review_path}")
        else:
            actual_hash = digest(normalized_text(review_path))
            if actual_hash != manifest.get("archived_file_sha256"):
                errors.append("archived_file_sha256: does not match review content")

    segments = manifest.get("segments")
    if not isinstance(segments, list) or not segments:
        errors.append("segments: expected a non-empty array")
        segments = []
    expected_sequences = list(range(1, len(segments) + 1))
    actual_sequences = [segment.get("sequence") if isinstance(segment, dict) else None for segment in segments]
    if actual_sequences != expected_sequences:
        errors.append(f"segments: sequence must be contiguous in stored order; got {actual_sequences}")
    if manifest.get("segment_count") != len(segments):
        errors.append("segment_count: does not match segments length")
    expected_status = "exact-single" if len(segments) == 1 else "exact-assembled"
    if segments and manifest.get("artifact_status") != expected_status:
        errors.append(f"artifact_status: expected {expected_status} for {len(segments)} segment(s)")
    for index, segment in enumerate(segments, start=1):
        if not isinstance(segment, dict):
            errors.append(f"segments[{index}]: must be an object")
            continue
        if not isinstance(segment.get("revision"), int) or segment["revision"] < 1:
            errors.append(f"segments[{index}].revision: expected positive integer")
        if not isinstance(segment.get("character_count"), int) or segment["character_count"] < 1:
            errors.append(f"segments[{index}].character_count: expected positive integer")
        if not SHA256_RE.fullmatch(str(segment.get("normalized_sha256", ""))):
            errors.append(f"segments[{index}].normalized_sha256: invalid SHA-256")
    for key in ("assembled_normalized_sha256", "archived_file_sha256"):
        if not SHA256_RE.fullmatch(str(manifest.get(key, ""))):
            errors.append(f"{key}: invalid SHA-256")

    supersedes = manifest.get("supersedes_review_ids", [])
    if not isinstance(supersedes, list) or any(not isinstance(item, str) or not item.strip() for item in supersedes):
        errors.append("supersedes_review_ids: expected an array of non-empty review IDs")
    elif len(set(supersedes)) != len(supersedes):
        errors.append("supersedes_review_ids: duplicate target")
    elif review_id in supersedes:
        errors.append("supersedes_review_ids: review cannot supersede itself")

    return manifest, errors


def validate_tree(kb_root: Path) -> dict[str, Any]:
    paths = sorted(kb_root.rglob("*.review-manifest.json"))
    records: list[tuple[Path, dict[str, Any]]] = []
    issues: list[dict[str, Any]] = []
    for path in paths:
        manifest, errors = validate_manifest(path, kb_root)
        if manifest is not None:
            records.append((path, manifest))
        if errors:
            issues.append({"manifest": str(path), "errors": errors})

    by_id: dict[str, list[Path]] = {}
    for path, manifest in records:
        review_id = manifest.get("review_id")
        if isinstance(review_id, str) and review_id:
            by_id.setdefault(review_id, []).append(path)
    for review_id, duplicate_paths in by_id.items():
        if len(duplicate_paths) > 1:
            issues.append({
                "manifest": review_id,
                "errors": ["duplicate review_id: " + ", ".join(map(str, duplicate_paths))],
            })

    known_ids = set(by_id)
    graph: dict[str, list[str]] = {}
    for path, manifest in records:
        review_id = manifest.get("review_id")
        supersedes = manifest.get("supersedes_review_ids", [])
        if not isinstance(review_id, str) or not isinstance(supersedes, list):
            continue
        graph[review_id] = [item for item in supersedes if isinstance(item, str)]
        missing = [item for item in graph[review_id] if item not in known_ids]
        if missing:
            issues.append({"manifest": str(path), "errors": [f"unknown superseded review_id: {item}" for item in missing]})

    def visit(node: str, trail: tuple[str, ...]) -> None:
        if node in trail:
            cycle = " -> ".join((*trail[trail.index(node):], node))
            issues.append({"manifest": node, "errors": [f"supersession cycle: {cycle}"]})
            return
        for target in graph.get(node, []):
            visit(target, (*trail, node))

    for node in graph:
        visit(node, ())

    return {
        "knowledge_base": str(kb_root.resolve()),
        "manifest_count": len(paths),
        "valid": not issues,
        "issue_count": len(issues),
        "issues": issues,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate frontend review publication artifacts.")
    parser.add_argument(
        "--knowledge-base",
        type=Path,
        default=Path(__file__).resolve().parents[1],
        help="Knowledge-base root; defaults to the parent of tools/.",
    )
    args = parser.parse_args()
    report = validate_tree(args.knowledge_base.resolve())
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if report["valid"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
