from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Nyaya AI Backend"
    app_env: str = "development"
    api_v1_prefix: str = "/api/v1"
    max_upload_mb: int = Field(default=15, ge=1, le=100)
    tesseract_cmd: str | None = None
    enable_image_ocr: bool = True
    enable_pdf_ocr: bool = False
    default_language: str = "en"
    
    gemini_api_key: str | None = None
    sarvam_api_key: str | None = None
    gemini_model: str = "gemini-2.5-flash"
    supabase_url: str | None = None
    supabase_service_role_key: str | None = None
    supabase_storage_bucket: str = "case-documents"
    local_knowledge_path: str = "app/data/legal_knowledge.txt"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    return Settings()
