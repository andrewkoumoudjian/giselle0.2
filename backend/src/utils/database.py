import os
import json
from typing import Dict, List, Any, Optional
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

class SupabaseClient:
    """Singleton client for Supabase database operations."""
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SupabaseClient, cls).__new__(cls)
            
            # Check if we're using mock data
            use_mock = os.getenv("USE_MOCK_DATA", "true").lower() == "true"
            
            # Get Supabase credentials
            supabase_url = os.getenv("SUPABASE_URL")
            supabase_key = os.getenv("SUPABASE_KEY")
            
            try:
                if not use_mock and supabase_url and supabase_key:
                    print("Connecting to real Supabase database...")
                    cls._instance.client = create_client(supabase_url, supabase_key)
                    # Test the connection
                    cls._instance.client.table('companies').select("*").limit(1).execute()
                    cls._instance.use_mock = False
                    print("Successfully connected to Supabase database")
                else:
                    if use_mock:
                        reason = "USE_MOCK_DATA is set to true"
                    elif not supabase_url:
                        reason = "SUPABASE_URL is not set"
                    elif not supabase_key:
                        reason = "SUPABASE_KEY is not set"
                    else:
                        reason = "unknown reason"
                    
                    print(f"WARNING: Using mock database - {reason}")
                    # Use internal mock implementation for testing/development
                    from .mock_database import MockSupabaseClient
                    cls._instance.client = MockSupabaseClient()
                    cls._instance.use_mock = True
            except Exception as e:
                print(f"ERROR connecting to Supabase: {str(e)}")
                print("Falling back to mock database...")
                from .mock_database import MockSupabaseClient
                cls._instance.client = MockSupabaseClient()
                cls._instance.use_mock = True
                
        return cls._instance
    
    def get_client(self) -> Client:
        """Get the Supabase client instance."""
        return self.client
    
    # Companies
    def create_company(self, name: str) -> Dict[str, Any]:
        """Create a new company."""
        return self.client.table('companies').insert({"name": name}).execute().data[0]
    
    def get_company(self, company_id: str) -> Dict[str, Any]:
        """Get a company by ID."""
        return self.client.table('companies').select("*").eq("id", company_id).execute().data[0]
    
    # Job Descriptions
    def create_job_description(self, 
                              company_id: str, 
                              title: str, 
                              description: str, 
                              department: Optional[str] = None,
                              required_skills: Optional[List[str]] = None,
                              soft_skills_priorities: Optional[Dict[str, int]] = None) -> Dict[str, Any]:
        """Create a new job description."""
        job_data = {
            "company_id": company_id,
            "title": title,
            "description": description,
        }
        
        if department:
            job_data["department"] = department
            
        if required_skills:
            job_data["required_skills"] = json.dumps(required_skills)
            
        if soft_skills_priorities:
            job_data["soft_skills_priorities"] = json.dumps(soft_skills_priorities)
            
        return self.client.table('job_descriptions').insert(job_data).execute().data[0]
    
    def get_job_description(self, job_id: str) -> Dict[str, Any]:
        """Get a job description by ID."""
        return self.client.table('job_descriptions').select("*").eq("id", job_id).execute().data[0]
    
    # Candidates
    def create_candidate(self, name: str, email: str, resume_url: Optional[str] = None) -> Dict[str, Any]:
        """Create a new candidate."""
        candidate_data = {
            "name": name,
            "email": email
        }
        
        if resume_url:
            candidate_data["resume_url"] = resume_url
            
        return self.client.table('candidates').insert(candidate_data).execute().data[0]
    
    def update_candidate_resume(self, candidate_id: str, resume_url: str, parsed_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a candidate's resume information."""
        return self.client.table('candidates').update({
            "resume_url": resume_url,
            "resume_parsed": json.dumps(parsed_data)
        }).eq("id", candidate_id).execute().data[0]
    
    def get_candidate(self, candidate_id: str) -> Dict[str, Any]:
        """Get a candidate by ID."""
        return self.client.table('candidates').select("*").eq("id", candidate_id).execute().data[0]
    
    # Interviews
    def create_interview(self, job_id: str, candidate_id: str) -> Dict[str, Any]:
        """Create a new interview."""
        return self.client.table('interviews').insert({
            "job_id": job_id,
            "candidate_id": candidate_id,
            "status": "pending"
        }).execute().data[0]
    
    def update_interview_status(self, interview_id: str, status: str) -> Dict[str, Any]:
        """Update an interview's status."""
        update_data = {"status": status}
        
        if status == "completed":
            update_data["completed_at"] = "now()"
            
        return self.client.table('interviews').update(update_data).eq("id", interview_id).execute().data[0]
    
    def get_interview(self, interview_id: str) -> Dict[str, Any]:
        """Get an interview by ID."""
        return self.client.table('interviews').select("*").eq("id", interview_id).execute().data[0]
    
    # Questions
    def create_questions(self, interview_id: str, questions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Create multiple questions for an interview."""
        question_data = []
        
        for i, q in enumerate(questions):
            question_data.append({
                "interview_id": interview_id,
                "text": q["question"],
                "type": q.get("type", "behavioral"),
                "skill_assessed": q.get("skill_assessed"),
                "order_index": i
            })
            
        return self.client.table('questions').insert(question_data).execute().data
    
    def get_interview_questions(self, interview_id: str) -> List[Dict[str, Any]]:
        """Get all questions for an interview."""
        return self.client.table('questions').select("*").eq("interview_id", interview_id).order("order_index").execute().data
    
    # Responses
    def create_response(self, question_id: str, audio_url: str) -> Dict[str, Any]:
        """Create a new response."""
        return self.client.table('responses').insert({
            "question_id": question_id,
            "audio_url": audio_url
        }).execute().data[0]
    
    def update_response_analysis(self, response_id: str, transcription: str, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Update a response with transcription and analysis."""
        return self.client.table('responses').update({
            "transcription": transcription,
            "analysis_results": json.dumps(analysis)
        }).eq("id", response_id).execute().data[0]
    
    # Assessments
    def create_assessment(self, interview_id: str, assessment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new assessment."""
        data = {
            "interview_id": interview_id,
            "empathy_score": assessment_data.get("empathy_score"),
            "collaboration_score": assessment_data.get("collaboration_score"),
            "confidence_score": assessment_data.get("confidence_score"),
            "english_proficiency": assessment_data.get("english_proficiency"),
            "professionalism": assessment_data.get("professionalism"),
        }
        
        if "field_importance" in assessment_data:
            data["field_importance"] = json.dumps(assessment_data["field_importance"])
            
        if "candidate_skills" in assessment_data:
            data["candidate_skills"] = json.dumps(assessment_data["candidate_skills"])
            
        if "correlation_matrix" in assessment_data:
            data["correlation_matrix"] = json.dumps(assessment_data["correlation_matrix"])
            
        return self.client.table('assessments').insert(data).execute().data[0]
    
    def get_assessment(self, interview_id: str) -> Dict[str, Any]:
        """Get an assessment by interview ID."""
        return self.client.table('assessments').select("*").eq("interview_id", interview_id).execute().data[0]
    
    # Storage methods
    def upload_resume(self, file_path: str, file_name: str) -> str:
        """Upload a resume file to storage and return the URL."""
        with open(file_path, 'rb') as f:
            self.client.storage.from_('resumes').upload(file_name, f)
            
        return self.client.storage.from_('resumes').get_public_url(file_name)
    
    def upload_audio(self, file_path: str, file_name: str) -> str:
        """Upload an audio file to storage and return the URL."""
        with open(file_path, 'rb') as f:
            self.client.storage.from_('interview_audio').upload(file_name, f)
            
        return self.client.storage.from_('interview_audio').get_public_url(file_name) 