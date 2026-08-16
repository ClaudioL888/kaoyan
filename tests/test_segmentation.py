from __future__ import annotations

import unittest

from kb.models.common import BBox, SourceAnchor
from kb.models.schema import BlockKind, BlockObservation
from kb.services.segmentation import segment_questions


def block(identifier: str, kind: BlockKind, text: str, page: int) -> BlockObservation:
    anchor = SourceAnchor(
        page_id=f"PG:SV:SRC-408-WD-DS-2027:aaaaaaaaaaaaaaaa:P{page:04d}",
        rendition_id=f"RND:PAGE:{page}:NATIVE",
        bbox=BBox(x0=0, y0=0, x1=100, y1=20),
    )
    return BlockObservation(
        observation_id=identifier,
        parse_run_id="RUN:DEMO:1",
        anchor=anchor,
        reading_order=int(identifier[-1]),
        primary_kind=kind,
        content_spans=[{"ordinal": 1, "kind": "text", "text": text}],
    )


class SegmentationTests(unittest.TestCase):
    def test_question_candidate_can_cross_pages(self) -> None:
        candidates = segment_questions(
            [
                block("OBS:1", BlockKind.QUESTION_NUMBER, "18.", 1),
                block("OBS:2", BlockKind.QUESTION_STEM, "设A为方阵", 1),
                block("OBS:3", BlockKind.OPTION, "A. 正确", 2),
                block("OBS:4", BlockKind.QUESTION_NUMBER, "19.", 2),
            ]
        )
        self.assertEqual(len(candidates), 2)
        self.assertEqual(candidates[0].question_label, "18")
        self.assertEqual(candidates[0].observation_ids, ["OBS:1", "OBS:2", "OBS:3"])
        self.assertEqual(len(candidates[0].anchors), 3)


if __name__ == "__main__":
    unittest.main()
