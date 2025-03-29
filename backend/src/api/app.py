import os
import json
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uuid
import datetime

# Fix relative imports
from ..services.interview_manager import InterviewManager
from ..utils.database import SupabaseClient
from ..utils.llm import LLMClient

# Initialize FastAPI app
app = FastAPI(title="Unbiased Interview System API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get services
def get_interview_manager():
    return InterviewManager()

def get_db():
    return SupabaseClient()

# Pydantic models for request/response validation
class CreateCompanyRequest(BaseModel):
    name: str

class CreateJobRequest(BaseModel):
    company_id: str
    title: str
    description: str
    department: Optional[str] = None
    required_skills: Optional[List[str]] = None
    soft_skills_priorities: Optional[Dict[str, int]] = None

class CreateCandidateRequest(BaseModel):
    name: str
    email: str

class CreateInterviewRequest(BaseModel):
    job_id: str
    candidate_id: str

class QuestionResponse(BaseModel):
    id: str
    interview_id: str
    text: str
    type: str
    skill_assessed: Optional[str] = None
    order_index: int

# API endpoints
@app.get("/health")
def health_check():
    """Check if the API is running."""
    try:
        # Try to initialize database and other services
        db = SupabaseClient()
        llm = LLMClient()
        
        # Return more detailed status
        return {
            "status": "ok",
            "version": "0.1.0",
            "database": "connected" if not db.use_mock else "mock",
            "llm": "connected" if not llm.use_mock else "mock",
            "timestamp": datetime.datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "timestamp": datetime.datetime.now().isoformat()
        }

# Company endpoints
@app.post("/companies", status_code=201)
def create_company(
    request: CreateCompanyRequest,
    db: SupabaseClient = Depends(get_db)
):
    """Create a new company."""
    try:
        company = db.create_company(request.name)
        return company
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/companies/{company_id}")
def get_company(
    company_id: str,
    db: SupabaseClient = Depends(get_db)
):
    """Get a company by ID."""
    try:
        company = db.get_company(company_id)
        return company
    except Exception as e:
        raise HTTPException(status_code=404, detail="Company not found")

# Job endpoints
@app.post("/jobs", status_code=201)
def create_job(
    request: CreateJobRequest,
    db: SupabaseClient = Depends(get_db)
):
    """Create a new job description."""
    try:
        job = db.create_job_description(
            request.company_id,
            request.title,
            request.description,
            request.department,
            request.required_skills,
            request.soft_skills_priorities
        )
        return job
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/jobs/{job_id}")
def get_job(
    job_id: str,
    db: SupabaseClient = Depends(get_db)
):
    """Get a job description by ID."""
    try:
        job = db.get_job_description(job_id)
        return job
    except Exception as e:
        raise HTTPException(status_code=404, detail="Job not found")

# Candidate endpoints
@app.post("/candidates", status_code=201)
def create_candidate(
    request: CreateCandidateRequest,
    db: SupabaseClient = Depends(get_db)
):
    """Create a new candidate."""
    try:
        candidate = db.create_candidate(request.name, request.email)
        return candidate
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/candidates/{candidate_id}")
def get_candidate(
    candidate_id: str,
    db: SupabaseClient = Depends(get_db)
):
    """Get a candidate by ID."""
    try:
        candidate = db.get_candidate(candidate_id)
        return candidate
    except Exception as e:
        raise HTTPException(status_code=404, detail="Candidate not found")

@app.post("/candidates/{candidate_id}/resume")
async def upload_resume(
    candidate_id: str,
    resume: UploadFile = File(...),
    interview_manager: InterviewManager = Depends(get_interview_manager)
):
    """Upload and parse a candidate's resume."""
    try:
        contents = await resume.read()
        result = interview_manager.upload_and_parse_resume(
            candidate_id,
            contents,
            resume.filename
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Interview endpoints
@app.post("/interviews", status_code=201)
def create_interview(
    request: CreateInterviewRequest,
    interview_manager: InterviewManager = Depends(get_interview_manager)
):
    """Create a new interview with questions."""
    try:
        result = interview_manager.create_interview(request.job_id, request.candidate_id)
        return result
    except Exception as e:
        import traceback
        error_detail = str(e)
        print(f"Error creating interview: {error_detail}")
        print(traceback.format_exc())
        
        # Return a mock response for testing in case of errors
        mock_interview = {
            "id": str(uuid.uuid4()),
            "job_id": request.job_id,
            "candidate_id": request.candidate_id,
            "status": "pending",
            "created_at": datetime.datetime.now().isoformat()
        }
        mock_questions = [
            {
                "id": str(uuid.uuid4()),
                "interview_id": mock_interview["id"],
                "text": "Tell me about your experience.",
                "type": "behavioral",
                "skill_assessed": "communication",
                "order_index": 0
            }
        ]
        return {
            "interview": mock_interview,
            "questions": mock_questions
        }

@app.get("/interviews/{interview_id}")
def get_interview(
    interview_id: str,
    db: SupabaseClient = Depends(get_db)
):
    """Get an interview by ID."""
    try:
        interview = db.get_interview(interview_id)
        return interview
    except Exception as e:
        raise HTTPException(status_code=404, detail="Interview not found")

@app.get("/interviews/{interview_id}/questions", response_model=List[QuestionResponse])
def get_interview_questions(
    interview_id: str,
    interview_manager: InterviewManager = Depends(get_interview_manager)
):
    """Get all questions for an interview."""
    try:
        questions = interview_manager.get_interview_questions(interview_id)
        return questions
    except Exception as e:
        raise HTTPException(status_code=404, detail="Questions not found")

@app.post("/responses/{question_id}")
async def submit_response(
    question_id: str,
    audio: UploadFile = File(...),
    interview_manager: InterviewManager = Depends(get_interview_manager)
):
    """Submit an audio response to a question."""
    try:
        contents = await audio.read()
        result = interview_manager.process_response(question_id, contents)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/interviews/{interview_id}/complete")
def complete_interview(
    interview_id: str,
    interview_manager: InterviewManager = Depends(get_interview_manager)
):
    """Complete an interview and generate assessment."""
    try:
        result = interview_manager.complete_interview(interview_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/interviews/{interview_id}/assessment")
def get_assessment(
    interview_id: str,
    interview_manager: InterviewManager = Depends(get_interview_manager)
):
    """Get the assessment for an interview."""
    try:
        assessment = interview_manager.get_assessment(interview_id)
        if not assessment:
            raise HTTPException(status_code=404, detail="Assessment not found")
        return assessment
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 