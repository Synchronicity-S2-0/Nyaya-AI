from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_analyze_text_orchestration_for_legal_notice() -> None:
    payload = {
        "text": (
            "Legal notice dated 12 May 2026 from Advocate Ramesh Sharma. "
            "You are hereby called upon to pay Rs 50000 within 15 days, "
            "failing which civil and criminal proceedings may be initiated."
        ),
        "target_language": "hi",
        "draft_type": "reply",
    }
    response = client.post("/api/v1/documents/analyze-text", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert data["classification"]["document_type"] == "legal_notice"
    assert "12 May 2026" in data["extraction"]["dates"]
    assert data["recommendations"]["urgency"] == "high"
    assert data["draft"]["draft_type"] == "reply"
    assert data["translation"]["language"] == "Hindi"
    assert data["processing"]["classifier"].startswith("fallback:")
    assert data["processing"]["rag"] == "local_txt"
    assert data["processing"]["translation"].startswith("fallback:")
    assert "does not replace a lawyer" in data["disclaimer"]

    # Defense / loophole analysis
    assert data["defense"] is not None, "defense field must always be populated"
    assert isinstance(data["defense"]["detected_loopholes"], list)
    assert len(data["defense"]["detected_loopholes"]) >= 1, "at least one loophole should be detected"
    assert isinstance(data["defense"]["defense_strategy"], str)
    assert len(data["defense"]["defense_strategy"]) > 0
    # Each loophole must have the three required keys
    for lh in data["defense"]["detected_loopholes"]:
        assert "description" in lh
        assert "legal_basis" in lh
        assert "action_item" in lh


def test_options() -> None:
    response = client.get("/api/v1/documents/options")
    assert response.status_code == 200
    assert "fir" in response.json()["document_types"]


def test_rag_uses_local_txt_knowledge_base() -> None:
    payload = {
        "text": "Eviction notice from landlord. The tenant must vacate within 10 days.",
        "target_language": "en",
    }
    response = client.post("/api/v1/documents/analyze-text", json=payload)
    assert response.status_code == 200

    knowledge = response.json()["knowledge"]
    assert any("utility disconnection warnings" in item["content"] for item in knowledge)
