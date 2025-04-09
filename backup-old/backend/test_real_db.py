#!/usr/bin/env python3
"""Test script for PostgreSQL database operations."""

import os
import json
import uuid
from datetime import datetime

# Set environment variables to use real database
os.environ["USE_MOCK_DATA"] = "false"
os.environ["USE_POSTGRES"] = "true"

# Import database implementation
from src.utils.database import PostgresDatabase

def main():
    """Run database tests."""
    print("Testing real PostgreSQL database operations...")
    
    try:
        # Initialize database connection
        db = PostgresDatabase()
        print("✅ Database connection successful")
        
        # Test company operations
        print("\nTesting company operations:")
        company = db.create_company(f"Test Company {uuid.uuid4().hex[:8]}")
        print(f"✅ Created company: {json.dumps(company, default=str)}")
        
        company_id = company['id']
        retrieved_company = db.get_company(company_id)
        print(f"✅ Retrieved company: {json.dumps(retrieved_company, default=str)}")
        
        # Test job operations
        print("\nTesting job operations:")
        job = db.create_job(
            company_id=company_id,
            title="Software Engineer",
            description="Test job description",
            department="Engineering",
            required_skills=["Python", "SQL", "FastAPI"]
        )
        print(f"✅ Created job: {json.dumps(job, default=str)}")
        
        job_id = job['id']
        retrieved_job = db.get_job(job_id)
        print(f"✅ Retrieved job: {json.dumps(retrieved_job, default=str)}")
        
        # Test candidate operations
        print("\nTesting candidate operations:")
        candidate = db.create_candidate(
            name="Test Candidate",
            email=f"test{uuid.uuid4().hex[:8]}@example.com"
        )
        print(f"✅ Created candidate: {json.dumps(candidate, default=str)}")
        
        candidate_id = candidate['id']
        retrieved_candidate = db.get_candidate(candidate_id)
        print(f"✅ Retrieved candidate: {json.dumps(retrieved_candidate, default=str)}")
        
        # Test interview operations
        print("\nTesting interview operations:")
        interview = db.create_interview(job_id, candidate_id)
        print(f"✅ Created interview: {json.dumps(interview, default=str)}")
        
        interview_id = interview['id']
        retrieved_interview = db.get_interview(interview_id)
        print(f"✅ Retrieved interview: {json.dumps(retrieved_interview, default=str)}")
        
        updated_interview = db.update_interview_status(interview_id, "in_progress")
        print(f"✅ Updated interview status: {json.dumps(updated_interview, default=str)}")
        
        # Test question operations
        print("\nTesting question operations:")
        questions = [
            {
                "text": "Tell me about your experience with Python",
                "type": "technical",
                "skill_assessed": "python_programming"
            },
            {
                "text": "Describe a challenging situation you've faced",
                "type": "behavioral",
                "skill_assessed": "problem_solving"
            }
        ]
        
        created_questions = db.create_questions(interview_id, questions)
        print(f"✅ Created {len(created_questions)} questions")
        
        retrieved_questions = db.get_interview_questions(interview_id)
        print(f"✅ Retrieved {len(retrieved_questions)} questions")
        
        # Test response operations
        if retrieved_questions:
            question_id = retrieved_questions[0]['id']
            print("\nTesting response operations:")
            response = db.create_response(
                question_id=question_id,
                response_text="This is a test response"
            )
            print(f"✅ Created response: {json.dumps(response, default=str)}")
            
            response_id = response['id']
            analysis = {
                "relevance_score": 0.85,
                "technical_accuracy": 0.9,
                "key_points": ["Point 1", "Point 2"]
            }
            
            updated_response = db.update_response_analysis(response_id, analysis)
            print(f"✅ Updated response with analysis: {json.dumps(updated_response, default=str)}")
        
        print("\n✅ All database tests completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during database testing: {str(e)}")
        raise

if __name__ == "__main__":
    main() 