"""Command-line entry points for inspectable Phase 1 operations."""

from __future__ import annotations

import argparse
from pathlib import Path

from kb.models.schema import SourceKind
from kb.services.pipeline import ingest_image_only_pdf


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="kb")
    commands = parser.add_subparsers(dest="command", required=True)
    ingest = commands.add_parser("ingest-image-pdf", help="Register an image-only PDF and extract native page images.")
    ingest.add_argument("source_path", type=Path)
    ingest.add_argument("--storage-root", type=Path, default=Path("data"))
    ingest.add_argument("--source-id", required=True)
    ingest.add_argument("--title", required=True)
    ingest.add_argument("--subject", required=True)
    ingest.add_argument("--kind", choices=[kind.value for kind in SourceKind], required=True)
    return parser


def main() -> int:
    args = build_parser().parse_args()
    if args.command == "ingest-image-pdf":
        document_dir = ingest_image_only_pdf(
            source_path=args.source_path,
            storage_root=args.storage_root,
            source_id=args.source_id,
            title=args.title,
            subject=args.subject,
            kind=SourceKind(args.kind),
        )
        print(document_dir)
        return 0
    raise AssertionError(f"unhandled command: {args.command}")


if __name__ == "__main__":
    raise SystemExit(main())
