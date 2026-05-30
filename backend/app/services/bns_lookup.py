"""
bns_lookup.py — Live statutory source lookup for BNS 2023, IPC, and Constitution.

Uses the InsightLaw free API (insightlaw.in) — no API key required, 200 req/hour.
Falls back gracefully to empty list on any network or parse failure.

Source trust chain for judges:
  1. Section numbers extracted from document by ExtractionAgent
  2. Live text fetched from InsightLaw (derived from official MHA Gazette)
  3. IndiaCode permalink included for direct government verification
  4. `in_force` flag set: BNS is current law (Jul 2024+); IPC is repealed
"""

import logging
import re
from datetime import datetime, timezone
from functools import lru_cache

import httpx

from app.models.schemas import StatutorySource

logger = logging.getLogger("uvicorn.error")

# ── Constants ────────────────────────────────────────────────────────────────

INSIGHTLAW_BASE = "https://insightlaw.in/api"

# Official IndiaCode act-level permalinks (free, always accessible)
INDIACODE_URLS = {
    "BNS": "https://www.indiacode.nic.in/handle/123456789/20062",
    "IPC": "https://www.indiacode.nic.in/handle/123456789/2263",
    "BNSS": "https://www.indiacode.nic.in/handle/123456789/20063",  # Bharatiya Nagarik Suraksha Sanhita
    "BSA": "https://www.indiacode.nic.in/handle/123456789/20064",   # Bharatiya Sakshya Adhiniyam
    "CONSTITUTION": "https://www.indiacode.nic.in/handle/123456789/99",
}

# IPC → BNS static mapping for the most commonly referenced sections
# (abridged; covers FIR-related, property, fraud, and violence sections)
IPC_TO_BNS_MAP: dict[str, str] = {
    "302": "103",   # Murder
    "307": "109",   # Attempt to murder
    "304": "105",   # Culpable homicide not amounting to murder
    "304A": "106",  # Causing death by negligence
    "323": "115",   # Voluntarily causing hurt
    "324": "117",   # Voluntarily causing hurt by dangerous weapons
    "325": "116",   # Grievous hurt
    "326": "118",   # Grievous hurt by dangerous weapons
    "354": "74",    # Assault / criminal force on woman
    "376": "64",    # Rape
    "379": "303",   # Theft
    "380": "305",   # Theft in dwelling house
    "392": "309",   # Robbery
    "395": "310",   # Dacoity
    "396": "311",   # Dacoity with murder
    "406": "316",   # Criminal breach of trust
    "409": "318",   # Criminal breach of trust by public servant
    "415": "318",   # Cheating (overlap; BNS 318 covers several)
    "420": "318",   # Cheating by inducement
    "427": "324",   # Mischief causing loss
    "436": "325",   # Mischief by fire
    "447": "329",   # Criminal trespass
    "448": "330",   # House trespass
    "452": "333",   # House trespass with injury
    "499": "356",   # Defamation
    "500": "357",   # Punishment for defamation
    "503": "351",   # Criminal intimidation
    "504": "352",   # Intentional insult with provocation
    "505": "353",   # Statements conducing public mischief
    "509": "79",    # Word / gesture insult to modesty
}

# Regex patterns to parse section references from extraction output
_SECTION_PATTERNS = [
    # "Section 103 of BNS" / "Section 103 BNS"
    re.compile(
        r"(?:section|sec\.?|u/s)\s*(\w+)\s+(?:of\s+)?(bns|bnss|bsa|ipc|crpc|constitution)",
        re.IGNORECASE,
    ),
    # "BNS Section 103" / "IPC Section 302"
    re.compile(
        r"(bns|bnss|bsa|ipc|crpc|constitution)\s+(?:section|sec\.?)\s*(\w+)",
        re.IGNORECASE,
    ),
    # Bare "Section 103" (ambiguous — we'll try BNS first then IPC)
    re.compile(
        r"(?:^|[\s,;(])(?:section|sec\.?|u/s)\s*(\d+[A-Za-z]?)\b",
        re.IGNORECASE,
    ),
]

_CORPUS_ALIASES = {
    "bns": "BNS",
    "bnss": "BNSS",
    "bsa": "BSA",
    "ipc": "IPC",
    "crpc": "BNSS",  # BNSS replaces CrPC
    "constitution": "CONSTITUTION",
}


# ── Public API ───────────────────────────────────────────────────────────────

