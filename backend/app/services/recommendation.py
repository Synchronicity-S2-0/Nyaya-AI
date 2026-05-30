import json
import logging
import httpx
from app.core.config import get_settings
from app.models.schemas import ActionRecommendation, ClassificationResult, ExtractionResult, KnowledgeSnippet


class ActionRecommendationAgent:
    def __init__(self) -> None:
        self.last_source = "fallback"

    def recommend(
        self,
        classification: ClassificationResult,
        extraction: ExtractionResult,
        knowledge: list[KnowledgeSnippet],
    ) -> ActionRecommendation:
        settings = get_settings()
        api_key = settings.gemini_api_key

        if api_key:
            try:
                schema = {
                    "type": "object",
                    "properties": {
                        "next_steps": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Sequential, actionable steps the citizen must take immediately (e.g. calculated reply days, gather receipt proofs)."
                        },
                        "required_documents": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Essential documents they need to collect to defend or act upon this notice/file."
                        },
                        "authorities": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Relevant Indian government, police, municipal, rent control, or judicial authorities they can approach."
                        },
                        "escalation_paths": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "Formal legal escalation options (e.g., appeal to Senior Superintendent, file consumer forum complaint, legal aid clinics)."
                        },
                        "urgency": {
                            "type": "string",
                            "enum": ["low", "medium", "high"],
                            "description": "Urgency rating. High urgency should be set for summonses, eviction risks, arrest/criminal notices, or short deadlines."
                        }
                    },
                    "required": ["next_steps", "required_documents", "authorities", "escalation_paths", "urgency"]
                }

                knowledge_context = "\n".join([f"- {k.title}: {k.content}" for k in knowledge])
                
                prompt = (
                    "You are a professional, objective legal procedural recommender in India. "
                    "Based on the document classification, extracted entities, and relevant legal knowledge context, "
                    "recommend actionable next steps, required documents, relevant public authorities, and formal escalation paths. "
                    "Your recommendations must be legally sound, practical for an ordinary citizen, and tailored to the context.\n\n"
                    f"Document Type: {classification.document_type}\n"
                    f"Extracted Legal Sections: {', '.join(extraction.legal_sections) or 'None'}\n"
                    f"Extracted Deadlines: {', '.join(extraction.deadlines) or 'None'}\n"
                    f"Extracted Risks: {', '.join(extraction.risks) or 'None'}\n"
                    f"Legal Knowledge Context:\n{knowledge_context or 'None'}"
                )

                result_dict = self._call_gemini_api(prompt, schema, api_key, settings.gemini_model)
                self.last_source = "llm:gemini"
                return ActionRecommendation(
                    next_steps=result_dict.get("next_steps", []),
                    required_documents=result_dict.get("required_documents", []),
                    authorities=result_dict.get("authorities", []),
                    escalation_paths=result_dict.get("escalation_paths", []),
                    urgency=result_dict.get("urgency", "medium")
                )
            except Exception as e:
                self.last_source = "fallback:rules"
                logging.getLogger("uvicorn.error").warning(
                    f"Gemini action recommendation failed, falling back to static logic: {e}"
                )

        # Fallback to original static dictionary-based recommendations
        self.last_source = "fallback:rules"
        doc_type = classification.document_type
        next_steps = [
            "Save a clean copy of the document and note the date/time of receipt.",
            "Verify names, dates, deadlines, addresses, and legal sections from the original.",
        ]
        required_documents = ["Original document", "Identity/address proof", "Supporting communication records"]
        authorities: list[str] = []
        escalation_paths: list[str] = []

        if doc_type == "fir":
            next_steps += [
                "Check the FIR number, police station, sections invoked, and incident details.",
                "Collect evidence, witness details, medical records, or CCTV references if relevant.",
            ]
            authorities = ["Police station", "Senior Police Officer", "Legal Services Authority"]
            escalation_paths = ["Approach senior police officials", "Seek legal aid", "Consult an advocate for bail/protection strategy"]
        elif doc_type == "legal_notice":
            next_steps += [
                "Calculate the reply deadline from the date of service.",
                "Prepare a point-wise reply with documents supporting your position.",
            ]
            authorities = ["Sender/advocate named in notice", "Mediation centre if suitable", "Civil court or forum if dispute escalates"]
            escalation_paths = ["Send a written reply", "Attempt settlement", "Consult an advocate before admitting liability"]
        elif doc_type == "eviction_notice":
            next_steps += [
                "Check whether the notice period matches the agreement and applicable local rules.",
                "Collect rent receipts, lease agreement, and proof of payments.",
            ]
            required_documents += ["Rent agreement", "Rent receipts", "Payment proof"]
            authorities = ["Rent authority", "Civil court", "Legal Services Authority"]
            escalation_paths = ["Reply to notice", "Seek injunction or protection if advised", "Use mediation if available"]
        elif doc_type == "rti":
            next_steps += [
                "Identify the correct public authority and Public Information Officer.",
                "Convert broad requests into specific information points.",
            ]
            authorities = ["Public Information Officer", "First Appellate Authority", "Information Commission"]
            escalation_paths = ["File first appeal after statutory delay/refusal", "File second appeal/complaint where applicable"]
        elif doc_type == "summons":
            next_steps += [
                "Mark the appearance date and court details immediately.",
                "Arrange all documents mentioned in the summons.",
            ]
            authorities = ["Court registry", "Legal Services Authority", "Advocate"]
            escalation_paths = ["Appear or arrange representation", "Seek adjournment only through proper procedure"]
        else:
            next_steps += [
                "Identify what the document asks you to do, pay, submit, or attend.",
                "Ask a qualified lawyer/legal aid clinic to review if money, liberty, property, or employment is at risk.",
            ]
            authorities = ["District Legal Services Authority", "Relevant department/forum", "Qualified advocate"]
            escalation_paths = ["Legal aid clinic", "Mediation", "Appropriate court/forum"]

        urgency = "high" if extraction.deadlines or doc_type in {"summons", "fir", "eviction_notice"} else "medium"
        if extraction.risks and any("arrest" in risk.lower() or "eviction" in risk.lower() for risk in extraction.risks):
            urgency = "high"

        return ActionRecommendation(
            next_steps=next_steps,
            required_documents=required_documents,
            authorities=authorities,
            escalation_paths=escalation_paths,
            urgency=urgency,
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
