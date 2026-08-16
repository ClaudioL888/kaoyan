"""Conservative, run-scoped Question Segmentation prototype."""

from __future__ import annotations

import re
from collections.abc import Iterable

from kb.models.common import SourceAnchor, StrictModel
from kb.models.schema import BlockKind, BlockObservation, ReviewStatus
from pydantic import Field

_QUESTION_LABEL = re.compile(r"^\s*(\d+)[\.、．)]")


class QuestionCandidate(StrictModel):
    candidate_id: str
    parse_run_id: str
    question_label: str | None = None
    observation_ids: list[str] = Field(min_length=1)
    anchors: list[SourceAnchor] = Field(min_length=1)
    review_status: ReviewStatus = ReviewStatus.NEEDS_REVIEW


def _plain_text(observation: BlockObservation) -> str:
    return "".join(span.text or "" for span in observation.content_spans)


def segment_questions(observations: Iterable[BlockObservation]) -> list[QuestionCandidate]:
    """Group blocks until the next question number; IDs are based on first observation, not batch ordinal."""
    candidates: list[QuestionCandidate] = []
    current: list[BlockObservation] = []
    current_label: str | None = None
    current_run_id: str | None = None

    def flush() -> None:
        nonlocal current, current_label, current_run_id
        if current and current_run_id:
            first_id = current[0].observation_id
            candidates.append(
                QuestionCandidate(
                    candidate_id=f"QOBS:{current_run_id}:{first_id}",
                    parse_run_id=current_run_id,
                    question_label=current_label,
                    observation_ids=[item.observation_id for item in current],
                    anchors=[item.anchor for item in current],
                )
            )
        current, current_label, current_run_id = [], None, None

    for observation in observations:
        if observation.primary_kind is BlockKind.QUESTION_NUMBER:
            flush()
            match = _QUESTION_LABEL.match(_plain_text(observation))
            current_label = match.group(1) if match else None
            current_run_id = observation.parse_run_id
            current.append(observation)
        elif current:
            if observation.parse_run_id != current_run_id:
                raise ValueError("question segmentation input may not mix parse runs")
            current.append(observation)
    flush()
    return candidates
