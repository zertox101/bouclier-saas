from typing import Optional, List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, validator, computed_field

class Settings(BaseSettings):
    # Core
    PROJECT_NAME: str = "BOUCLIER_SAAS"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "placeholder_key"
    
    # DB
    DB_USER: str = "bouclier_user"
    DB_PASS: str = "bouclier_password_prod"
    DB_PASSWORD: str = ""  # alias used by docker-compose
    DB_NAME: str = "bouclier_data"
    DB_HOST: str = "db"
    DB_PORT: str = "5432"

    @computed_field
    @property
    def DATABASE_URL(self) -> str:
        password = self.DB_PASSWORD or self.DB_PASS
        return f"postgresql://{self.DB_USER}:{password}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    # Redis
    REDIS_HOST: str = "redis"
    REDIS_PORT: int = 6379

    # AI
    LLM_PROVIDER: str = "ollama"
    LLM_BASE_URL: str = "http://ollama:11434"
    LLM_MODEL: str = "llama3.2:3b"
    QDRANT_HOST: str = "qdrant"
    QDRANT_PORT: int = 6333

    # Offensive Policies
    OFFENSIVE_MODE: bool = False
    SAFE_MODE: bool = True
    MAX_SCAN_SCOPE: str = "10.0.0.0/24"
    ALLOW_EXTERNAL_TARGETS: bool = False
    MAX_CONCURRENT_SCANS: int = 3
    TOOLS_API_SECRET: str = "sk_live_placeholder"
    TOOLS_API_URL: str = "http://tools-api:8100"

    # Observability
    LOG_LEVEL: str = "info"
    AUDIT_LOGGING: bool = True

    model_config = SettingsConfigDict(
        env_file=(".env.core", ".env.ai", ".env.offensive", ".env.app"),
        env_file_encoding='utf-8',
        extra='ignore'
    )

settings = Settings()
