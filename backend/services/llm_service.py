import json

from cerebras.cloud.sdk import Cerebras

try:
    from backend.env import get_required_env
except ModuleNotFoundError:
    from env import get_required_env

client = Cerebras(api_key=get_required_env("CEREBRAS_API_KEY"))
MODEL_NAME = get_required_env("CEREBRAS_MODEL")

SYSTEM_PROMPT = """You are an expert resume analyst. Given a resume and a job description, return a JSON object with:
- match_score: a number 0-100
- matched_skills: list of skills found in both resume and JD
- missing_skills: list of objects {skill, importance} where importance is "critical", "recommended", or "nice-to-have"
- bullet_suggestions: list of objects {original, rewritten, section} improving resume bullets
- summary: a brief paragraph summarizing the analysis

Return ONLY valid JSON, no markdown fences or extra text."""


async def analyze_resume(resume_text: str, job_description: str) -> dict:
    user_prompt = f"""## Resume
{resume_text}

## Job Description
{job_description}

Analyze the resume against the job description and return the structured JSON."""

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
    )

    return json.loads(response.choices[0].message.content)
