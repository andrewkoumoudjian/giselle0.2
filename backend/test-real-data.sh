#!/bin/bash

# Set up colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "Testing API with real data..."

# Check health
echo -e "\n${GREEN}Testing health endpoint...${NC}"
HEALTH_RESPONSE=$(curl -s http://localhost:8000/health)
echo $HEALTH_RESPONSE

# Create a company
echo -e "\n${GREEN}Creating test company...${NC}"
COMPANY_RESPONSE=$(curl -s -X POST http://localhost:8000/companies \
  -H "Content-Type: application/json" \
  -d '{"name":"Real Test Company"}')
echo $COMPANY_RESPONSE
COMPANY_ID=$(echo $COMPANY_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))")
echo "Company ID: $COMPANY_ID"

if [ -z "$COMPANY_ID" ]; then
  echo -e "${RED}Failed to create company!${NC}"
  exit 1
fi

# Create a job
echo -e "\n${GREEN}Creating test job...${NC}"
JOB_RESPONSE=$(curl -s -X POST http://localhost:8000/jobs \
  -H "Content-Type: application/json" \
  -d "{\"company_id\":\"$COMPANY_ID\",\"title\":\"Software Engineer\",\"description\":\"We are looking for a skilled software engineer with experience in backend development.\",\"department\":\"Engineering\",\"required_skills\":[\"Python\",\"FastAPI\",\"PostgreSQL\"]}")
echo $JOB_RESPONSE
JOB_ID=$(echo $JOB_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))")
echo "Job ID: $JOB_ID"

if [ -z "$JOB_ID" ]; then
  echo -e "${RED}Failed to create job!${NC}"
  exit 1
fi

# Create a candidate
echo -e "\n${GREEN}Creating test candidate...${NC}"
CANDIDATE_RESPONSE=$(curl -s -X POST http://localhost:8000/candidates \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Smith","email":"jane.smith@example.com"}')
echo $CANDIDATE_RESPONSE
CANDIDATE_ID=$(echo $CANDIDATE_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))")
echo "Candidate ID: $CANDIDATE_ID"

if [ -z "$CANDIDATE_ID" ]; then
  echo -e "${RED}Failed to create candidate!${NC}"
  exit 1
fi

# Create an interview
echo -e "\n${GREEN}Creating test interview...${NC}"
INTERVIEW_RESPONSE=$(curl -s -X POST http://localhost:8000/interviews \
  -H "Content-Type: application/json" \
  -d "{\"job_id\":\"$JOB_ID\",\"candidate_id\":\"$CANDIDATE_ID\"}")
echo $INTERVIEW_RESPONSE
INTERVIEW_ID=$(echo $INTERVIEW_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))")
echo "Interview ID: $INTERVIEW_ID"

if [ -z "$INTERVIEW_ID" ]; then
  echo -e "${RED}Failed to create interview!${NC}"
  exit 1
fi

# Get interview questions
echo -e "\n${GREEN}Getting interview questions...${NC}"
QUESTIONS_RESPONSE=$(curl -s "http://localhost:8000/interviews/$INTERVIEW_ID/questions")
echo $QUESTIONS_RESPONSE
QUESTION_ID=$(echo $QUESTIONS_RESPONSE | python3 -c "import sys, json; data = json.load(sys.stdin); print(data[0]['id'] if data and len(data) > 0 else '')")
echo "First Question ID: $QUESTION_ID"

if [ -z "$QUESTION_ID" ]; then
  echo -e "${RED}Failed to get interview questions!${NC}"
  exit 1
fi

# Submit a response
echo -e "\n${GREEN}Submitting a text response...${NC}"
RESPONSE=$(curl -s -X POST "http://localhost:8000/responses/$QUESTION_ID" \
  -F "response_text=I have five years of experience with Python and have worked on several FastAPI projects. I've also used PostgreSQL extensively in my previous role.")
echo $RESPONSE
RESPONSE_ID=$(echo $RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))")
echo "Response ID: $RESPONSE_ID"

if [ -z "$RESPONSE_ID" ]; then
  echo -e "${RED}Failed to submit response!${NC}"
  exit 1
fi

echo -e "\n${GREEN}All tests completed successfully!${NC}" 