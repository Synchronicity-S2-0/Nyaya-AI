import json
import logging
import httpx
from app.core.config import get_settings
from app.models.schemas import ClassificationResult, ExplanationResult, ExtractionResult, KnowledgeSnippet


class LegalReasoningAgent:
    def __init__(self) -> None:
        self.last_source = "fallback"

    def explain(
        self,
        text: str,
        classification: ClassificationResult,
        extraction: ExtractionResult,
        knowledge: list[KnowledgeSnippet],
    ) -> ExplanationResult:
        settings = get_settings()
        api_key = settings.gemini_api_key

        if api_key:
            try:
                schema = {
                    "type": "object",
                    "properties": {
                        "summary": {
                            "type": "string",
                            "description": "A very concise (1-2 sentences) high-level summary of what this document is and its main implication."
                        },
                        "simple_explanation": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Clear, bulleted points explaining the document contents in simple, non-legal language suitable for an ordinary citizen."
                        },
                        "caveats": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Important warnings, disclaimers, or standard safety alerts about what could happen if they fail to act or if the analysis is incorrect."
                        }
                    },
                    "required": ["summary", "simple_explanation", "caveats"]
                }

                knowledge_context = "\n".join([f"- {k.title}: {k.content}" for k in knowledge])
                
                prompt = (
                    "You are a compassionate, clear, and objective legal accessibility assistant for common citizens in India. "
                    "Explain the provided document text in simple, everyday language. Do not use legal jargon without explaining it. "
                    "Synthesize your explanation using the document classification, extracted entities, and relevant legal knowledge context provided.\n\n"
                    f"Document Type: {classification.document_type} (Confidence: {classification.confidence:.0%})\n"
                    f"Extracted Sections: {', '.join(extraction.legal_sections) or 'None'}\n"
                    f"Extracted Dates & Deadlines: {', '.join(extraction.deadlines) or 'None'}\n"
                    f"Relevant Central/State Acts Context:\n{knowledge_context or 'None'}\n\n"
                    f"Raw Text snippet:\n{text[:3000]}"
                )

                result_dict = self._call_gemini_api(prompt, schema, api_key, settings.gemini_model)
                self.last_source = "llm:gemini"
                return ExplanationResult(
                    summary=result_dict.get("summary", ""),
                    simple_explanation=result_dict.get("simple_explanation", []),
                    caveats=result_dict.get("caveats", [])
                )
            except Exception as e:
                self.last_source = "fallback:template"
                logging.getLogger("uvicorn.error").warning(
                    f"Gemini reasoning failed, falling back to template-based explanation: {e}"
                )

        # Fallback to template-based explanation
        self.last_source = "fallback:template"
        doc_label = classification.document_type.replace("_", " ")
        summary = (
            f"This appears to be a {doc_label} with {classification.confidence:.0%} confidence."
            if classification.document_type != "unknown"
            else "The document type is unclear from the available text."
        )

        bullets = [
            "Read this as a first-level triage summary, not as a final legal opinion.",
            f"The system found {len(extraction.dates)} date(s), {len(extraction.deadlines)} deadline signal(s), and {len(extraction.legal_sections)} legal section reference(s).",
        ]
        if extraction.obligations:
            bullets.append(f"Main obligation detected: {extraction.obligations[0]}")
        if extraction.risks:
            bullets.append(f"Main risk detected: {extraction.risks[0]}")
        if knowledge:
            bullets.append(f"Relevant procedural context: {knowledge[0].content}")
        if not text.strip():
            bullets.append("No readable text was available, so analysis is limited.")

        caveats = [
            "This does not replace a lawyer, advocate, or legal aid authority.",
            "Verify facts, names, dates, sections, and deadlines against the original document.",
            "For urgent deadlines, court summons, arrest risk, eviction, or high-value disputes, contact a qualified lawyer promptly.",
        ]

        return ExplanationResult(summary=summary, simple_explanation=bullets, caveats=caveats)

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
                "responseMimeType": "application/json",
                "responseJsonSchema": schema,
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
