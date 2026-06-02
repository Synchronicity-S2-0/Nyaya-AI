from app.models.schemas import AnalysisResponse, DraftType, ParsedDocument, ProcessingTrace
from app.services.bns_lookup import BNSLookupService
from app.services.classifier import ClassificationAgent
from app.services.defense import DefenseAgent
from app.services.drafting import DraftingAgent
from app.services.extraction import ExtractionAgent
from app.services.rag import RAGService
from app.services.reasoning import LegalReasoningAgent
from app.services.recommendation import ActionRecommendationAgent
from app.services.translation import TranslationAgent


DISCLAIMER = (
    "Nyaya AI is a legal accessibility and first-level triage assistant. "
    "It does not replace a lawyer and should not be treated as final legal advice."
)


class LegalWorkflowOrchestrator:
    def __init__(
        self,
        classifier: ClassificationAgent,
        extractor: ExtractionAgent,
        bns_lookup: BNSLookupService,
        rag: RAGService,
        reasoning: LegalReasoningAgent,
        recommender: ActionRecommendationAgent,
        defense_agent: DefenseAgent,
        drafter: DraftingAgent,
        translator: TranslationAgent,
    ):
        self.classifier = classifier
        self.extractor = extractor
        self.bns_lookup = bns_lookup
        self.rag = rag
        self.reasoning = reasoning
        self.recommender = recommender
        self.defense_agent = defense_agent
        self.drafter = drafter
        self.translator = translator

    def run(
        self,
        parsed: ParsedDocument,
        target_language: str = "en",
        draft_type: DraftType | None = None,
    ) -> AnalysisResponse:
        classification = self.classifier.classify(parsed.text)
        extraction = self.extractor.extract(parsed.text)

        # ── BNS Lookup: fetch live statute text for extracted legal sections ──
        statutory_sources = self.bns_lookup.lookup(extraction.legal_sections)

        knowledge = self.rag.retrieve(parsed.text, classification, extraction)
        explanation = self.reasoning.explain(
            parsed.text, classification, extraction, knowledge, statutory_sources
        )
        recommendations = self.recommender.recommend(classification, extraction, knowledge)
        defense = self.defense_agent.analyze(parsed.text, classification, extraction, knowledge)
        draft = self.drafter.draft(draft_type, classification, extraction, parsed.text) if draft_type else None
        if not draft_type:
            self.drafter.last_source = "not_requested"
        translation = self.translator.translate(
            target_language,
            explanation.summary,
            recommendations.next_steps,
        )
        processing = ProcessingTrace(
            classifier=self.classifier.last_source,
            extraction=self.extractor.last_source,
            bns_lookup=self.bns_lookup.last_source,
            rag=self.rag.last_source,
            reasoning=self.reasoning.last_source,
            recommendation=self.recommender.last_source,
            defense=self.defense_agent.last_source,
            drafting=self.drafter.last_source,
            translation=self.translator.last_source,
        )

        return AnalysisResponse(
            parsed=parsed,
            classification=classification,
            extraction=extraction,
            explanation=explanation,
            knowledge=knowledge,
            statutory_sources=statutory_sources,
            recommendations=recommendations,
            defense=defense,
            draft=draft,
            translation=translation,
            processing=processing,
            disclaimer=DISCLAIMER,
        )
