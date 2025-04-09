import os
import json
import uuid
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
from supabase import create_client, Client

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SupabaseClient:
    def __init__(self):
        # Get Supabase connection parameters from environment
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_KEY')
        
        # Check if we should use mock data
        self.use_mock = os.getenv('USE_MOCK_DATA', 'false').lower() == 'true'
        
        if self.use_mock:
            logger.warning("Using mock database - USE_MOCK_DATA is set to true")
            from .mock_database import MockSupabaseClient
            self.client = MockSupabaseClient()
        else:
            # Validate Supabase credentials
            if not supabase_url or not supabase_key:
                logger.error("Supabase URL and key must be provided in environment variables")
                raise ValueError("Supabase URL and key must be provided")
            
            # Connect to Supabase
            try:
                self.client = create_client(supabase_url, supabase_key)
                logger.info("Successfully connected to Supabase")
            except Exception as e:
                logger.error(f"Failed to connect to Supabase: {str(e)}")
                logger.warning("Falling back to mock database")
                from .mock_database import MockSupabaseClient
                self.client = MockSupabaseClient()
                self.use_mock = True
    
    # Company operations
    def create_company(self, name: str) -> Dict[str, Any]:
        """Create a new company."""
        try:
            result = self.client.table("companies").insert({
                "name": name
            }).execute()
            
            if not result.data:
                raise ValueError("Failed to create company")
                
            return result.data[0]
        except Exception as e:
            logger.error(f"Error creating company: {str(e)}")
            raise
    
    def get_company(self, company_id: str) -> Dict[str, Any]:
        """Get a company by ID."""
        try:
            result = self.client.table("companies").select("*").eq("id", company_id).execute()
            
            if not result.data:
                raise ValueError(f"Company not found with ID: {company_id}")
                
            return result.data[0]
        except Exception as e:
            logger.error(f"Error retrieving company: {str(e)}")
            raise
    
    # Job description operations
    def create_job_description(self, company_id: str, title: str, description: str, 
                             department: Optional[str] = None, 
                             required_skills: Optional[List[str]] = None,
                             soft_skills_priorities: Optional[Dict[str, int]] = None) -> Dict[str, Any]:
        """Create a new job description."""
        try:
            data = {
                "company_id": company_id,
                "title": title,
                "description": description,
                "department": department,
                "required_skills": json.dumps(required_skills) if required_skills else None,
                "soft_skills_priorities": json.dumps(soft_skills_priorities) if soft_skills_priorities else None
            }
            
            result = self.client.table("job_descriptions").insert(data).execute()
            
            if not result.data:
                raise ValueError("Failed to create job description")
                
            return result.data[0]
        except Exception as e:
            logger.error(f"Error creating job description: {str(e)}")
            raise
    
    def get_job_description(self, job_id: str) -> Dict[str, Any]:
        """Get a job description by ID."""
        try:
            result = self.client.table("job_descriptions").select("*").eq("id", job_id).execute()
            
            if not result.data:
                raise ValueError(f"Job description not found with ID: {job_id}")
                
            return result.data[0]
        except Exception as e:
            logger.error(f"Error retrieving job description: {str(e)}")
            raise
    
    # Candidate operations
    def create_candidate(self, name: str, email: str, resume_url: Optional[str] = None) -> Dict[str, Any]:
        """Create a new candidate."""
        try:
            data = {
                "name": name,
                "email": email,
                "resume_url": resume_url
            }
            
            result = self.client.table("candidates").insert(data).execute()
            
            if not result.data:
                raise ValueError("Failed to create candidate")
                
            return result.data[0]
        except Exception as e:
            logger.error(f"Error creating candidate: {str(e)}")
            raise
    
    def get_candidate(self, candidate_id: str) -> Dict[str, Any]:
        """Get a candidate by ID."""
        try:
            result = self.client.table("candidates").select("*").eq("id", candidate_id).execute()
            
            if not result.data:
                raise ValueError(f"Candidate not found with ID: {candidate_id}")
                
            return result.data[0]
        except Exception as e:
            logger.error(f"Error retrieving candidate: {str(e)}")
            raise
    
    def update_candidate_resume(self, candidate_id: str, resume_url: str, resume_parsed: Dict[str, Any]) -> Dict[str, Any]:
        """Update a candidate's resume data."""
        try:
            data = {
                "resume_url": resume_url,
                "resume_parsed": json.dumps(resume_parsed)
            }
            
            result = self.client.table("candidates").update(data).eq("id", candidate_id).execute()
            
            if not result.data:
                raise ValueError(f"Failed to update candidate resume for ID: {candidate_id}")
                
            return result.data[0]
        except Exception as e:
            logger.error(f"Error updating candidate resume: {str(e)}")
            raise
    
    # Interview operations
    def create_interview(self, job_id: str, candidate_id: str) -> Dict[str, Any]:
        """Create a new interview."""
        try:
            data = {
                "job_id": job_id,
                "candidate_id": candidate_id,
                "status": "pending"
            }
            
            result = self.client.table("interviews").insert(data).execute()
            
            if not result.data:
                raise ValueError("Failed to create interview")
                
            return result.data[0]
        except Exception as e:
            logger.error(f"Error creating interview: {str(e)}")
            raise
    
    def get_interview(self, interview_id: str) -> Dict[str, Any]:
        """Get an interview by ID."""
        try:
            result = self.client.table("interviews").select("*").eq("id", interview_id).execute()
            
            if not result.data:
                raise ValueError(f"Interview not found with ID: {interview_id}")
                
            return result.data[0]
        except Exception as e:
            logger.error(f"Error retrieving interview: {str(e)}")
            raise
    
    def update_interview_status(self, interview_id: str, status: str) -> Dict[str, Any]:
        """Update the status of an interview."""
        try:
            data = {
                "status": status
            }
            
            if status == "completed":
                data["completed_at"] = "now()"
            
            result = self.client.table("interviews").update(data).eq("id", interview_id).execute()
            
            if not result.data:
                raise ValueError(f"Failed to update interview status for ID: {interview_id}")
                
            return result.data[0]
        except Exception as e:
            logger.error(f"Error updating interview status: {str(e)}")
            raise
    
    # Question operations
    def create_questions(self, interview_id: str, questions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Create questions for an interview."""
        try:
            insert_data = []
            for idx, question in enumerate(questions):
                insert_data.append({
                    "interview_id": interview_id,
                    "text": question.get("text", ""),
                    "type": question.get("type", "technical"),
                    "skill_assessed": question.get("skill_assessed", ""),
                    "order_index": idx
                })
            
            result = self.client.table("questions").insert(insert_data).execute()
            
            if not result.data:
                raise ValueError(f"Failed to create questions for interview ID: {interview_id}")
                
            return result.data
        except Exception as e:
            logger.error(f"Error creating questions: {str(e)}")
            raise
    
    def get_interview_questions(self, interview_id: str) -> List[Dict[str, Any]]:
        """Get all questions for an interview."""
        try:
            result = self.client.table("questions").select("*").eq("interview_id", interview_id).order("order_index").execute()
            
            return result.data
        except Exception as e:
            logger.error(f"Error retrieving interview questions: {str(e)}")
            raise
    
    # Response operations
    def create_response(self, question_id: str, transcription: str, audio_url: Optional[str] = None, analysis_results: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Create a response to a question."""
        try:
            data = {
                "question_id": question_id,
                "transcription": transcription,
                "audio_url": audio_url,
                "analysis_results": json.dumps(analysis_results) if analysis_results else None
            }
            
            result = self.client.table("responses").insert(data).execute()
            
            if not result.data:
                raise ValueError(f"Failed to create response for question ID: {question_id}")
                
            return result.data[0]
        except Exception as e:
            logger.error(f"Error creating response: {str(e)}")
            raise
    
    def get_response(self, response_id: str) -> Dict[str, Any]:
        """Get a response by ID."""
        try:
            result = self.client.table("responses").select("*").eq("id", response_id).execute()
            
            if not result.data:
                raise ValueError(f"Response not found with ID: {response_id}")
                
            return result.data[0]
        except Exception as e:
            logger.error(f"Error retrieving response: {str(e)}")
            raise
    
    def update_response_analysis(self, response_id: str, analysis_results: Dict[str, Any]) -> Dict[str, Any]:
        """Update the analysis of a response."""
        try:
            data = {
                "analysis_results": json.dumps(analysis_results)
            }
            
            result = self.client.table("responses").update(data).eq("id", response_id).execute()
            
            if not result.data:
                raise ValueError(f"Failed to update response analysis for ID: {response_id}")
                
            return result.data[0]
        except Exception as e:
            logger.error(f"Error updating response analysis: {str(e)}")
            raise
    
    # Assessment operations
    def create_assessment(self, interview_id: str, assessment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create an assessment for an interview."""
        try:
            data = {
                "interview_id": interview_id,
                "empathy_score": assessment_data.get("empathy_score"),
                "collaboration_score": assessment_data.get("collaboration_score"),
                "confidence_score": assessment_data.get("confidence_score"),
                "english_proficiency": assessment_data.get("english_proficiency"),
                "professionalism": assessment_data.get("professionalism"),
                "field_importance": json.dumps(assessment_data.get("field_importance", {})),
                "candidate_skills": json.dumps(assessment_data.get("candidate_skills", {})),
                "correlation_matrix": json.dumps(assessment_data.get("correlation_matrix", {}))
            }
            
            result = self.client.table("assessments").insert(data).execute()
            
            if not result.data:
                raise ValueError(f"Failed to create assessment for interview ID: {interview_id}")
                
            return result.data[0]
        except Exception as e:
            logger.error(f"Error creating assessment: {str(e)}")
            raise
    
    def get_assessment(self, interview_id: str) -> Dict[str, Any]:
        """Get an assessment by interview ID."""
        try:
            result = self.client.table("assessments").select("*").eq("interview_id", interview_id).execute()
            
            if not result.data:
                raise ValueError(f"Assessment not found for interview ID: {interview_id}")
                
            return result.data[0]
        except Exception as e:
            logger.error(f"Error retrieving assessment: {str(e)}")
            raise
    
    # Storage operations
    def upload_resume(self, candidate_id: str, file_data: bytes, file_name: str) -> str:
        """Upload a resume file to storage and return the URL."""
        try:
            storage_path = f"{candidate_id}/{file_name}"
            
            self.client.storage.from_("resumes").upload(
                storage_path,
                file_data
            )
            
            url = self.client.storage.from_("resumes").get_public_url(storage_path)
            return url
        except Exception as e:
            logger.error(f"Error uploading resume: {str(e)}")
            raise
    
    def upload_audio(self, interview_id: str, question_id: str, file_data: bytes) -> str:
        """Upload an audio file to storage and return the URL."""
        try:
            file_name = f"{interview_id}_{question_id}.webm"
            storage_path = f"{interview_id}/{file_name}"
            
            self.client.storage.from_("interview_audio").upload(
                storage_path,
                file_data
            )
            
            url = self.client.storage.from_("interview_audio").get_public_url(storage_path)
            return url
        except Exception as e:
            logger.error(f"Error uploading audio: {str(e)}")
            raise

# Database factory
def get_database():
    """Get the appropriate database implementation based on environment."""
    use_mock = os.getenv('USE_MOCK_DATA', 'true').lower() == 'true'
    use_supabase = os.getenv('USE_SUPABASE', 'false').lower() == 'true'
    
    if not use_mock and use_supabase:
        logger.info("Using Supabase database")
        return SupabaseClient()
    else:
        logger.warning("Using mock database - USE_MOCK_DATA is set to true or USE_SUPABASE is set to false")
        from .mock_database import MockSupabaseClient
        return MockSupabaseClient() 