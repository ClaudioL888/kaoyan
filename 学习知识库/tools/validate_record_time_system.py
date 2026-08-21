from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SUBJECT_DIRS = [ROOT / "math2", ROOT / "408", ROOT / "english2", ROOT / "politics"]
REQUIRED = {
    "record_id", "recorded_at", "record_date", "time_zone", "time_status",
    "subject", "unit_id", "record_type", "title", "summary", "source_file",
    "question_refs", "source_status",
}

MARKDOWN_TIME_MARKERS = (
    "记录时间：",
    "接受时间：",
    "归档时间：",
    "接受与原始归档时间：",
    "框架预留时间：",
    "最近增量时间：",
)


def main() -> None:
    markdown = [path for root in SUBJECT_DIRS for path in root.rglob("*.md")]
    json_files = [path for root in SUBJECT_DIRS for path in root.rglob("*.json")]
    missing_stamps = []
    for path in markdown:
        text = path.read_text(encoding="utf-8")
        if not any(marker in text for marker in MARKDOWN_TIME_MARKERS):
            missing_stamps.append(str(path))
    assert not missing_stamps, missing_stamps

    missing_json_time = []
    for path in json_files:
        data = json.loads(path.read_text(encoding="utf-8"))
        timestamp = data.get("recorded_at") or data.get("accepted_at")
        time_zone = data.get("record_time_zone")
        if not timestamp or time_zone not in {None, "Asia/Shanghai"}:
            missing_json_time.append(str(path))
    assert not missing_json_time, missing_json_time

    rows = []
    ids = set()
    for line in (ROOT / "activity_log.jsonl").read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        row = json.loads(line)
        assert REQUIRED <= row.keys(), (row.get("record_id"), REQUIRED - row.keys())
        assert row["record_id"] not in ids, row["record_id"]
        ids.add(row["record_id"])
        recorded = datetime.fromisoformat(row["recorded_at"])
        assert recorded.utcoffset().total_seconds() == 8 * 3600, row["recorded_at"]
        assert row["record_date"] == recorded.date().isoformat(), row["record_id"]
        assert row["time_zone"] == "Asia/Shanghai", row["record_id"]
        assert (ROOT / row["source_file"]).is_file(), row["source_file"]
        rows.append(row)

    print(json.dumps({
        "markdown_files_with_time": len(markdown),
        "json_files_with_time": len(json_files),
        "activity_records": len(rows),
        "unique_record_ids": len(ids),
        "status": "PASS",
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
