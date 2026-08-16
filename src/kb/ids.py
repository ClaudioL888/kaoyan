"""Deterministic IDs for immutable sources, observations, and reconciled entities."""

from __future__ import annotations

import re
import uuid

_SOURCE_ID = re.compile(r"^SRC-[A-Z0-9]+(?:-[A-Z0-9]+)+$")
_SHA256 = re.compile(r"^[0-9a-f]{64}$")
_ENTITY_PREFIXES = {"BLK", "FOR", "FIG", "Q", "SOL"}


def validate_source_id(source_id: str) -> str:
    if not _SOURCE_ID.fullmatch(source_id):
        raise ValueError("source_id must use SRC-SEGMENT-SEGMENT format")
    return source_id


def validate_sha256(content_sha256: str) -> str:
    if not _SHA256.fullmatch(content_sha256):
        raise ValueError("content_sha256 must be a lowercase 64-character SHA-256 digest")
    return content_sha256


def make_source_version_id(source_id: str, content_sha256: str) -> str:
    validate_source_id(source_id)
    validate_sha256(content_sha256)
    return f"SV:{source_id}:{content_sha256[:16]}"


def make_page_id(source_version_id: str, pdf_page_index: int) -> str:
    if pdf_page_index < 0:
        raise ValueError("pdf_page_index must be >= 0")
    return f"PG:{source_version_id}:P{pdf_page_index + 1:04d}"


def make_observation_id(parse_run_id: str, page_id: str, ordinal: int) -> str:
    if ordinal < 1:
        raise ValueError("ordinal must be >= 1")
    return f"OBS:{parse_run_id}:{page_id}:B{ordinal:04d}"


def _uuid_entity(prefix: str, stable_key: str) -> str:
    if prefix not in _ENTITY_PREFIXES:
        raise ValueError(f"unsupported entity prefix: {prefix}")
    return f"{prefix}:{uuid.uuid5(uuid.NAMESPACE_URL, stable_key)}"


def make_block_id(source_version_id: str, page_id: str, bbox: tuple[int, int, int, int], kind: str) -> str:
    return _uuid_entity("BLK", f"{source_version_id}|{page_id}|{bbox}|{kind}")


def make_formula_id(source_version_id: str, page_id: str, bbox: tuple[int, int, int, int], ordinal: int = 1) -> str:
    return _uuid_entity("FOR", f"{source_version_id}|{page_id}|{bbox}|formula|{ordinal}")


def make_figure_id(source_version_id: str, page_id: str, bbox: tuple[int, int, int, int], ordinal: int = 1) -> str:
    return _uuid_entity("FIG", f"{source_version_id}|{page_id}|{bbox}|figure|{ordinal}")


def make_question_id(source_id: str, question_key: str) -> str:
    validate_source_id(source_id)
    return _uuid_entity("Q", f"{source_id}|question|{question_key}")


def make_solution_id(source_id: str, question_key: str, solution_source_id: str) -> str:
    validate_source_id(source_id)
    return _uuid_entity("SOL", f"{source_id}|{question_key}|{solution_source_id}")
