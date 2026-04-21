import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    CEREBRAS_API_KEY: str
    CEREBRAS_MODEL: str 

    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str

    FRONTEND_URL: str = ""
    FRONTEND_URLS: str = ""

    @property
    def allowed_origins(self) -> list[str]:
        urls: list[str] = []
        if self.FRONTEND_URL.strip():
            urls.append(self.FRONTEND_URL.strip())
        if self.FRONTEND_URLS:
            urls.extend(url.strip() for url in self.FRONTEND_URLS.split(",") if url.strip())
        deduped = list(dict.fromkeys(urls))
        return deduped if deduped else ["*"]

    class Config:
        env_file = ".env" if os.path.exists(".env") else None


settings = Settings()
