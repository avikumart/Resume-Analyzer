from pydantic import BaseModel


class MissingSkill(BaseModel):
    skill: str
    importance: str  # "critical" | "recommended" | "nice-to-have"


class BulletSuggestion(BaseModel):
    original: str
    rewritten: str
    section: str


class AnalysisRequest(BaseModel):
    job_description: str


class AnalysisResponse(BaseModel):
    id: str
    match_score: float
    matched_skills: list[str]
    missing_skills: list[MissingSkill]
    bullet_suggestions: list[BulletSuggestion]
    summary: str
