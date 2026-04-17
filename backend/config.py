import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    cerebras_api_key: str
    cerebras_model: str = "llama-4-scout-17b-16e-instruct"

    supabase_url: str
    supabase_service_key: str

    frontend_url: str = ""
    frontend_urls: str = ""

    @property
    def allowed_origins(self) -> list[str]:
        urls: list[str] = []
        if self.frontend_url.strip():
            urls.append(self.frontend_url.strip())
        if self.frontend_urls:
            urls.extend(url.strip() for url in self.frontend_urls.split(",") if url.strip())
        deduped = list(dict.fromkeys(urls))
        return deduped if deduped else ["*"]

    class Config:
        env_file = ".env" if os.path.exists(".env") else None


settings = Settings()
