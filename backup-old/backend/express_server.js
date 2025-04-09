const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 8000;

// Set up multer for file uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// In-memory data storage (replace with actual database in production)
const candidates = [];
const jobs = [];
const interviews = [];
const questions = [];
const responses = [];
const assessments = [];

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '0.1.0',
    message: 'Backend API is running'
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({
    message: 'This is a test endpoint from the backend API'
  });
});

// Candidates endpoints
app.get('/candidates', (req, res) => {
  res.json(candidates);
});

app.get('/candidates/:id', (req, res) => {
  const candidate = candidates.find(c => c.id === req.params.id);
  if (!candidate) {
    return res.status(404).json({ message: 'Candidate not found' });
  }
  res.json(candidate);
});

app.post('/candidates', (req, res) => {
  const { name, email, phone } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required' });
  }
  
  const newCandidate = {
    id: uuidv4(),
    name,
    email,
    phone: phone || null,
    resume_url: null,
    resume_parsed: null,
    created_at: new Date().toISOString()
  };
  
  candidates.push(newCandidate);
  res.status(201).json(newCandidate);
});

app.post('/candidates/:id/resume', upload.single('resume'), (req, res) => {
  const candidate = candidates.find(c => c.id === req.params.id);
  
  if (!candidate) {
    return res.status(404).json({ message: 'Candidate not found' });
  }
  
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  // Set the resume URL
  candidate.resume_url = `/uploads/${req.file.filename}`;
  
  // In a real application, you would parse the resume here
  candidate.resume_parsed = {
    skills: ['JavaScript', 'React', 'Node.js'],
    education: 'Sample University',
    experience: '3 years of development experience'
  };
  
  res.json({ 
    message: 'Resume uploaded successfully',
    candidate 
  });
});

// Jobs endpoints
app.get('/jobs', (req, res) => {
  res.json(jobs);
});

app.get('/jobs/:id', (req, res) => {
  const job = jobs.find(j => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }
  res.json(job);
});

app.post('/jobs', (req, res) => {
  const { title, description, company_id, department, required_skills } = req.body;
  
  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required' });
  }
  
  const newJob = {
    id: uuidv4(),
    company_id: company_id || 'default',
    title,
    description,
    department: department || null,
    required_skills: required_skills || [],
    created_at: new Date().toISOString()
  };
  
  jobs.push(newJob);
  res.status(201).json(newJob);
});

// Interviews endpoints
app.get('/interviews', (req, res) => {
  res.json(interviews);
});

app.get('/interviews/:id', (req, res) => {
  const interview = interviews.find(i => i.id === req.params.id);
  if (!interview) {
    return res.status(404).json({ message: 'Interview not found' });
  }
  res.json(interview);
});

app.post('/interviews', (req, res) => {
  const { job_id, candidate_id } = req.body;
  
  if (!job_id || !candidate_id) {
    return res.status(400).json({ message: 'Job ID and Candidate ID are required' });
  }
  
  // Check if job and candidate exist
  const job = jobs.find(j => j.id === job_id);
  const candidate = candidates.find(c => c.id === candidate_id);
  
  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }
  
  if (!candidate) {
    return res.status(404).json({ message: 'Candidate not found' });
  }
  
  const interviewId = uuidv4();
  
  // Create new interview
  const newInterview = {
    id: interviewId,
    job_id,
    candidate_id,
    status: 'pending',
    created_at: new Date().toISOString(),
    completed_at: null
  };
  
  interviews.push(newInterview);
  
  // Generate questions for the interview
  const interviewQuestions = [
    {
      id: uuidv4(),
      interview_id: interviewId,
      text: 'Tell me about your experience with JavaScript.',
      type: 'technical',
      skill_assessed: 'JavaScript',
      order_index: 0
    },
    {
      id: uuidv4(),
      interview_id: interviewId,
      text: 'Describe a challenging project you worked on recently.',
      type: 'behavioral',
      skill_assessed: 'Problem Solving',
      order_index: 1
    },
    {
      id: uuidv4(),
      interview_id: interviewId,
      text: 'How do you handle conflicts in a team environment?',
      type: 'behavioral',
      skill_assessed: 'Teamwork',
      order_index: 2
    }
  ];
  
  questions.push(...interviewQuestions);
  
  res.status(201).json({
    interview: newInterview,
    questions: interviewQuestions
  });
});

app.get('/interviews/:id/questions', (req, res) => {
  const interviewQuestions = questions.filter(q => q.interview_id === req.params.id);
  
  if (interviewQuestions.length === 0) {
    return res.status(404).json({ message: 'No questions found for this interview' });
  }
  
  res.json(interviewQuestions);
});

app.post('/interviews/:id/complete', (req, res) => {
  const interview = interviews.find(i => i.id === req.params.id);
  
  if (!interview) {
    return res.status(404).json({ message: 'Interview not found' });
  }
  
  interview.status = 'completed';
  interview.completed_at = new Date().toISOString();
  
  // Generate assessment
  const newAssessment = {
    id: uuidv4(),
    interview_id: interview.id,
    empathy_score: Math.floor(Math.random() * 5) + 1,
    collaboration_score: Math.floor(Math.random() * 5) + 1,
    confidence_score: Math.floor(Math.random() * 5) + 1,
    english_proficiency: Math.floor(Math.random() * 5) + 1,
    professionalism: Math.floor(Math.random() * 5) + 1,
    created_at: new Date().toISOString()
  };
  
  assessments.push(newAssessment);
  
  res.json({
    interview,
    assessment: newAssessment
  });
});

// Responses endpoint
app.post('/responses/:questionId', upload.single('audio'), (req, res) => {
  const questionId = req.params.questionId;
  const question = questions.find(q => q.id === questionId);
  
  if (!question) {
    return res.status(404).json({ message: 'Question not found' });
  }
  
  if (!req.file) {
    return res.status(400).json({ message: 'No audio file uploaded' });
  }
  
  const newResponse = {
    id: uuidv4(),
    question_id: questionId,
    audio_url: `/uploads/${req.file.filename}`,
    transcription: 'This is a mock transcription of the audio response.',
    created_at: new Date().toISOString()
  };
  
  responses.push(newResponse);
  
  res.json({
    message: 'Response recorded successfully',
    response: newResponse
  });
});

// Get assessment for an interview
app.get('/interviews/:id/assessment', (req, res) => {
  const assessment = assessments.find(a => a.interview_id === req.params.id);
  
  if (!assessment) {
    return res.status(404).json({ message: 'Assessment not found for this interview' });
  }
  
  res.json(assessment);
});

// Start the server
app.listen(port, () => {
  console.log(`Backend API server running at http://localhost:${port}`);
}); 