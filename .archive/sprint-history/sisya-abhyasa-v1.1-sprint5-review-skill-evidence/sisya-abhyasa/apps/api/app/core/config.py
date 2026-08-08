from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "Sisya Abhyasa API"
    environment: str = "development"
    database_url: str = "postgresql+psycopg://sisya:sisya@localhost:5432/sisya"
    frontend_origin: str = "http://localhost:3000"
    allow_dev_auth: bool = True
    gemini_api_key: str | None = None
    gemini_model: str = "gemini-2.5-flash-lite"
    github_app_id: str | None = None
    github_app_client_id: str | None = None
    github_app_client_secret: str | None = None
    github_app_slug: str | None = None
    github_app_private_key: str | None = None
    github_webhook_secret: str | None = None
    external_ai_code_review_enabled: bool = False
    model_config = SettingsConfigDict(env_file=".env", env_prefix="SISYA_", extra="ignore")

settings = Settings()
