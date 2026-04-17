from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

try:
    from backend.config import settings
    from backend.models.schemas import AnalysisResponse
    from backend.services import db_service, llm_service
    from backend.utils.parser import extract_text
except ModuleNotFoundError:
    from config import settings
    from models.schemas import AnalysisResponse
    from services import db_service, llm_service
    from utils.parser import extract_text

app = FastAPI(title="Smart Resume & Job Match Analyzer", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
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
