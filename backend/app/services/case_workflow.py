from __future__ import annotations

from fastapi import UploadFile

from app.models.schemas import AnalysisResponse, DraftType
from app.services.case_store import CaseAccessError, CaseNotFoundError, CaseStore
from app.services.document_parser import DocumentParser
from app.services.orchestration import LegalWorkflowOrchestrator


class CaseWorkflowService:
    def __init__(
        self,
        store: CaseStore,
        parser: DocumentParser,
        orchestrator: LegalWorkflowOrchestrator,
    ) -> None:
        self.store = store
        self.parser = parser
        self.orchestrator = orchestrator

    def create_case(self, user_id: str, title: str | None) -> tuple[dict, dict]:
        case = self.store.create_case(user_id, title)
        event = self.store.add_event(
            case["id"],
            user_id,
            "case_created",
            f"Case created: {case['title']}",
            {"case_id": case["id"]},
        )
        return case, event

    def list_cases(self, user_id: str) -> list[dict]:
        return self.store.list_cases(user_id)

    def get_case_detail(self, case_id: str, user_id: str) -> dict:
        return self.store.get_case_detail(case_id, user_id)

    async def analyze_file(
        self,
        case_id: str,
        user_id: str,
        upload: UploadFile,
        target_language: str = "en",
        draft_type: DraftType | None = None,
    ) -> tuple[dict, list[dict], AnalysisResponse]:
        self.store.get_case(case_id, user_id)
        content = await upload.read()
        file_name = upload.filename or "uploaded-document"
        content_type = upload.content_type or "application/octet-stream"
        file_url = self.store.upload_file(case_id, file_name, content, content_type)
        upload.file.seek(0)
        parsed = await self.parser.parse_upload(upload)
        if not parsed.text.strip():
            parsed.warnings.append("No readable text was found; orchestration will return limited guidance.")

        analysis = self.orchestrator.run(parsed, target_language=target_language, draft_type=draft_type)
        document = self._save_analysis_document(
            case_id=case_id,
            user_id=user_id,
            source_type=parsed.source_type,
            extracted_text=parsed.text,
            analysis=analysis,
            file_name=file_name,
            file_url=file_url,
        )
        upload_event = self.store.add_event(
            case_id,
            user_id,
            "document_uploaded",
            f"Uploaded {file_name}",
            {"document_id": document["id"], "file_name": file_name, "file_url": file_url},
        )
        analysis_event = self._add_analysis_event(case_id, user_id, document, analysis)
        return document, [upload_event, analysis_event], analysis

    def analyze_text(
        self,
        case_id: str,
        user_id: str,
        text: str,
        target_language: str = "en",
        draft_type: DraftType | None = None,
    ) -> tuple[dict, list[dict], AnalysisResponse]:
        self.store.get_case(case_id, user_id)
        parsed = self.parser.parse_text(text)
        analysis = self.orchestrator.run(parsed, target_language=target_language, draft_type=draft_type)
        document = self._save_analysis_document(
            case_id=case_id,
            user_id=user_id,
            source_type="text",
            extracted_text=text,
            analysis=analysis,
        )
        text_event = self.store.add_event(
            case_id,
            user_id,
            "text_submitted",
            "Pasted legal text submitted",
            {"document_id": document["id"]},
        )
        analysis_event = self._add_analysis_event(case_id, user_id, document, analysis)
        return document, [text_event, analysis_event], analysis

    def answer_question(self, case_id: str, user_id: str, message: str) -> tuple[dict, dict, list[dict]]:
        detail = self.store.get_case_detail(case_id, user_id)
        user_message = self.store.add_message(case_id, user_id, "user", message)
        question_event = self.store.add_event(
            case_id,
            user_id,
            "user_question",
            message[:180],
            {"message_id": user_message["id"]},
        )
        answer = self._build_case_answer(detail, message)
        assistant_message = self.store.add_message(case_id, user_id, "assistant", answer)
        answer_event = self.store.add_event(
            case_id,
            user_id,
            "assistant_response",
            answer[:180],
            {"message_id": assistant_message["id"]},
        )
        return user_message, assistant_message, [question_event, answer_event]

    def _save_analysis_document(
        self,
        case_id: str,
        user_id: str,
        source_type: str,
        extracted_text: str,
        analysis: AnalysisResponse,
        file_name: str | None = None,
        file_url: str | None = None,
    ) -> dict:
        analysis_json = analysis.model_dump(mode="json")
        document_type = analysis.classification.document_type
        urgency = analysis.recommendations.urgency
        document = self.store.add_document(
            case_id=case_id,
            user_id=user_id,
            source_type=source_type,
            extracted_text=extracted_text,
            analysis_json=analysis_json,
            document_type=document_type,
            file_name=file_name,
            file_url=file_url,
        )
        self.store.update_case_after_analysis(case_id, document_type, urgency)
        return document

    def _add_analysis_event(
        self,
        case_id: str,
        user_id: str,
        document: dict,
        analysis: AnalysisResponse,
    ) -> dict:
        doc_label = analysis.classification.document_type.replace("_", " ")
        urgency = analysis.recommendations.urgency
        return self.store.add_event(
            case_id,
            user_id,
            "analysis_completed",
            f"Analysis completed: {doc_label} with {urgency} urgency",
            {
                "document_id": document["id"],
                "document_type": analysis.classification.document_type,
                "urgency": urgency,
            },
        )

    def _build_case_answer(self, detail: dict, question: str) -> str:
        documents = detail["documents"]
        if not documents:
            return (
                "I do not see any analyzed document in this case yet. Upload or paste the latest "
                "notice/document first, then I can answer using the case history. "
                "This is first-level legal triage, not final legal advice."
            )

        latest = documents[-1]
        analysis = latest["analysis_json"]
        classification = analysis.get("classification", {})
        recommendations = analysis.get("recommendations", {})
        defense = analysis.get("defense") or {}
        extraction = analysis.get("extraction", {})

        next_steps = recommendations.get("next_steps", [])[:4]
        deadlines = extraction.get("deadlines", [])
        obligations = extraction.get("obligations", [])
        loopholes = defense.get("detected_loopholes", [])

        parts = [
            f"Based on the saved case history, the latest document is classified as {classification.get('document_type', 'unknown')}.",
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
