"""Strict, versioned canonical schema for Phase 1 scanned-material ingestion."""

from __future__ import annotations

from datetime import datetime, timezone
from enum import StrEnum
from typing import Annotated

from pydantic import Field, model_validator

from .common import ContentAsset, SourceAnchor, StrictModel


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class SourceKind(StrEnum):
    TEXTBOOK = "textbook"
    QUESTION_BANK = "question_bank"
    SOLUTION_BOOK = "solution_book"
    USER_UPLOAD = "user_upload"


class ReviewStatus(StrEnum):
    AUTO_ACCEPTED = "auto_accepted"
    NEEDS_REVIEW = "needs_review"
    REVIEWED = "reviewed"
    CORRECTED = "corrected"
    REJECTED = "rejected"
    UNREVIEWED = "unreviewed"


class BlockKind(StrEnum):
    TITLE = "title"
    HEADING = "heading"
    TEXT = "text"
    FORMULA = "formula"
    FIGURE = "figure"
    TABLE = "table"
    QUESTION_NUMBER = "question_number"
    QUESTION_STEM = "question_stem"
    OPTION = "option"
    ANSWER = "answer"
    SOLUTION = "solution"
    CAPTION = "caption"
    PAGE_NUMBER = "page_number"
    HEADER = "header"
    FOOTER = "footer"
    UNKNOWN = "unknown"


class SpanKind(StrEnum):
    TEXT = "text"
    FORMULA = "formula"
    FIGURE = "figure"


class TextOrigin(StrEnum):
    OCR_RAW = "ocr_raw"
    OCR_NORMALIZED = "ocr_normalized"
    HUMAN_CORRECTION = "human_correction"
    AI_EXPLANATION = "ai_explanation"


class SolutionType(StrEnum):
    OFFICIAL = "official"
    TEXTBOOK = "textbook"
    AI_GENERATED = "ai_generated"
    USER_PROVIDED = "user_provided"
    USER_CORRECTED = "user_corrected"


class ParseRunStatus(StrEnum):
    RUNNING = "running"
    COMPLETED = "completed"
    COMPLETED_WITH_ERRORS = "completed_with_errors"
    FAILED = "failed"


