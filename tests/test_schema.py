from __future__ import annotations

import unittest

from pydantic import ValidationError

from kb.models.common import AssetKind, BBox, ContentAsset, CropSpec, SourceAnchor
from kb.models.schema import (
    Block, BlockKind, BlockObservation, ContentSpan, Document, FormulaOccurrence,
    FormulaRecognition, Page, Question, ReviewStatus, SpanKind,
    TextOrigin, TextRevision,
)

SHA = "a" * 64
SV = "SV:SRC-M2-ZY30-CALC-2027:aaaaaaaaaaaaaaaa"
PAGE = "PG:SV:SRC-M2-ZY30-CALC-2027:aaaaaaaaaaaaaaaa:P0053"
RENDITION = "RND:PG:SV:SRC-M2-ZY30-CALC-2027:aaaaaaaaaaaaaaaa:P0053:ANALYSIS-144DPI"
ANCHOR = SourceAnchor(page_id=PAGE, rendition_id=RENDITION, bbox=BBox(x0=8, y0=12, x1=180, y1=90))


class SchemaTests(unittest.TestCase):
    def test_crop_asset_has_parent_and_reproducible_spec(self) -> None:
        formula_crop = ContentAsset(
            asset_id="ASSET:FORMULA:001", kind=AssetKind.FORMULA_CROP,
            relative_path="documents/demo/assets/formulas/f001.png", sha256=SHA,
            mime_type="image/png", byte_size=123, width_px=172, height_px=78,
            derived_from_asset_id="ASSET:PAGE:001",
            crop_spec=CropSpec(parent_asset_id="ASSET:PAGE:001", bbox=ANCHOR.bbox, padding_px=4),
        )
        self.assertEqual(formula_crop.crop_spec.parent_asset_id, "ASSET:PAGE:001")

    def test_anchor_and_bbox_constraints_are_strict(self) -> None:
        with self.assertRaises(ValidationError):
            SourceAnchor(page_id=PAGE, rendition_id=RENDITION, bbox=BBox(x0=20, y0=20, x1=20, y1=40))
        with self.assertRaises(ValidationError):
            ContentAsset(asset_id="ASSET:X", kind=AssetKind.ORIGINAL_PDF, relative_path="../escape.pdf", sha256=SHA, mime_type="application/pdf", byte_size=1)

    def test_unknown_fields_and_post_assignment_are_rejected(self) -> None:
        with self.assertRaises(ValidationError):
            SourceAnchor(page_id=PAGE, rendition_id=RENDITION, bbox=ANCHOR.bbox, unexpected="bad")
        observation = BlockObservation(
            observation_id="OBS:RUN:1:B0001", parse_run_id="RUN:1", anchor=ANCHOR,
            reading_order=1, primary_kind=BlockKind.TEXT,
            content_spans=[ContentSpan(ordinal=1, kind=SpanKind.TEXT, text="极限")],
        )
        with self.assertRaises(ValidationError):
            observation.content_spans = [{"invalid": True}]

    def test_observation_is_distinct_from_stable_block(self) -> None:
        observation = BlockObservation(
            observation_id="OBS:RUN:1:B0001", parse_run_id="RUN:1", anchor=ANCHOR,
            reading_order=1, primary_kind=BlockKind.TEXT,
            content_spans=[ContentSpan(ordinal=1, kind=SpanKind.TEXT, text="极限")],
        )
        block = Block(
            block_id="BLK:01JSTABLE", source_version_id=SV,
            observation_ids=[observation.observation_id], active_observation_id=observation.observation_id,
            anchor=ANCHOR,
        )
        self.assertNotEqual(block.block_id, observation.observation_id)
        with self.assertRaises(ValidationError):
            Block(block_id="BLK:BAD", source_version_id=SV, observation_ids=[observation.observation_id], active_observation_id="OBS:RUN:2:B0001", anchor=ANCHOR)

    def test_text_and_formula_keep_independent_provenance(self) -> None:
        block = Block(
            block_id="BLK:01JFORMULA", source_version_id=SV,
            observation_ids=["OBS:RUN:1:B0002"], active_observation_id="OBS:RUN:1:B0002", anchor=ANCHOR,
            review_status=ReviewStatus.REVIEWED,
        )
        text = TextRevision(
            text_revision_id="TXT:01", block_id=block.block_id, origin=TextOrigin.OCR_RAW,
            text="由洛必达法则可得", parser_name="example", parser_version="1.0", confidence=0.91,
        )
        formula = FormulaOccurrence(
            formula_id="FOR:01", source_version_id=SV, observation_ids=["FORMOBS:01"],
            active_observation_id="FORMOBS:01", anchor=ANCHOR, visual_asset_id="ASSET:FORMULA:001",
            block_id=block.block_id,
        )
        latex = FormulaRecognition(
            formula_recognition_id="FREC:01", formula_id=formula.formula_id,
            latex=r"\lim_{x \to 0} \frac{\sin x}{x}=1", parser_name="example-math", parser_version="1.0", confidence=0.75,
        )
        self.assertEqual(text.block_id, formula.block_id)
        self.assertEqual(latex.formula_id, formula.formula_id)

    def test_document_and_question_round_trip(self) -> None:
        page2 = SourceAnchor(page_id=PAGE.replace("P0053", "P0054"), rendition_id=RENDITION.replace("P0053", "P0054"), bbox=BBox(x0=0, y0=0, x1=300, y1=100))
        document = Document(document_id="DOC:01", source_version_id=SV, title="demo", page_ids=[PAGE], asset_ids=["ASSET:PAGE:1"], structured_root="documents/demo/structured")
        question = Question(question_id="Q:01", source_version_id=SV, question_label="18", block_ids=["BLK:Q18-A"], anchors=[ANCHOR, page2])
        self.assertEqual(Document.model_validate_json(document.model_dump_json()).document_id, "DOC:01")
        self.assertEqual(len(Question.model_validate_json(question.model_dump_json()).anchors), 2)


if __name__ == "__main__":
    unittest.main()

