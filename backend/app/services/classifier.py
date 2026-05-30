import json
import logging
import httpx
from app.core.config import get_settings
from app.models.schemas import ClassificationResult, DocumentType


class ClassificationAgent:
    KEYWORDS: dict[DocumentType, list[str]] = {
        "fir": ["fir", "first information report", "police station", "complainant", "accused"],
        "legal_notice": ["legal notice", "notice", "hereby called upon", "within", "advocate"],
        "contract": ["agreement", "contract", "party", "terms and conditions", "consideration"],
        "eviction_notice": ["eviction", "vacate", "tenant", "landlord", "premises"],
        "employment_agreement": ["employment", "employee", "employer", "salary", "notice period"],
        "summons": ["summons", "appear before", "court", "case no", "hearing"],
        "complaint": ["complaint", "grievance", "consumer forum", "prayer"],
        "rti": ["right to information", "rti", "public information officer", "pio"],
        "affidavit": ["affidavit", "deponent", "solemnly affirm", "notary"],
        "unknown": [],
    }

    def __init__(self) -> None:
        self.last_source = "fallback"

    def classify(self, text: str) -> ClassificationResult:
        settings = get_settings()
        api_key = settings.gemini_api_key

        if api_key:
            try:
                schema = {
                    "type": "object",
                    "properties": {
                        "document_type": {
                            "type": "string",
                            "enum": ["fir", "legal_notice", "contract", "eviction_notice", "employment_agreement", "summons", "complaint", "rti", "affidavit", "unknown"]
                        },
                        "confidence": {
                            "type": "number",
                            "description": "Confidence level between 0.0 and 1.0"
                        },
                        "signals": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Key vocabulary or structural signals in the text that support this classification."
                        }
                    },
                    "required": ["document_type", "confidence", "signals"]
                }
                
                prompt = (
                    "Analyze the following legal text and classify its document type. "
                    "Select the best match from the supported types: "
                    "fir, legal_notice, contract, eviction_notice, employment_agreement, summons, complaint, rti, affidavit, or unknown. "
                    "Provide a confidence score (0.0 to 1.0) and a list of structural signals (e.g. phrases, header terms).\n\n"
                    f"Text:\n{text[:4000]}"
                )
                
                result_dict = self._call_gemini_api(prompt, schema, api_key, settings.gemini_model)
                self.last_source = "llm:gemini"
                return ClassificationResult(
                    document_type=result_dict.get("document_type", "unknown"),
                    confidence=round(result_dict.get("confidence", 0.5), 2),
                    signals=result_dict.get("signals", [])
                )
            except Exception as e:
                self.last_source = "fallback:keyword"
                logging.getLogger("uvicorn.error").warning(
                    f"Gemini classification failed, falling back to keyword classifier: {e}"
                )

        # Fallback to keyword-based classification
        lowered = text.lower()
        scored: list[tuple[DocumentType, int, list[str]]] = []
        for doc_type, keywords in self.KEYWORDS.items():
            if doc_type == "unknown":
                continue
            signals = [keyword for keyword in keywords if keyword in lowered]
            scored.append((doc_type, len(signals), signals))

        best_type, best_score, signals = max(scored, key=lambda item: item[1])
        if best_score == 0:
            self.last_source = "fallback:keyword"
            return ClassificationResult(document_type="unknown", confidence=0.15, signals=[])

        confidence = min(0.95, 0.35 + best_score * 0.15)
        self.last_source = "fallback:keyword"
        return ClassificationResult(
            document_type=best_type,
            confidence=round(confidence, 2),
            signals=signals,
        )

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
