"""Materialize canonical page renditions with explicit PDF coordinate transforms."""

from __future__ import annotations

from dataclasses import dataclass
from hashlib import sha256
from io import BytesIO
from pathlib import Path

import pdfplumber
from PIL import Image
from pypdf import PdfReader

from kb.ids import make_page_id
from kb.models.common import AssetKind, ContentAsset, PageRendition
from kb.models.schema import Page, PageProcessRecord, PageProcessStatus, SourceVersion


@dataclass(frozen=True)
class PageMaterialization:
    page: Page | None
    rendition: PageRendition | None
    asset: ContentAsset | None
    native_asset: ContentAsset | None
    status: PageProcessRecord


_FORMAT_DETAILS = {
    "PNG": ("png", "image/png"),
    "JPEG": ("jpg", "image/jpeg"),
    "JPEG2000": ("jp2", "image/jp2"),
    "TIFF": ("tiff", "image/tiff"),
}


def _write_immutable(path: Path, data: bytes) -> str:
    digest = sha256(data).hexdigest()
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        if sha256(path.read_bytes()).hexdigest() != digest:
            raise RuntimeError(f"refusing to overwrite a different immutable asset: {path}")
    else:
        path.write_bytes(data)
    return digest


def _native_asset(
    *, storage_root: Path, document_root: Path, source_version: SourceVersion,
    original_pdf: ContentAsset, pdf_page, page_index: int,
) -> ContentAsset | None:
    images = list(pdf_page.images)
    if len(images) != 1:
        return None
    data = images[0].data
    with Image.open(BytesIO(data)) as image:
        image_format = image.format or "PNG"
        width_px, height_px = image.size
    suffix, mime_type = _FORMAT_DETAILS.get(image_format, ("bin", "application/octet-stream"))
    path = document_root / "pages" / f"p{page_index + 1:04d}.native.{suffix}"
    _write_immutable(path, data)
    return ContentAsset(
        asset_id=f"ASSET:{source_version.source_version_id}:PAGE:{page_index + 1:04d}:NATIVE",
        kind=AssetKind.EMBEDDED_PAGE_IMAGE,
        relative_path=path.relative_to(storage_root).as_posix(),
        sha256=sha256(data).hexdigest(),
        mime_type=mime_type,
        byte_size=len(data),
        width_px=width_px,
        height_px=height_px,
        derived_from_asset_id=original_pdf.asset_id,
    )


def materialize_pages(
    *, storage_root: Path, source_version: SourceVersion, original_pdf: ContentAsset,
    render_dpi: int = 144, attempt: int = 1, page_indexes: set[int] | None = None,
) -> list[PageMaterialization]:
    """Render every page at one canonical DPI while preserving native scan images when present.

    A failed page becomes a PageProcessRecord and does not prevent later pages from completing.
    The canonical analysis rendition is always the full-page render, whose affine transform is
    deterministic from DPI and PDF media-box height; native XObjects are auxiliary assets only.
    """
    if render_dpi <= 0:
        raise ValueError("render_dpi must be positive")
    source_path = storage_root / original_pdf.relative_path
    reader = PdfReader(str(source_path))
    document_root = storage_root / "documents" / source_version.source_id / source_version.content_sha256[:16]
    results: list[PageMaterialization] = []

    with pdfplumber.open(source_path) as pdf:
        for page_index, pdf_page in enumerate(reader.pages):
            if page_indexes is not None and page_index not in page_indexes:
                continue
            page_id = make_page_id(source_version.source_version_id, page_index)
            page_height_pt = float(pdf_page.mediabox.height)
            page_width_pt = float(pdf_page.mediabox.width)
            native_asset: ContentAsset | None = None
            try:
                native_asset = _native_asset(
                    storage_root=storage_root, document_root=document_root,
                    source_version=source_version, original_pdf=original_pdf,
                    pdf_page=pdf_page, page_index=page_index,
                )
                rendered = pdf.pages[page_index].to_image(resolution=render_dpi).original.convert("RGB")
                width_px, height_px = rendered.size
                buffer = BytesIO()
                rendered.save(buffer, format="PNG")
                data = buffer.getvalue()
                path = document_root / "pages" / f"p{page_index + 1:04d}.analysis-{render_dpi}dpi.png"
                _write_immutable(path, data)
                asset = ContentAsset(
                    asset_id=f"ASSET:{source_version.source_version_id}:PAGE:{page_index + 1:04d}:ANALYSIS-{render_dpi}DPI",
                    kind=AssetKind.ANALYSIS_PAGE_IMAGE,
                    relative_path=path.relative_to(storage_root).as_posix(),
                    sha256=sha256(data).hexdigest(),
                    mime_type="image/png",
                    byte_size=len(data),
                    width_px=width_px,
                    height_px=height_px,
                    derived_from_asset_id=original_pdf.asset_id,
                )
                scale = 72.0 / render_dpi
                transform = (scale, 0.0, 0.0, -scale, 0.0, page_height_pt)
                rendition = PageRendition(
                    rendition_id=f"RND:{page_id}:ANALYSIS-{render_dpi}DPI",
                    page_id=page_id,
                    asset_id=asset.asset_id,
                    width_px=width_px,
                    height_px=height_px,
                    dpi=render_dpi,
                    pdf_page_width_pt=page_width_pt,
                    pdf_page_height_pt=page_height_pt,
                    transform_to_pdf=transform,
                )
                page = Page(
                    page_id=page_id,
                    source_version_id=source_version.source_version_id,
                    pdf_page_index=page_index,
                    rendition_ids=[rendition.rendition_id],
                )
                status = PageProcessRecord(
                    page_id=page_id, source_version_id=source_version.source_version_id,
                    pdf_page_index=page_index, status=PageProcessStatus.COMPLETED, attempt=attempt,
                )
                results.append(PageMaterialization(page, rendition, asset, native_asset, status))
            except Exception as exc:
                status = PageProcessRecord(
                    page_id=page_id, source_version_id=source_version.source_version_id,
                    pdf_page_index=page_index, status=PageProcessStatus.RETRYABLE, attempt=attempt,
                    error_code=type(exc).__name__, error_message=str(exc),
                )
                results.append(PageMaterialization(None, None, None, native_asset, status))
    return results


def extract_native_page_images(
    *, storage_root: Path, source_version: SourceVersion, original_pdf: ContentAsset,
) -> list[PageMaterialization]:
    """Backward-compatible name; now returns canonical rendered pages plus native assets."""
    return materialize_pages(
        storage_root=storage_root, source_version=source_version, original_pdf=original_pdf,
    )



