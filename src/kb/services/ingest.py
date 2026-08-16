"""Minimal, non-destructive source registration for the Phase 1 pipeline."""

from __future__ import annotations

from hashlib import sha256
from pathlib import Path
from shutil import copy2

from kb.ids import make_source_version_id, validate_source_id
from kb.models.common import AssetKind, ContentAsset
from kb.models.schema import Source, SourceKind, SourceVersion


def sha256_file(path: Path) -> str:
    digest = sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def register_source(
    *,
    source_path: Path,
    storage_root: Path,
    source_id: str,
    title: str,
    subject: str,
    kind: SourceKind,
) -> tuple[Source, SourceVersion, ContentAsset]:
    """Copy a PDF into managed immutable storage and return its initial canonical records.

    The caller may inspect the returned models before serializing them. Existing original
    assets are reused when the byte hash matches, so a repeated registration never overwrites
    the user's source file or creates a second copy of identical bytes.
    """
    validate_source_id(source_id)
    source_path = source_path.resolve(strict=True)
    if source_path.suffix.lower() != ".pdf":
        raise ValueError("only PDF sources are supported by the initial registrar")

    content_sha256 = sha256_file(source_path)
    source_version_id = make_source_version_id(source_id, content_sha256)
    # Logical IDs use ':' as namespace separators, which Windows cannot use in paths.
    # Keep identity and storage addressing separate by using the content hash as the directory key.
    target_dir = storage_root / "sources" / source_id / content_sha256[:16]
    target_pdf = target_dir / "source.pdf"
    target_dir.mkdir(parents=True, exist_ok=True)
    if not target_pdf.exists():
        copy2(source_path, target_pdf)
    elif sha256_file(target_pdf) != content_sha256:
        raise RuntimeError(f"managed source path has unexpected bytes: {target_pdf}")

    relative_path = target_pdf.relative_to(storage_root).as_posix()
    asset = ContentAsset(
        asset_id=f"ASSET:{source_version_id}:ORIGINAL_PDF",
        kind=AssetKind.ORIGINAL_PDF,
        relative_path=relative_path,
        sha256=content_sha256,
        mime_type="application/pdf",
        byte_size=target_pdf.stat().st_size,
    )
    source = Source(source_id=source_id, title=title, subject=subject, kind=kind)
    version = SourceVersion(
        source_version_id=source_version_id,
        source_id=source_id,
        content_sha256=content_sha256,
        original_pdf_asset_id=asset.asset_id,
    )
    return source, version, asset

