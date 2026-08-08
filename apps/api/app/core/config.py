import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "Sisya Abhyasa API"
    environment: str = "development"
    database_url: str = os.getenv("DATABASE_URL") or os.getenv("SISYA_DATABASE_URL") or "sqlite:///./test.db"
    frontend_origin: str = "http://localhost:3000"
    allow_dev_auth: bool = False
    gemini_api_key: str | None = None
    gemini_model: str = "gemini-2.5-flash-lite"
    github_app_id: str | None = None
    github_app_client_id: str | None = None
    github_app_client_secret: str | None = None
    github_app_slug: str | None = None
    github_app_private_key: str | None = None
    github_webhook_secret: str | None = None
    external_ai_code_review_enabled: bool = False
    github_client_id: str | None = None
    github_client_secret: str | None = None
    github_callback_url: str = "http://localhost:8000/api/v1/github/callback"
    secret_key: str = "sisya-secret-key-change-in-production-32bytes!"
    session_cookie_name: str = "sisya_session"
    session_days: int = 7
    email_verification_hours: int = 24
    model_config = SettingsConfigDict(env_file=".env", env_prefix="SISYA_", extra="ignore")

    @property
    def oauth_client_id(self) -> str | None:
        return self.github_client_id or self.github_app_client_id

    @property
    def oauth_client_secret(self) -> str | None:
        return self.github_client_secret or self.github_app_client_secret

settings = Settings()
