"""Atomic, inspectable JSON and JSONL persistence helpers."""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Iterable

from pydantic import BaseModel


def _replace_atomic(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(path.name + ".tmp")
    temporary.write_text(text, encoding="utf-8", newline="\n")
    os.replace(temporary, path)


def write_json(path: Path, record: BaseModel) -> None:
    _replace_atomic(path, record.model_dump_json(indent=2) + "\n")


def write_jsonl(path: Path, records: Iterable[BaseModel]) -> None:
    text = "".join(record.model_dump_json() + "\n" for record in records)
    _replace_atomic(path, text)


def read_json(path: Path) -> dict[str, object]:
    return json.loads(path.read_text(encoding="utf-8"))


def read_jsonl(path: Path) -> list[dict[str, object]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]
