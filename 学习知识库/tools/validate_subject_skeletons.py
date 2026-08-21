from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


CATALOGS = [
    ROOT / "math2" / "catalog.json",
    ROOT / "408" / "data-structures" / "catalog.json",
    ROOT / "408" / "computer-organization" / "catalog.json",
    ROOT / "408" / "operating-systems" / "catalog.json",
    ROOT / "408" / "computer-networks" / "catalog.json",
    ROOT / "english2" / "catalog.json",
    ROOT / "politics" / "catalog.json",
]


def main() -> None:
    checked = 0
    skeletons = 0
    organized_or_linked = 0
    accepted_review_refs = 0
    all_ids: set[str] = set()

    for catalog_path in CATALOGS:
        catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
        assert catalog["framework_status"] == "ready", catalog_path
        entries = catalog.get("chapters", catalog.get("modules", []))
        local_paths: set[str] = set()
        for entry in entries:
            item_id = entry.get("chapter_id", entry.get("module_id"))
            assert item_id and item_id not in all_ids, item_id
            all_ids.add(item_id)
            rel = entry["path"]
            assert rel not in local_paths, (catalog_path, rel)
            local_paths.add(rel)
            unit_dir = catalog_path.parent / rel
            assert unit_dir.is_dir(), unit_dir
            meta_name = "chapter.json" if "chapters" in catalog else "module.json"
            meta = json.loads((unit_dir / meta_name).read_text(encoding="utf-8"))
            assert meta["framework_status"] == "ready", unit_dir
            assert isinstance(meta["confirmed_increment_count"], int), unit_dir
            assert meta["organization_status"] in {"skeleton", "partially-organized", "organized"}, unit_dir
            if catalog.get("subject", "").startswith("408."):
                framework_path = unit_dir / meta.get("framework_file", "chapter_framework.md")
                assert framework_path.is_file(), framework_path
                framework_text = framework_path.read_text(encoding="utf-8")
                if meta["organization_status"] == "skeleton":
                    assert "仅预留结构（reserved-empty）" in framework_text, framework_path
                assert "章首问题台账" in framework_text, framework_path
                assert "思维拓展" in framework_text, framework_path
            if meta["organization_status"] == "skeleton":
                skeletons += 1
            else:
                organized_or_linked += 1
            for review in meta.get("accepted_reviews", []):
                review_path = unit_dir / review["path"]
                assert review_path.is_file(), review
                manifest_path = review.get("manifest_path")
                if manifest_path:
                    assert (unit_dir / manifest_path).is_file(), review
                accepted_review_refs += 1
            checked += 1

        for review in catalog.get("accepted_reviews", []):
            assert (catalog_path.parent / review["path"]).is_file(), review

    manifest = json.loads((ROOT / "framework_manifest.json").read_text(encoding="utf-8"))
    assert manifest["totals"]["unit_count"] == checked
    assert manifest["totals"]["skeleton_count"] == skeletons
    assert manifest["totals"]["organized_or_linked_count"] == organized_or_linked
    print(json.dumps({
        "catalogs": len(CATALOGS),
        "units": checked,
        "skeletons": skeletons,
        "organized_or_linked": organized_or_linked,
        "unique_ids": len(all_ids),
        "accepted_review_refs": accepted_review_refs,
        "status": "PASS",
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
