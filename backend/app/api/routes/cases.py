from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status

from app.api.dependencies import get_case_workflow
from app.models.schemas import (
    CaseAnalysisResponse,
    CaseAnalyzeTextRequest,
    CaseCreateRequest,
    CaseCreateResponse,
    CaseDetailResponse,
    CaseListResponse,
    CaseMessageRequest,
    CaseMessageResponse,
    DraftType,
)
from app.services.case_store import CaseAccessError, CaseNotFoundError
from app.services.case_workflow import CaseWorkflowService

router = APIRouter(prefix="/cases", tags=["cases"])


def handle_case_error(exc: Exception) -> None:
    if isinstance(exc, CaseNotFoundError):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    if isinstance(exc, CaseAccessError):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
    raise exc


@router.post("", response_model=CaseCreateResponse)
def create_case(
    request: CaseCreateRequest,
    workflow: CaseWorkflowService = Depends(get_case_workflow),
) -> CaseCreateResponse:
    case, _event = workflow.create_case(request.user_id, request.title)
    return CaseCreateResponse(case_id=case["id"], case=case)


@router.get("", response_model=CaseListResponse)
def list_cases(
    user_id: str = Query(..., min_length=1),
    workflow: CaseWorkflowService = Depends(get_case_workflow),
) -> CaseListResponse:
    return CaseListResponse(cases=workflow.list_cases(user_id))


@router.get("/{case_id}", response_model=CaseDetailResponse)
def get_case_detail(
    case_id: str,
    user_id: str = Query(..., min_length=1),
    workflow: CaseWorkflowService = Depends(get_case_workflow),
) -> CaseDetailResponse:
    try:
        return CaseDetailResponse(**workflow.get_case_detail(case_id, user_id))
    except Exception as exc:
        handle_case_error(exc)
        raise


@router.post("/{case_id}/documents/analyze", response_model=CaseAnalysisResponse)
async def analyze_case_upload(
    case_id: str,
    file: UploadFile = File(...),
    user_id: str = Form(...),
    target_language: str = Form("en"),
    draft_type: DraftType | None = Form(None),
    workflow: CaseWorkflowService = Depends(get_case_workflow),
) -> CaseAnalysisResponse:
    try:
        document, events, analysis = await workflow.analyze_file(
            case_id=case_id,
            user_id=user_id,
            upload=file,
            target_language=target_language,
            draft_type=draft_type,
        )
    except Exception as exc:
        handle_case_error(exc)
        raise
    return CaseAnalysisResponse(
        case_id=case_id,
        document_id=document["id"],
        event_ids=[event["id"] for event in events],
        analysis=analysis,
    )


@router.post("/{case_id}/documents/analyze-text", response_model=CaseAnalysisResponse)
def analyze_case_text(
    case_id: str,
    request: CaseAnalyzeTextRequest,
    workflow: CaseWorkflowService = Depends(get_case_workflow),
) -> CaseAnalysisResponse:
    try:
        document, events, analysis = workflow.analyze_text(
            case_id=case_id,
            user_id=request.user_id,
            text=request.text,
            target_language=request.target_language,
            draft_type=request.draft_type,
        )
    except Exception as exc:
        handle_case_error(exc)
        raise
    return CaseAnalysisResponse(
        case_id=case_id,
        document_id=document["id"],
        event_ids=[event["id"] for event in events],
        analysis=analysis,
    )


@router.post("/{case_id}/messages", response_model=CaseMessageResponse)
def add_case_message(
    case_id: str,
    request: CaseMessageRequest,
    workflow: CaseWorkflowService = Depends(get_case_workflow),
) -> CaseMessageResponse:
    try:
        user_message, assistant_message, events = workflow.answer_question(
            case_id,
            request.user_id,
            request.message,
        )
    except Exception as exc:
        handle_case_error(exc)
        raise
    return CaseMessageResponse(
        case_id=case_id,
        user_message=user_message,
        assistant_message=assistant_message,
        event_ids=[event["id"] for event in events],
    )
