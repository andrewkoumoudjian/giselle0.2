# Giselle AI Interview System

An AI-powered unbiased interview system designed to reduce cultural and racial bias in the hiring process.

## System Overview

Giselle combines advanced AI technologies to provide:

- Automated interview question generation based on job descriptions and candidate resumes
- Voice-based interview sessions with real-time recording
- Comprehensive analysis of interview responses
- Detailed results visualization with skills assessment

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
giselle/
├── frontend/        # Next.js frontend
│   ├── app/         # Pages and components
│   ├── lib/         # Utilities and API client
│   └── public/      # Static assets
├── backend/         # FastAPI backend
│   ├── src/         # Source code
│   │   ├── api/     # API endpoints
│   │   ├── services/# Business logic
│   │   └── utils/   # Utilities
│   └── tests/       # Test files
└── README.md        # This file
```

## Environment Variables

### Frontend (.env.local)

- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:8000)
- `NEXT_PUBLIC_AUTH_ENABLED`: Enable authentication features (true/false)
- `NEXT_PUBLIC_APP_NAME`: Application name
- `NEXT_PUBLIC_APP_DESCRIPTION`: Application description

### Backend (.env)

- `OPENAI_API_KEY`: OpenAI API key for LLM features
- `SUPABASE_URL`: Supabase instance URL
- `SUPABASE_KEY`: Supabase service key
- `ELEVENLABS_API_KEY`: ElevenLabs API key for voice synthesis

## Features

- **Interview Setup**: Create interviews with custom job descriptions and resume upload
- **Voice Interview**: Real-time voice recording and natural interview flow
- **Analysis**: AI-powered assessment of technical skills and soft skills
- **Results Visualization**: Detailed charts and feedback on performance

## Troubleshooting

If you encounter any issues:

1. Make sure all dependencies are installed: `./setup.sh`
2. Check that environment variables are correctly set
3. For Python module import errors, ensure you're running with the virtual environment activated
4. Verify that the backend is running before attempting to use API features in the frontend 