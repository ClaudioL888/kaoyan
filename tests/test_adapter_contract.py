from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from kb.adapters.base import DocumentParser, ParsedPage, ParserPageInput, assert_anchor_matches_input
from kb.models.common import BBox, ContentAsset, PageRendition, SourceAnchor, AssetKind
from kb.models.schema import BlockKind, BlockObservation, Page, ParseRun


class DummyAdapter(DocumentParser):
    name = "dummy"
    version = "1.0"

    def parse_page(self, *, parse_run: ParseRun, page_input: ParserPageInput) -> ParsedPage:
        return ParsedPage(
            page_id=page_input.page.page_id,
            rendition_id=page_input.rendition.rendition_id,
            observations=[
                BlockObservation(
                    observation_id="OBS:RUN:DEMO:B0001", parse_run_id=parse_run.parse_run_id,
                    anchor=SourceAnchor(page_id=page_input.page.page_id, rendition_id=page_input.rendition.rendition_id, bbox=BBox(x0=0, y0=0, x1=10, y1=10)),
                    reading_order=1, primary_kind=BlockKind.TEXT,
                )
            ],
        )


class AdapterContractTests(unittest.TestCase):
    def test_adapter_receives_concrete_page_context_and_returns_checked_anchors(self) -> None:
        page = Page(page_id="PG:PAGE:1", source_version_id="SV:SRC-TEST-IMAGE-PDF-2027:aaaaaaaaaaaaaaaa", pdf_page_index=0, rendition_ids=["RND:PAGE:1:NATIVE"])
        rendition = PageRendition(
            rendition_id="RND:PAGE:1:NATIVE", page_id=page.page_id, asset_id="ASSET:PAGE:1",
            width_px=100, height_px=100, dpi=144, pdf_page_width_pt=50, pdf_page_height_pt=50,
            transform_to_pdf=(0.5, 0, 0, -0.5, 0, 50),
        )
        asset = ContentAsset(
            asset_id="ASSET:PAGE:1", kind=AssetKind.ANALYSIS_PAGE_IMAGE,
            relative_path="documents/test/page.png", sha256="a" * 64, mime_type="image/png", byte_size=100,
            width_px=100, height_px=100, derived_from_asset_id="ASSET:PDF:1",
        )
        page_input = ParserPageInput(page=page, rendition=rendition, asset=asset, absolute_image_path=Path(tempfile.gettempdir()) / "page.png")
        run = ParseRun(
            parse_run_id="RUN:DEMO", source_version_id=page.source_version_id, parser_name="dummy",
            parser_version="1.0", pipeline_version="0.1", configuration_sha256="a" * 64,
            input_rendition_ids=[rendition.rendition_id],
        )
        parsed = DummyAdapter().parse_page(parse_run=run, page_input=page_input)
        assert_anchor_matches_input(parsed, page_input)
        self.assertEqual(parsed.observations[0].anchor.rendition_id, parsed.rendition_id)


if __name__ == "__main__":
    unittest.main()
