import os
import json
import uuid
from dotenv import load_dotenv
from src.utils.database import SupabaseClient

# Load environment variables
load_dotenv()

# Tests for Supabase client
def test_supabase_client():
    print("Testing Supabase client...")
    
    # Create client
    client = SupabaseClient()
    print("✓ Successfully initialized Supabase client")
    
    # Test company operations
    print("\nTesting company operations:")
    company_name = f"Test Company {uuid.uuid4()}"
    company = client.create_company(company_name)
    print(f"✓ Created company: {company['name']} (ID: {company['id']})")
    
    retrieved_company = client.get_company(company['id'])
    print(f"✓ Retrieved company: {retrieved_company['name']}")
    
    # Test job description operations
    print("\nTesting job description operations:")
    job_title = "Software Engineer"
    job_description = "Develop web applications using Next.js and Python."
    required_skills = ["JavaScript", "React", "Python", "FastAPI"]
    soft_skills = {"communication": 8, "teamwork": 9, "problem_solving": 10}
    
    job = client.create_job_description(
        company_id=company['id'],
        title=job_title,
        description=job_description,
        department="Engineering",
        required_skills=required_skills,
        soft_skills_priorities=soft_skills
    )
    print(f"✓ Created job: {job['title']} (ID: {job['id']})")
    
    retrieved_job = client.get_job_description(job['id'])
    print(f"✓ Retrieved job: {retrieved_job['title']}")
    
    # Test candidate operations
    print("\nTesting candidate operations:")
    candidate_name = f"Test Candidate {uuid.uuid4()}"
    candidate_email = f"test_{uuid.uuid4()}@example.com"
    
    candidate = client.create_candidate(candidate_name, candidate_email)
    print(f"✓ Created candidate: {candidate['name']} (ID: {candidate['id']})")
    
    retrieved_candidate = client.get_candidate(candidate['id'])
    print(f"✓ Retrieved candidate: {retrieved_candidate['name']}")
    
    # Test interview operations
    print("\nTesting interview operations:")
    interview = client.create_interview(job['id'], candidate['id'])
    print(f"✓ Created interview (ID: {interview['id']})")
    
    retrieved_interview = client.get_interview(interview['id'])
    print(f"✓ Retrieved interview (ID: {retrieved_interview['id']})")
    
    # Test question operations
    print("\nTesting question operations:")
    questions = [
        {
            "text": "Describe your experience with React.",
            "type": "technical",
            "skill_assessed": "React"
        },
        {
            "text": "How do you handle conflicts in a team?",
            "type": "behavioral",
            "skill_assessed": "Teamwork"
        }
    ]
    
    created_questions = client.create_questions(interview['id'], questions)
    print(f"✓ Created {len(created_questions)} questions")
    
    retrieved_questions = client.get_interview_questions(interview['id'])
    print(f"✓ Retrieved {len(retrieved_questions)} questions")
    
    # Test response operations
    print("\nTesting response operations:")
    question_id = retrieved_questions[0]['id']
    transcription = "I have 3 years of experience working with React in professional settings."
    
    response = client.create_response(
        question_id=question_id,
        transcription=transcription,
        analysis_results={"confidence": 8, "relevance": 9, "technical_accuracy": 7}
    )
    print(f"✓ Created response (ID: {response['id']})")
    
    # Test assessment operations
    print("\nTesting assessment operations:")
    assessment_data = {
        "empathy_score": 15,
        "collaboration_score": 18,
        "confidence_score": 16,
        "english_proficiency": 19,
        "professionalism": 17,
        "field_importance": {
            "web_development": 90,
            "backend_development": 70,
            "database_management": 50
        },
        "candidate_skills": {
            "web_development": 85,
            "backend_development": 75,
            "database_management": 60
        },
        "correlation_matrix": {
            "score": 85,
            "matches": [
                {"field": "web_development", "match": 0.9},
                {"field": "backend_development", "match": 0.8},
                {"field": "database_management", "match": 0.7}
            ]
        }
    }
    
    assessment = client.create_assessment(interview['id'], assessment_data)
    print(f"✓ Created assessment (ID: {assessment['id']})")
    
    retrieved_assessment = client.get_assessment(interview['id'])
    print(f"✓ Retrieved assessment (ID: {retrieved_assessment['id']})")
    
    print("\nAll tests completed successfully!")

if __name__ == "__main__":
    test_supabase_client() 