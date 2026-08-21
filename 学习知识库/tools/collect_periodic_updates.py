from __future__ import annotations

import argparse
import json
from datetime import datetime, time, timedelta, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TZ = timezone(timedelta(hours=8), name="Asia/Shanghai")


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--days", type=int, choices=[1, 7, 14], required=True)
    parser.add_argument("--as-of", help="YYYY-MM-DD; defaults to current local date")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    as_of = datetime.strptime(args.as_of, "%Y-%m-%d").date() if args.as_of else datetime.now(TZ).date()
    end = datetime.combine(as_of, time.min, TZ)
    start = end - timedelta(days=args.days)
    rows = []
    log_path = ROOT / "activity_log.jsonl"
    if log_path.exists():
        for line in log_path.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            row = json.loads(line)
            recorded = datetime.fromisoformat(row["recorded_at"])
            if start <= recorded < end:
                rows.append(row)
    rows.sort(key=lambda row: (row["subject"], row["recorded_at"], row["record_id"]))
    print(json.dumps({
        "window": {"start": start.isoformat(), "end": end.isoformat(), "days": args.days},
        "count": len(rows),
        "records": rows,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
