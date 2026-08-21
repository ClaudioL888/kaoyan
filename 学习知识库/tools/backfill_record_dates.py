from __future__ import annotations

import hashlib
import json
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TZ = timezone(timedelta(hours=8), name="Asia/Shanghai")
# One-time migration timestamp. Keep stable on reruns so backfilled records do not
# appear to move between reporting windows.
NOW = datetime(2026, 8, 19, 20, 5, 1, tzinfo=TZ)
BACKFILL_AT = NOW.isoformat()
BACKFILL_DATE = NOW.date().isoformat()
SUBJECT_ROOTS = {"math2", "408", "english2", "politics"}


def first_heading(text: str, fallback: str) -> str:
    for line in text.splitlines():
        if line.startswith("# "):
            return line[2:].strip()
    return fallback


def stamp_markdown(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    if "> 记录时间：" in text:
        return False
    lines = text.splitlines()
    insert_at = 1 if lines and lines[0].startswith("# ") else 0
    stamp = [
        "",
        f"> 记录时间：{NOW.strftime('%Y-%m-%d %H:%M:%S')} +08:00",
        "> 时间状态：既有内容回填（按用户指示，现有内容统一以 2026-08-19 为记录日期；不代表原题或资料发布日期）",
    ]
    lines[insert_at:insert_at] = stamp
    path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
    return True


def is_content_record(path: Path, text: str) -> bool:
    rel = path.relative_to(ROOT)
    if rel.parts[0] not in SUBJECT_ROOTS:
        return False
    if path.name == ".gitkeep":
        return False
    if "\\reviews\\" in str(path) or "/reviews/" in rel.as_posix():
        return path.suffix.lower() == ".md"
    if path.name == "user_weaknesses.md" and "暂无可确认的个人薄弱点" in text and "### " not in text:
        return False
    no_content_markers = ["当前无。", "当前尚无已确认条目。", "当前尚无已确认内容。"]
    if any(marker in text for marker in no_content_markers):
        substantive = [line for line in text.splitlines() if line.startswith("## ") and line not in {"## 已确认增量", "## 已确认薄弱点"}]
        if not substantive:
            return False
    return path.suffix.lower() == ".md"


def subject_for(path: Path) -> str:
    rel = path.relative_to(ROOT)
    if rel.parts[0] != "408":
        return rel.parts[0]
    return "408." + rel.parts[1]


def unit_for(path: Path, subject: str) -> str:
    current = path.parent
    while current != ROOT and ROOT in current.parents:
        for name, key in [("chapter.json", "chapter_id"), ("module.json", "module_id")]:
            meta = current / name
            if meta.exists():
                return json.loads(meta.read_text(encoding="utf-8"))[key]
        current = current.parent
    return subject + ".aggregate"


def record_type_for(path: Path) -> str:
    if "reviews" in path.parts:
        return "accepted-review"
    mapping = {
        "textbook_knowledge.md": "textbook-knowledge",
        "question_methods.md": "question-method",
        "evidence_and_language.md": "evidence-language",
        "answer_methods.md": "answer-method",
        "knowledge_cards.md": "knowledge-card",
        "concept_boundaries.md": "concept-boundary",
        "stable_rules.md": "stable-rule",
        "user_weaknesses.md": "user-weakness",
    }
    return mapping.get(path.name, "knowledge-note")


def summary_for(text: str, title: str) -> str:
    candidates = []
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or stripped.startswith(">") or stripped.startswith("```"):
            continue
        if stripped in {"当前无。", "当前尚无已确认条目。", "当前尚无已确认内容。"}:
            continue
        candidates.append(stripped.lstrip("- "))
        if len("；".join(candidates)) >= 260:
            break
    return ("；".join(candidates)[:320] or f"{title} 的既有确认内容，详细内容见源文件。")


def question_refs(text: str) -> list[str]:
    patterns = [
        r"(?:Q|q)\d{1,3}",
        r"第\s*\d{1,3}\s*题",
        r"(?:基础篇|强化篇)?第?\d{1,3}[—-]\d{1,3}题",
        r"20\d{2}\s*年[^\s，。；]{0,12}(?:第\s*\d{1,3}\s*题|Q\d{1,3})",
        r"\d+\.\d+-(?:\d{1,3})(?:[—-]\d{1,3})?",
        r"\d+\.\d+\s*(?:选择题|应用题)\s*\d{1,3}[—-]\d{1,3}",
        r"例\d+\.\d+",
    ]
    hits = []
    for pattern in patterns:
        hits.extend(re.findall(pattern, text))
    return list(dict.fromkeys(hits))[:30]


def update_json_metadata(path: Path) -> None:
    data = json.loads(path.read_text(encoding="utf-8"))
    data["recorded_at"] = data.get("recorded_at", BACKFILL_AT)
    data["record_time_zone"] = "Asia/Shanghai"
    data["record_time_status"] = data.get("record_time_status", "backfilled-existing")
    for key in ("accepted_reviews", "chapters", "modules"):
        for item in data.get(key, []):
            if isinstance(item, dict):
                item["recorded_at"] = item.get("recorded_at", item.get("accepted_at", BACKFILL_AT))
                item["record_time_zone"] = "Asia/Shanghai"
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    stamped = 0
    content_paths = []
    for subject_root in [ROOT / "math2", ROOT / "408", ROOT / "english2", ROOT / "politics"]:
        for path in subject_root.rglob("*.md"):
            original = path.read_text(encoding="utf-8")
            if is_content_record(path, original):
                content_paths.append(path)
            stamped += int(stamp_markdown(path))
        for path in subject_root.rglob("*.json"):
            update_json_metadata(path)

    log_path = ROOT / "activity_log.jsonl"
    existing = []
    existing_ids = set()
    if log_path.exists():
        for line in log_path.read_text(encoding="utf-8").splitlines():
            if line.strip():
                row = json.loads(line)
                if row.get("time_status") != "backfilled-existing":
                    existing.append(row)
                    existing_ids.add(row["record_id"])

    added = 0
    for path in sorted(content_paths):
        rel = path.relative_to(ROOT).as_posix()
        record_id = "backfill-20260819-" + hashlib.sha256(rel.encode("utf-8")).hexdigest()[:16]
        if record_id in existing_ids:
            continue
        text = path.read_text(encoding="utf-8")
        title = first_heading(text, path.stem)
        subject = subject_for(path)
        row = {
            "record_id": record_id,
            "recorded_at": BACKFILL_AT,
            "record_date": BACKFILL_DATE,
            "time_zone": "Asia/Shanghai",
            "time_status": "backfilled-existing",
            "subject": subject,
            "unit_id": unit_for(path, subject),
            "record_type": record_type_for(path),
            "title": title,
            "summary": summary_for(text, title),
            "source_file": rel,
            "question_refs": question_refs(text),
            "source_status": "既有已确认内容；按用户指示统一回填为2026-08-19",
        }
        existing.append(row)
        existing_ids.add(record_id)
        added += 1

    log_path.write_text("".join(json.dumps(row, ensure_ascii=False) + "\n" for row in existing), encoding="utf-8")
    for folder in ["daily", "weekly", "biweekly"]:
        report_dir = ROOT / "periodic-reports" / folder
        report_dir.mkdir(parents=True, exist_ok=True)
        (report_dir / ".gitkeep").touch(exist_ok=True)

    manifest = {
        "schema_version": "1.0",
        "backfilled_at": BACKFILL_AT,
        "backfill_date": BACKFILL_DATE,
        "time_zone": "Asia/Shanghai",
        "markdown_files_stamped": stamped,
        "content_records_added_to_activity_log": added,
        "activity_log_total_records": len(existing),
        "note": "现有内容按用户指示统一视为2026-08-19记录；不代表原题或来源发布日期。",
    }
    (ROOT / "record_time_backfill_manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(manifest, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
