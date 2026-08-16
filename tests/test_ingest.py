from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from kb.models.schema import SourceKind
from kb.services.ingest import register_source, sha256_file


class RegisterSourceTests(unittest.TestCase):
    def test_registering_same_pdf_reuses_immutable_managed_copy(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            input_pdf = root / "renamed-input.pdf"
            input_pdf.write_bytes(b"%PDF-1.4\nminimal test source\n")
            storage = root / "managed"

            first = register_source(
                source_path=input_pdf,
                storage_root=storage,
                source_id="SRC-M2-ZY30-CALC-2027",
                title="示例高数资料",
                subject="calculus",
                kind=SourceKind.TEXTBOOK,
            )
            second = register_source(
                source_path=input_pdf,
                storage_root=storage,
                source_id="SRC-M2-ZY30-CALC-2027",
                title="示例高数资料",
                subject="calculus",
                kind=SourceKind.TEXTBOOK,
            )

            source, version, asset = first
            self.assertEqual(version.source_version_id, second[1].source_version_id)
            self.assertEqual(asset.sha256, sha256_file(input_pdf))
            self.assertTrue((storage / asset.relative_path).is_file())
            self.assertEqual(source.source_id, "SRC-M2-ZY30-CALC-2027")


if __name__ == "__main__":
    unittest.main()
