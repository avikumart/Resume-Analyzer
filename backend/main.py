import os

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

try:
    from backend.models.schemas import AnalysisResponse
    from backend.services import db_service, llm_service
    from backend.utils.parser import extract_text
except ModuleNotFoundError:
    from models.schemas import AnalysisResponse
    from services import db_service, llm_service
    from utils.parser import extract_text

app = FastAPI(title="Smart Resume & Job Match Analyzer", version="1.0.0")


def get_allowed_origins() -> list[str]:
    origins: list[str] = []

    cors_origins = os.getenv("CORS_ORIGINS", "")
    if cors_origins.strip():
        origins.extend(origin.strip() for origin in cors_origins.split(",") if origin.strip())

    frontend_url = os.getenv("FRONTEND_URL", "").strip()
    if frontend_url:
        origins.append(frontend_url)

    frontend_urls = os.getenv("FRONTEND_URLS", "")
    if frontend_urls.strip():
        origins.extend(origin.strip() for origin in frontend_urls.split(",") if origin.strip())

    deduped = list(dict.fromkeys(origins))
    return deduped if deduped else ["*"]


allowed_origins = get_allowed_origins()

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=allowed_origins != ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"service": "resume-analyzer-api", "status": "ok"}


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.post("/api/analyze/", response_model=AnalysisResponse, tags=["analysis"])
async def analyze(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
):
    resume_text = await extract_text(resume)
    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from resume")

    analysis = await llm_service.analyze_resume(resume_text, job_description)
    saved = await db_service.save_analysis(analysis, resume_text, job_description)

    return AnalysisResponse(id=saved["id"], **analysis)


@app.get("/api/analyze/history", tags=["analysis"])
async def history():
    return await db_service.get_history()


@app.get("/api/analyze/{analysis_id}", tags=["analysis"])
async def get_analysis(analysis_id: str):
    result = await db_service.get_analysis(analysis_id)
    if not result:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return result
