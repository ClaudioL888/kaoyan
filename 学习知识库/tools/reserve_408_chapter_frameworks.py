from __future__ import annotations

import json
from pathlib import Path

from build_subject_skeletons import (
    CO,
    DS,
    FRAMEWORK_TEMPLATE_UPDATED_AT,
    NET,
    OS,
    ROOT,
    chapter_framework_text,
)


SUBJECTS = [
    ("data-structures", "408.data-structures", DS),
    ("computer-organization", "408.computer-organization", CO),
    ("operating-systems", "408.operating-systems", OS),
    ("computer-networks", "408.computer-networks", NET),
]


def write_json(path: Path, data: dict) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    created = 0
    preserved = 0
    wording_refreshed = 0
    updated_meta = 0

    for folder, subject, items in SUBJECTS:
        base = ROOT / "408" / folder
        catalog_path = base / "catalog.json"
        catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
        catalog_entries = {entry["chapter_id"]: entry for entry in catalog["chapters"]}

        for item in items:
            chapter_dir = base / item["slug"]
            chapter_path = chapter_dir / "chapter.json"
            chapter = json.loads(chapter_path.read_text(encoding="utf-8"))
            framework_path = chapter_dir / "chapter_framework.md"

            if framework_path.exists():
                preserved += 1
                existing_text = framework_path.read_text(encoding="utf-8")
                old_wording = "> 状态：仅预留结构（reserved-empty）；尚未扫描或整理本章，不代表已掌握、已复习或已完成。"
                new_wording = "> 状态：本文件仅预留结构（reserved-empty），尚未向这些新栏目填充内容；章节既有复盘状态以 `chapter.json` 和 `reviews/` 为准，本文件本身不代表已掌握、已复习或已完成。"
                if old_wording in existing_text:
                    framework_path.write_text(existing_text.replace(old_wording, new_wording), encoding="utf-8")
                    wording_refreshed += 1
            else:
                framework_path.write_text(chapter_framework_text(chapter["title"], subject), encoding="utf-8")
                created += 1

            framework_meta = {
                "framework_file": "chapter_framework.md",
                "framework_template_version": "1.0",
                "framework_template_status": "reserved-empty",
                "framework_template_updated_at": FRAMEWORK_TEMPLATE_UPDATED_AT,
            }
            if any(chapter.get(key) != value for key, value in framework_meta.items()):
                chapter.update(framework_meta)
                write_json(chapter_path, chapter)
                updated_meta += 1

            entry = catalog_entries[item["chapter_id"]]
            entry.update(framework_meta)

        catalog["framework_template_updated_at"] = FRAMEWORK_TEMPLATE_UPDATED_AT
        write_json(catalog_path, catalog)

    print(json.dumps({
        "framework_files_created": created,
        "existing_framework_files_preserved": preserved,
        "framework_wording_refreshed": wording_refreshed,
        "chapter_metadata_updated": updated_meta,
        "course_content_written": False,
        "activity_log_written": False,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
