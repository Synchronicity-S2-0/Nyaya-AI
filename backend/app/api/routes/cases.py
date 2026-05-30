from fastapi import APIRouter, Depends, File, Form, UploadFile

from app.api.dependencies import get_case_workflow
from app.models.schemas import (
    CaseAnalysisResponse,
    CaseAnalyzeTextRequest,
    CaseMessageRequest,
    CaseMessageResponse,
    DraftType,
)
from app.services.case_workflow import CaseWorkflowService

router = APIRouter(prefix="/cases", tags=["cases"])


def case_update_from_analysis(analysis) -> dict[str, str]:
    doc_type = (analysis.classification.document_type or "unknown").replace("_", " ").title()
    if doc_type == "Unknown":
        doc_type = "Legal"
    
    if analysis.extraction.names:
        main_party = analysis.extraction.names[0].strip()
        title = f"{doc_type} - {main_party}"
    else:
        title = f"{doc_type} Matter"

    return {
        "title": title,
        "case_type": analysis.classification.document_type,
        "latest_urgency": analysis.recommendations.urgency,
        "status": "open",
    }


@router.post("/{case_id}/documents/analyze", response_model=CaseAnalysisResponse)
async def analyze_case_upload(
    case_id: str,
    file: UploadFile = File(...),
    user_id: str = Form(...),
    target_language: str = Form("en"),
    draft_type: DraftType | None = Form(None),
    document_id: str | None = Form(None),
    file_url: str | None = Form(None),
    workflow: CaseWorkflowService = Depends(get_case_workflow),
) -> CaseAnalysisResponse:
    document, events, analysis = await workflow.analyze_file(
        case_id=case_id,
        user_id=user_id,
        upload=file,
        target_language=target_language,
        draft_type=draft_type,
        document_id=document_id,
        file_url=file_url,
    )
    return CaseAnalysisResponse(
        case_id=case_id,
        document_id=document_id,
        analysis=analysis,
        suggested_document=document,
        suggested_events=events,
        case_update=case_update_from_analysis(analysis),
    )


@router.post("/{case_id}/documents/analyze-text", response_model=CaseAnalysisResponse)
def analyze_case_text(
    case_id: str,
    request: CaseAnalyzeTextRequest,
    workflow: CaseWorkflowService = Depends(get_case_workflow),
) -> CaseAnalysisResponse:
    document, events, analysis = workflow.analyze_text(
        case_id=case_id,
        user_id=request.user_id,
        text=request.text,
        target_language=request.target_language,
        draft_type=request.draft_type,
        document_id=request.document_id,
        file_url=request.file_url,
        file_name=request.file_name,
    )
    return CaseAnalysisResponse(
        case_id=case_id,
        document_id=request.document_id,
        analysis=analysis,
        suggested_document=document,
        suggested_events=events,
        case_update=case_update_from_analysis(analysis),
    )


@router.post("/{case_id}/messages", response_model=CaseMessageResponse)
def add_case_message(
    case_id: str,
    request: CaseMessageRequest,
    workflow: CaseWorkflowService = Depends(get_case_workflow),
) -> CaseMessageResponse:
    user_message, assistant_message, events = workflow.answer_question(
        case_id=case_id,
        user_id=request.user_id,
        message=request.message,
        documents=request.documents,
        messages=request.messages,
        events=request.events,
    )
    return CaseMessageResponse(
        case_id=case_id,
        user_message=user_message,
        assistant_message=assistant_message,
        suggested_events=events,
    )
