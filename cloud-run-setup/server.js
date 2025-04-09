const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');
const { Storage } = require('@google-cloud/storage');

// Load environment variables
dotenv.config();

// Check if we should use mock data
const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'false' ? false : true;
console.log(`AI Mode: ${USE_MOCK_DATA ? 'MOCK DATA' : 'REAL AI'}`);

// Initialize Google Cloud Storage
let storage;
let bucket;
try {
  storage = new Storage();
  const bucketName = process.env.GCS_BUCKET_NAME || 'giselle-uploads';
  bucket = storage.bucket(bucketName);
  console.log(`Using Google Cloud Storage bucket: ${bucketName}`);
} catch (error) {
  console.error('Error initializing Google Cloud Storage:', error);
  console.log('Will fallback to memory storage for uploads');
}

// Configure multer for memory storage (files will be in req.file.buffer)
const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage });

// Create Express app
const app = express();
const port = parseInt(process.env.PORT) || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data storage - In production, this would be replaced with a database
// For Cloud Run, consider using Firestore, Cloud SQL, or other persistent storage
const candidates = [];
const jobs = [];
const interviews = [];
const questions = {};
const responses = [];
const assessments = [];

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check request received');
  res.json({
    status: 'ok',
    version: '0.1.0',
    message: 'Backend API is running'
  });
});

// Candidates endpoints
app.get('/candidates', (req, res) => {
  console.log('GET candidates request received');
  res.json(candidates);
});

app.post('/candidates', (req, res) => {
  console.log('POST candidates request received', req.body);
  
  const { name, email } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required' });
  }
  
  const newCandidate = {
    id: uuidv4(),
    name,
    email,
    created_at: new Date().toISOString()
  };
  
  candidates.push(newCandidate);
  console.log('Created candidate:', newCandidate);
  res.status(201).json(newCandidate);
});

// Resume upload endpoint with Google Cloud Storage
app.post('/candidates/:id/resume', upload.single('resume'), async (req, res) => {
  console.log('POST resume upload request received for candidate ID:', req.params.id);
  
  const candidateId = req.params.id;
  const candidate = candidates.find(c => c.id === candidateId);
  
  if (!candidate) {
    return res.status(404).json({ message: 'Candidate not found' });
  }
  
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  try {
    let resumeUrl;
    // Upload to Google Cloud Storage if available
    if (bucket) {
      const filename = `${Date.now()}-${req.file.originalname}`;
      const file = bucket.file(`resumes/${filename}`);
      
      // Create a write stream and upload the file
      const stream = file.createWriteStream({
        metadata: {
          contentType: req.file.mimetype,
        },
        resumable: false,
      });
      
      // Handle stream errors
      const streamError = new Promise((resolve, reject) => {
        stream.on('error', (err) => {
          console.error('Upload stream error:', err);
          reject(err);
        });
        
        stream.on('finish', () => {
          // Make the file publicly accessible
          file.makePublic().then(() => {
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
            console.log(`File uploaded to: ${publicUrl}`);
            resolve(publicUrl);
          }).catch(err => {
            console.error('Error making file public:', err);
            reject(err);
          });
        });
      });
      
      // Write the file buffer to the stream
      stream.end(req.file.buffer);
      resumeUrl = await streamError;
    } else {
      // Fallback for local development
      resumeUrl = `memory://${req.file.originalname}`;
      console.log('Using memory storage fallback');
    }
    
    // Update candidate with resume URL
    candidate.resume_url = resumeUrl;
    candidate.resume_parsed = {
      skills: ['JavaScript', 'React', 'Node.js', 'Communication'],
      experience: [
        {
          title: 'Frontend Developer',
          company: 'Tech Company',
          duration: '2 years',
          description: 'Developed responsive web applications'
        }
      ],
      education: [
        {
          degree: 'Computer Science',
          institution: 'University',
          year: '2020'
        }
      ]
    };
    
    console.log('Resume uploaded for candidate:', candidate);
    res.status(200).json({ 
      message: 'Resume uploaded successfully',
      resume_url: candidate.resume_url,
      parsed_data: candidate.resume_parsed
    });
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ message: 'Error uploading resume', error: error.message });
  }
});

// Jobs endpoints
app.get('/jobs', (req, res) => {
  console.log('GET jobs request received');
  res.json(jobs);
});

app.get('/jobs/:id', (req, res) => {
  console.log('GET job request received for ID:', req.params.id);
  
  const job = jobs.find(j => j.id === req.params.id);
  
  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }
  
  res.json(job);
});

