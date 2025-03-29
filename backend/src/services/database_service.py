import logging
from typing import List, Dict, Any, Optional

from ..utils.database import get_database

logger = logging.getLogger(__name__)

class DatabaseService:
    """Service for database operations."""
    
    def __init__(self):
        """Initialize with a database connection."""
        self.db = get_database()
        logger.info("DatabaseService initialized")
    
    # Company operations
    def create_company(self, name: str) -> Dict[str, Any]:
        """Create a new company."""
        return self.db.create_company(name)
    
    def get_company(self, company_id: str) -> Dict[str, Any]:
        """Get a company by ID."""
        return self.db.get_company(company_id)
    
    # Job operations
    def create_job(self, company_id: str, title: str, description: str, 
                  department: Optional[str] = None, required_skills: Optional[List[str]] = None) -> Dict[str, Any]:
        """Create a new job."""
        return self.db.create_job(company_id, title, description, department, required_skills)
    
    def get_job(self, job_id: str) -> Dict[str, Any]:
        """Get a job by ID."""
        return self.db.get_job(job_id)
    
    # Candidate operations
    def create_candidate(self, name: str, email: str, resume_path: Optional[str] = None) -> Dict[str, Any]:
        """Create a new candidate."""
        return self.db.create_candidate(name, email, resume_path)
    
    def get_candidate(self, candidate_id: str) -> Dict[str, Any]:
        """Get a candidate by ID."""
        return self.db.get_candidate(candidate_id)
    
    # Interview operations
    def create_interview(self, job_id: str, candidate_id: str) -> Dict[str, Any]:
        """Create a new interview."""
        interview = self.db.create_interview(job_id, candidate_id)
        
        # Generate questions for the interview based on the job
        job = self.get_job(job_id)
        questions = self._generate_default_questions(job)
        
        # Create questions in the database
        self.db.create_questions(interview['id'], questions)
        
        return interview
    
    def get_interview(self, interview_id: str) -> Dict[str, Any]:
        """Get an interview by ID."""
        return self.db.get_interview(interview_id)
    
    def update_interview_status(self, interview_id: str, status: str) -> Dict[str, Any]:
        """Update an interview's status."""
        return self.db.update_interview_status(interview_id, status)
    
    # Question operations
    def get_interview_questions(self, interview_id: str) -> List[Dict[str, Any]]:
        """Get all questions for an interview."""
        return self.db.get_interview_questions(interview_id)
    
    # Response operations
    def create_response(self, question_id: str, response_text: str, audio_path: Optional[str] = None) -> Dict[str, Any]:
        """Create a response to a question."""
        return self.db.create_response(question_id, response_text, audio_path)
    
    def update_response_analysis(self, response_id: str, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Update the analysis of a response."""
        return self.db.update_response_analysis(response_id, analysis)
    
    def _generate_default_questions(self, job: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate default interview questions based on the job."""
        questions = [
            {
                "text": f"Tell me about your experience with {job['title']} roles.",
                "type": "experience",
                "skill_assessed": "professional_experience"
            },
            {
                "text": "Describe a challenging situation you faced at work and how you resolved it.",
                "type": "behavioral",
                "skill_assessed": "problem_solving"
            },
            {
                "text": f"What interests you about this {job['title']} position?",
                "type": "motivation",
                "skill_assessed": "job_fit"
            }
        ]
        
        # Add a technical question if job has required skills
        if job.get('required_skills') and len(job['required_skills']) > 0:
            skill = job['required_skills'][0]
            questions.append({
                "text": f"Can you explain your experience with {skill}?",
                "type": "technical",
                "skill_assessed": "technical_knowledge"
            })
        
        return questions 