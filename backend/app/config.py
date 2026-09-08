from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "sqlite:///./fieldtest.db"
    jwt_secret: str = "dev-jwt-secret-change-in-production"
    signing_secret: str = "dev-signing-secret-change-in-production"
    jwt_expire_minutes: int = 480
    upload_dir: str = "./uploads"
    cors_origins: str = "http://localhost:5173,http://localhost:8081,exp://localhost:8081"
    ml_enabled: bool = False

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
