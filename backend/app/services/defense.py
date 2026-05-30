"""
DefenseAgent — Legal Loophole & Defense Strategy Analysis

Analyses a legal document (typically a notice, FIR, contract, or summons) and
identifies:
  • Procedural defects the opposing party may have made
  • Statutory loopholes (e.g. limitation periods, notice requirements, jurisdiction gaps)
  • Concrete actions the citizen can take to defend themselves

Gemini REST integration with automatic fallback to a rule-based heuristic engine.
"""

from __future__ import annotations

import json
import logging
import re
import httpx

from app.core.config import get_settings
from app.models.schemas import (
    ClassificationResult,
    DefenseAnalysis,
    ExtractionResult,
    KnowledgeSnippet,
    LoopholeDetail,
)

log = logging.getLogger("uvicorn.error")

# ---------------------------------------------------------------------------
# Gemini JSON schema for structured defense output
# ---------------------------------------------------------------------------
_DEFENSE_SCHEMA = {
    "type": "object",
    "properties": {
        "detected_loopholes": {
            "type": "array",
            "description": "List of identified legal loopholes, procedural defects, or defense grounds.",
            "items": {
                "type": "object",
                "properties": {
                    "description": {
                        "type": "string",
                        "description": "Clear description of the loophole or procedural defect.",
                    },
                    "legal_basis": {
                        "type": "string",
                        "description": (
                            "The specific Indian legal provision or principle (e.g. "
                            "'Section 3, Limitation Act 1963', 'Order VII Rule 11 CPC', "
                            "'Section 106, Transfer of Property Act 1882')."
                        ),
                    },
                    "action_item": {
                        "type": "string",
                        "description": "Concrete step the citizen should take to raise or exploit this defense.",
                    },
                },
                "required": ["description", "legal_basis", "action_item"],
            },
        },
        "defense_strategy": {
            "type": "string",
            "description": (
                "A cohesive 2-4 sentence overall defense strategy summarising how the citizen "
                "should respond to this document, what their strongest grounds are, and what "
                "they should do first."
            ),
        },
    },
    "required": ["detected_loopholes", "defense_strategy"],
}

# ---------------------------------------------------------------------------
# Rule-based fallback — heuristic patterns tied to Central Indian Acts
# ---------------------------------------------------------------------------

