from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-4-20250514"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o"
    llm_provider: str = "openai"
    cors_origins: str = "http://localhost:3000"
    
    # Keycloak settings
    keycloak_server_url: str = "http://localhost:8080"
    keycloak_realm: str = "writer-assistant"
    keycloak_client_id: str = "writer-assistant-backend"
    keycloak_client_secret: str = ""

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
