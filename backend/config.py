from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    cerebras_api_key: str
    cerebras_model: str = "llama-4-scout-17b-16e-instruct"

    supabase_url: str
    supabase_service_key: str

    frontend_url: str = "http://localhost:3000"
    frontend_urls: str = ""

    @property
    def allowed_origins(self) -> list[str]:
        urls = [self.frontend_url]
        if self.frontend_urls:
            urls.extend(url.strip() for url in self.frontend_urls.split(",") if url.strip())
        return list(dict.fromkeys(urls))

    class Config:
        env_file = ".env"


settings = Settings()