_FALLBACK_RULES: list[dict] = [
    # --- Limitation Act, 1963 ---
    {
        "doc_types": {"legal_notice", "contract", "complaint", "unknown"},
        "trigger_patterns": [
            r"\blimitation\b", r"\btime[- ]barred\b", r"\bprescribed period\b",
            r"\byears? (before|ago|prior)\b",
        ],
        "loophole": LoopholeDetail(
            description=(
                "The claim or notice may be time-barred under the Limitation Act, 1963. "
                "Legal actions must be filed within the prescribed limitation period "
                "(3 years for most civil suits, 1 year for certain special proceedings)."
            ),
            legal_basis="Section 3 read with Schedule I, Limitation Act, 1963",
            action_item=(
                "Verify the date the cause of action arose. If the notice is served after "
                "the limitation period has expired, file a written objection specifically "
                "pleading limitation as a preliminary point."
            ),
        ),
    },
    # --- Transfer of Property Act, 1882 — eviction notice period ---
    {
        "doc_types": {"eviction_notice"},
        "trigger_patterns": [r"\bvacate\b", r"\bevict\b", r"\btenant\b", r"\blandlord\b"],
        "loophole": LoopholeDetail(
            description=(
                "An eviction notice must provide the minimum notice period prescribed by "
                "the Transfer of Property Act, 1882 (15 days for month-to-month tenancy, "
                "6 months for annual tenancy) and applicable State Rent Control legislation. "
                "A shorter notice period renders the notice legally defective."
            ),
            legal_basis="Section 106, Transfer of Property Act, 1882; applicable State Rent Control Act",
            action_item=(
                "Compute the notice period stated in the document. If it is shorter than "
                "the statutory minimum, raise this as a legal defect in writing to the landlord "
                "and retain the document as evidence."
            ),
        ),
    },
    # --- Indian Contract Act, 1872 — vague / uncertain terms ---
    {
        "doc_types": {"contract", "employment_agreement"},
        "trigger_patterns": [
            r"\bvague\b", r"\buncertain\b", r"\bnot defined\b", r"\bterms?\b",
            r"\bconsideration\b", r"\bpenalty clause\b",
        ],
        "loophole": LoopholeDetail(
            description=(
                "Contracts with vague, uncertain, or unconscionable terms may be void or "
                "unenforceable. Penalty clauses that are punitive rather than a genuine "
                "pre-estimate of loss are typically unenforceable in Indian courts."
            ),
            legal_basis="Sections 29 (Uncertain agreements void) and 74 (Penalty clauses), Indian Contract Act, 1872",
            action_item=(
                "Identify every clause that uses undefined terms or imposes disproportionate "
                "penalties. Document these as specific objections and consult a lawyer about "
                "challenging enforceability before making any payment."
            ),
        ),
    },
    # --- Negotiable Instruments Act, 1881 — Section 138 notice requirements ---
    {
        "doc_types": {"legal_notice", "complaint"},
        "trigger_patterns": [
            r"\bcheque\b", r"\bdishonour\b", r"\bbounced?\b",
            r"\bsection 138\b", r"\bni act\b",
        ],
        "loophole": LoopholeDetail(
            description=(
                "A Section 138 NI Act cheque-dishonour notice is procedurally invalid if it "
                "was not sent within 30 days of receiving the bank memo, or if the complaint "
                "was not filed within 30 days of the expiry of the 15-day payment notice period."
            ),
            legal_basis="Section 138 read with Section 142, Negotiable Instruments Act, 1881",
            action_item=(
                "Verify: (1) the date on the bank dishonour memo, (2) the date on which the "
                "legal notice was issued — it must be within 30 days of the memo; and (3) "
                "confirm that the 15-day demand period has not been extended unfairly. "
                "Any procedural gap invalidates the complaint."
            ),
        ),
    },
    # --- CrPC / BNSS — FIR procedural defects ---
    {
        "doc_types": {"fir"},
        "trigger_patterns": [r"\bfir\b", r"\bfirst information report\b", r"\bpolice station\b"],
        "loophole": LoopholeDetail(
            description=(
                "An FIR may be challenged on procedural grounds: delayed registration without "
                "explanation (suggesting embellishment), registration at a wrong jurisdictional "
                "police station, or failure to follow mandatory procedural requirements "
                "under the BNSS (earlier CrPC)."
            ),
            legal_basis="Sections 173–175, Bharatiya Nagarik Suraksha Sanhita, 2023 (earlier Section 154–157 CrPC)",
            action_item=(
                "Note the time gap between the alleged incident and FIR registration. "
                "Check whether the police station has territorial jurisdiction. "
                "File an application before the Magistrate or approach the High Court "
                "under Section 528 BNSS (earlier Section 482 CrPC) if there is a gross abuse."
            ),
        ),
    },
    # --- Jurisdiction defect (general) ---
    {
        "doc_types": {"legal_notice", "summons", "complaint", "contract", "unknown"},
        "trigger_patterns": [
            r"\bjurisdiction\b", r"\bcourt\b", r"\btribunal\b",
            r"\bforum\b", r"\bcompetent\b",
        ],
        "loophole": LoopholeDetail(
            description=(
                "If the notice, complaint, or summons has been filed in or issued from a court "
                "or forum that does not have territorial or pecuniary jurisdiction over the "
                "dispute, all proceedings are void ab initio."
            ),
            legal_basis="Sections 15–20, Code of Civil Procedure, 1908; Order VII Rule 11(d) CPC",
            action_item=(
                "Check whether the court's territorial jurisdiction covers the location where "
                "the cause of action arose or where you reside/work. If not, file a written "
                "objection on jurisdiction at the earliest opportunity — delay can amount to "
                "a waiver of the objection."
            ),
        ),
    },
    # --- Improper / defective service of notice ---
    {
        "doc_types": {"legal_notice", "summons", "eviction_notice"},
        "trigger_patterns": [
            r"\bservice\b", r"\bserved\b", r"\bdelivered\b",
            r"\baddress\b", r"\breceipt\b",
        ],
        "loophole": LoopholeDetail(
            description=(
                "Legal notices and summons are only valid if properly served on the correct "
                "addressee at their known address. Defective service (wrong address, "
                "unserved, unsigned acknowledgment) is a defense against procedural deadlines."
            ),
            legal_basis="Order V, Code of Civil Procedure, 1908; Section 13, Specific Relief Act, 1963",
            action_item=(
                "Collect proof of how and when the notice was actually received. "
                "If you believe service was defective, file a written objection and do not "
                "treat the stated deadline as binding until proper service is acknowledged."
            ),
        ),
    },
]


