from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from app.api.dependencies import get_orchestrator, get_parser
from app.core.config import get_settings
from app.models.schemas import AnalysisResponse, AnalyzeTextRequest, DraftType, SupportedOptions
from app.services.document_parser import DocumentParser
from app.services.orchestration import LegalWorkflowOrchestrator

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_upload(
    file: UploadFile = File(...),
    target_language: str = Form("en"),
    draft_type: DraftType | None = Form(None),
    parser: DocumentParser = Depends(get_parser),
    orchestrator: LegalWorkflowOrchestrator = Depends(get_orchestrator),
) -> AnalysisResponse:
    settings = get_settings()
    content_length = file.headers.get("content-length")
    if content_length and int(content_length) > settings.max_upload_mb * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds {settings.max_upload_mb} MB upload limit.",
        )

    parsed = await parser.parse_upload(file)
    if not parsed.text.strip():
        parsed.warnings.append("No readable text was found; orchestration will return limited guidance.")
    return orchestrator.run(parsed, target_language=target_language, draft_type=draft_type)


@router.post("/analyze-text", response_model=AnalysisResponse)
def analyze_text(
    request: AnalyzeTextRequest,
    parser: DocumentParser = Depends(get_parser),
    orchestrator: LegalWorkflowOrchestrator = Depends(get_orchestrator),
) -> AnalysisResponse:
    parsed = parser.parse_text(request.text)
    return orchestrator.run(
        parsed,
        target_language=request.target_language,
        draft_type=request.draft_type,
    )


@router.get("/options", response_model=SupportedOptions)
def supported_options() -> SupportedOptions:
    return SupportedOptions(
        document_types=[
            "fir",
            "legal_notice",
            "contract",
            "eviction_notice",
            "employment_agreement",
            "summons",
            "complaint",
            "rti",
            "affidavit",
        ],
        languages={"en": "English", "hi": "Hindi", "bn": "Bengali", "ta": "Tamil"},
        draft_types=["complaint", "reply", "affidavit", "rti", "summary"],
    )
