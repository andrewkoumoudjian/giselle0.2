import os
import json
import logging
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uuid
import datetime
import traceback

# Setup logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Simple Mock API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"}
    )

# Pydantic models for request/response validation
class CreateCompanyRequest(BaseModel):
    name: str

class CreateJobRequest(BaseModel):
    company_id: str
    title: str
    description: str
    department: Optional[str] = None
    required_skills: Optional[List[str]] = None

class CreateCandidateRequest(BaseModel):
    name: str
    email: str

class CreateInterviewRequest(BaseModel):
    job_id: str
    candidate_id: str

# API endpoints
@app.get("/health")
def health_check():
    """Check if the API is running."""
    return {
        "status": "ok",
        "version": "0.1.0",
        "timestamp": datetime.datetime.now().isoformat()
    }

# Company endpoints
@app.post("/companies", status_code=201)
def create_company(request: CreateCompanyRequest):
    """Create a new company."""
    return {
        "id": str(uuid.uuid4()),
        "name": request.name,
        "created_at": datetime.datetime.now().isoformat()
    }

# Job endpoints
@app.post("/jobs", status_code=201)
def create_job(request: CreateJobRequest):
    """Create a new job description."""
    return {
        "id": str(uuid.uuid4()),
        "company_id": request.company_id,
        "title": request.title,
        "description": request.description,
        "department": request.department,
        "required_skills": request.required_skills,
        "created_at": datetime.datetime.now().isoformat()
    }

# Candidate endpoints
@app.post("/candidates", status_code=201)
def create_candidate(request: CreateCandidateRequest):
    """Create a new candidate."""
    return {
        "id": str(uuid.uuid4()),
        "name": request.name,
        "email": request.email,
        "created_at": datetime.datetime.now().isoformat()
    }

# Interview endpoints
@app.post("/interviews", status_code=201)
def create_interview(request: CreateInterviewRequest):
    """Create a new interview with questions."""
    try:
        logger.debug(f"Creating interview with job_id={request.job_id}, candidate_id={request.candidate_id}")
        
        interview_id = str(uuid.uuid4())
        interview = {
            "id": interview_id,
            "job_id": request.job_id,
            "candidate_id": request.candidate_id,
            "status": "pending",
            "created_at": datetime.datetime.now().isoformat()
        }
        
        # Mock questions
        questions = [
            {
                "id": str(uuid.uuid4()),
                "interview_id": interview_id,
                "text": "Tell me about your experience with frontend development.",
                "type": "experience",
                "skill_assessed": "technical_knowledge",
                "order_index": 0
            },
            {
                "id": str(uuid.uuid4()),
                "interview_id": interview_id,
                "text": "How do you handle difficult team dynamics?",
                "type": "behavioral",
                "skill_assessed": "collaboration",
                "order_index": 1
            },
            {
                "id": str(uuid.uuid4()),
                "interview_id": interview_id,
                "text": "What's your approach to responsive design?",
                "type": "technical",
                "skill_assessed": "frontend_skills",
                "order_index": 2
            }
        ]
        
        response = {
            "interview": interview,
            "questions": questions
        }
        
        logger.debug(f"Created interview with id={interview_id}")
        return response
    
    except Exception as e:
        logger.error(f"Error creating interview: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error creating interview: {str(e)}")

@app.get("/interviews/{interview_id}/questions")
def get_interview_questions(interview_id: str):
    """Get all questions for an interview."""
    return [
        {
            "id": str(uuid.uuid4()),
            "interview_id": interview_id,
            "text": "Tell me about your experience with frontend development.",
            "type": "experience",
            "skill_assessed": "technical_knowledge",
            "order_index": 0
        },
        {
            "id": str(uuid.uuid4()),
            "interview_id": interview_id,
            "text": "How do you handle difficult team dynamics?",
            "type": "behavioral",
            "skill_assessed": "collaboration",
            "order_index": 1
        },
        {
            "id": str(uuid.uuid4()),
            "interview_id": interview_id,
            "text": "What's your approach to responsive design?",
            "type": "technical",
            "skill_assessed": "frontend_skills",
            "order_index": 2
        }
    ] 