class PageProcessStatus(StrEnum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    RETRYABLE = "retryable"


class Source(StrictModel):
    """Human-registered logical source; its ID must not be derived from a filename."""

    source_id: str = Field(pattern=r"^SRC-[A-Z0-9]+(?:-[A-Z0-9]+)+$")
    title: str
    subject: str
    kind: SourceKind
    created_at: datetime = Field(default_factory=utc_now)


class SourceVersion(StrictModel):
    """One immutable byte-level PDF belonging to a logical Source."""

    source_version_id: str
    source_id: str = Field(pattern=r"^SRC-[A-Z0-9]+(?:-[A-Z0-9]+)+$")
    content_sha256: str = Field(pattern=r"^[0-9a-f]{64}$")
    original_pdf_asset_id: str
    parent_source_version_id: str | None = None
    created_at: datetime = Field(default_factory=utc_now)


class Document(StrictModel):
    """Logical document snapshot tying source metadata, pages and assets together."""

    document_id: str
    source_version_id: str
    title: str
    page_ids: list[str] = Field(default_factory=list)
    asset_ids: list[str] = Field(default_factory=list)
    structured_root: str
    created_at: datetime = Field(default_factory=utc_now)


class Page(StrictModel):
    page_id: str
    source_version_id: str
    pdf_page_index: Annotated[int, Field(ge=0)]
    printed_page_label: str | None = None
    rendition_ids: list[str] = Field(default_factory=list)


class PageProcessRecord(StrictModel):
    page_id: str
    source_version_id: str
    pdf_page_index: Annotated[int, Field(ge=0)]
    status: PageProcessStatus
    attempt: Annotated[int, Field(ge=1)] = 1
    error_code: str | None = None
    error_message: str | None = None
    created_at: datetime = Field(default_factory=utc_now)


class ParseRun(StrictModel):
    """Reproducible record of an external parser invocation."""

    parse_run_id: str
    source_version_id: str
    parser_name: str
    parser_version: str
    pipeline_version: str
    configuration_sha256: str = Field(pattern=r"^[0-9a-f]{64}$")
    input_rendition_ids: list[str]
    status: ParseRunStatus = ParseRunStatus.RUNNING
    created_at: datetime = Field(default_factory=utc_now)
    finished_at: datetime | None = None


class ContentSpan(StrictModel):
    """Ordered inline content; formulas and figures are explicit run-scoped references."""

    ordinal: Annotated[int, Field(ge=1)]
    kind: SpanKind
    text: str | None = None
    formula_observation_id: str | None = None
    figure_observation_id: str | None = None

    @model_validator(mode="after")
    def kind_matches_reference(self) -> "ContentSpan":
        if self.kind is SpanKind.TEXT and self.text is None:
            raise ValueError("text spans require text")
        if self.kind is not SpanKind.TEXT and self.text is not None:
            raise ValueError("formula/figure spans cannot carry text")
        if self.kind is SpanKind.FORMULA and self.formula_observation_id is None:
            raise ValueError("formula spans require formula_observation_id")
        if self.kind is SpanKind.FIGURE and self.figure_observation_id is None:
            raise ValueError("figure spans require figure_observation_id")
        if self.kind is SpanKind.FORMULA and self.figure_observation_id is not None:
            raise ValueError("formula spans cannot reference figures")
        if self.kind is SpanKind.FIGURE and self.formula_observation_id is not None:
            raise ValueError("figure spans cannot reference formulas")
        return self


class BlockObservation(StrictModel):
    """Parser-specific layout finding; never a cross-run semantic identity."""

    observation_id: str
    parse_run_id: str
    anchor: SourceAnchor
    reading_order: Annotated[int, Field(ge=1)]
    primary_kind: BlockKind
    confidence: Annotated[float | None, Field(ge=0, le=1)] = None
    review_status: ReviewStatus = ReviewStatus.NEEDS_REVIEW
    content_spans: list[ContentSpan] = Field(default_factory=list)


class FormulaObservation(StrictModel):
    formula_observation_id: str
    parse_run_id: str
    anchor: SourceAnchor
    visual_asset_id: str | None = None
    block_observation_id: str | None = None
    confidence: Annotated[float | None, Field(ge=0, le=1)] = None
    review_status: ReviewStatus = ReviewStatus.NEEDS_REVIEW


class FigureObservation(StrictModel):
    figure_observation_id: str
    parse_run_id: str
    anchor: SourceAnchor
    visual_asset_id: str | None = None
    block_observation_id: str | None = None
    confidence: Annotated[float | None, Field(ge=0, le=1)] = None
    review_status: ReviewStatus = ReviewStatus.NEEDS_REVIEW


class Block(StrictModel):
    """Stable, reconciled content entity linked to one or more parser observations."""

    block_id: str
    source_version_id: str
    observation_ids: list[str] = Field(min_length=1)
    active_observation_id: str
    anchor: SourceAnchor
    text_revision_ids: list[str] = Field(default_factory=list)
    active_text_revision_id: str | None = None
    review_status: ReviewStatus = ReviewStatus.UNREVIEWED

    @model_validator(mode="after")
    def active_observation_must_belong_to_block(self) -> "Block":
        if self.active_observation_id not in self.observation_ids:
            raise ValueError("active_observation_id must be one of observation_ids")
        if self.active_text_revision_id is not None and self.active_text_revision_id not in self.text_revision_ids:
            raise ValueError("active_text_revision_id must be one of text_revision_ids")
        return self


class TextRevision(StrictModel):
    text_revision_id: str
    block_id: str
    origin: TextOrigin
    text: str
    parser_name: str | None = None
    parser_version: str | None = None
    confidence: Annotated[float | None, Field(ge=0, le=1)] = None
    previous_text_revision_id: str | None = None
    created_by: str | None = None
    reason: str | None = None
    created_at: datetime = Field(default_factory=utc_now)


class FormulaOccurrence(StrictModel):
    """Stable formula appearance, linked to run-specific formula observations."""

    formula_id: str
    source_version_id: str
    observation_ids: list[str] = Field(min_length=1)
    active_observation_id: str
    anchor: SourceAnchor
    visual_asset_id: str
    block_id: str | None = None
    review_status: ReviewStatus = ReviewStatus.NEEDS_REVIEW

    @model_validator(mode="after")
    def active_observation_must_belong_to_formula(self) -> "FormulaOccurrence":
        if self.active_observation_id not in self.observation_ids:
            raise ValueError("active_observation_id must be one of observation_ids")
        return self


class FormulaRecognition(StrictModel):
    formula_recognition_id: str
    formula_id: str
    latex: str
    parser_name: str
    parser_version: str
    confidence: Annotated[float | None, Field(ge=0, le=1)] = None
    created_at: datetime = Field(default_factory=utc_now)


class FigureOccurrence(StrictModel):
    figure_id: str
    source_version_id: str
    observation_ids: list[str] = Field(min_length=1)
    active_observation_id: str
    anchor: SourceAnchor
    visual_asset_id: str
    figure_type: str = "unknown"
    caption_block_ids: list[str] = Field(default_factory=list)
    description: str | None = None
    structured_data: dict[str, object] = Field(default_factory=dict)
    review_status: ReviewStatus = ReviewStatus.NEEDS_REVIEW

    @model_validator(mode="after")
    def active_observation_must_belong_to_figure(self) -> "FigureOccurrence":
        if self.active_observation_id not in self.observation_ids:
            raise ValueError("active_observation_id must be one of observation_ids")
        return self


class QuestionOption(StrictModel):
    label: str
    text_revision_ids: list[str] = Field(default_factory=list)
    block_ids: list[str] = Field(default_factory=list)


class Question(StrictModel):
    """Stable question entity; chapter/type are attributes, never identity components."""

    question_id: str
    source_version_id: str
    question_label: str | None = None
    block_ids: list[str] = Field(min_length=1)
    anchors: list[SourceAnchor] = Field(min_length=1)
    options: list[QuestionOption] = Field(default_factory=list)
    formula_ids: list[str] = Field(default_factory=list)
    figure_ids: list[str] = Field(default_factory=list)
    review_status: ReviewStatus = ReviewStatus.UNREVIEWED


class Solution(StrictModel):
    solution_id: str
    question_id: str
    source_version_id: str
    solution_type: SolutionType
    block_ids: list[str] = Field(min_length=1)
    anchors: list[SourceAnchor] = Field(min_length=1)
    text_revision_ids: list[str] = Field(default_factory=list)
    formula_ids: list[str] = Field(default_factory=list)
    figure_ids: list[str] = Field(default_factory=list)
    review_status: ReviewStatus = ReviewStatus.UNREVIEWED
