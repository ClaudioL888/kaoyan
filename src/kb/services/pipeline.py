"""Small, inspectable Phase 1 ingestion pipeline with source registry and page retry records."""

from __future__ import annotations

from pathlib import Path

from kb.models.schema import Document, Source, SourceKind, SourceVersion
from kb.services.ingest import register_source
from kb.services.page_images import materialize_pages
from kb.services.serialization import write_json, write_jsonl


def _persist_source_registry(storage_root: Path, source: Source, version: SourceVersion) -> None:
    source_path = storage_root / "registry" / "sources" / f"{source.source_id}.json"
    if source_path.exists():
        existing = Source.model_validate_json(source_path.read_text(encoding="utf-8"))
        if (existing.title, existing.subject, existing.kind) != (source.title, source.subject, source.kind):
            raise ValueError(f"source_id metadata conflict: {source.source_id}")
    else:
        write_json(source_path, source)
    version_path = storage_root / "registry" / "source_versions" / source.source_id / f"{version.content_sha256}.json"
    write_json(version_path, version)


def ingest_image_only_pdf(
    *, source_path: Path, storage_root: Path, source_id: str, title: str,
    subject: str, kind: SourceKind, render_dpi: int = 144,
) -> Path:
    """Register a PDF, materialize every page, and persist inspectable canonical snapshots."""
    source, version, original_pdf = register_source(
        source_path=source_path, storage_root=storage_root, source_id=source_id,
        title=title, subject=subject, kind=kind,
    )
    _persist_source_registry(storage_root, source, version)
    records = materialize_pages(
        storage_root=storage_root, source_version=version,
        original_pdf=original_pdf, render_dpi=render_dpi,
    )
    document_dir = storage_root / "documents" / version.source_id / version.content_sha256[:16]
    structured_dir = document_dir / "structured"
    successful = [record for record in records if record.page is not None]
    assets = [original_pdf]
    for record in records:
        if record.asset is not None:
            assets.append(record.asset)
        if record.native_asset is not None:
            assets.append(record.native_asset)
    document = Document(
        document_id=f"DOC:{version.source_version_id}",
        source_version_id=version.source_version_id,
        title=source.title,
        page_ids=[record.page.page_id for record in successful if record.page is not None],
        asset_ids=[asset.asset_id for asset in assets],
        structured_root=structured_dir.relative_to(storage_root).as_posix(),
    )
    write_json(document_dir / "document.json", document)
    write_jsonl(structured_dir / "pages.jsonl", [record.page for record in successful if record.page is not None])
    write_jsonl(structured_dir / "renditions.jsonl", [record.rendition for record in successful if record.rendition is not None])
    write_jsonl(structured_dir / "assets.jsonl", assets)
    write_jsonl(structured_dir / "page_status.jsonl", [record.status for record in records])
    return document_dir
