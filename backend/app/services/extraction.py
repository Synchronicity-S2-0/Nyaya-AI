import re
import json
import logging
import httpx
from app.core.config import get_settings
from app.models.schemas import ExtractedEntity, ExtractionResult


class ExtractionAgent:
    DATE_PATTERN = re.compile(
        r"\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+\d{4})\b",
        re.IGNORECASE,
    )
    SECTION_PATTERN = re.compile(
        r"\b(?:section|sec\.?|u/s)\s*\d+[A-Za-z-]*(?:\s+of\s+(?:ipc|crpc|bns|bnss|it act|rti act))?",
        re.IGNORECASE,
    )
    MONEY_PATTERN = re.compile(r"\b(?:rs\.?|inr|₹)\s?[\d,]+(?:\.\d{1,2})?\b", re.IGNORECASE)
    DEADLINE_PATTERN = re.compile(
        r"\b(?:within|before|by|not later than)\s+(?:\d+\s+)?(?:days?|weeks?|months?|\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|[A-Za-z]+\s+\d{1,2},?\s+\d{4})\b",
        re.IGNORECASE,
    )
    NAME_PATTERN = re.compile(
        r"\b(?:Mr\.|Mrs\.|Ms\.|Shri|Smt\.|Kumari|Advocate|Dr\.)\s+[A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){0,3}\b"
    )

    def __init__(self) -> None:
        self.last_source = "fallback"

    def extract(self, text: str) -> ExtractionResult:
        settings = get_settings()
        api_key = settings.gemini_api_key

        if api_key:
            try:
                schema = {
                    "type": "object",
                    "properties": {
                        "names": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Names of individuals, advocates, corporations, government authorities, or key parties."
                        },
                        "dates": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Explicit calendar dates mentioned (e.g. 12-05-2026, 12 May 2026)."
                        },
                        "deadlines": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Any specific legal or procedural deadline statements (e.g., 'within 15 days', 'by 5 PM on 30th May')."
                        },
                        "legal_sections": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Specific acts, sections, rules, or statutes mentioned (e.g., 'Section 138 of NI Act', 'Section 420 of IPC')."
                        },
                        "obligations": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Specific requirements, requirements to pay, perform, submit, or do something."
                        },
                        "risks": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Potential hazards, threats, eviction risk, arrest warnings, default consequences, or litigation threats."
                        },
                        "penalties": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Fines, financial charges, interest rates, or criminal sentences mentioned."
                        },
                        "entities": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "label": {"type": "string", "description": "Type of entity (e.g., name, date, legal_section, monetary_value)."},
                                    "value": {"type": "string", "description": "The exact text value of the entity."},
                                    "context": {"type": "string", "description": "A short snippet of surrounding context."}
                                },
                                "required": ["label", "value"]
                            }
                        }
                    },
                    "required": ["names", "dates", "deadlines", "legal_sections", "obligations", "risks", "penalties", "entities"]
                }

                prompt = (
                    "Analyze the following legal text and extract key structural entities: "
                    "names, explicit dates, deadlines, legal sections or acts, obligations, risks, penalties, and individual structured entity objects. "
                    "Focus specifically on context relevant to an ordinary citizen's legal rights and obligations.\n\n"
                    f"Text:\n{text[:4000]}"
                )

                result_dict = self._call_gemini_api(prompt, schema, api_key, settings.gemini_model)
                
                # Transform plain dict into ExtractionResult Pydantic model
                entities = [
                    ExtractedEntity(
                        label=e.get("label", "unknown"),
                        value=e.get("value", ""),
                        context=e.get("context")
                    )
                    for e in result_dict.get("entities", [])
                ]
                
                self.last_source = "llm:gemini"
                return ExtractionResult(
                    names=result_dict.get("names", []),
                    dates=result_dict.get("dates", []),
                    deadlines=result_dict.get("deadlines", []),
                    legal_sections=result_dict.get("legal_sections", []),
                    obligations=result_dict.get("obligations", []),
                    risks=result_dict.get("risks", []),
                    penalties=result_dict.get("penalties", []),
                    entities=entities
                )
            except Exception as e:
                self.last_source = "fallback:regex"
                logging.getLogger("uvicorn.error").warning(
                    f"Gemini structured extraction failed, falling back to Regex extractor: {e}"
                )

        # Fallback to original Regex-based extraction
        self.last_source = "fallback:regex"
        sentences = self._sentences(text)
        dates = self._unique(self.DATE_PATTERN.findall(text))
        legal_sections = self._unique(self.SECTION_PATTERN.findall(text))
        deadlines = self._unique(self.DEADLINE_PATTERN.findall(text))
        penalties = self._unique(self.MONEY_PATTERN.findall(text))
        names = self._unique(self.NAME_PATTERN.findall(text))

        obligations = self._find_sentences(
            sentences,
            ["shall", "must", "required to", "liable to", "undertake", "agree to", "called upon"],
        )
        risks = self._find_sentences(
            sentences,
            ["penalty", "liable", "default", "breach", "eviction", "arrest", "non-compliance", "failure"],
        )

        entities = [
            ExtractedEntity(label="date", value=value) for value in dates
        ] + [
            ExtractedEntity(label="legal_section", value=value) for value in legal_sections
        ]

        return ExtractionResult(
            names=names,
            dates=dates,
            deadlines=deadlines,
            legal_sections=legal_sections,
            obligations=obligations,
            risks=risks,
            penalties=penalties,
            entities=entities,
        )

    def _sentences(self, text: str) -> list[str]:
        return [part.strip() for part in re.split(r"(?<=[.!?])\s+", text) if part.strip()]

    def _find_sentences(self, sentences: list[str], keywords: list[str]) -> list[str]:
        matches = []
        for sentence in sentences:
            lowered = sentence.lower()
            if any(keyword in lowered for keyword in keywords):
                matches.append(sentence[:400])
        return matches[:8]

    def _unique(self, values: list[str]) -> list[str]:
        seen = set()
        cleaned = []
        for value in values:
            normalized = " ".join(value.split())
            key = normalized.lower()
            if key not in seen:
                seen.add(key)
                cleaned.append(normalized)
        return cleaned[:20]

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