class DefenseAgent:
    """
    Analyses a legal document for exploitable loopholes and defence grounds.

    Priority order:
        1. Gemini API (if GEMINI_API_KEY is set)
        2. Rule-based heuristic fallback (always works without keys)
    """

    def analyze(
        self,
        text: str,
        classification: ClassificationResult,
        extraction: ExtractionResult,
        knowledge: list[KnowledgeSnippet],
    ) -> DefenseAnalysis:
        settings = get_settings()
        api_key = settings.gemini_api_key

        if api_key:
            try:
                return self._analyze_with_gemini(text, classification, extraction, knowledge, api_key, settings.gemini_model)
            except Exception as exc:
                log.warning(f"DefenseAgent Gemini call failed, falling back to rules: {exc}")

        return self._analyze_with_rules(text, classification, extraction)

    # ------------------------------------------------------------------
    # Gemini path
    # ------------------------------------------------------------------

    def _analyze_with_gemini(
        self,
        text: str,
        classification: ClassificationResult,
        extraction: ExtractionResult,
        knowledge: list[KnowledgeSnippet],
        api_key: str,
        model: str,
    ) -> DefenseAnalysis:
        knowledge_ctx = "\n".join(f"- {k.title}: {k.content}" for k in knowledge)

        prompt = (
            "You are an expert Indian defence lawyer advising a common citizen who has just "
            "received a legal document. Your task is to identify every legal loophole, "
            "procedural defect, jurisdictional issue, limitation bar, or statutory requirement "
            "the opposing party may have failed to comply with — and turn each into a "
            "concrete defence the citizen can raise.\n\n"
            "Rules:\n"
            "1. Ground every loophole in a specific Indian statute or procedural rule.\n"
            "2. Be specific: name the section and Act (e.g. 'Section 106, TP Act 1882').\n"
            "3. Action items must be actionable by a citizen without a lawyer present.\n"
            "4. Do NOT fabricate sections — only cite real Indian law.\n\n"
            f"Document Type : {classification.document_type} (confidence {classification.confidence:.0%})\n"
            f"Extracted Sections: {', '.join(extraction.legal_sections) or 'None'}\n"
            f"Extracted Deadlines: {', '.join(extraction.deadlines) or 'None'}\n"
            f"Extracted Obligations: {', '.join(extraction.obligations) or 'None'}\n"
            f"Extracted Risks: {', '.join(extraction.risks) or 'None'}\n"
            f"Extracted Penalties: {', '.join(extraction.penalties) or 'None'}\n"
            f"Relevant Legal Context:\n{knowledge_ctx or 'None'}\n\n"
            f"Full Document Text (first 4000 chars):\n{text[:4000]}"
        )

        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{model}:generateContent?key={api_key}"
        )
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "response_mime_type": "application/json",
                "response_schema": _DEFENSE_SCHEMA,
                "temperature": 0.15,
            },
        }
        with httpx.Client() as client:
            resp = client.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=15.0)

        if resp.status_code != 200:
            raise ValueError(f"Gemini API error {resp.status_code}: {resp.text}")

        raw = json.loads(resp.json()["candidates"][0]["content"]["parts"][0]["text"])

        loopholes = [
            LoopholeDetail(
                description=item.get("description", ""),
                legal_basis=item.get("legal_basis", ""),
                action_item=item.get("action_item", ""),
            )
            for item in raw.get("detected_loopholes", [])
        ]
        return DefenseAnalysis(
            detected_loopholes=loopholes,
            defense_strategy=raw.get("defense_strategy", ""),
        )

    # ------------------------------------------------------------------
    # Rule-based fallback
    # ------------------------------------------------------------------

    def _analyze_with_rules(
        self,
        text: str,
        classification: ClassificationResult,
        extraction: ExtractionResult,
    ) -> DefenseAnalysis:
        lowered = text.lower()
        doc_type = classification.document_type
        matched: list[LoopholeDetail] = []

        for rule in _FALLBACK_RULES:
            # Must match document type
            if doc_type not in rule["doc_types"] and "unknown" not in rule["doc_types"]:
                continue
            # At least one trigger pattern must fire
            if any(re.search(pat, lowered) for pat in rule["trigger_patterns"]):
                matched.append(rule["loophole"])

        # Generic loopholes that always apply when deadlines are present
        if extraction.deadlines and not any("deadline" in m.description.lower() for m in matched):
            matched.append(
                LoopholeDetail(
                    description=(
                        "The document specifies a deadline. Whether that deadline is legally "
                        "enforceable depends on whether proper notice was served and the "
                        "correct statutory period was calculated."
                    ),
                    legal_basis="General principles of natural justice; applicable statute of limitations",
                    action_item=(
                        "Verify that the deadline computation starts from the date of actual "
                        "receipt, not from the date of dispatch. If service was defective, "
                        "the deadline may not have begun running."
                    ),
                )
            )

        if not matched:
            matched.append(
                LoopholeDetail(
                    description=(
                        "No specific loopholes were automatically identified from the text. "
                        "A qualified advocate should review the original document for "
                        "jurisdiction, limitation, service defects, and substantive defences."
                    ),
                    legal_basis="General legal principles under Indian law",
                    action_item=(
                        "Consult a District Legal Services Authority (DLSA) lawyer for free "
                        "legal aid, or approach a Bar Association legal aid desk."
                    ),
                )
            )

        strategy = self._build_strategy(doc_type, matched)
        return DefenseAnalysis(detected_loopholes=matched, defense_strategy=strategy)

    def _build_strategy(self, doc_type: str, loopholes: list[LoopholeDetail]) -> str:
        count = len(loopholes)
        base = (
            f"Your document has been triaged as a '{doc_type.replace('_', ' ')}'. "
            f"The system identified {count} potential defence ground(s). "
        )
        if count == 0:
            return base + (
                "No automatic loopholes were found; seek legal advice promptly. "
                "Do not ignore the document."
            )
        if count == 1:
            return base + (
                f"Prioritise the defence described above: {loopholes[0].action_item} "
                "Gather all supporting documents before acting."
            )
        # Multiple loopholes — prioritise by impact
        return base + (
            "Address procedural and jurisdictional defects first, as these can nullify the "
            "entire notice or proceeding before reaching the merits. "
            "Document every step you take and keep copies of all correspondence. "
            "If the matter involves liberty, property, or significant money, consult a "
            "qualified advocate at the earliest."
        )
