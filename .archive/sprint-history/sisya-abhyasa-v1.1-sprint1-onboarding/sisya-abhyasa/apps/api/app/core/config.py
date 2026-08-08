from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "Sisya Abhyasa API"
    environment: str = "development"
    database_url: str = "postgresql+psycopg://sisya:sisya@localhost:5432/sisya"
    frontend_origin: str = "http://localhost:3000"
    allow_dev_auth: bool = True
    model_config = SettingsConfigDict(env_file=".env", env_prefix="SISYA_", extra="ignore")

settings = Settings()