app.post('/jobs', (req, res) => {
  console.log('POST jobs request received', req.body);
  
  const { title, description } = req.body;
  
  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required' });
  }
  
  const newJob = {
    id: uuidv4(),
    title,
    description,
    created_at: new Date().toISOString()
  };
  
  jobs.push(newJob);
  console.log('Created job:', newJob);
  res.status(201).json(newJob);
});

// Interviews endpoints
app.get('/interviews', (req, res) => {
  console.log('GET interviews request received');
  res.json(interviews);
});

app.get('/interviews/:id', (req, res) => {
  console.log('GET interview request received for ID:', req.params.id);
  
  const interview = interviews.find(i => i.id === req.params.id);
  
  if (!interview) {
    return res.status(404).json({ message: 'Interview not found' });
  }
  
  res.json(interview);
});

app.post('/interviews', (req, res) => {
  console.log('POST interviews request received', req.body);
  
  const { job_id, candidate_id } = req.body;
  
  if (!job_id || !candidate_id) {
    return res.status(400).json({ message: 'Job ID and Candidate ID are required' });
  }
  
  const newInterview = {
    id: uuidv4(),
    job_id,
    candidate_id,
    status: 'pending',
    created_at: new Date().toISOString()
  };
  
  interviews.push(newInterview);
  console.log('Created interview:', newInterview);
  
  // Generate questions for this interview
  const interviewQuestions = generateQuestionsForInterview(newInterview.id, job_id);
  questions[newInterview.id] = interviewQuestions;
  
  res.status(201).json(newInterview);
});

// Questions endpoint
app.get('/interviews/:id/questions', (req, res) => {
  console.log('GET questions request received for interview ID:', req.params.id);
  
  const interviewId = req.params.id;
  const interview = interviews.find(i => i.id === interviewId);
  
  if (!interview) {
    return res.status(404).json({ message: 'Interview not found' });
  }
  
  const interviewQuestions = questions[interviewId] || [];
  
  res.json(interviewQuestions);
});

// Submit answer endpoint with Google Cloud Storage for audio
app.post('/interviews/:interviewId/questions/:questionId/answer', upload.single('audio'), async (req, res) => {
  console.log('POST answer submission received for interview ID:', req.params.interviewId, 'question ID:', req.params.questionId);
  
  const { interviewId, questionId } = req.params;
  
  const interview = interviews.find(i => i.id === interviewId);
  if (!interview) {
    return res.status(404).json({ message: 'Interview not found' });
  }
  
  const interviewQuestions = questions[interviewId] || [];
  const question = interviewQuestions.find(q => q.id === questionId);
  if (!question) {
    return res.status(404).json({ message: 'Question not found' });
  }
  
  if (!req.file) {
    return res.status(400).json({ message: 'No audio file uploaded' });
  }
  
  try {
    let audioUrl;
    // Upload to Google Cloud Storage if available
    if (bucket) {
      const filename = `${Date.now()}-${req.file.originalname}`;
      const file = bucket.file(`answers/${filename}`);
      
      // Create a write stream and upload the file
      const stream = file.createWriteStream({
        metadata: {
          contentType: req.file.mimetype,
        },
        resumable: false,
      });
      
      // Handle stream errors
      const streamError = new Promise((resolve, reject) => {
        stream.on('error', (err) => {
          console.error('Upload stream error:', err);
          reject(err);
        });
        
        stream.on('finish', () => {
          // Make the file publicly accessible
          file.makePublic().then(() => {
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
            console.log(`File uploaded to: ${publicUrl}`);
            resolve(publicUrl);
          }).catch(err => {
            console.error('Error making file public:', err);
            reject(err);
          });
        });
      });
      
      // Write the file buffer to the stream
      stream.end(req.file.buffer);
      audioUrl = await streamError;
    } else {
      // Fallback for local development
      audioUrl = `memory://${req.file.originalname}`;
      console.log('Using memory storage fallback');
    }
    
    // Process the response
    const responseId = uuidv4();
    
    // Mock transcription and analysis
    // In production, you would send the audio to a speech-to-text service
    const transcription = "This is a mock transcription of the candidate's response.";
    const analysis = {
      clarity: 8,
      relevance: 7,
      depth: 9,
      confidence: 8
    };
    
    const newResponse = {
      id: responseId,
      interview_id: interviewId,
      question_id: questionId,
      audio_url: audioUrl,
      transcription,
      analysis,
      created_at: new Date().toISOString()
    };
    
    responses.push(newResponse);
    
    res.status(200).json({
      message: 'Answer submitted successfully',
      response: newResponse
    });
  } catch (error) {
    console.error('Error uploading audio:', error);
    res.status(500).json({ message: 'Error uploading audio', error: error.message });
  }
});

