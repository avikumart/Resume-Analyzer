from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    cerebras_api_key: str
    cerebras_model: str = "llama-4-scout-17b-16e-instruct"

    supabase_url: str
    supabase_service_key: str

    frontend_url: str = "http://localhost:3000"

    class Config:
        env_file = ".env"


settings = Settings()
