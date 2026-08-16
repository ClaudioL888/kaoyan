from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from PIL import Image

from kb.models.schema import SourceKind
from kb.services.integrity import validate_document_snapshot
from kb.services.pipeline import ingest_image_only_pdf


class IntegrityTests(unittest.TestCase):
    def test_snapshot_passes_cross_record_hash_and_transform_gate(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            pdf = root / "fixture.pdf"
            Image.new("RGB", (120, 180), "white").save(pdf, "PDF", resolution=144)
            storage = root / "managed"
            document = ingest_image_only_pdf(
                source_path=pdf, storage_root=storage, source_id="SRC-TEST-INTEGRITY-2027",
                title="integrity", subject="test", kind=SourceKind.USER_UPLOAD,
            )
            self.assertEqual(validate_document_snapshot(storage, document), [])


if __name__ == "__main__":
    unittest.main()
