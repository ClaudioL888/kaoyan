"""Concrete adapter for vendor JSON already expressed in canonical rendition pixels."""

from __future__ import annotations

from collections.abc import Mapping

from kb.adapters.base import DocumentParser, ParsedPage, ParserPageInput, assert_anchor_matches_input
from kb.ids import make_observation_id
from kb.models.common import BBox, SourceAnchor
from kb.models.schema import (
    BlockKind,
    BlockObservation,
    ContentSpan,
    FigureObservation,
    FormulaObservation,
    ParseRun,
    SpanKind,
)


class ExternalJsonAdapter(DocumentParser):
    """Normalize a small stable interchange format before writing canonical records.

    MinerU/Paddle adapters may translate their private output into this payload shape; the
    rest of the knowledge system never imports vendor packages or vendor JSON directly.
    """

    name = "external-json"
    version = "1.0"

    def __init__(self, payloads: Mapping[str, dict[str, object]]) -> None:
        self.payloads = payloads

    def parse_page(self, *, parse_run: ParseRun, page_input: ParserPageInput) -> ParsedPage:
        payload = self.payloads[page_input.page.page_id]
        if payload.get("coordinate_space") != "canonical_rendition_pixels":
            raise ValueError("external payload must use canonical_rendition_pixels")
        observations: list[BlockObservation] = []
        formulas: list[FormulaObservation] = []
        figures: list[FigureObservation] = []
        raw_blocks = payload.get("blocks", [])
        if not isinstance(raw_blocks, list):
            raise ValueError("blocks must be a list")

        for ordinal, raw in enumerate(raw_blocks, start=1):
            if not isinstance(raw, dict):
                raise ValueError("each block must be an object")
            bbox_values = raw.get("bbox")
            if not isinstance(bbox_values, list) or len(bbox_values) != 4:
                raise ValueError("block bbox must contain four integers")
            bbox = BBox(x0=bbox_values[0], y0=bbox_values[1], x1=bbox_values[2], y1=bbox_values[3])
            anchor = SourceAnchor(
                page_id=page_input.page.page_id,
                rendition_id=page_input.rendition.rendition_id,
                bbox=bbox,
            )
            observation_id = make_observation_id(parse_run.parse_run_id, page_input.page.page_id, ordinal)
            kind = BlockKind(str(raw.get("kind", "unknown")))
            spans: list[ContentSpan] = []
            if kind is BlockKind.FORMULA:
                formula_id = f"FOBS:{observation_id}:001"
                formulas.append(
                    FormulaObservation(
                        formula_observation_id=formula_id,
                        parse_run_id=parse_run.parse_run_id,
                        anchor=anchor,
                        block_observation_id=observation_id,
                        confidence=raw.get("confidence"),
                    )
                )
                spans.append(ContentSpan(ordinal=1, kind=SpanKind.FORMULA, formula_observation_id=formula_id))
            elif kind is BlockKind.FIGURE:
                figure_id = f"FIGOBS:{observation_id}:001"
                figures.append(
                    FigureObservation(
                        figure_observation_id=figure_id,
                        parse_run_id=parse_run.parse_run_id,
                        anchor=anchor,
                        block_observation_id=observation_id,
                        confidence=raw.get("confidence"),
                    )
                )
                spans.append(ContentSpan(ordinal=1, kind=SpanKind.FIGURE, figure_observation_id=figure_id))
            elif raw.get("text") is not None:
                spans.append(ContentSpan(ordinal=1, kind=SpanKind.TEXT, text=str(raw["text"])))
            observations.append(
                BlockObservation(
                    observation_id=observation_id,
                    parse_run_id=parse_run.parse_run_id,
                    anchor=anchor,
                    reading_order=int(raw.get("reading_order", ordinal)),
                    primary_kind=kind,
                    confidence=raw.get("confidence"),
                    content_spans=spans,
                )
            )
        parsed = ParsedPage(
            page_id=page_input.page.page_id,
            rendition_id=page_input.rendition.rendition_id,
            observations=observations,
            formula_observations=formulas,
            figure_observations=figures,
        )
        assert_anchor_matches_input(parsed, page_input)
        return parsed
