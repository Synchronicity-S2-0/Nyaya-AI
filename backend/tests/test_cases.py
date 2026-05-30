from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_case_text_analysis_returns_prisma_save_suggestions() -> None:
    payload = {
        "user_id": "case-user-1",
        "document_id": "doc-1",
        "file_url": "https://res.cloudinary.com/demo/raw/upload/notice.txt",
        "file_name": "notice.txt",
        "text": "Eviction notice from landlord Mr. Amit Verma. Tenant Ms. Priya Shah must vacate within 10 days due to unpaid rent.",
        "target_language": "en",
        "draft_type": "reply",
    }
    response = client.post("/api/v1/cases/case-1/documents/analyze-text", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["case_id"] == "case-1"
    assert data["document_id"] == "doc-1"
    assert data["analysis"]["classification"]["document_type"] == "eviction_notice"
    assert data["suggested_document"]["case_id"] == "case-1"
    assert data["suggested_document"]["user_id"] == "case-user-1"
    assert data["suggested_document"]["file_url"] == payload["file_url"]
    assert data["suggested_document"]["analysis_json"]["recommendations"]["urgency"] == "high"
    assert data["case_update"] == {
        "case_type": "eviction_notice",
        "latest_urgency": "high",
        "status": "open",
    }
    assert [event["event_type"] for event in data["suggested_events"]] == [
        "text_submitted",
        "analysis_completed",
    ]


def test_case_file_upload_returns_suggestions_without_storage_write() -> None:
    response = client.post(
        "/api/v1/cases/case-2/documents/analyze",
        data={
            "user_id": "case-user-2",
            "target_language": "en",
            "draft_type": "reply",
            "document_id": "doc-2",
            "file_url": "https://res.cloudinary.com/demo/raw/upload/legal-notice.txt",
        },
        files={
            "file": (
                "notice.txt",
                b"Legal notice dated 12 May 2026. You must pay Rs 50000 within 15 days.",
                "text/plain",
            )
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["analysis"]["classification"]["document_type"] == "legal_notice"
    assert data["suggested_document"]["file_name"] == "notice.txt"
    assert data["suggested_document"]["file_url"] == "https://res.cloudinary.com/demo/raw/upload/legal-notice.txt"
    assert data["suggested_events"][0]["event_type"] == "document_uploaded"


def test_case_message_uses_supplied_prisma_history() -> None:
    analysis_response = client.post(
        "/api/v1/cases/case-3/documents/analyze-text",
        json={
            "user_id": "case-user-3",
            "text": "Legal notice dated 12 May 2026. You must pay Rs 50000 within 15 days.",
            "target_language": "en",
        },
    )
    saved_document = analysis_response.json()["suggested_document"]

    response = client.post(
        "/api/v1/cases/case-3/messages",
        json={
            "user_id": "case-user-3",
            "message": "What should I do now?",
            "documents": [saved_document],
            "messages": [],
            "events": [],
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["user_message"]["message"] == "What should I do now?"
    assert "latest document" in data["assistant_message"]["message"].lower()
    assert [event["event_type"] for event in data["suggested_events"]] == [
        "user_question",
        "assistant_response",
    ]
