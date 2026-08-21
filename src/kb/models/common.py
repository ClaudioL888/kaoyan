"""Shared models for immutable assets and page-relative geometry."""

from __future__ import annotations

from enum import StrEnum
from pathlib import PurePosixPath
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class StrictModel(BaseModel):
    """Canonical records reject unknown fields and validate post-construction assignments."""

    model_config = ConfigDict(extra="forbid", validate_assignment=True)


class AssetKind(StrEnum):
    ORIGINAL_PDF = "original_pdf"
    EMBEDDED_PAGE_IMAGE = "embedded_page_image"
    RENDERED_PAGE_IMAGE = "rendered_page_image"
    ANALYSIS_PAGE_IMAGE = "analysis_page_image"
    FORMULA_CROP = "formula_crop"
    FIGURE_CROP = "figure_crop"
    TABLE_CROP = "table_crop"


class BBox(StrictModel):
    """Rectangle in a named raster coordinate space: left/top inclusive, right/bottom exclusive."""

    model_config = ConfigDict(extra="forbid", validate_assignment=True, frozen=True)

    x0: Annotated[int, Field(ge=0)]
    y0: Annotated[int, Field(ge=0)]
    x1: Annotated[int, Field(gt=0)]
    y1: Annotated[int, Field(gt=0)]

    @model_validator(mode="after")
    def has_positive_area(self) -> "BBox":
        if self.x1 <= self.x0 or self.y1 <= self.y0:
            raise ValueError("bbox must have positive area")
        return self


class CropSpec(StrictModel):
    parent_asset_id: str
    bbox: BBox
    padding_px: Annotated[int, Field(ge=0)] = 0


class ContentAsset(StrictModel):
    """A file in managed storage; business objects reference asset_id, never a raw path."""

    asset_id: str
    kind: AssetKind
    relative_path: str
    sha256: str = Field(pattern=r"^[0-9a-f]{64}$")
    mime_type: str
    byte_size: Annotated[int, Field(gt=0)]
    width_px: Annotated[int | None, Field(gt=0)] = None
    height_px: Annotated[int | None, Field(gt=0)] = None
    derived_from_asset_id: str | None = None
    crop_spec: CropSpec | None = None

    @field_validator("relative_path")
    @classmethod
    def relative_storage_path_only(cls, value: str) -> str:
        path = PurePosixPath(value)
        if path.is_absolute() or ".." in path.parts:
            raise ValueError("relative_path must be a relative POSIX path without '..'")
        return value

    @model_validator(mode="after")
    def validate_image_dimensions_and_derivation(self) -> "ContentAsset":
        image_asset = self.kind is not AssetKind.ORIGINAL_PDF
        if image_asset and (self.width_px is None or self.height_px is None):
            raise ValueError("image assets require width_px and height_px")
        is_crop = self.kind in {AssetKind.FORMULA_CROP, AssetKind.FIGURE_CROP, AssetKind.TABLE_CROP}
        if is_crop != (self.crop_spec is not None):
            raise ValueError("crop assets must have crop_spec; non-crop assets must not")
        if self.kind is not AssetKind.ORIGINAL_PDF and self.derived_from_asset_id is None:
            raise ValueError("derived assets must identify their parent asset")
        return self


class PageRendition(StrictModel):
    """A concrete raster image and its explicit mapping back to PDF page points."""

    rendition_id: str
    page_id: str
    asset_id: str
    width_px: Annotated[int, Field(gt=0)]
    height_px: Annotated[int, Field(gt=0)]
    dpi: Annotated[int | None, Field(gt=0)] = None
    coordinate_system: Literal["pixel_top_left"] = "pixel_top_left"
    pdf_page_width_pt: Annotated[float, Field(gt=0)]
    pdf_page_height_pt: Annotated[float, Field(gt=0)]
    # x_pdf=a*x_px+c*y_px+e; y_pdf=b*x_px+d*y_px+f, in PDF points.
    transform_to_pdf: tuple[float, float, float, float, float, float]


class SourceAnchor(StrictModel):
    """The non-optional provenance location for any extracted content."""

    page_id: str
    rendition_id: str
    bbox: BBox
