import json
import logging
import httpx
from app.core.config import get_settings
from app.models.schemas import ClassificationResult, DraftResult, DraftType, ExtractionResult


class DraftingAgent:
    def __init__(self) -> None:
        self.last_source = "not_requested"

    def draft(
        self,
        draft_type: DraftType,
        classification: ClassificationResult,
        extraction: ExtractionResult,
    ) -> DraftResult:
        settings = get_settings()
        api_key = settings.gemini_api_key

        if api_key:
            try:
                schema = {
                    "type": "object",
                    "properties": {
                        "draft_type": {
                            "type": "string",
                            "enum": ["complaint", "reply", "affidavit", "rti", "summary"],
                            "description": "The exact type of the draft being generated."
                        },
                        "title": {
                            "type": "string",
                            "description": "A formal legal title for the document (e.g. 'REPLY TO LEGAL NOTICE DATED 12.05.2026')."
                        },
                        "body": {
                            "type": "string",
                            "description": "The full text of the drafted document. Must use formal Indian legal draft formats. Must place brackets around variables requiring user input like [Name], [Address], [Date] so they are easily identifiable."
                        },
                        "placeholders": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "A list of all bracketed placeholders detected in the body (e.g. ['[Applicant Name]', '[Rent Amount]'])."
                        }
                    },
                    "required": ["draft_type", "title", "body", "placeholders"]
                }

                prompt = (
                    "You are an expert Indian legal drafting assistant. "
                    f"Generate a professional, legally-sound {draft_type} draft corresponding to a {classification.document_type} "
                    "using the extracted entities. Pre-fill any known fields (like names, sections, dates, and obligation values) "
                    "directly into the draft. For fields that are missing or require personal input from the citizen, "
                    "use clear brackets like [Applicant Name], [deponent age], or [Place of verification].\n\n"
                    f"Document Classification: {classification.document_type}\n"
                    f"Extracted Names: {', '.join(extraction.names) or 'None'}\n"
                    f"Extracted Dates & Deadlines: {', '.join(extraction.dates) or 'None'}\n"
                    f"Extracted Sections: {', '.join(extraction.legal_sections) or 'None'}\n"
                    f"Extracted Obligations: {', '.join(extraction.obligations) or 'None'}\n"
                    f"Extracted Risks: {', '.join(extraction.risks) or 'None'}\n"
                    f"Extracted Penalties: {', '.join(extraction.penalties) or 'None'}"
                )

                result_dict = self._call_gemini_api(prompt, schema, api_key, settings.gemini_model)
                self.last_source = "llm:gemini"
                return DraftResult(
                    draft_type=result_dict.get("draft_type", draft_type),
                    title=result_dict.get("title", f"Draft {draft_type.capitalize()}"),
                    body=result_dict.get("body", ""),
                    placeholders=result_dict.get("placeholders", [])
                )
            except Exception as e:
                self.last_source = "fallback:template"
                logging.getLogger("uvicorn.error").warning(
                    f"Gemini drafting failed, falling back to static templates: {e}"
                )

        # Fallback to original static template-based drafting
        self.last_source = "fallback:template"
        doc_label = classification.document_type.replace("_", " ")
        if draft_type == "reply":
            title = "Draft Reply"
            body = (
                "To,\n[Recipient Name]\n[Address]\n\n"
                "Subject: Reply to your notice/document\n\n"
                "I/We acknowledge receipt of the document referred to above. The allegations and demands are denied except where expressly admitted. "
                f"The document appears to relate to a {doc_label}. Based on the available record, the following points require correction or clarification:\n\n"
                "1. [State factual correction]\n"
                "2. [Attach supporting document reference]\n"
                "3. [State requested resolution]\n\n"
                "This reply is issued without prejudice to all rights and remedies available in law.\n\n"
                "Sincerely,\n[Your Name]"
            )
        elif draft_type == "rti":
            title = "Draft RTI Application"
            body = (
                "To,\nThe Public Information Officer\n[Public Authority]\n\n"
                "Subject: Application under the Right to Information Act, 2005\n\n"
                "Please provide the following information:\n"
                "1. [Specific information request]\n"
                "2. [Specific information request]\n"
                "3. [Certified copy request, if needed]\n\n"
                "Applicant details:\n[Name]\n[Address]\n[Contact]\n\n"
                "Fee details: [IPO/DD/Online reference]\n\n"
                "Sincerely,\n[Applicant Name]"
            )
        elif draft_type == "affidavit":
            title = "Draft Affidavit"
            body = (
                "AFFIDAVIT\n\n"
                "I, [Name], aged [Age], residing at [Address], do solemnly affirm and state as follows:\n\n"
                "1. I am the deponent and am competent to swear this affidavit.\n"
                "2. The facts stated below are true to my personal knowledge and records.\n"
                "3. [Insert fact]\n"
                "4. [Insert fact]\n\n"
                "Verified at [Place] on [Date].\n\n"
                "Deponent"
            )
        elif draft_type == "complaint":
            title = "Draft Complaint"
            body = (
                "To,\n[Authority/Forum]\n\n"
                "Subject: Complaint regarding [Issue]\n\n"
                "I request your intervention regarding the matter described below:\n\n"
                "1. Parties involved: [Names]\n"
                "2. Facts in brief: [Timeline]\n"
                "3. Documents attached: [List]\n"
                "4. Relief requested: [Action requested]\n\n"
                "Please take appropriate action as per law.\n\n"
                "Sincerely,\n[Complainant Name]"
            )
        else:
            title = "Document Summary Draft"
            body = (
                f"Document type: {doc_label}\n"
                f"Dates found: {', '.join(extraction.dates) or 'None detected'}\n"
                f"Deadlines found: {', '.join(extraction.deadlines) or 'None detected'}\n"
                f"Legal sections found: {', '.join(extraction.legal_sections) or 'None detected'}\n"
                "Key issue: [Write in one sentence]\n"
                "Suggested action: [Write next procedural step]\n"
            )

        return DraftResult(
            draft_type=draft_type,
            title=title,
            body=body,
            placeholders=self._placeholders(body),
        )

    def _placeholders(self, body: str) -> list[str]:
        placeholders = []
        start = 0
        while True:
            open_at = body.find("[", start)
            close_at = body.find("]", open_at)
            if open_at == -1 or close_at == -1:
                break
            value = body[open_at : close_at + 1]
            if value not in placeholders:
                placeholders.append(value)
            start = close_at + 1
        return placeholders

    def _call_gemini_api(self, prompt: str, schema: dict, api_key: str, model: str) -> dict:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        headers = {
            "Content-Type": "application/json"
        }
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ],
            "generationConfig": {
                "response_mime_type": "application/json",
                "response_schema": schema,
                "temperature": 0.1
            }
        }
        with httpx.Client() as client:
            resp = client.post(url, json=payload, headers=headers, timeout=10.0)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(text)
            else:
                raise ValueError(f"Gemini API returned status code {resp.status_code}: {resp.text}")
