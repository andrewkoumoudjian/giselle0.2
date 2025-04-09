#!/bin/bash

# Create a candidate
echo "Creating a test candidate..."
CANDIDATE_RESPONSE=$(curl -s -X POST http://localhost:8000/candidates \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Candidate","email":"test@example.com"}')

echo $CANDIDATE_RESPONSE | python3 -m json.tool

# Extract candidate ID
CANDIDATE_ID=$(echo $CANDIDATE_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
echo "Candidate ID: $CANDIDATE_ID"

# Create a job
echo -e "\nCreating a test job..."
JOB_RESPONSE=$(curl -s -X POST http://localhost:8000/jobs \
  -H "Content-Type: application/json" \
  -d '{"company_id":"default","title":"Test Job","description":"This is a test job description for frontend development. We are looking for someone with React and Next.js experience."}')

echo $JOB_RESPONSE | python3 -m json.tool

# Extract job ID
JOB_ID=$(echo $JOB_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
echo "Job ID: $JOB_ID"

# Create an interview
echo -e "\nCreating a test interview..."
INTERVIEW_RESPONSE=$(curl -s -X POST http://localhost:8000/interviews \
  -H "Content-Type: application/json" \
  -d "{\"candidate_id\":\"$CANDIDATE_ID\",\"job_id\":\"$JOB_ID\"}")

echo $INTERVIEW_RESPONSE | python3 -m json.tool

# Extract interview ID
INTERVIEW_ID=$(echo $INTERVIEW_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['interview']['id'])")
echo "Interview ID: $INTERVIEW_ID"

# Get interview questions
echo -e "\nGetting interview questions..."
curl -s http://localhost:8000/interviews/$INTERVIEW_ID/questions | python3 -m json.tool

echo -e "\nInterview creation test completed!" 