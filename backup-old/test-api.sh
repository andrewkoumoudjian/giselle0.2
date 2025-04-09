#!/bin/bash

echo "Testing backend API health..."
curl -s http://localhost:8000/health | python3 -m json.tool

# Test creating a company
echo -e "\nTesting company creation..."
curl -s -X POST http://localhost:8000/companies \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Company"}' | python3 -m json.tool

# Test creating a job
echo -e "\nTesting job creation..."
curl -s -X POST http://localhost:8000/jobs \
  -H "Content-Type: application/json" \
  -d '{"company_id":"default","title":"Test Job","description":"This is a test job description"}' | python3 -m json.tool

echo -e "\nAPI tests completed!" 