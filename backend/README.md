# Giselle: AI-Powered Unbiased Interview System - Backend

This is the backend implementation for the Giselle system, an AI-powered platform designed to conduct unbiased interviews and assessments for job candidates.

## Features

- Generates unbiased interview questions based on job descriptions
- Processes audio responses with speech-to-text analysis
- Analyzes responses for soft skills like empathy, collaboration, and confidence
- Creates job-candidate correlation matrices for objective skill matching
- Provides comprehensive assessment reports for HR departments

## Tech Stack

- **FastAPI**: Modern, high-performance web framework
- **LangChain & LangGraph**: Orchestration of LLM operations
- **OpenRouter**: Access to best-in-class language models
- **ElevenLabs**: Speech-to-text processing with pattern analysis
- **Supabase**: Database and storage solution
- **Pydantic**: Data validation and settings management
- **Pandas & NumPy**: Data processing for correlation analysis

## Setup Instructions

### Prerequisites

- Python 3.9+
- Supabase account with:
  - Project URL
  - Service role API key
  - Storage buckets for `resumes` and `interview_audio`
- OpenRouter API key
- ElevenLabs API key

### Environment Configuration

1. Copy the `.env.example` file to `.env`
2. Fill in your API keys and configuration:

```bash
# API Keys
OPENROUTER_API_KEY=your-openrouter-api-key
ELEVENLABS_API_KEY=your-elevenlabs-api-key

# Supabase Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-service-key

# Server Configuration
PORT=8000
HOST=0.0.0.0
ENV=development

# JWT Configuration 
JWT_SECRET=your-jwt-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# LLM Configuration
DEFAULT_MODEL=anthropic/claude-3-sonnet
TECHNICAL_ANALYSIS_MODEL=anthropic/claude-3-opus
RESUME_ANALYSIS_MODEL=google/gemini-1.5-pro
```

### Database Setup

1. Connect to your Supabase project
2. Run the SQL setup script from `database/setup.sql`
3. Create the required storage buckets in Supabase:
   - `resumes` - For storing candidate resumes
   - `interview_audio` - For storing interview audio files

### Installation

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the server:
   ```bash
   python src/main.py
   ```

4. The API will be available at `http://localhost:8000`
5. Access the API documentation at `http://localhost:8000/docs`

## API Endpoints

### Health Check
- `GET /health` - Check if the API is running

### Companies
- `POST /companies` - Create a new company
- `GET /companies/{company_id}` - Get company by ID

### Jobs
- `POST /jobs` - Create a new job description
- `GET /jobs/{job_id}` - Get job description by ID

### Candidates
- `POST /candidates` - Create a new candidate
- `GET /candidates/{candidate_id}` - Get candidate by ID
- `POST /candidates/{candidate_id}/resume` - Upload and parse resume

### Interviews
- `POST /interviews` - Create a new interview with questions
- `GET /interviews/{interview_id}` - Get interview by ID
- `GET /interviews/{interview_id}/questions` - Get all questions for an interview
- `POST /interviews/{interview_id}/complete` - Complete an interview and generate assessment
- `GET /interviews/{interview_id}/assessment` - Get the assessment for an interview

### Responses
- `POST /responses/{question_id}` - Submit an audio response to a question

## Development

### Project Structure

```
backend/
├── database/            # Database setup scripts
├── src/
│   ├── agents/          # LangChain/LangGraph agents
│   │   ├── question_generator.py
│   │   ├── response_analyzer.py
│   │   └── resume_analyzer.py
│   ├── api/             # FastAPI endpoints
│   │   └── app.py
│   ├── models/          # Pydantic models
│   ├── services/        # Business logic services
│   │   ├── interview_manager.py
│   │   └── speech_processor.py
│   ├── utils/           # Utility functions
│   │   ├── database.py
│   │   └── llm.py
│   └── main.py          # Application entry point
├── .env.example         # Example environment variables
├── requirements.txt     # Python dependencies
└── README.md            # This file
```

### Testing

Run tests with pytest:

```bash
pytest
```

## Contributing

1. Follow the project structure when adding new features
2. Maintain type hints throughout the codebase
3. Write tests for new functionality
4. Document API endpoints and important functions
