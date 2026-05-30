"""
law.py — Dedicated API endpoints for live Indian statute lookup.

Provides judges and the frontend with on-demand access to:
  - BNS 2023 sections (current criminal law, in force July 2024)
  - IPC sections (repealed July 2024, retained for legacy document reference)
  - IPC → BNS cross-reference mapping

All text is fetched live from InsightLaw (insightlaw.in) which publishes
the official MHA Gazette text under CC BY-NC 4.0.
IndiaCode permalinks are always included so judges can verify on the
authoritative government portal.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.dependencies import get_bns_lookup
from app.models.schemas import StatutorySource
from app.services.bns_lookup import (
    BNSLookupService,
    IPC_TO_BNS_MAP,
    INDIACODE_URLS,
    _fetch_section,
)

import httpx

router = APIRouter(prefix="/law", tags=["law"])

INSIGHTLAW_BASE = "https://insightlaw.in/api"


# ── BNS Endpoints ────────────────────────────────────────────────────────────

@router.get(
    "/bns/section/{section_number}",
    response_model=StatutorySource,
    summary="Fetch a BNS 2023 section by number",
    description=(
        "Returns the official text of a Bharatiya Nyaya Sanhita (BNS) 2023 section. "
        "Text is fetched live from the InsightLaw API (official Gazette source). "
        "An IndiaCode permalink is included for government-authoritative verification."
    ),
)
def get_bns_section(
    section_number: str,
    bns: BNSLookupService = Depends(get_bns_lookup),
) -> StatutorySource:
    source = _fetch_section("BNS", section_number)
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"BNS Section {section_number} not found. Valid range: 1–358.",
        )
    return source


@router.get(
    "/bns/search",
    response_model=list[StatutorySource],
    summary="Search BNS 2023 by keyword",
    description=(
        "Searches the Bharatiya Nyaya Sanhita (BNS) 2023 for sections matching the query. "
        "Results are fetched live from InsightLaw. Each result includes an IndiaCode permalink."
    ),
)
def search_bns(
    q: str = Query(..., min_length=2, description="Keyword to search within BNS 2023"),
    bns: BNSLookupService = Depends(get_bns_lookup),
) -> list[StatutorySource]:
    try:
        with httpx.Client(timeout=8.0) as client:
            resp = client.get(
                f"{INSIGHTLAW_BASE}/bns/search",
                params={"q": q},
                headers={"Accept": "application/json"},
            )
        if resp.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"InsightLaw search returned status {resp.status_code}.",
            )
        data = resp.json()
        results = data if isinstance(data, list) else data.get("results", [])
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="InsightLaw API timed out. Please retry.",
        )

    sources: list[StatutorySource] = []
    for item in results[:10]:  # cap at 10 to respect free-tier rate limits
        sec_num = str(item.get("section") or item.get("article") or "")
        if not sec_num:
            continue
        s = _fetch_section("BNS", sec_num)
        if s:
            sources.append(s)
    return sources


# ── IPC Endpoints (legacy / repealed) ────────────────────────────────────────

@router.get(
    "/ipc/section/{section_number}",
    response_model=StatutorySource,
    summary="Fetch an IPC section by number (repealed — for legacy document reference)",
    description=(
        "Returns the text of an Indian Penal Code (IPC) section. "
        "⚠ IPC was repealed in July 2024 and replaced by BNS. "
        "This endpoint is provided for documents that still reference old IPC sections. "
        "Where a BNS equivalent exists, it will be noted in `ipc_to_bns_note`."
    ),
)
def get_ipc_section(section_number: str) -> StatutorySource:
    source = _fetch_section("IPC", section_number)
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"IPC Section {section_number} not found.",
        )
    # Enrich with BNS mapping note if available
    if section_number in IPC_TO_BNS_MAP and not source.ipc_to_bns_note:
        bns_eq = IPC_TO_BNS_MAP[section_number]
        source = source.model_copy(
            update={
                "ipc_to_bns_note": (
                    f"⚠ IPC repealed July 2024. "
                    f"Equivalent current provision: BNS Section {bns_eq}. "
                    f"Verify at {INDIACODE_URLS['BNS']}"
                )
            }
        )
    return source


# ── Cross-reference ───────────────────────────────────────────────────────────

@router.get(
    "/ipc-to-bns/{ipc_section}",
    summary="Resolve an IPC section to its BNS 2023 equivalent",
    description=(
        "Given a repealed IPC section number, returns the corresponding BNS 2023 section "
        "with its live text and IndiaCode citation. Returns 404 if no direct mapping exists."
    ),
)
def ipc_to_bns_crossref(ipc_section: str) -> dict:
    bns_section = IPC_TO_BNS_MAP.get(ipc_section)
    if not bns_section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"No direct BNS mapping found for IPC Section {ipc_section}. "
                f"The full IPC-to-BNS table is available at {INDIACODE_URLS['BNS']}"
            ),
        )
    ipc_source = _fetch_section("IPC", ipc_section)
    bns_source = _fetch_section("BNS", bns_section)
    return {
        "ipc_section": ipc_section,
        "bns_section": bns_section,
        "ipc": ipc_source.model_dump() if ipc_source else None,
        "bns": bns_source.model_dump() if bns_source else None,
        "note": (
            f"IPC Section {ipc_section} was repealed in July 2024. "
            f"BNS Section {bns_section} is the equivalent provision currently in force."
        ),
        "indiacode_bns": INDIACODE_URLS["BNS"],
        "indiacode_ipc": INDIACODE_URLS["IPC"],
    }


# ── Health / info ─────────────────────────────────────────────────────────────

@router.get(
    "/info",
    summary="Statute database info",
    description="Returns metadata about the statutory sources used by Nyaya AI.",
)
def law_info() -> dict:
    return {
        "sources": [
            {
                "name": "Bharatiya Nyaya Sanhita (BNS) 2023",
                "corpus": "BNS",
                "status": "In force from 1 July 2024",
                "sections": 358,
                "replaces": "Indian Penal Code (IPC) 1860",
                "indiacode_url": INDIACODE_URLS["BNS"],
                "api": "insightlaw.in (Official Gazette text, CC BY-NC 4.0)",
            },
            {
                "name": "Indian Penal Code (IPC) 1860",
                "corpus": "IPC",
                "status": "REPEALED — July 2024",
                "sections": 511,
                "replaced_by": "BNS 2023",
                "indiacode_url": INDIACODE_URLS["IPC"],
                "api": "insightlaw.in (Official Gazette text, CC BY-NC 4.0)",
            },
            {
                "name": "Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023",
                "corpus": "BNSS",
                "status": "In force from 1 July 2024",
                "replaces": "Code of Criminal Procedure (CrPC) 1973",
                "indiacode_url": INDIACODE_URLS["BNSS"],
            },
            {
                "name": "Bharatiya Sakshya Adhiniyam (BSA) 2023",
                "corpus": "BSA",
                "status": "In force from 1 July 2024",
                "replaces": "Indian Evidence Act 1872",
                "indiacode_url": INDIACODE_URLS["BSA"],
            },
        ],
        "trust_chain": (
            "Nyaya AI fetches statute text live from InsightLaw (insightlaw.in), "
            "which publishes official MHA Gazette text. Every citation includes an "
            "IndiaCode.nic.in permalink for government-authoritative verification."
        ),
        "ipc_to_bns_mapped_sections": len(IPC_TO_BNS_MAP),
    }