// Complete interview and get results
app.post('/interviews/:id/complete', (req, res) => {
  console.log('POST complete interview request received for ID:', req.params.id);
  
  const interviewId = req.params.id;
  const interview = interviews.find(i => i.id === interviewId);
  
  if (!interview) {
    return res.status(404).json({ message: 'Interview not found' });
  }
  
  // Update interview status
  interview.status = 'completed';
  interview.completed_at = new Date().toISOString();
  
  // Generate assessment
  const assessment = generateInterviewAssessment(interviewId);
  assessments.push(assessment);
  
  res.status(200).json({
    message: 'Interview completed successfully',
    interview,
    assessment
  });
});

// Get interview results
app.get('/interviews/:id/results', (req, res) => {
  console.log('GET results request received for interview ID:', req.params.id);
  
  const interviewId = req.params.id;
  const assessment = assessments.find(a => a.interview_id === interviewId);
  
  if (!assessment) {
    // If no assessment exists, generate one
    const interview = interviews.find(i => i.id === interviewId);
    
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    
    const newAssessment = generateInterviewAssessment(interviewId);
    assessments.push(newAssessment);
    
    return res.json(newAssessment);
  }
  
  res.json(assessment);
});

// Helper functions
function generateQuestionsForInterview(interviewId, jobId) {
  const job = jobs.find(j => j.id === jobId);
  const jobTitle = job ? job.title : 'Generic Position';
  const jobDescription = job ? job.description : 'Generic job description';
  
  if (!USE_MOCK_DATA) {
    console.log('Using real AI to generate interview questions...');
    try {
      // In a real implementation, this would call an LLM API
      // For now, we'll still use mock questions but with a message indicating we're in real AI mode
      console.log('LLM would generate questions based on:', jobTitle, jobDescription);
      
      // This would be replaced with actual LLM call in the full implementation
      return [
        {
          id: uuidv4(),
          interview_id: interviewId,
          text: `As an ${jobTitle}, how have you applied AI technologies to solve real-world problems?`,
          type: 'technical',
          skill_assessed: 'ai_expertise',
          order_index: 0
        },
        {
          id: uuidv4(),
          interview_id: interviewId,
          text: 'What experience do you have with large language models and prompt engineering?',
          type: 'technical',
          skill_assessed: 'llm_knowledge',
          order_index: 1
        },
        {
          id: uuidv4(),
          interview_id: interviewId,
          text: 'Describe a challenging AI project where you had to optimize for performance and cost.',
          type: 'behavioral',
          skill_assessed: 'problem_solving',
          order_index: 2
        },
        {
          id: uuidv4(),
          interview_id: interviewId,
          text: 'How do you stay updated with the rapidly evolving field of AI?',
          type: 'behavioral',
          skill_assessed: 'continuous_learning',
          order_index: 3
        },
        {
          id: uuidv4(),
          interview_id: interviewId,
          text: 'What ethical considerations do you take into account when developing AI solutions?',
          type: 'technical',
          skill_assessed: 'ai_ethics',
          order_index: 4
        }
      ];
    } catch (error) {
      console.error('Error generating questions with AI:', error);
      // Fall back to mock questions if AI fails
    }
  }
  
  // Generate 5 mock questions (used when USE_MOCK_DATA is true or AI fails)
  return [
    {
      id: uuidv4(),
      interview_id: interviewId,
      text: `What specific skills or experience do you have that make you a good fit for this ${jobTitle} role?`,
      type: 'behavioral',
      skill_assessed: 'job_fit',
      order_index: 0
    },
    {
      id: uuidv4(),
      interview_id: interviewId,
      text: 'Describe a challenging project you worked on and how you approached it.',
      type: 'behavioral',
      skill_assessed: 'problem_solving',
      order_index: 1
    },
    {
      id: uuidv4(),
      interview_id: interviewId,
      text: 'How do you handle working under pressure with tight deadlines?',
      type: 'behavioral',
      skill_assessed: 'stress_management',
      order_index: 2
    },
    {
      id: uuidv4(),
      interview_id: interviewId,
      text: 'Tell me about a time when you had to collaborate with a difficult team member.',
      type: 'behavioral',
      skill_assessed: 'collaboration',
      order_index: 3
    },
    {
      id: uuidv4(),
      interview_id: interviewId,
      text: `What do you consider your greatest professional achievement related to ${jobTitle}?`,
      type: 'behavioral',
      skill_assessed: 'achievement',
      order_index: 4
    }
  ];
}

