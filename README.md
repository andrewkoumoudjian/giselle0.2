# HR Talent Platform

A modern HR service backend using Supabase that analyzes job applications with LangGraph agents. This platform is designed to be deployable on Vercel serverless and Supabase with minimal computing resources.

## System Overview

This system combines advanced AI technologies to provide:

- Automated candidate filtering based on job descriptions and resumes
- AI-powered resume analysis and skills matching using LangGraph agents
- Customizable filtering parameters for HR professionals
- Interview scheduling and management
- Candidate comparison and evaluation
- Comprehensive analytics dashboard
- Serverless architecture using Supabase and Vercel

## Getting Started

### Prerequisites

- Node.js (v16+)
- Python 3.9+
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/giselle.git
   cd giselle
   ```

2. Run the setup script to install dependencies:
   ```
   ./setup.sh
   ```

   This will:
   - Install Node.js dependencies for the frontend
   - Create a Python virtual environment for the backend
   - Install Python dependencies
   - Set up environment variables

### Running the Application

Start both frontend and backend services:

```
npm run dev
```

Or start them individually:

```
# Frontend only
npm run frontend:dev

# Backend only
npm run backend:dev
```

The frontend will be available at http://localhost:3000, and the API at http://localhost:8000.

## Project Structure

```
hr-candidate-filtering-system/
├── api/             # Vercel serverless API functions
│   └── index.js     # Main API entry point
├── frontend/        # Next.js frontend
│   ├── app/         # Pages and components
│   ├── lib/         # Utilities and API client
│   └── public/      # Static assets
├── backend/         # Original FastAPI backend (for reference)
│   ├── src/         # Source code
│   │   ├── api/     # API endpoints
│   │   ├── services/# Business logic
│   │   └── utils/   # Utilities
│   └── tests/       # Test files
├── supabase/        # Supabase configuration
│   └── migrations/  # Database migration scripts
├── server.js        # Local development server
└── README.md        # This file
```

## Environment Variables

### Frontend and API (.env.local)

- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:3001)
- `NEXT_PUBLIC_RESUME_PARSER_API_URL`: Resume parser API URL
- `NEXT_PUBLIC_RESUME_PARSER_API_KEY`: Resume parser API key
- `NEXT_PUBLIC_ENVIRONMENT`: Current environment (development, production, test)
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase instance URL
- `NEXT_PUBLIC_SUPABASE_KEY`: Supabase anon/public key
- `OPENROUTER_API_KEY`: OpenRouter API key for LangGraph
- `OPENROUTER_MODEL`: OpenRouter model to use (default: deepseek/deepseek-chat-v3-0324:free)

### Backend (.env)

- `SUPABASE_URL`: Supabase instance URL
- `SUPABASE_SERVICE_KEY`: Supabase service key for database access
- `PORT`: Port for local development server (default: 3001)

## Features

- **Job Listings**: Create, manage, and search for job listings
- **Job Applications**: Submit and track job applications
- **AI-Powered Candidate Filtering**: Automatically analyze and score candidates based on job requirements
- **User-Defined Filtering Parameters**: Customize filtering criteria
- **Interview Scheduling**: Schedule and manage interviews with candidates
- **Candidate Comparison**: Compare multiple candidates side by side
- **Serverless Architecture**: Designed to run on Vercel and Supabase for minimal computing resources
- **Resume Analysis**: AI-powered extraction of skills, experience, and education from resumes using LangGraph
- **Candidate Scoring**: Objective evaluation of candidates against job requirements
- **Employer Dashboard**: Comprehensive visualization of hiring metrics and job management
- **Authentication**: User authentication with Supabase Auth
- **Storage**: Resume and company logo storage with Supabase Storage

## Troubleshooting

If you encounter any issues:

1. Make sure all dependencies are installed: `./setup.sh`
2. Check that environment variables are correctly set
3. For Python module import errors, ensure you're running with the virtual environment activated
4. Verify that the backend is running before attempting to use API features in the frontend