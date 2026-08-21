"""Stable boundary between external OCR/layout tools and the internal schema."""

from __future__ import annotations

from abc import ABC, abstractmethod
from pathlib import Path

from kb.models.common import ContentAsset, PageRendition, StrictModel
from kb.models.schema import BlockObservation, FigureObservation, FormulaObservation, Page, ParseRun


class ParserPageInput(StrictModel):
    """All page context an adapter needs; adapters do not resolve hidden global IDs."""

    page: Page
    rendition: PageRendition
    asset: ContentAsset
    absolute_image_path: Path


class ParsedPage(StrictModel):
    page_id: str
    rendition_id: str
    observations: list[BlockObservation]
    formula_observations: list[FormulaObservation] = []
    figure_observations: list[FigureObservation] = []


class DocumentParser(ABC):
    name: str
    version: str

    @abstractmethod
    def parse_page(self, *, parse_run: ParseRun, page_input: ParserPageInput) -> ParsedPage:
        raise NotImplementedError


def assert_anchor_matches_input(parsed: ParsedPage, page_input: ParserPageInput) -> None:
    """Validate every parser object before it enters canonical storage."""
    if parsed.page_id != page_input.page.page_id or parsed.rendition_id != page_input.rendition.rendition_id:
        raise ValueError("parser output page/rendition does not match its input")
    anchored = [*parsed.observations, *parsed.formula_observations, *parsed.figure_observations]
    for item in anchored:
        if item.anchor.page_id != page_input.page.page_id:
            raise ValueError("parser object anchor points to another page")
        if item.anchor.rendition_id != page_input.rendition.rendition_id:
            raise ValueError("parser object anchor points to another rendition")
        bbox = item.anchor.bbox
        if bbox.x1 > page_input.rendition.width_px or bbox.y1 > page_input.rendition.height_px:
            raise ValueError("parser object bbox exceeds rendition dimensions")