function generateInterviewAssessment(interviewId) {
  const interview = interviews.find(i => i.id === interviewId);
  const job = jobs.find(j => j.id === interview.job_id);
  const jobTitle = job ? job.title : 'Generic Position';
  const candidateResponses = responses.filter(r => r.interview_id === interviewId);
  
  if (!USE_MOCK_DATA) {
    console.log('Using real AI to generate interview assessment...');
    try {
      // In a real implementation, this would call an LLM API
      // For now, we'll use enhanced mock data to simulate AI responses
      console.log(`LLM would analyze ${candidateResponses.length} responses for job: ${jobTitle}`);
      
      // This would be replaced with actual LLM call in the full implementation
      return {
        id: uuidv4(),
        interview_id: interviewId,
        overall_assessment: `The candidate demonstrates strong AI engineering capabilities and deep understanding of machine learning concepts. Their knowledge of LLMs and prompt engineering is particularly impressive. They show good communication skills and a systematic approach to problem-solving.`,
        skills_assessment: [
          { name: "AI Technical Knowledge", score: 19 },
          { name: "ML/LLM Expertise", score: 18 },
          { name: "Communication", score: 16 },
          { name: "Problem Solving", score: 17 },
          { name: "AI Ethics Awareness", score: 15 }
        ],
        response_quality: [
          { clarity: 17, relevance: 18, depth: 19 },
          { clarity: 18, relevance: 19, depth: 17 },
          { clarity: 16, relevance: 17, depth: 18 },
          { clarity: 17, relevance: 16, depth: 17 },
          { clarity: 18, relevance: 17, depth: 19 }
        ],
        job_match_radar: [
          { field: "AI/ML Knowledge", score: 90 },
          { field: "Technical Implementation", score: 85 },
          { field: "Communication", score: 80 },
          { field: "Problem Solving", score: 85 },
          { field: "Domain Knowledge", score: 75 }
        ],
        strengths: [
          "Deep understanding of large language models",
          "Strong technical implementation skills",
          "Excellent problem-solving approach",
          "Good awareness of AI ethics considerations",
          "Clear communication of complex concepts"
        ],
        improvements: [
          "Could further develop domain-specific AI applications knowledge",
          "May benefit from more experience with production deployment",
          "Could provide more specific metrics on project outcomes"
        ],
        empathy_score: 16,
        collaboration_score: 15,
        confidence_score: 18,
        created_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating assessment with AI:', error);
      // Fall back to mock assessment if AI fails
    }
  }
  
  // Generate mock assessment data (used when USE_MOCK_DATA is true or AI fails)
  return {
    id: uuidv4(),
    interview_id: interviewId,
    overall_assessment: "The candidate demonstrates strong technical skills and good communication abilities. They showed excellent problem-solving capabilities but could improve on collaboration skills.",
    skills_assessment: [
      { name: "Technical Knowledge", score: 18 },
      { name: "Communication", score: 16 },
      { name: "Problem Solving", score: 17 },
      { name: "Adaptability", score: 15 }
    ],
    response_quality: [
      { clarity: 16, relevance: 17, depth: 15 },
      { clarity: 18, relevance: 16, depth: 17 },
      { clarity: 15, relevance: 15, depth: 14 },
      { clarity: 17, relevance: 16, depth: 16 },
      { clarity: 16, relevance: 15, depth: 15 }
    ],
    job_match_radar: [
      { field: "Technical Skills", score: 85 },
      { field: "Communication", score: 75 },
      { field: "Problem Solving", score: 80 },
      { field: "Teamwork", score: 65 },
      { field: "Domain Knowledge", score: 70 }
    ],
    strengths: [
      "Strong technical knowledge",
      "Excellent problem-solving abilities",
      "Clear communication skills",
      "Good adaptability to new situations"
    ],
    improvements: [
      "Could improve collaboration skills",
      "May need to develop more specific domain knowledge",
      "Should work on providing more detailed responses"
    ],
    empathy_score: 15,
    collaboration_score: 14,
    confidence_score: 17,
    created_at: new Date().toISOString()
  };
}

// Start the server
app.listen(port, () => {
  console.log(`Backend API server running at http://0.0.0.0:${port}`);
  console.log(`Available endpoints:`);
  console.log(`- GET  /health`);
  console.log(`- GET  /candidates`);
  console.log(`- POST /candidates`);
  console.log(`- POST /candidates/:id/resume`);
  console.log(`- GET  /jobs`);
  console.log(`- GET  /jobs/:id`);
  console.log(`- POST /jobs`);
  console.log(`- GET  /interviews`);
  console.log(`- GET  /interviews/:id`);
  console.log(`- POST /interviews`);
  console.log(`- GET  /interviews/:id/questions`);
  console.log(`- POST /interviews/:interviewId/questions/:questionId/answer`);
  console.log(`- POST /interviews/:id/complete`);
  console.log(`- GET  /interviews/:id/results`);
}); 