from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from PIL import Image

from kb.models.schema import SourceKind
from kb.services.pipeline import ingest_image_only_pdf
from kb.services.serialization import read_json, read_jsonl


class PagePipelineTests(unittest.TestCase):
    def test_image_only_pdf_keeps_canonical_render_and_native_page_asset(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            input_pdf = root / "fixture.pdf"
            image = Image.new("RGB", (120, 180), color=(240, 240, 240))
            image.save(input_pdf, "PDF", resolution=144.0)
            document_dir = ingest_image_only_pdf(
                source_path=input_pdf, storage_root=root / "managed",
                source_id="SRC-TEST-IMAGE-PDF-2027", title="图像型 PDF 测试件",
                subject="test", kind=SourceKind.USER_UPLOAD, render_dpi=144,
            )
            pages = read_jsonl(document_dir / "structured" / "pages.jsonl")
            renditions = read_jsonl(document_dir / "structured" / "renditions.jsonl")
            assets = read_jsonl(document_dir / "structured" / "assets.jsonl")
            self.assertEqual(len(pages), 1)
            self.assertEqual(pages[0]["pdf_page_index"], 0)
            self.assertEqual(renditions[0]["coordinate_system"], "pixel_top_left")
            self.assertEqual(len(renditions[0]["transform_to_pdf"]), 6)
            native_asset = next(item for item in assets if item["kind"] == "embedded_page_image")
            analysis_asset = next(item for item in assets if item["kind"] == "analysis_page_image")
            self.assertTrue((root / "managed" / native_asset["relative_path"]).is_file())
            self.assertTrue((root / "managed" / analysis_asset["relative_path"]).is_file())
            self.assertTrue((document_dir / "document.json").is_file())
            self.assertEqual(read_json(document_dir / "document.json")["page_ids"], [pages[0]["page_id"]])


if __name__ == "__main__":
    unittest.main()
