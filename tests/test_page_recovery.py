from __future__ import annotations

import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from PIL import Image

from kb.models.schema import PageProcessStatus, SourceKind
from kb.services.ingest import register_source
from kb.services.page_images import materialize_pages


class PageRecoveryTests(unittest.TestCase):
    def test_one_page_failure_does_not_abort_following_pages(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            pdf = root / "two-pages.pdf"
            first = Image.new("RGB", (100, 140), "white")
            second = Image.new("RGB", (100, 140), "gray")
            first.save(pdf, "PDF", save_all=True, append_images=[second], resolution=144)
            storage = root / "managed"
            _, version, original = register_source(
                source_path=pdf, storage_root=storage, source_id="SRC-TEST-RECOVERY-2027",
                title="recovery", subject="test", kind=SourceKind.USER_UPLOAD,
            )
            with patch("kb.services.page_images._native_asset", side_effect=[RuntimeError("page failure"), None]):
                records = materialize_pages(storage_root=storage, source_version=version, original_pdf=original)
            self.assertEqual(records[0].status.status, PageProcessStatus.RETRYABLE)
            self.assertEqual(records[1].status.status, PageProcessStatus.COMPLETED)


if __name__ == "__main__":
    unittest.main()
