from __future__ import annotations

import unittest

from kb.ids import (
    make_block_id, make_figure_id, make_formula_id, make_observation_id,
    make_page_id, make_question_id, make_solution_id, make_source_version_id,
)


class IdTests(unittest.TestCase):
    def test_source_version_id_uses_registered_source_and_bytes_not_filename(self) -> None:
        digest = "b" * 64
        self.assertEqual(make_source_version_id("SRC-M2-ZY30-CALC-2027", digest), "SV:SRC-M2-ZY30-CALC-2027:bbbbbbbbbbbbbbbb")

    def test_page_id_uses_physical_pdf_page_not_printed_page_label(self) -> None:
        source_version_id = make_source_version_id("SRC-M2-ZY30-LA-2027", "c" * 64)
        self.assertTrue(make_page_id(source_version_id, 0).endswith("P0001"))
        self.assertTrue(make_page_id(source_version_id, 151).endswith("P0152"))

    def test_observation_id_is_run_scoped(self) -> None:
        page_id = make_page_id("SV:SRC-408-WD-DS-2027:dddddddddddddddd", 299)
        self.assertNotEqual(make_observation_id("RUN:MINERU:1", page_id, 17), make_observation_id("RUN:PADDLE:1", page_id, 17))

    def test_entity_ids_are_deterministic_and_change_only_when_identity_key_changes(self) -> None:
        bbox = (1, 2, 30, 40)
        block_a = make_block_id("SV:A", "PG:A", bbox, "text")
        self.assertEqual(block_a, make_block_id("SV:A", "PG:A", bbox, "text"))
        self.assertNotEqual(block_a, make_block_id("SV:A", "PG:A", bbox, "heading"))
        self.assertTrue(make_formula_id("SV:A", "PG:A", bbox).startswith("FOR:"))
        self.assertTrue(make_figure_id("SV:A", "PG:A", bbox).startswith("FIG:"))
        self.assertTrue(make_question_id("SRC-M2-ZY30-CALC-2027", "18").startswith("Q:"))
        self.assertTrue(make_solution_id("SRC-M2-ZY30-CALC-2027", "18", "SRC-SOLUTION-2027").startswith("SOL:"))


if __name__ == "__main__":
    unittest.main()
