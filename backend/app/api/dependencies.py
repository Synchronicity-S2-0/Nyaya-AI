from functools import lru_cache

from app.core.config import get_settings
from app.services.case_store import CaseStore, InMemoryCaseStore, SupabaseCaseStore
from app.services.case_workflow import CaseWorkflowService
from app.services.classifier import ClassificationAgent
from app.services.defense import DefenseAgent
from app.services.document_parser import DocumentParser
from app.services.drafting import DraftingAgent
from app.services.extraction import ExtractionAgent
from app.services.ocr import OCRService
from app.services.orchestration import LegalWorkflowOrchestrator
from app.services.rag import RAGService
from app.services.reasoning import LegalReasoningAgent
from app.services.recommendation import ActionRecommendationAgent
from app.services.translation import TranslationAgent


@lru_cache
def get_parser() -> DocumentParser:
    return DocumentParser(OCRService(get_settings()))


@lru_cache
def get_orchestrator() -> LegalWorkflowOrchestrator:
    return LegalWorkflowOrchestrator(
        classifier=ClassificationAgent(),
        extractor=ExtractionAgent(),
        rag=RAGService(),
        reasoning=LegalReasoningAgent(),
        recommender=ActionRecommendationAgent(),
        defense_agent=DefenseAgent(),
        drafter=DraftingAgent(),
        translator=TranslationAgent(),
    )


@lru_cache
def get_case_store() -> CaseStore:
    settings = get_settings()
    if settings.supabase_url and settings.supabase_service_role_key:
        return SupabaseCaseStore(settings)
    return InMemoryCaseStore()


@lru_cache
def get_case_workflow() -> CaseWorkflowService:
    return CaseWorkflowService(
        store=get_case_store(),
        parser=get_parser(),
        orchestrator=get_orchestrator(),
    )
