from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from kb.adapters.base import ParserPageInput
from kb.adapters.external_json import ExternalJsonAdapter
from kb.models.common import AssetKind, ContentAsset, PageRendition
from kb.models.schema import Page, ParseRun


class ExternalJsonAdapterTests(unittest.TestCase):
    def test_text_formula_and_figure_become_normalized_observations(self) -> None:
        page = Page(page_id="PG:1", source_version_id="SV:1", pdf_page_index=0, rendition_ids=["RND:1"])
        rendition = PageRendition(
            rendition_id="RND:1", page_id=page.page_id, asset_id="ASSET:1", width_px=100,
            height_px=120, dpi=144, pdf_page_width_pt=50, pdf_page_height_pt=60,
            transform_to_pdf=(0.5, 0, 0, -0.5, 0, 60),
        )
        asset = ContentAsset(
            asset_id="ASSET:1", kind=AssetKind.ANALYSIS_PAGE_IMAGE,
            relative_path="documents/test/page.png", sha256="a" * 64, mime_type="image/png",
            byte_size=10, width_px=100, height_px=120, derived_from_asset_id="ASSET:PDF",
        )
        page_input = ParserPageInput(
            page=page, rendition=rendition, asset=asset,
            absolute_image_path=Path(tempfile.gettempdir()) / "page.png",
        )
        run = ParseRun(
            parse_run_id="RUN:1", source_version_id="SV:1", parser_name="fixture",
            parser_version="1", pipeline_version="0.1", configuration_sha256="a" * 64,
            input_rendition_ids=["RND:1"],
        )
        payload = {
            "coordinate_space": "canonical_rendition_pixels",
            "blocks": [
                {"bbox": [0, 0, 40, 10], "kind": "text", "text": "题干", "reading_order": 1},
                {"bbox": [0, 11, 50, 30], "kind": "formula", "reading_order": 2},
                {"bbox": [0, 31, 80, 80], "kind": "figure", "reading_order": 3},
            ],
        }
        parsed = ExternalJsonAdapter({page.page_id: payload}).parse_page(parse_run=run, page_input=page_input)
        self.assertEqual(len(parsed.observations), 3)
        self.assertEqual(len(parsed.formula_observations), 1)
        self.assertEqual(len(parsed.figure_observations), 1)
        self.assertEqual(parsed.observations[0].content_spans[0].text, "题干")


if __name__ == "__main__":
    unittest.main()
