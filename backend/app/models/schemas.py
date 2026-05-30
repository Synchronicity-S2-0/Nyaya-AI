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


class CaseCreateRequest(BaseModel):
    user_id: str = Field(..., min_length=1)
    title: str | None = None


class CaseAnalyzeTextRequest(BaseModel):
    user_id: str = Field(..., min_length=1)
    text: str = Field(..., min_length=1)
    target_language: str = "en"
    draft_type: DraftType | None = None


class CaseMessageRequest(BaseModel):
    user_id: str = Field(..., min_length=1)
    message: str = Field(..., min_length=1)
    target_language: str = "en"


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


class CaseRecord(BaseModel):
    id: str
    user_id: str
    title: str
    case_type: str | None = None
    status: str = "open"
    latest_urgency: str | None = None
    created_at: str
    updated_at: str


class CaseDocumentRecord(BaseModel):
    id: str
    case_id: str
    user_id: str
    source_type: str
    file_url: str | None = None
    file_name: str | None = None
    extracted_text: str
    analysis_json: dict[str, Any]
    document_type: str
    created_at: str


class CaseMessageRecord(BaseModel):
    id: str
    case_id: str
    user_id: str
    role: Literal["user", "assistant"]
    message: str
    created_at: str


class CaseEventRecord(BaseModel):
    id: str
    case_id: str
    user_id: str
    event_type: Literal[
        "case_created",
        "document_uploaded",
        "text_submitted",
        "analysis_completed",
        "user_question",
        "assistant_response",
    ]
    summary: str
    metadata_json: dict[str, Any] = Field(default_factory=dict)
    created_at: str


class CaseCreateResponse(BaseModel):
    case_id: str
    case: CaseRecord


class CaseListResponse(BaseModel):
    cases: list[CaseRecord]


class CaseDetailResponse(BaseModel):
    case: CaseRecord
    documents: list[CaseDocumentRecord]
    messages: list[CaseMessageRecord]
    events: list[CaseEventRecord]


class CaseAnalysisResponse(BaseModel):
    case_id: str
    document_id: str
    event_ids: list[str]
    analysis: AnalysisResponse


class CaseMessageResponse(BaseModel):
    case_id: str
    user_message: CaseMessageRecord
    assistant_message: CaseMessageRecord
    event_ids: list[str]
