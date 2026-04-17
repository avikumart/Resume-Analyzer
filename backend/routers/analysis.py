from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from models.schemas import AnalysisResponse
from services import db_service, llm_service
from utils.parser import extract_text

router = APIRouter()


@router.post("/", response_model=AnalysisResponse)
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


@router.get("/history")
async def history():
    return await db_service.get_history()


@router.get("/{analysis_id}")
async def get_analysis(analysis_id: str):
    result = await db_service.get_analysis(analysis_id)
    if not result:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return result
