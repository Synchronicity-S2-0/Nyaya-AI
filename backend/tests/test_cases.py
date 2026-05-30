from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_case_text_followups_timeline_and_messages() -> None:
    user_id = "case-user-1"
    created = client.post("/api/v1/cases", json={"user_id": user_id, "title": "Landlord dispute"})
    assert created.status_code == 200
    case_id = created.json()["case_id"]

    first_payload = {
        "user_id": user_id,
        "text": "Eviction notice from landlord Mr. Amit Verma. Tenant Ms. Priya Shah must vacate within 10 days due to unpaid rent.",
        "target_language": "en",
        "draft_type": "reply",
    }
    first = client.post(f"/api/v1/cases/{case_id}/documents/analyze-text", json=first_payload)
    assert first.status_code == 200
    first_data = first.json()
    assert first_data["case_id"] == case_id
    assert first_data["analysis"]["classification"]["document_type"] == "eviction_notice"
    assert first_data["analysis"]["recommendations"]["urgency"] == "high"

    second_payload = {
        "user_id": user_id,
        "text": "Follow-up eviction notice dated 20 May 2026. The landlord says electricity may be disconnected if possession is not handed over within 3 days.",
        "target_language": "en",
        "draft_type": None,
    }
    second = client.post(f"/api/v1/cases/{case_id}/documents/analyze-text", json=second_payload)
    assert second.status_code == 200

    message = client.post(
        f"/api/v1/cases/{case_id}/messages",
        json={"user_id": user_id, "message": "What should I do now?", "target_language": "en"},
    )
    assert message.status_code == 200
    assert "latest document" in message.json()["assistant_message"]["message"].lower()

    detail = client.get(f"/api/v1/cases/{case_id}", params={"user_id": user_id})
    assert detail.status_code == 200
    data = detail.json()
    assert data["case"]["case_type"] == "eviction_notice"
    assert data["case"]["latest_urgency"] == "high"
    assert len(data["documents"]) == 2
    assert len(data["messages"]) == 2
    assert data["documents"][0]["extracted_text"] == first_payload["text"]
    assert data["documents"][0]["analysis_json"]["recommendations"]["urgency"] == "high"
    assert [event["event_type"] for event in data["events"]] == [
        "case_created",
        "text_submitted",
        "analysis_completed",
        "text_submitted",
        "analysis_completed",
        "user_question",
        "assistant_response",
    ]


def test_case_file_upload_followup() -> None:
    user_id = "case-user-2"
    created = client.post("/api/v1/cases", json={"user_id": user_id, "title": "Notice upload"})
    case_id = created.json()["case_id"]

    response = client.post(
        f"/api/v1/cases/{case_id}/documents/analyze",
        data={"user_id": user_id, "target_language": "en", "draft_type": "reply"},
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
    assert data["document_id"]

    detail = client.get(f"/api/v1/cases/{case_id}", params={"user_id": user_id})
    assert detail.status_code == 200
    assert detail.json()["documents"][0]["file_name"] == "notice.txt"


def test_case_access_rejects_other_user() -> None:
    created = client.post("/api/v1/cases", json={"user_id": "owner-user", "title": "Private case"})
    case_id = created.json()["case_id"]

    detail = client.get(f"/api/v1/cases/{case_id}", params={"user_id": "other-user"})
    assert detail.status_code == 403

    followup = client.post(
        f"/api/v1/cases/{case_id}/documents/analyze-text",
        json={"user_id": "other-user", "text": "Legal notice within 15 days."},
    )
    assert followup.status_code == 403


def test_case_list_returns_only_user_cases() -> None:
    client.post("/api/v1/cases", json={"user_id": "list-user-a", "title": "A"})
    client.post("/api/v1/cases", json={"user_id": "list-user-b", "title": "B"})

    response = client.get("/api/v1/cases", params={"user_id": "list-user-a"})
    assert response.status_code == 200
    titles = [case["title"] for case in response.json()["cases"]]
    assert "A" in titles
    assert "B" not in titles
