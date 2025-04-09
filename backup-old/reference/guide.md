# Comprehensive Guide: AI-Powered Unbiased Interview System

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Database Design](#database-design)
4. [Backend Implementation](#backend-implementation)
   - [Interview Question Generation](#interview-question-generation)
   - [Speech-to-Text Processing](#speech-to-text-processing)
   - [Text Analysis Pipeline](#text-analysis-pipeline)
   - [Resume Analysis](#resume-analysis)
   - [Correlation Matrix Generation](#correlation-matrix-generation)
5. [Frontend Implementation](#frontend-implementation)
   - [Candidate Interface](#candidate-interface)
   - [HR Interface](#hr-interface)
6. [Integration Framework](#integration-framework)
7. [Literature and References](#literature-and-references)
8. [Deployment Guide](#deployment-guide)


Context:
I am currently in a case competition and i need to win it. We are tackling the problem of solving culture and race biast during a hiring process. You are a professionnal software engineer that is expert in ai implementation. I want to create a tool that conducts automatic interviews (5 questions max) for a user with question derived and created with a llm with guidelines the tool will set using the job description imputed by the HR dept. The frontend for the candidate will include a place to upload their resume and a window to conduct the intrview. The frontend for the HR dept includes a job description text field, a Final report with scores out of 20 for empathy, collaboration and confidence and a correlation matrix for the job fitness. For the unique backend, the tool will use eleven labs speech to text recognition and take into account text artifacts, patterns of speech and level of professionalism and proficency in english. The backend will use a langchain based agent with the most efficent llm for the task to create the ratings from the text analysis. Another langchain based agent will then populate a list of professsioanl fields with their an importance score out of 100. The same agent will then analyse the resume and the professionalism levels and produce the same ratings; a correlation matrix will be created by comparing those two lists to find out if the candidate is fit for the job.  want to use supabase as a database, openrouter as a llm provider, langchain, langgraph, nextjs, sdhadc as frameworks and code in python. I

## Project Overview

This system aims to reduce cultural and racial bias during hiring by creating an automated interview process with:

- AI-generated interview questions based on job descriptions
- Speech-to-text analysis that evaluates communication patterns without bias
- Resume-to-job correlation scoring based on skills rather than background
- Standardized scoring for soft skills (empathy, collaboration, confidence)
- Job fitness correlation matrix to evaluate candidate-role match

The system uses Next.js for the frontend, Python with LangChain and LangGraph for the backend, Supabase for database management, and OpenRouter to access various LLMs optimized for different tasks.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js Frontend                         │
├────────────────┬────────────────────────┬──────────────────────┐
│ Candidate UI   │                        │  HR Department UI    │
│ - Resume Upload│                        │ - Job Description    │
│ - Interview    │                        │ - Scoring Dashboard  │
│   Interface    │                        │ - Correlation Matrix │
└────────────────┴────────────────────────┴──────────────────────┘
           ▲                                      ▲
           │                                      │
           ▼                                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                           API Layer                             │
└─────────────────────────────────────────────────────────────────┘
           ▲                                      ▲
           │                                      │
           ▼                                      ▼
┌─────────────────┐                    ┌─────────────────────────┐
│   LangChain/    │                    │                         │
│   LangGraph     │◄───────────────────┤    Eleven Labs API      │
│   Agents        │                    │    (Speech-to-Text)     │
└─────────────────┘                    └─────────────────────────┘
           ▲                                      ▲
           │                                      │
           ▼                                      ▼
┌─────────────────┐                    ┌─────────────────────────┐
│   OpenRouter    │                    │                         │
│   (LLM Access)  │                    │      Supabase DB        │
└─────────────────┘                    └─────────────────────────┘
```




## 1. System Architecture Overview

This system creates an automated interview process that reduces culture and race bias through structured analysis of candidate responses and qualifications. The architecture consists of:

- **Frontend**: Next.js application with separate interfaces for candidates and HR
- **Backend**: Python-based API services with LangChain and LangGraph agents
- **Database**: Supabase for storing job descriptions, candidate data, interviews, and results
- **AI Services**: OpenRouter for LLM access, Eleven Labs for speech processing

## 2. Core Workflow

1. HR uploads job description
2. System generates tailored interview questions
3. Candidate uploads resume and completes interview
4. System analyzes responses for soft skills and technical fit
5. System generates correlation matrix and final report

## 3. Frontend Implementation Guide

### Candidate Portal

Create a Next.js application with the following pages:

- **Landing Page**: Instructions and privacy notice
- **Resume Upload**: Drag-and-drop interface with parsing confirmation
- **Interview Interface**:
  - Video recording component with permissions handling
  - Question display with progress indicator
  - Countdown timer per question (optional)
  - Playback of completed responses
  - Submission confirmation

### HR Portal

Create a secure dashboard with:

- **Job Creation**: Form for job title, description, required skills, and soft skills priorities
- **Candidate Management**: List of applicants with status indicators
- **Results Viewer**:
  - Scores for empathy, collaboration, confidence (0-20 scale)
  - Interactive correlation matrix visualization
  - Downloadable report generation

## 4. Backend Services

### Authentication Service

Implement Supabase authentication with:
- Role-based access control (HR vs. candidate)
- Secure token handling and session management
- Privacy compliance features (data retention policies)

### Interview Generation Service

This service will:
1. Parse job descriptions using LangChain
2. Extract key skills, responsibilities, and requirements
3. Generate context-relevant interview questions (max 5)
4. Store questions in Supabase with job ID reference

### Response Processing Pipeline

Build a sequential processing pipeline:
1. Speech capture and storage in Supabase
2. Eleven Labs speech-to-text conversion
3. Text artifact analysis (filler words, pauses, repetition)
4. Speaking pattern analysis (speed, clarity, tone variations)
5. Professional language assessment
6. English proficiency evaluation
7. Storage of processed results

## 5. AI Agent Implementation

### Question Generation Agent

Design a LangChain agent that:
- Takes job description as input
- Uses guidelines for bias-free question formulation
- Focuses on behavioral and situational questions over knowledge-testing
- Generates a balanced mix of technical and soft skill assessments
- Ensures questions are clear, concise, and culturally neutral

### Response Analysis Agent

Implement a LangGraph workflow with:
1. **Text Analysis Node**: Processes transcribed responses for:
   - Clarity and coherence
   - Technical accuracy
   - Relevant experience mentions
   - Filler word frequency

2. **Skill Assessment Node**: Evaluates and scores:
   - Empathy (0-20): Understanding of others' perspectives
   - Collaboration (0-20): Team-oriented language and examples
   - Confidence (0-20): Language certainty and presentation style

3. **Professionalism Evaluation Node**: Assesses:
   - Language appropriateness
   - Technical vocabulary usage
   - Problem-solving approach
   - Communication effectiveness

### Correlation Analysis Agent

Create an agent that:
1. Extracts professional fields from job description with importance ratings (0-100)
2. Analyzes resume for skill evidence and interview responses for demonstrated competence
3. Generates matching scores between requirements and qualifications
4. Produces a correlation matrix visualization data

## 6. Database Schema Design

In Supabase, create the following tables:

1. **Users**
   - user_id (PK)
   - email
   - role (hr/candidate)
   - created_at

2. **Jobs**
   - job_id (PK)
   - title
   - description
   - required_skills (JSON)
   - soft_skills_priorities (JSON)
   - created_by (FK: Users)
   - created_at

3. **Candidates**
   - candidate_id (PK)
   - user_id (FK: Users)
   - resume_url
   - parsed_resume_data (JSON)
   - created_at

4. **Interviews**
   - interview_id (PK)
   - job_id (FK: Jobs)
   - candidate_id (FK: Candidates)
   - status
   - created_at
   - completed_at

5. **Questions**
   - question_id (PK)
   - interview_id (FK: Interviews)
   - text
   - order_index

6. **Responses**
   - response_id (PK)
   - question_id (FK: Questions)
   - audio_url
   - transcription
   - analysis_results (JSON)
   - created_at

7. **Reports**
   - report_id (PK)
   - interview_id (FK: Interviews)
   - empathy_score
   - collaboration_score
   - confidence_score
   - correlation_matrix (JSON)
   - created_at

## 7. Bias Mitigation Strategies

Implement these specific techniques:

1. **Question Formulation Guidelines**
   - Focus on behavior and experience, not background
   - Use inclusive language checker
   - Standardize question difficulty across all candidates

2. **Response Analysis**
   - Evaluate substance over style/accent
   - Use cultural context awareness in language evaluation
   - Apply consistent scoring rubrics

3. **Technical Implementation**
   - Regular bias testing with diverse sample responses
   - Human review option for edge cases
   - Continuous model fine-tuning with feedback

## 8. Integration Points

### Eleven Labs Integration
- Use streaming API for real-time speech-to-text
- Configure for multi-accent and dialect recognition
- Implement error handling for unclear audio

### OpenRouter Integration
- Create configurable model selection based on task needs
- Implement token usage monitoring and optimization
- Set up fallback models for reliability

### LangChain Agents
- Use ReAct prompting for better reasoning
- Implement tools for accessing external knowledge bases
- Create feedback loops for continuous improvement

### Next.js and Python Backend
- Use API routes for secure communication
- Implement WebSocket for real-time interview experience
- Create middleware for authentication and logging

## 9. Implementation Roadmap

1. **Phase 1: Core Infrastructure**
   - Setup Supabase database and authentication
   - Create basic Next.js frontend shells
   - Implement Python backend API structure
   - Test basic integration points

2. **Phase 2: AI Agent Development**
   - Develop and test question generation agent
   - Build response analysis pipeline
   - Implement correlation analysis agent
   - Create initial bias mitigation rules

3. **Phase 3: Frontend Experience**
   - Complete candidate interview interface
   - Build HR dashboard and reporting
   - Implement responsive design and accessibility

4. **Phase 4: Integration & Testing**
   - Connect all components
   - Conduct bias testing with diverse samples
   - Optimize performance and reliability

## 10. Recommended Literature for Agent Training

### For Bias Mitigation
1. "Algorithms of Oppression" by Safiya Noble
2. "Weapons of Math Destruction" by Cathy O'Neil
3. "Fairness in Machine Learning" research papers from FAccT conference

### For Interview Assessment
1. "The Structured Interview" by the U.S. Office of Personnel Management
2. "Behavioral Interviewing Guide" by Development Dimensions International
3. "Competency-Based Interviews" by Robin Kessler

### For Language Analysis
1. "Speech and Language Processing" by Daniel Jurafsky & James H. Martin
2. "Natural Language Processing with Python" by Bird, Klein, and Loper
3. Research papers on cross-cultural communication patterns

### For Agent Construction
1. "Building LLM Powered Applications" by Simon D. Willison
2. "Designing and Engineering Large Language Model Applications"
3. LangChain and LangGraph documentation and research papers






## Database Design

Create the following tables in Supabase:

### Tables

1. `companies`
   - `id`: UUID (primary key)
   - `name`: String
   - `created_at`: Timestamp

2. `job_descriptions`
   - `id`: UUID (primary key)
   - `company_id`: UUID (foreign key)
   - `title`: String
   - `description`: Text
   - `department`: String
   - `required_skills`: JSON Array
   - `created_at`: Timestamp

3. `candidates`
   - `id`: UUID (primary key)
   - `name`: String
   - `email`: String
   - `resume_url`: String
   - `resume_parsed`: JSON
   - `created_at`: Timestamp

4. `interviews`
   - `id`: UUID (primary key)
   - `job_id`: UUID (foreign key)
   - `candidate_id`: UUID (foreign key)
   - `status`: String (pending, completed)
   - `questions`: JSON Array
   - `answers`: JSON Array
   - `created_at`: Timestamp

5. `assessments`
   - `id`: UUID (primary key)
   - `interview_id`: UUID (foreign key)
   - `empathy_score`: Integer (0-20)
   - `collaboration_score`: Integer (0-20)
   - `confidence_score`: Integer (0-20)
   - `english_proficiency`: Integer (0-20)
   - `professionalism`: Integer (0-20)
   - `field_importance`: JSON Array
   - `candidate_skills`: JSON Array
   - `correlation_matrix`: JSON
   - `created_at`: Timestamp

```sql name=database_setup.sql
-- Example Supabase Schema (can be run in Supabase SQL Editor)
create table companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamp with time zone default now()
);

create table job_descriptions (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id),
  title text not null,
  description text not null,
  department text,
  required_skills jsonb,
  created_at timestamp with time zone default now()
);

-- Add remaining tables following the same pattern
```

## Backend Implementation

### Interview Question Generation

Create a LangChain agent that generates unbiased interview questions:

```python name=question_generator.py
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.chat_models import ChatOpenAI
import openrouter

def create_interview_questions_agent(openrouter_api_key):
    """Create an agent that generates unbiased interview questions."""
    
    # Connect to OpenRouter to access best model for question generation
    llm = ChatOpenAI(
        openai_api_base="https://openrouter.ai/api/v1",
        openai_api_key=openrouter_api_key,
        model="anthropic/claude-3-opus"  # High-quality reasoning LLM
    )
    
    # Create prompt template for generating questions
    prompt_template = """
    You are an unbiased hiring expert creating interview questions.
    
    Job Description:
    {job_description}
    
    Required Skills:
    {required_skills}
    
    Generate 5 technical and behavioral questions that:
    1. Focus solely on job-relevant skills and experience
    2. Avoid cultural references that may favor certain backgrounds
    3. Use clear, straightforward language
    4. Can be answered in 2-3 minutes each
    5. Evaluate the candidate's ability to perform the specific job functions
    
    Return the questions in JSON format with this structure:
    [
      {{"question": "question text", "type": "technical|behavioral", "skill_assessed": "skill name"}}
    ]
    """
    
    prompt = PromptTemplate(
        input_variables=["job_description", "required_skills"],
        template=prompt_template
    )
    
    return LLMChain(llm=llm, prompt=prompt)
```

### Speech-to-Text Processing

Implement Eleven Labs API integration:

```python name=speech_processor.py
import requests
import json
from typing import Dict, Any

class ElevenLabsSpeechProcessor:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://api.elevenlabs.io/v1"
        
    def transcribe_audio(self, audio_file) -> Dict[str, Any]:
        """
        Transcribe audio using Eleven Labs API.
        Returns transcription and metadata about speech patterns.
        """
        headers = {
            "xi-api-key": self.api_key
        }
        
        files = {
            'audio': open(audio_file, 'rb')
        }
        
        response = requests.post(
            f"{self.base_url}/speech-to-text",
            headers=headers,
            files=files
        )
        
        if response.status_code == 200:
            result = response.json()
            
            # Extract not just text but also metadata about speech patterns
            # This would include pace, pauses, tone variations, etc.
            return {
                "text": result.get("text", ""),
                "metadata": result.get("metadata", {})
            }
        else:
            raise Exception(f"Error in transcription: {response.text}")
```

### Text Analysis Pipeline

Create a LangGraph-based analysis pipeline:

```python name=text_analysis.py
from langgraph.graph import StateGraph
from langchain.chat_models import ChatOpenAI
from langchain.schema import SystemMessage, HumanMessage

def create_text_analysis_graph(openrouter_api_key):
    """
    Creates a LangGraph for analyzing interview responses.
    """
    # Initialize LLM with OpenRouter
    llm = ChatOpenAI(
        openai_api_base="https://openrouter.ai/api/v1",
        openai_api_key=openrouter_api_key,
        model="anthropic/claude-3-sonnet"  # Good balance of quality and cost
    )
    
    # Define the state
    class AnalysisState:
        def __init__(self, response_text, speech_metadata):
            self.response_text = response_text
            self.speech_metadata = speech_metadata
            self.empathy_score = None
            self.collaboration_score = None
            self.confidence_score = None
            self.english_proficiency = None
            self.professionalism = None
    
    # Define analysis nodes
    def analyze_empathy(state):
        messages = [
            SystemMessage(content="""
            You are an expert in detecting empathy in communication. 
            Analyze the text for signs of empathy such as:
            - Acknowledgment of others' feelings
            - Perspective-taking ability
            - Compassionate language
            - Awareness of others' needs
            Score from 0-20 based ONLY on concrete evidence in the text.
            """),
            HumanMessage(content=f"Text to analyze: {state.response_text}")
        ]
        response = llm.invoke(messages)
        state.empathy_score = int(response.content.strip())
        return state
    
    # Continue with similar functions for other analysis nodes
    # (collaboration_score, confidence_score, etc.)
    
    # Create the graph
    workflow = StateGraph()
    
    # Add nodes
    workflow.add_node("analyze_empathy", analyze_empathy)
    # Add other analysis nodes...
    
    # Define the edges
    workflow.add_edge("analyze_empathy", "analyze_collaboration")
    # Continue with other edges...
    
    workflow.set_entry_point("analyze_empathy")
    # Set exit point to the final analysis node
    
    return workflow.compile()
```

### Resume Analysis

Create an agent to analyze resumes:

```python name=resume_analyzer.py
from langchain.document_loaders import PyPDFLoader
from langchain.chains import LLMChain
from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate

def create_resume_analysis_agent(openrouter_api_key):
    """Create an agent that analyzes resumes for skills and experience."""
    
    # Connect to OpenRouter
    llm = ChatOpenAI(
        openai_api_base="https://openrouter.ai/api/v1",
        openai_api_key=openrouter_api_key,
        model="google/gemini-1.5-pro"  # Good for structured data extraction
    )
    
    # Extract skills and experience from resume
    extract_template = """
    You are a professional resume analyst. Extract the following information from the resume text:
    
    Resume Content:
    {resume_text}
    
    Extract and return ONLY a JSON object with the following structure:
    {{
        "skills": ["skill1", "skill2", ...],
        "experience": [
            {{"title": "Job Title", "company": "Company Name", "duration": "X years", "description": "Brief summary"}}
        ],
        "education": [
            {{"degree": "Degree Name", "institution": "Institution Name", "year": "Year"}}
        ]
    }}
    """
    
    extract_prompt = PromptTemplate(
        input_variables=["resume_text"],
        template=extract_template
    )
    
    extract_chain = LLMChain(llm=llm, prompt=extract_prompt)
    
    # Score resume against professional fields
    scoring_template = """
    You are an unbiased professional skills assessor.
    
    Resume Information:
    {resume_info}
    
    Job Fields Required:
    {job_fields}
    
    For each job field listed, assign a score from 0-100 indicating how well the candidate's skills and experience match that field.
    Base your scoring ONLY on concrete evidence from their resume, not assumptions about background.
    
    Return ONLY a JSON array of objects with this structure:
    [
        {{"field": "field_name", "score": score, "evidence": "brief justification"}}
    ]
    """
    
    scoring_prompt = PromptTemplate(
        input_variables=["resume_info", "job_fields"],
        template=scoring_template
    )
    
    scoring_chain = LLMChain(llm=llm, prompt=scoring_prompt)
    
    return {
        "extract_chain": extract_chain,
        "scoring_chain": scoring_chain
    }
```

### Correlation Matrix Generation

Create a utility to generate the correlation matrix:

```python name=correlation_matrix.py
import numpy as np
import pandas as pd

def generate_correlation_matrix(job_fields, candidate_fields):
    """
    Generate a correlation matrix between job requirements and candidate skills.
    
    Parameters:
    - job_fields: List of dicts with field name and importance score
    - candidate_fields: List of dicts with field name and candidate score
    
    Returns:
    - Dictionary with correlation score and matrix visualization data
    """
    # Create dataframes for job requirements and candidate skills
    job_df = pd.DataFrame(job_fields)
    candidate_df = pd.DataFrame(candidate_fields)
    
    # Merge dataframes on field name
    merged_df = pd.merge(job_df, candidate_df, on='field', suffixes=('_job', '_candidate'))
    
    # Calculate weighted match score
    merged_df['weighted_match'] = (merged_df['score_candidate'] / 100) * (merged_df['score_job'] / 100)
    
    # Calculate overall correlation score
    total_importance = sum(item['score'] for item in job_fields)
    correlation_score = (merged_df['weighted_match'] * merged_df['score_job']).sum() / total_importance * 100
    
    # Create a visualization dataset for the frontend
    visualization_data = merged_df[['field', 'score_job', 'score_candidate', 'weighted_match']].to_dict('records')
    
    return {
        'correlation_score': correlation_score,
        'visualization_data': visualization_data
    }
```

## Frontend Implementation

### Candidate Interface

Create a Next.js page for candidate interviews:

```tsx name=candidate-interview.tsx
import { useState, useRef } from 'react';
import { Box, Button, Container, Typography, LinearProgress, Paper } from '@mui/material';

export default function CandidateInterview() {
  const [status, setStatus] = useState('initial'); // initial, recording, processing, completed
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [recordings, setRecordings] = useState([]);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  async function startInterview() {
    // Fetch interview questions from backend
    const response = await fetch('/api/interview/questions', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    setQuestions(data.questions);
    setStatus('ready');
  }
  
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob);
        formData.append('questionId', questions[currentQuestionIndex].id);
        
        setStatus('processing');
        
        // Upload recording
        await fetch('/api/interview/submit-answer', {
          method: 'POST',
          body: formData,
        });
        
        setRecordings([...recordings, {
          questionId: questions[currentQuestionIndex].id,
          blob: audioBlob
        }]);
        
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setStatus('ready');
        } else {
          setStatus('completed');
        }
      };
      
      mediaRecorderRef.current.start();
      setStatus('recording');
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  }
  
  function stopRecording() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  }
  
  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Automated Interview
        </Typography>
        
        {status === 'initial' && (
          <Box textAlign="center" mt={4}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={startInterview}
            >
              Start Interview
            </Button>
            <Typography variant="body1" mt={2}>
              You will be asked 5 questions. Please speak clearly when answering.
            </Typography>
          </Box>
        )}
        
        {(status === 'ready' || status === 'recording' || status === 'processing') && (
          <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Question {currentQuestionIndex + 1} of {questions.length}
            </Typography>
            
            <Typography variant="h6" paragraph>
              {questions[currentQuestionIndex]?.question}
            </Typography>
            
            {status === 'ready' && (
              <Button 
                variant="contained" 
                color="primary" 
                onClick={startRecording}
              >
                Start Recording
              </Button>
            )}
            
            {status === 'recording' && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress color="secondary" />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Recording...
                  </Typography>
                </Box>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  onClick={stopRecording}
                >
                  Stop Recording
                </Button>
              </>
            )}
            
            {status === 'processing' && (
              <Box sx={{ width: '100%', mt: 2 }}>
                <LinearProgress />
                <Typography variant="body2" align="center" mt={1}>
                  Processing your answer...
                </Typography>
              </Box>
            )}
          </Paper>
        )}
        
        {status === 'completed' && (
          <Box textAlign="center" mt={4}>
            <Typography variant="h5" gutterBottom>
              Interview Completed
            </Typography>
            <Typography variant="body1">
              Thank you for completing the interview. Your responses are being analyzed.
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
}
```

### HR Interface

Create a Next.js page for HR departments:

```tsx name=hr-dashboard.tsx
import { useState, useEffect } from 'react';
import { 
  Box, Container, Typography, TextField, Button, 
  Paper, Grid, Card, CardContent, Divider,
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Rating
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function HRDashboard() {
  const [jobDescription, setJobDescription] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  
  // Fetch candidates from the API
  useEffect(() => {
    const fetchCandidates = async () => {
      const response = await fetch('/api/candidates');
      const data = await response.json();
      setCandidates(data.candidates);
    };
    
    fetchCandidates();
  }, []);
  
  const handleSubmitJobDescription = async () => {
    const response = await fetch('/api/job-descriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description: jobDescription }),
    });
    
    const data = await response.json();
    // Handle the response as needed
  };
  
  const handleSelectCandidate = async (candidateId) => {
    const response = await fetch(`/api/candidates/${candidateId}/assessment`);
    const data = await response.json();
    setSelectedCandidate(data);
  };
  
  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          HR Dashboard
        </Typography>
        
        <Paper elevation={3} sx={{ p: 3,