class BNSLookupService:
    """Fetches live statutory text for legal sections found in a document."""

    def __init__(self) -> None:
        self.last_source = "not_called"

    def lookup(self, legal_sections: list[str]) -> list[StatutorySource]:
        """
        Given a list of legal section strings (from ExtractionAgent),
        parse them and fetch live statute text.

        Returns a deduplicated list of StatutorySource objects,
        ordered: BNS first, then IPC (for legacy references), then others.
        """
        if not legal_sections:
            self.last_source = "skipped:no_sections"
            return []

        parsed = _parse_section_references(legal_sections)
        if not parsed:
            self.last_source = "skipped:no_parseable_sections"
            return []

        results: list[StatutorySource] = []
        seen: set[tuple[str, str]] = set()

        for corpus, section_num in parsed:
            key = (corpus, section_num)
            if key in seen:
                continue
            seen.add(key)
            source = _fetch_section(corpus, section_num)
            if source:
                results.append(source)

        # Sort: BNS/BNSS/BSA first (current laws), then IPC (repealed), then others
        _corpus_order = {"BNS": 0, "BNSS": 1, "BSA": 2, "IPC": 3, "CONSTITUTION": 4}
        results.sort(key=lambda s: _corpus_order.get(s.corpus, 99))

        if results:
            self.last_source = "insightlaw.in"
        else:
            self.last_source = "fallback:empty"

        return results


# ── Internal helpers ─────────────────────────────────────────────────────────

def _parse_section_references(sections: list[str]) -> list[tuple[str, str]]:
    """
    Parse extracted section strings into (corpus, section_number) tuples.
    Handles IPC→BNS auto-resolution and ambiguous bare section numbers.
    """
    results: list[tuple[str, str]] = []

    for raw in sections:
        text = raw.strip()

        # Pattern 1: "Section 103 of BNS" or "Section 103 BNS"
        m = _SECTION_PATTERNS[0].search(text)
        if m:
            sec, corp = m.group(1), m.group(2).lower()
            corpus = _CORPUS_ALIASES.get(corp, "BNS")
            # Auto-resolve IPC → BNS equivalent if available
            if corpus == "IPC" and sec in IPC_TO_BNS_MAP:
                results.append(("BNS", IPC_TO_BNS_MAP[sec]))
                results.append(("IPC", sec))  # Also keep IPC for "repealed" label
            else:
                results.append((corpus, sec))
            continue

        # Pattern 2: "BNS Section 103" or "IPC Section 302"
        m = _SECTION_PATTERNS[1].search(text)
        if m:
            corp, sec = m.group(1).lower(), m.group(2)
            corpus = _CORPUS_ALIASES.get(corp, "BNS")
            if corpus == "IPC" and sec in IPC_TO_BNS_MAP:
                results.append(("BNS", IPC_TO_BNS_MAP[sec]))
                results.append(("IPC", sec))
            else:
                results.append((corpus, sec))
            continue

        # Pattern 3: bare "Section 103" — assume BNS (current law)
        m = _SECTION_PATTERNS[2].search(text)
        if m:
            sec = m.group(1)
            results.append(("BNS", sec))

    return results


@lru_cache(maxsize=512)
def _fetch_section(corpus: str, section_number: str) -> "StatutorySource | None":
    """
    Fetch a single section from InsightLaw. Results are cached in-memory
    so repeated references to the same section never hit the network twice.
    """
    corpus_path_map = {
        "BNS": "bns",
        "IPC": "ipc",
        "CONSTITUTION": "constitution",
        # BNSS and BSA not yet in InsightLaw free tier; fall back gracefully
    }
    path = corpus_path_map.get(corpus)
    if not path:
        return None

    endpoint = "article" if corpus == "CONSTITUTION" else "section"
    url = f"{INSIGHTLAW_BASE}/{path}/{endpoint}/{section_number}"

    try:
        with httpx.Client(timeout=6.0) as client:
            resp = client.get(url, headers={"Accept": "application/json"})

        if resp.status_code == 404:
            logger.debug("InsightLaw: %s section %s not found", corpus, section_number)
            return None

        if resp.status_code != 200:
            logger.warning(
                "InsightLaw API returned %s for %s/%s", resp.status_code, corpus, section_number
            )
            return None

        data = resp.json()
        title = data.get("title_en") or data.get("title") or f"Section {section_number}"
        langs = data.get("languages", {})
        text_preview = langs.get("en") or data.get("text_en") or ""

        # Strip the "[Full text: insightlaw.in/access]" trailer from free tier
        text_preview = re.sub(r"\s*\[Full text:[^\]]+\]", "", text_preview).strip()

        in_force = corpus != "IPC"  # IPC repealed July 2024

        return StatutorySource(
            corpus=corpus,
            section_number=section_number,
            title=title,
            text_preview=text_preview,
            source_url=INDIACODE_URLS.get(corpus, "https://www.indiacode.nic.in/"),
            api_source="insightlaw.in (Official Gazette text, CC BY-NC 4.0)",
            in_force=in_force,
            ipc_to_bns_note=(
                f"⚠ IPC repealed July 2024. Equivalent BNS provision may apply."
                if not in_force
                else ""
            ),
            fetched_at=datetime.now(timezone.utc).isoformat(),
        )

    except httpx.TimeoutException:
        logger.warning("InsightLaw API timeout for %s section %s", corpus, section_number)
        return None
    except Exception as exc:
        logger.warning("InsightLaw API error for %s/%s: %s", corpus, section_number, exc)
        return None
