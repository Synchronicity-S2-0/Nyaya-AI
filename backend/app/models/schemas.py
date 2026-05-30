from typing import Literal

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
    disclaimer: str


class SupportedOptions(BaseModel):
    document_types: list[str]
    languages: dict[str, str]
    draft_types: list[str]
