"""Cross-record and on-disk integrity checks used as the pre-bulk ingestion gate."""

from __future__ import annotations

from hashlib import sha256
from pathlib import Path

from kb.models.common import ContentAsset, PageRendition
from kb.models.schema import Document, Page, PageProcessRecord
from kb.services.serialization import read_json, read_jsonl


def validate_document_snapshot(storage_root: Path, document_dir: Path) -> list[str]:
    issues: list[str] = []
    structured = document_dir / "structured"
    document = Document.model_validate(read_json(document_dir / "document.json"))
    pages = [Page.model_validate(item) for item in read_jsonl(structured / "pages.jsonl")]
    renditions = [PageRendition.model_validate(item) for item in read_jsonl(structured / "renditions.jsonl")]
    assets = [ContentAsset.model_validate(item) for item in read_jsonl(structured / "assets.jsonl")]
    statuses = [PageProcessRecord.model_validate(item) for item in read_jsonl(structured / "page_status.jsonl")]

    page_by_id = {page.page_id: page for page in pages}
    rendition_by_id = {rendition.rendition_id: rendition for rendition in renditions}
    asset_by_id = {asset.asset_id: asset for asset in assets}

    if set(document.page_ids) != set(page_by_id):
        issues.append("document.page_ids do not match pages.jsonl")
    if set(document.asset_ids) != set(asset_by_id):
        issues.append("document.asset_ids do not match assets.jsonl")

    for asset in assets:
        path = storage_root / asset.relative_path
        if not path.is_file():
            issues.append(f"missing asset file: {asset.asset_id}")
            continue
        digest = sha256(path.read_bytes()).hexdigest()
        if digest != asset.sha256:
            issues.append(f"asset hash mismatch: {asset.asset_id}")

    for page in pages:
        for rendition_id in page.rendition_ids:
            if rendition_id not in rendition_by_id:
                issues.append(f"page references missing rendition: {page.page_id} -> {rendition_id}")

    for rendition in renditions:
        if rendition.page_id not in page_by_id:
            issues.append(f"rendition references missing page: {rendition.rendition_id}")
        asset = asset_by_id.get(rendition.asset_id)
        if asset is None:
            issues.append(f"rendition references missing asset: {rendition.rendition_id}")
            continue
        if (asset.width_px, asset.height_px) != (rendition.width_px, rendition.height_px):
            issues.append(f"rendition/asset dimensions differ: {rendition.rendition_id}")
        a, b, c, d, e, f = rendition.transform_to_pdf
        mapped_right = a * rendition.width_px + c * rendition.height_px + e
        mapped_bottom = b * rendition.width_px + d * rendition.height_px + f
        if abs(mapped_right - rendition.pdf_page_width_pt) > 1.0:
            issues.append(f"x transform drift exceeds 1pt: {rendition.rendition_id}")
        if abs(mapped_bottom) > 1.0:
            issues.append(f"y transform drift exceeds 1pt: {rendition.rendition_id}")

    status_page_ids = {status.page_id for status in statuses}
    if not set(page_by_id).issubset(status_page_ids):
        issues.append("one or more materialized pages have no page status")
    return issues
