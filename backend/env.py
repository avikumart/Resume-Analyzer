import os
from pathlib import Path


def _load_local_env_file() -> None:
    env_path = Path(__file__).resolve().parent / ".env"
    if not env_path.exists():
        return

    for raw_line in env_path.read_text().splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key:
            os.environ.setdefault(key, value)


_load_local_env_file()


def get_env(name: str, default: str = "") -> str:
    return os.getenv(name, default).strip()


def get_required_env(name: str) -> str:
    value = get_env(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def get_csv_env(name: str) -> list[str]:
    raw_value = get_env(name)
    if not raw_value:
        return []
    return [item.strip() for item in raw_value.split(",") if item.strip()]


def get_allowed_origins() -> list[str]:
    origins: list[str] = []
    origins.extend(get_csv_env("CORS_ORIGINS"))

    frontend_url = get_env("FRONTEND_URL")
    if frontend_url:
        origins.append(frontend_url)

    origins.extend(get_csv_env("FRONTEND_URLS"))

    if get_env("ENVIRONMENT", "development").lower() != "production":
        origins.extend(
            [
                "http://localhost:3000",
                "http://127.0.0.1:3000",
            ]
        )

    # An empty production list is intentional. The frontend proxies /api through
    # Vercel, so the browser does not need cross-origin access to the API.
    return list(dict.fromkeys(origins))
