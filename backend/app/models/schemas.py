from typing import Any, Literal

from pydantic import BaseModel, Field


DocumentType = Literal[
    "fir",
    "legal_notice",
    "contract",
    "eviction_notice",
    "employment_agreement",
    "summons",
    "complaint",
    "rti",
    "affidavit",
    "unknown",
]


DraftType = Literal["complaint", "reply", "affidavit", "rti", "summary"]


class AnalyzeTextRequest(BaseModel):
    text: str = Field(..., min_length=1)
    target_language: str = "en"
    draft_type: DraftType | None = None


class CaseAnalyzeTextRequest(BaseModel):
    user_id: str = Field(..., min_length=1)
    text: str = Field(..., min_length=1)
    target_language: str = "en"
    draft_type: DraftType | None = None
    document_id: str | None = None
    file_url: str | None = None
    file_name: str | None = None


class CaseMessageRequest(BaseModel):
    user_id: str = Field(..., min_length=1)
    message: str = Field(..., min_length=1)
    target_language: str = "en"
    documents: list[dict[str, Any]] = Field(default_factory=list)
    messages: list[dict[str, Any]] = Field(default_factory=list)
    events: list[dict[str, Any]] = Field(default_factory=list)


class ParsedDocument(BaseModel):
    source_type: str
    text: str
    page_count: int | None = None
    warnings: list[str] = Field(default_factory=list)


class ClassificationResult(BaseModel):
    document_type: DocumentType
    confidence: float
    signals: list[str] = Field(default_factory=list)


class ExtractedEntity(BaseModel):
    label: str
    value: str
    context: str | None = None


class ExtractionResult(BaseModel):
    names: list[str] = Field(default_factory=list)
    dates: list[str] = Field(default_factory=list)
    deadlines: list[str] = Field(default_factory=list)
    legal_sections: list[str] = Field(default_factory=list)
    obligations: list[str] = Field(default_factory=list)
    risks: list[str] = Field(default_factory=list)
    penalties: list[str] = Field(default_factory=list)
    entities: list[ExtractedEntity] = Field(default_factory=list)


class KnowledgeSnippet(BaseModel):
    title: str
    content: str
    tags: list[str] = Field(default_factory=list)
    score: float


class StatutorySource(BaseModel):
    """A verified statutory citation fetched live from InsightLaw (official Gazette text)."""

    corpus: str
    """Legal corpus: 'BNS', 'IPC', 'BNSS', 'BSA', or 'CONSTITUTION'."""

    section_number: str
    """Numeric section or article identifier (e.g. '103', '302', '21')."""

    title: str
    """Official section heading (e.g. 'Punishment for murder')."""

    text_preview: str
    """First ~300 characters of the section text from the official gazette."""

    source_url: str
    """IndiaCode.nic.in permalink — government-authoritative full text."""

    api_source: str
    """Attribution for the live-fetch API (e.g. 'insightlaw.in')."""

    in_force: bool
    """True for BNS/BNSS/BSA (current law). False for IPC/CrPC (repealed July 2024)."""

    ipc_to_bns_note: str = ""
    """Non-empty only for repealed IPC sections, advising the BNS equivalent."""

    fetched_at: str
    """ISO 8601 timestamp of when this citation was fetched from the live API."""


class ExplanationResult(BaseModel):
    summary: str
    simple_explanation: list[str]
    caveats: list[str]


class ActionRecommendation(BaseModel):
    next_steps: list[str]
    required_documents: list[str]
    authorities: list[str]
    escalation_paths: list[str]
    urgency: Literal["low", "medium", "high"]


class DraftResult(BaseModel):
    draft_type: DraftType
    title: str
    body: str
    placeholders: list[str]


class LoopholeDetail(BaseModel):
    description: str = Field(
        description="Clear description of the loophole or procedural defect found in the document."
    )
    legal_basis: str = Field(
        description="The Indian legal provision, section, or principle that supports this defense "
                    "(e.g. 'Section 3, Limitation Act 1963', 'Order VII Rule 11 CPC')."
    )
    action_item: str = Field(
        description="Concrete step the citizen should take to raise or exploit this defense."
    )


class DefenseAnalysis(BaseModel):
    detected_loopholes: list[LoopholeDetail] = Field(default_factory=list)
    defense_strategy: str = Field(
        default="",
        description="Overall recommended defense strategy summarising how the citizen should respond."
    )


class TranslationResult(BaseModel):
    language: str
    mode: str
    translated_summary: str
    translated_next_steps: list[str]


class ProcessingTrace(BaseModel):
    classifier: str
    extraction: str
    bns_lookup: str
    rag: str
    reasoning: str
    recommendation: str
    defense: str
    drafting: str | None = None
    translation: str | None = None


class AnalysisResponse(BaseModel):
    parsed: ParsedDocument
    classification: ClassificationResult
    extraction: ExtractionResult
    explanation: ExplanationResult
    knowledge: list[KnowledgeSnippet]
    statutory_sources: list[StatutorySource] = Field(default_factory=list)
    """Live statutory citations fetched from official gazette text — for judge-level source trust."""
    recommendations: ActionRecommendation
    defense: DefenseAnalysis | None = None
    draft: DraftResult | None = None
    translation: TranslationResult | None = None
    processing: ProcessingTrace
    disclaimer: str


class SupportedOptions(BaseModel):
    document_types: list[str]
    languages: dict[str, str]
    draft_types: list[str]


class SuggestedCaseDocument(BaseModel):
    case_id: str
    user_id: str
    source_type: str
    file_url: str | None = None
    file_name: str | None = None
    extracted_text: str
    analysis_json: dict[str, Any]
    document_type: str


class SuggestedCaseMessage(BaseModel):
    case_id: str
    user_id: str
    role: Literal["user", "assistant"]
    message: str


class SuggestedCaseEvent(BaseModel):
    case_id: str
    user_id: str
    event_type: Literal[
        "document_uploaded",
        "text_submitted",
        "analysis_completed",
        "user_question",
        "assistant_response",
    ]
    summary: str
    metadata_json: dict[str, Any] = Field(default_factory=dict)


class CaseAnalysisResponse(BaseModel):
    case_id: str
    document_id: str | None = None
    analysis: AnalysisResponse
    suggested_document: SuggestedCaseDocument
    suggested_events: list[SuggestedCaseEvent]
    case_update: dict[str, str]


class CaseMessageResponse(BaseModel):
    case_id: str
    user_message: SuggestedCaseMessage
    assistant_message: SuggestedCaseMessage
    suggested_events: list[SuggestedCaseEvent]
