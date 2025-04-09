from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uuid
from datetime import datetime
import logging
import traceback

# Setup logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Minimal API")

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

# Health check endpoint
@app.get("/health")
async def health_check():
    logger.debug("Health check requested")
    return {
        "status": "ok",
        "version": "0.1.0",
        "timestamp": datetime.now().isoformat()
    }

# Simple interview creation model
class InterviewRequest(BaseModel):
    job_id: str
    candidate_id: str

# Simple interview creation endpoint
@app.post("/interviews")
async def create_interview(request: InterviewRequest):
    try:
        logger.debug(f"Creating interview with job_id={request.job_id}, candidate_id={request.candidate_id}")
        
        interview_id = str(uuid.uuid4())
        logger.debug(f"Generated interview_id={interview_id}")
        
        response = {
            "interview": {
                "id": interview_id,
                "job_id": request.job_id,
                "candidate_id": request.candidate_id,
                "status": "pending",
                "created_at": datetime.now().isoformat()
            },
            "questions": [
                {
                    "id": str(uuid.uuid4()),
                    "interview_id": interview_id,
                    "text": "Tell me about yourself",
                    "order_index": 0
                }
            ]
        }
        
        logger.debug(f"Returning interview response with id={interview_id}")
        return response
    except Exception as e:
        logger.error(f"Error creating interview: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error creating interview: {str(e)}") 