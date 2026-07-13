from functools import lru_cache

from supabase import Client, create_client

try:
    from backend.env import get_required_env
except ModuleNotFoundError:
    from env import get_required_env

@lru_cache(maxsize=1)
def _get_client() -> Client:
    # Keep the service-role key server-side and avoid requiring it at import time.
    return create_client(
        get_required_env("SUPABASE_URL"),
        get_required_env("SUPABASE_SERVICE_KEY"),
    )


async def save_analysis(analysis: dict, resume_text: str, job_description: str) -> dict:
    row = {
        "match_score": analysis["match_score"],
        "matched_skills": analysis["matched_skills"],
        "missing_skills": analysis["missing_skills"],
        "bullet_suggestions": analysis["bullet_suggestions"],
        "summary": analysis["summary"],
        "resume_text": resume_text,
        "job_description": job_description,
    }
    result = _get_client().table("analyses").insert(row).execute()
    return result.data[0]


async def get_analysis(analysis_id: str) -> dict | None:
    result = (
        _get_client()
        .table("analyses")
        .select(
            "id, match_score, matched_skills, missing_skills, "
            "bullet_suggestions, summary, created_at"
        )
        .eq("id", analysis_id)
        .execute()
    )
    return result.data[0] if result.data else None


async def get_history() -> list[dict]:
    result = (
        _get_client().table("analyses")
        .select("id, match_score, summary, created_at")
        .order("created_at", desc=True)
        .execute()
    )
    return result.data
