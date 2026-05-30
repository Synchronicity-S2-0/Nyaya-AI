from __future__ import annotations

from fastapi import UploadFile

from app.models.schemas import (
    AnalysisResponse,
    DraftType,
    SuggestedCaseDocument,
    SuggestedCaseEvent,
    SuggestedCaseMessage,
)
from app.services.document_parser import DocumentParser
from app.services.orchestration import LegalWorkflowOrchestrator


class CaseWorkflowService:
    def __init__(
        self,
        parser: DocumentParser,
        orchestrator: LegalWorkflowOrchestrator,
    ) -> None:
        self.parser = parser
        self.orchestrator = orchestrator

    async def analyze_file(
        self,
        case_id: str,
        user_id: str,
        upload: UploadFile,
        target_language: str = "en",
        draft_type: DraftType | None = None,
        document_id: str | None = None,
        file_url: str | None = None,
    ) -> tuple[SuggestedCaseDocument, list[SuggestedCaseEvent], AnalysisResponse]:
        parsed = await self.parser.parse_upload(upload)
        if not parsed.text.strip():
            parsed.warnings.append("No readable text was found; orchestration will return limited guidance.")

        analysis = self.orchestrator.run(parsed, target_language=target_language, draft_type=draft_type)
        file_name = upload.filename or "uploaded-document"
        document = self._suggest_document(
            case_id=case_id,
            user_id=user_id,
            source_type=parsed.source_type,
            extracted_text=parsed.text,
            analysis=analysis,
            file_name=file_name,
            file_url=file_url,
        )
        events = [
            SuggestedCaseEvent(
                case_id=case_id,
                user_id=user_id,
                event_type="document_uploaded",
                summary=f"Uploaded {file_name}",
                metadata_json={
                    "document_id": document_id,
                    "file_name": file_name,
                    "file_url": file_url,
                },
            ),
            self._analysis_event(case_id, user_id, document_id, analysis),
        ]
        return document, events, analysis

    def analyze_text(
        self,
        case_id: str,
        user_id: str,
        text: str,
        target_language: str = "en",
        draft_type: DraftType | None = None,
        document_id: str | None = None,
        file_url: str | None = None,
        file_name: str | None = None,
    ) -> tuple[SuggestedCaseDocument, list[SuggestedCaseEvent], AnalysisResponse]:
        parsed = self.parser.parse_text(text)
        analysis = self.orchestrator.run(parsed, target_language=target_language, draft_type=draft_type)
        document = self._suggest_document(
            case_id=case_id,
            user_id=user_id,
            source_type="text",
            extracted_text=text,
            analysis=analysis,
            file_name=file_name,
            file_url=file_url,
        )
        events = [
            SuggestedCaseEvent(
                case_id=case_id,
                user_id=user_id,
                event_type="text_submitted",
                summary="Pasted legal text submitted",
                metadata_json={"document_id": document_id, "file_url": file_url},
            ),
            self._analysis_event(case_id, user_id, document_id, analysis),
        ]
        return document, events, analysis

    def answer_question(
        self,
        case_id: str,
        user_id: str,
        message: str,
        documents: list[dict],
        messages: list[dict],
        events: list[dict],
    ) -> tuple[SuggestedCaseMessage, SuggestedCaseMessage, list[SuggestedCaseEvent]]:
        user_message = SuggestedCaseMessage(
            case_id=case_id,
            user_id=user_id,
            role="user",
            message=message,
        )
        answer = self._build_case_answer(documents, message)
        assistant_message = SuggestedCaseMessage(
            case_id=case_id,
            user_id=user_id,
            role="assistant",
            message=answer,
        )
        suggested_events = [
            SuggestedCaseEvent(
                case_id=case_id,
                user_id=user_id,
                event_type="user_question",
                summary=message[:180],
                metadata_json={"prior_message_count": len(messages), "prior_event_count": len(events)},
            ),
            SuggestedCaseEvent(
                case_id=case_id,
                user_id=user_id,
                event_type="assistant_response",
                summary=answer[:180],
                metadata_json={},
            ),
        ]
        return user_message, assistant_message, suggested_events

    def _suggest_document(
        self,
        case_id: str,
        user_id: str,
        source_type: str,
        extracted_text: str,
        analysis: AnalysisResponse,
        file_name: str | None = None,
        file_url: str | None = None,
    ) -> SuggestedCaseDocument:
        return SuggestedCaseDocument(
            case_id=case_id,
            user_id=user_id,
            source_type=source_type,
            file_url=file_url,
            file_name=file_name,
            extracted_text=extracted_text,
            analysis_json=analysis.model_dump(mode="json"),
            document_type=analysis.classification.document_type,
        )

    def _analysis_event(
        self,
        case_id: str,
        user_id: str,
        document_id: str | None,
        analysis: AnalysisResponse,
    ) -> SuggestedCaseEvent:
        doc_label = analysis.classification.document_type.replace("_", " ")
        urgency = analysis.recommendations.urgency
        return SuggestedCaseEvent(
            case_id=case_id,
            user_id=user_id,
            event_type="analysis_completed",
            summary=f"Analysis completed: {doc_label} with {urgency} urgency",
            metadata_json={
                "document_id": document_id,
                "document_type": analysis.classification.document_type,
                "urgency": urgency,
            },
        )

    def _build_case_answer(self, documents: list[dict], question: str) -> str:
        if not documents:
            return (
                "I do not see any analyzed document in the supplied case context yet. "
                "Analyze the latest notice/document first, then ask again with the saved documents. "
                "This is first-level legal triage, not final legal advice."
            )

        latest = documents[-1]
        analysis = latest.get("analysis_json") or latest.get("analysisJson") or latest.get("analysis") or {}
        classification = analysis.get("classification", {})
        recommendations = analysis.get("recommendations", {})
        defense = analysis.get("defense") or {}
        extraction = analysis.get("extraction", {})

        next_steps = recommendations.get("next_steps", [])[:4]
        deadlines = extraction.get("deadlines", [])
        obligations = extraction.get("obligations", [])
        loopholes = defense.get("detected_loopholes", [])

        parts = [
            f"Based on the supplied case history, the latest document is classified as {classification.get('document_type', 'unknown')}.",
            f"Your question was: {question}",
        ]
        if deadlines:
            parts.append(f"Important deadline signal: {deadlines[0]}.")
        if obligations:
            parts.append(f"Main obligation from the latest document: {obligations[0]}")
        if next_steps:
            parts.append("Recommended next steps: " + " ".join(f"{idx + 1}. {step}" for idx, step in enumerate(next_steps)))
        if loopholes:
            parts.append(f"Before acting, verify this procedural point: {loopholes[0].get('action_item', '')}")
        parts.append("For urgent deadlines, eviction, criminal risk, or high-value disputes, consult a qualified advocate or legal aid authority promptly.")
        return "\n\n".join(part for part in parts if part.strip())
