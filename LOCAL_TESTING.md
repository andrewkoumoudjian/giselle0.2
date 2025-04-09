# Local Testing Guide

This guide will help you test the HR Candidate Filtering System locally before deploying to Vercel.

## Prerequisites

- Node.js 18 or higher
- npm or yarn

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file with the following variables:
   ```
   # Supabase Configuration
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_supabase_service_key

   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key

   # Server Configuration
   PORT=3001
   ```

3. Set up your Supabase database:
   - Create a new Supabase project
   - Run the SQL script in `supabase/migrations/20240601000000_hr_filtering_system.sql`
   - Create storage buckets named "resumes" and "interview_audio"

## Running the Server

Start the local development server:

```
node server.js
```

The server will be available at http://localhost:3001.

## Testing the API

You can test the API using the provided test script:

```
./run-local-test.sh
```

This script will:
1. Start the server
2. Test the health endpoint
3. Stop the server

## API Endpoints

### Health Check
- `GET /api/health`: Check if the API is running

### Companies
- `GET /api/companies`: Get all companies
- `POST /api/companies`: Create a new company

### Jobs
- `GET /api/jobs`: Get all jobs
- `POST /api/jobs`: Create a new job

### Candidates
- `GET /api/candidates`: Get all candidates
- `POST /api/candidates`: Create a new candidate

### Job Applications
- `POST /api/applications`: Submit a job application with resume
- `GET /api/jobs/:jobId/applications`: Get applications for a job
- `PATCH /api/applications/:id`: Update application status

### Interviews (Optional Feature)
- `POST /api/applications/:id/interview`: Create an interview for an application

## Manual Testing

You can use tools like Postman or curl to test the API endpoints manually.

Example curl commands:

```bash
# Health check
curl http://localhost:3001/api/health

# Create a company
curl -X POST http://localhost:3001/api/companies \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Company"}'

# Create a job
curl -X POST http://localhost:3001/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "company_id": "your_company_id",
    "title": "Software Engineer",
    "description": "We are looking for a software engineer...",
    "required_skills": ["JavaScript", "Node.js", "React"]
  }'
```

## Troubleshooting

If you encounter any issues:

1. Check that all dependencies are installed
2. Verify that your `.env` file has the correct values
3. Make sure your Supabase project is set up correctly
4. Check the console for any error messages
