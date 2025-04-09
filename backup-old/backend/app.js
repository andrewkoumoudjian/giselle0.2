const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create Express app
const app = express();
const port = 8000;

// Set up upload directory for files
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
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

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// In-memory data storage
const candidates = [];
const jobs = [];
const interviews = [];
const questions = [];
const responses = [];
const assessments = [];

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '0.1.0',
    message: 'Backend API is running'
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
  
  candidate.resume_url = `/uploads/${req.file.filename}`;
  
  // Mock resume parsing
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
  
  // Check if job and candidate exist (in a real app)
  // For now, we'll just create the interview
  
  const interviewId = uuidv4();
  
  const newInterview = {
    id: interviewId,
    job_id,
    candidate_id,
    status: 'pending',
    created_at: new Date().toISOString(),
    completed_at: null
  };
  
  interviews.push(newInterview);
  
  // Generate mock questions for this interview
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
  const interviewId = req.params.id;
  const interviewQuestions = questions.filter(q => q.interview_id === interviewId);
  
  if (interviewQuestions.length === 0) {
    return res.status(404).json({ message: 'No questions found for this interview' });
  }
  
  res.json(interviewQuestions);
});

// Response endpoints
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

// Interview completion and assessment
app.post('/interviews/:id/complete', (req, res) => {
  const interviewId = req.params.id;
  const interview = interviews.find(i => i.id === interviewId);
  
  if (!interview) {
    return res.status(404).json({ message: 'Interview not found' });
  }
  
  interview.status = 'completed';
  interview.completed_at = new Date().toISOString();
  
  // Generate a mock assessment
  const newAssessment = {
    id: uuidv4(),
    interview_id: interviewId,
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

app.get('/interviews/:id/assessment', (req, res) => {
  const interviewId = req.params.id;
  const assessment = assessments.find(a => a.interview_id === interviewId);
  
  if (!assessment) {
    return res.status(404).json({ message: 'Assessment not found for this interview' });
  }
  
  res.json(assessment);
});

// Start the server
app.listen(port, () => {
  console.log(`Backend API server running at http://localhost:${port}`);
}); 