import os
import json
import uuid
import logging
import psycopg2
from psycopg2.extras import RealDictCursor, register_uuid
from datetime import datetime
from typing import Dict, List, Any, Optional

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PostgresDatabase:
    def __init__(self):
        # Register UUID type
        register_uuid()
        
        # Get database connection parameters from environment
        self.db_params = {
            'dbname': os.getenv('DB_NAME', 'giselle_db'),
            'user': os.getenv('DB_USER', 'postgres'),
            'password': os.getenv('DB_PASSWORD', 'postgres'),
            'host': os.getenv('DB_HOST', 'localhost'),
            'port': os.getenv('DB_PORT', '5432'),
        }
        
        # Test connection
        try:
            self._get_connection()
            logger.info("Successfully connected to PostgreSQL database")
        except Exception as e:
            logger.error(f"Failed to connect to database: {str(e)}")
            raise
    
    def _get_connection(self):
        """Establish a new database connection."""
        conn = psycopg2.connect(**self.db_params)
        return conn
    
    def execute(self, query, params=None):
        """Execute a query and return the results."""
        with self._get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(query, params or {})
                try:
                    results = cur.fetchall()
                    return [dict(row) for row in results]
                except psycopg2.ProgrammingError:
                    # No results to fetch (e.g., for INSERT/UPDATE/DELETE)
                    return []
    
    def execute_one(self, query, params=None):
        """Execute a query and return a single result."""
        results = self.execute(query, params)
        return results[0] if results else None
    
    # Company operations
    def create_company(self, name):
        """Create a new company."""
        company_id = uuid.uuid4()
        query = """
            INSERT INTO companies (id, name) 
            VALUES (%(id)s, %(name)s)
            RETURNING id, name, created_at
        """
        params = {'id': company_id, 'name': name}
        return self.execute_one(query, params)
    
    def get_company(self, company_id):
        """Get a company by ID."""
        query = "SELECT * FROM companies WHERE id = %(id)s"
        return self.execute_one(query, {'id': company_id})
    
    # Job operations
    def create_job(self, company_id, title, description, department=None, required_skills=None):
        """Create a new job posting."""
        job_id = uuid.uuid4()
        query = """
            INSERT INTO jobs (id, company_id, title, description, department, required_skills) 
            VALUES (%(id)s, %(company_id)s, %(title)s, %(description)s, %(department)s, %(required_skills)s)
            RETURNING id, company_id, title, description, department, required_skills, created_at
        """
        params = {
            'id': job_id,
            'company_id': company_id,
            'title': title,
            'description': description,
            'department': department,
            'required_skills': required_skills if required_skills else []
        }
        return self.execute_one(query, params)
    
    def get_job(self, job_id):
        """Get a job by ID."""
        query = "SELECT * FROM jobs WHERE id = %(id)s"
        return self.execute_one(query, {'id': job_id})
    
    # Candidate operations
    def create_candidate(self, name, email, resume_path=None):
        """Create a new candidate."""
        candidate_id = uuid.uuid4()
        query = """
            INSERT INTO candidates (id, name, email, resume_path) 
            VALUES (%(id)s, %(name)s, %(email)s, %(resume_path)s)
            RETURNING id, name, email, resume_path, created_at
        """
        params = {
            'id': candidate_id,
            'name': name,
            'email': email,
            'resume_path': resume_path
        }
        return self.execute_one(query, params)
    
    def get_candidate(self, candidate_id):
        """Get a candidate by ID."""
        query = "SELECT * FROM candidates WHERE id = %(id)s"
        return self.execute_one(query, {'id': candidate_id})
    
    # Interview operations
    def create_interview(self, job_id, candidate_id):
        """Create a new interview."""
        interview_id = uuid.uuid4()
        query = """
            INSERT INTO interviews (id, job_id, candidate_id, status) 
            VALUES (%(id)s, %(job_id)s, %(candidate_id)s, 'pending')
            RETURNING id, job_id, candidate_id, status, created_at
        """
        params = {
            'id': interview_id,
            'job_id': job_id,
            'candidate_id': candidate_id
        }
        interview = self.execute_one(query, params)
        return interview
    
    def get_interview(self, interview_id):
        """Get an interview by ID."""
        query = "SELECT * FROM interviews WHERE id = %(id)s"
        return self.execute_one(query, {'id': interview_id})
    
    def update_interview_status(self, interview_id, status):
        """Update the status of an interview."""
        query = """
            UPDATE interviews 
            SET status = %(status)s
            WHERE id = %(id)s
            RETURNING id, job_id, candidate_id, status, created_at
        """
        params = {'id': interview_id, 'status': status}
        return self.execute_one(query, params)
    
    # Question operations
    def create_questions(self, interview_id, questions):
        """Create questions for an interview."""
        created_questions = []
        for idx, question in enumerate(questions):
            question_id = uuid.uuid4()
            query = """
                INSERT INTO questions (id, interview_id, text, type, skill_assessed, order_index) 
                VALUES (%(id)s, %(interview_id)s, %(text)s, %(type)s, %(skill_assessed)s, %(order_index)s)
                RETURNING id, interview_id, text, type, skill_assessed, order_index, created_at
            """
            params = {
                'id': question_id,
                'interview_id': interview_id,
                'text': question['text'],
                'type': question.get('type', 'standard'),
                'skill_assessed': question.get('skill_assessed'),
                'order_index': idx
            }
            created_question = self.execute_one(query, params)
            created_questions.append(created_question)
        return created_questions
    
    def get_interview_questions(self, interview_id):
        """Get all questions for an interview."""
        query = """
            SELECT * FROM questions 
            WHERE interview_id = %(interview_id)s 
            ORDER BY order_index
        """
        return self.execute(query, {'interview_id': interview_id})
    
    # Response operations
    def create_response(self, question_id, response_text, audio_path=None, analysis=None):
        """Create a response to a question."""
        response_id = uuid.uuid4()
        query = """
            INSERT INTO responses (id, question_id, response_text, audio_path, analysis) 
            VALUES (%(id)s, %(question_id)s, %(response_text)s, %(audio_path)s, %(analysis)s)
            RETURNING id, question_id, response_text, audio_path, analysis, created_at
        """
        params = {
            'id': response_id,
            'question_id': question_id,
            'response_text': response_text,
            'audio_path': audio_path,
            'analysis': json.dumps(analysis) if analysis else None
        }
        return self.execute_one(query, params)
    
    def get_response(self, response_id):
        """Get a response by ID."""
        query = "SELECT * FROM responses WHERE id = %(id)s"
        return self.execute_one(query, {'id': response_id})
    
    def update_response_analysis(self, response_id, analysis):
        """Update the analysis of a response."""
        query = """
            UPDATE responses 
            SET analysis = %(analysis)s
            WHERE id = %(id)s
            RETURNING id, question_id, response_text, audio_path, analysis, created_at
        """
        params = {'id': response_id, 'analysis': json.dumps(analysis)}
        return self.execute_one(query, params)

# Database factory
def get_database():
    """Get the appropriate database implementation based on environment."""
    use_mock = os.getenv('USE_MOCK_DATA', 'true').lower() == 'true'
    use_postgres = os.getenv('USE_POSTGRES', 'false').lower() == 'true'
    
    if not use_mock and use_postgres:
        logger.info("Using PostgreSQL database")
        return PostgresDatabase()
    else:
        logger.warning("Using mock database - USE_MOCK_DATA is set to true or USE_POSTGRES is set to false")
        from .mock_database import MockDatabase
        return MockDatabase() 