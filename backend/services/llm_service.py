import json

from cerebras.cloud.sdk import (
    APIConnectionError,
    APIStatusError,
    APITimeoutError,
    Cerebras,
    RateLimitError,
)

try:
    from backend.env import get_env, get_required_env
except ModuleNotFoundError:
    from env import get_env, get_required_env

DEFAULT_MODEL = "gpt-oss-120b"


class LLMServiceError(RuntimeError):
    """Base error for failures that are safe to expose through the API."""


class LLMRateLimitError(LLMServiceError):
    pass


class LLMTimeoutError(LLMServiceError):
    pass


class LLMUnavailableError(LLMServiceError):
    pass

SYSTEM_PROMPT = """You are an expert resume analyst. Given a resume and a job description, return a JSON object with:
- match_score: a number 0-100
- matched_skills: list of skills found in both resume and JD
- missing_skills: list of objects {skill, importance} where importance is "critical", "recommended", or "nice-to-have"
- bullet_suggestions: list of objects {original, rewritten, section} improving resume bullets
- summary: a brief paragraph summarizing the analysis

Return ONLY valid JSON, no markdown fences or extra text."""


async def analyze_resume(resume_text: str, job_description: str) -> dict:
    # Create the SDK client lazily so health checks and deployment builds do not
    # require production secrets. Missing secrets fail only analysis requests.
    # Vercel terminates this function after 60 seconds. Cerebras' default retry
    # policy can wait 60 seconds after a 429, guaranteeing a Vercel 504. Fail
    # fast instead so the frontend receives an actionable response.
    client = Cerebras(
        api_key=get_required_env("CEREBRAS_API_KEY"),
        max_retries=0,
        timeout=40.0,
    )
    model_name = get_env("CEREBRAS_MODEL", DEFAULT_MODEL)
    user_prompt = f"""## Resume
{resume_text}

## Job Description
{job_description}

Analyze the resume against the job description and return the structured JSON."""

    try:
        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_object"},
        )
        return json.loads(response.choices[0].message.content)
    except RateLimitError as exc:
        raise LLMRateLimitError(
            "The AI provider is temporarily busy. Wait a minute, then try again."
        ) from exc
    except APITimeoutError as exc:
        raise LLMTimeoutError(
            "The AI provider took too long to respond. Please try again."
        ) from exc
    except APIConnectionError as exc:
        raise LLMUnavailableError(
            "The AI provider is temporarily unreachable. Please try again shortly."
        ) from exc
    except (APIStatusError, json.JSONDecodeError) as exc:
        raise LLMUnavailableError(
            "The AI provider could not complete this analysis. Please try again."
        ) from exc
