#!/usr/bin/env python3
"""Test script for API endpoints with real data."""

import json
import uuid
import requests
import argparse
from datetime import datetime

API_BASE_URL = "http://localhost:8000"

def test_health():
    """Test the health endpoint."""
    print("\n🔍 Testing health endpoint...")
    response = requests.get(f"{API_BASE_URL}/health")
    if response.status_code == 200:
        print(f"✅ Health check successful: {json.dumps(response.json(), indent=2)}")
        return True
    else:
        print(f"❌ Health check failed: {response.status_code}")
        return False

def test_create_company():
    """Test company creation endpoint."""
    print("\n🔍 Testing company creation...")
    company_name = f"Test Company {uuid.uuid4().hex[:8]}"
    payload = {"name": company_name}
    
    response = requests.post(f"{API_BASE_URL}/companies", json=payload)
    if response.status_code == 201:
        company_data = response.json()
        print(f"✅ Company created: {json.dumps(company_data, indent=2)}")
        return company_data
    else:
        print(f"❌ Company creation failed: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def test_create_job(company_id):
    """Test job creation endpoint."""
    print("\n🔍 Testing job creation...")
    payload = {
        "company_id": company_id,
        "title": "Software Engineer",
        "description": "We are looking for a skilled software engineer.",
        "department": "Engineering",
        "required_skills": ["Python", "FastAPI", "PostgreSQL"]
    }
    
    response = requests.post(f"{API_BASE_URL}/jobs", json=payload)
    if response.status_code == 201:
        job_data = response.json()
        print(f"✅ Job created: {json.dumps(job_data, indent=2)}")
        return job_data
    else:
        print(f"❌ Job creation failed: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def test_create_candidate():
    """Test candidate creation endpoint."""
    print("\n🔍 Testing candidate creation...")
    payload = {
        "name": "Jane Smith",
        "email": f"jane.smith.{uuid.uuid4().hex[:8]}@example.com"
    }
    
    response = requests.post(f"{API_BASE_URL}/candidates", json=payload)
    if response.status_code == 201:
        candidate_data = response.json()
        print(f"✅ Candidate created: {json.dumps(candidate_data, indent=2)}")
        return candidate_data
    else:
        print(f"❌ Candidate creation failed: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def test_create_interview(job_id, candidate_id):
    """Test interview creation endpoint."""
    print("\n🔍 Testing interview creation...")
    payload = {
        "job_id": job_id,
        "candidate_id": candidate_id
    }
    
    response = requests.post(f"{API_BASE_URL}/interviews", json=payload)
    if response.status_code == 201:
        interview_data = response.json()
        print(f"✅ Interview created: {json.dumps(interview_data, indent=2)}")
        return interview_data
    else:
        print(f"❌ Interview creation failed: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def test_get_interview_questions(interview_id):
    """Test getting interview questions endpoint."""
    print("\n🔍 Testing get interview questions...")
    response = requests.get(f"{API_BASE_URL}/interviews/{interview_id}/questions")
    if response.status_code == 200:
        questions = response.json()
        print(f"✅ Retrieved {len(questions)} questions")
        return questions
    else:
        print(f"❌ Failed to get interview questions: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def test_submit_response(question_id):
    """Test submitting a response."""
    print("\n🔍 Testing response submission...")
    response_text = "This is a test response for the question. I have experience with the required skills."
    
    # Create multipart form data
    files = {
        'response_text': (None, response_text),
    }
    
    response = requests.post(f"{API_BASE_URL}/responses/{question_id}", files=files)
    if response.status_code == 200:
        response_data = response.json()
        print(f"✅ Response submitted: {json.dumps(response_data, indent=2)}")
        return response_data
    else:
        print(f"❌ Response submission failed: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def main():
    """Run API tests."""
    print("Starting API tests with real data...")
    
    # Test health endpoint
    if not test_health():
        print("❌ API is not available. Exiting tests.")
        return
    
    # Test company creation
    company_data = test_create_company()
    if not company_data:
        print("❌ Cannot continue tests without a company.")
        return
    
    # Test job creation
    job_data = test_create_job(company_data["id"])
    if not job_data:
        print("❌ Cannot continue tests without a job.")
        return
    
    # Test candidate creation
    candidate_data = test_create_candidate()
    if not candidate_data:
        print("❌ Cannot continue tests without a candidate.")
        return
    
    # Test interview creation
    interview_data = test_create_interview(job_data["id"], candidate_data["id"])
    if not interview_data:
        print("❌ Cannot continue tests without an interview.")
        return
    
    # Test getting interview questions
    questions = test_get_interview_questions(interview_data["id"])
    if not questions or len(questions) == 0:
        print("❌ Cannot continue tests without questions.")
        return
    
    # Test submitting a response to the first question
    response_data = test_submit_response(questions[0]["id"])
    if not response_data:
        print("❌ Response submission test failed.")
        return
    
    print("\n✅ All API tests completed successfully!")

if __name__ == "__main__":
    main() 