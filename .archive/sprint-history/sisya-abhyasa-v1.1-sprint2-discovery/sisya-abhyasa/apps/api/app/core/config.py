from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "Sisya Abhyasa API"
    environment: str = "development"
    database_url: str = "sqlite:///./sisya.db"
    frontend_origin: str = "http://localhost:3000"
    allow_dev_auth: bool = True
    gemini_api_key: str | None = None
    gemini_model: str = "gemini-2.5-flash-lite"
    model_config = SettingsConfigDict(env_file=".env", env_prefix="SISYA_", extra="ignore")

settings = Settings()
