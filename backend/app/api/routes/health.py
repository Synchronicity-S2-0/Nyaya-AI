from fastapi import APIRouter
import httpx

from app.core.config import get_settings

router = APIRouter(tags=["health"])


@router.get("/health")
def health() -> dict[str, str]:
    settings = get_settings()
    return {"status": "ok", "app": settings.app_name, "environment": settings.app_env}


@router.get("/health/ai")
def ai_health(live: bool = False) -> dict[str, object]:
    settings = get_settings()
    result: dict[str, object] = {
        "gemini_configured": bool(settings.gemini_api_key),
        "gemini_model": settings.gemini_model,
        "sarvam_configured": bool(settings.sarvam_api_key),
        "live_tested": live,
    }
    if not live:
        return result

    if not settings.gemini_api_key:
        result["gemini_status"] = "not_configured"
        return result

    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{settings.gemini_model}:generateContent?key={settings.gemini_api_key}"
    )
    payload = {
        "contents": [{"parts": [{"text": "Reply with OK only."}]}],
        "generationConfig": {"temperature": 0},
    }
    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.post(url, json=payload, headers={"Content-Type": "application/json"})
        result["gemini_http_status"] = response.status_code
        if response.status_code == 200:
            result["gemini_status"] = "ok"
        else:
            result["gemini_status"] = "error"
            result["gemini_error"] = response.text[:500]
    except Exception as exc:
        result["gemini_status"] = "error"
        result["gemini_error"] = str(exc)
    return result
