from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from PIL import Image

from kb.models.schema import SourceKind
from kb.services.pipeline import ingest_image_only_pdf


class SourceRegistryTests(unittest.TestCase):
    def test_registered_source_id_cannot_silently_change_metadata(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            pdf = root / "fixture.pdf"
            Image.new("RGB", (80, 100), "white").save(pdf, "PDF", resolution=144)
            storage = root / "managed"
            kwargs = dict(
                source_path=pdf, storage_root=storage, source_id="SRC-TEST-REGISTRY-2027",
                title="Original title", subject="test", kind=SourceKind.USER_UPLOAD,
            )
            ingest_image_only_pdf(**kwargs)
            with self.assertRaisesRegex(ValueError, "metadata conflict"):
                ingest_image_only_pdf(**{**kwargs, "title": "Different title"})


if __name__ == "__main__":
    unittest.main()
