const express = require('express');
const cors = require('cors');
const formidable = require('formidable');
const { v4: uuidv4 } = require('uuid');
const { db } = require('./lib/supabase');
const axios = require('axios');

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Check if OpenAI API key is set
if (!process.env.OPENAI_API_KEY) {
  console.warn('WARNING: OPENAI_API_KEY is not set. Question generation will not work properly.');
}

// Additional check for OpenRouter API key
if (!process.env.OPENROUTER_API_KEY) {
  console.warn('WARNING: OPENROUTER_API_KEY is not set. Using OpenAI fallback if available.');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check request received');
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Candidates routes
app.get('/api/candidates', async (req, res) => {
  try {
    const candidates = await db.getCandidates();
    res.status(200).json(candidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

app.get('/api/candidates/:id', async (req, res) => {
  try {
    const candidate = await db.getCandidateById(req.params.id);
      
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    res.status(200).json(candidate);
  } catch (error) {
    console.error(`Error fetching candidate ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch candidate' });
  }
});

app.post('/api/candidates', async (req, res) => {
  try {
    console.log('POST candidates request received', req.body);
    const { name, email, phone, position } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    const newCandidate = {
      id: uuidv4(),
      name,
      email,
      phone: phone || '',
      position: position || '',
      created_at: new Date().toISOString(),
      resume_url: null,
      resume_parsed: null
    };
    
    const candidate = await db.createCandidate(newCandidate);
      
    if (!candidate) {
      return res.status(500).json({ error: 'Failed to create candidate' });
    }
    
    console.log('Created candidate:', candidate);
    res.status(201).json(candidate);
  } catch (error) {
    console.error('Error creating candidate:', error);
    res.status(500).json({ error: 'Failed to create candidate' });
  }
});

// Jobs routes
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await db.getJobs();
    res.status(200).json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

app.get('/api/jobs/:id', async (req, res) => {
  try {
    const job = await db.getJobById(req.params.id);
      
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.status(200).json(job);
  } catch (error) {
    console.error(`Error fetching job ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

app.post('/api/jobs', async (req, res) => {
  try {
    console.log('POST jobs request received', req.body);
    const { title, company, description, requirements, responsibilities } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const newJob = {
      id: uuidv4(),
      title,
      company: company || 'Not specified',
      description: description || '',
      requirements: requirements || [],
      responsibilities: responsibilities || [],
      created_at: new Date().toISOString()
    };
    
    const job = await db.createJob(newJob);
      
    if (!job) {
      return res.status(500).json({ error: 'Failed to create job' });
    }
    
    console.log('Created job:', job);
    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// Generate interview questions with LLM
async function generateQuestionsWithLLM(job, candidate) {
  try {
    // Try OpenRouter first
    if (process.env.OPENROUTER_API_KEY) {
      const model = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat-v3-0324:free';

      const prompt = `
      Generate 5 tailored interview questions for a candidate applying for the following job:
      
      Job Title: ${job.title}
      Job Description: ${job.description}
      Requirements: ${job.requirements.join(', ')}
      Responsibilities: ${job.responsibilities.join(', ')}
      
      Candidate Information:
      Name: ${candidate.name}
      Position: ${candidate.position || 'Not specified'}
      Resume Data: ${JSON.stringify(candidate.resume_parsed || {})}
      
      Create questions that will assess the candidate's technical skills, experience, problem-solving abilities, and culture fit.
      Return only the 5 questions as a JSON array of strings.
      `;

      try {
        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: model,
            messages: [
              { role: 'system', content: 'You are an expert interviewer. Generate relevant and insightful interview questions based on the job and candidate details provided.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
              'HTTP-Referer': 'https://giselle-interview.vercel.app'
            }
          }
        );

        let questions = [];
        
        try {
          // Try to parse the response as JSON
          const content = response.data.choices[0].message.content;
          questions = JSON.parse(content);
        } catch (parseError) {
          // If parsing fails, extract questions from plain text
          const content = response.data.choices[0].message.content;
          questions = content.split('\n')
            .filter(line => line.trim().length > 0)
            .slice(0, 5);
        }

        // Ensure we have at least some questions
        if (Array.isArray(questions) && questions.length > 0) {
          return questions.slice(0, 5); // Limit to 5 questions
        }
      } catch (openRouterError) {
        console.error('Error using OpenRouter:', openRouterError);
        // Fall through to OpenAI if available, otherwise fallback
      }
    }

    // Fallback to OpenAI if available
    if (process.env.OPENAI_API_KEY) {
      const prompt = `
      Generate 5 tailored interview questions for a candidate applying for the following job:
      
      Job Title: ${job.title}
      Job Description: ${job.description}
      Requirements: ${job.requirements.join(', ')}
      Responsibilities: ${job.responsibilities.join(', ')}
      
      Candidate Information:
      Name: ${candidate.name}
      Position: ${candidate.position || 'Not specified'}
      Resume Data: ${JSON.stringify(candidate.resume_parsed || {})}
      
      Create questions that will assess the candidate's technical skills, experience, problem-solving abilities, and culture fit.
      Return only the 5 questions as a JSON array of strings.
      `;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            { role: 'system', content: 'You are an expert interviewer. Generate relevant and insightful interview questions based on the job and candidate details provided.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          }
        }
      );

      let questions = [];
      
      try {
        // Try to parse the response as JSON
        const content = response.data.choices[0].message.content;
        questions = JSON.parse(content);
      } catch (parseError) {
        // If parsing fails, extract questions from plain text
        const content = response.data.choices[0].message.content;
        questions = content.split('\n')
          .filter(line => line.trim().length > 0)
          .slice(0, 5);
      }

      // Ensure we have at least some questions
      if (Array.isArray(questions) && questions.length > 0) {
        return questions.slice(0, 5); // Limit to 5 questions
      }
    }

    // If all else fails, use fallback questions
    return getFallbackQuestions();
  } catch (error) {
    console.error('Error generating questions with LLM:', error);
    return getFallbackQuestions();
  }
}

// Fallback questions if LLM generation fails
function getFallbackQuestions() {
  return [
    "Tell me about your experience with the technologies mentioned in the job description.",
    "Describe a challenging project you worked on and how you overcame obstacles.",
    "How do you stay updated with the latest developments in your field?",
    "Can you explain your approach to problem-solving in a professional setting?",
    "What are your career goals and how does this position align with them?"
  ];
}

// Interviews routes
app.get('/api/interviews', async (req, res) => {
  try {
    console.log('GET interviews request received');
    const interviews = await db.getInterviews();
    res.status(200).json(interviews);
  } catch (error) {
    console.error('Error fetching interviews:', error);
    res.status(500).json({ error: 'Failed to fetch interviews' });
  }
});

app.get('/api/interviews/:id', async (req, res) => {
  try {
    const interview = await db.getInterviewById(req.params.id);
      
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    
    res.status(200).json(interview);
  } catch (error) {
    console.error(`Error fetching interview ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch interview' });
  }
});

app.post('/api/interviews', async (req, res) => {
  try {
    console.log('POST interviews request received', req.body);
    const { candidate_id, job_id } = req.body;
    
    if (!candidate_id || !job_id) {
      return res.status(400).json({ error: 'Candidate ID and Job ID are required' });
    }
    
    // Verify candidate and job exist
    const candidate = await db.getCandidateById(candidate_id);
    const job = await db.getJobById(job_id);
    
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    const newInterview = {
      id: uuidv4(),
      candidate_id: candidate_id,
      job_id: job_id,
      status: 'pending',
      created_at: new Date().toISOString(),
      completed_at: null
    };
    
    const interview = await db.createInterview(newInterview);
      
    if (!interview) {
      return res.status(500).json({ error: 'Failed to create interview' });
    }
    
    console.log('Created interview:', interview);
    
    // Generate questions using LLM
    const questionTexts = await generateQuestionsWithLLM(job, candidate);
    
    // Create question objects
    const questions = questionTexts.map((questionText, index) => ({
      id: uuidv4(),
      interview_id: interview.id,
      question: questionText,
      order_index: index
    }));
    
    // Save questions to database
    const savedQuestions = await db.createQuestions(questions);
    
    res.status(201).json({
      interview,
      questions: savedQuestions
    });
  } catch (error) {
    console.error('Error creating interview:', error);
    res.status(500).json({ error: 'Failed to create interview' });
  }
});

app.get('/api/interviews/:id/questions', async (req, res) => {
  try {
    const interviewId = req.params.id;
    const questions = await db.getInterviewQuestions(interviewId);
    res.status(200).json(questions);
  } catch (error) {
    console.error(`Error fetching questions for interview ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch interview questions' });
  }
});

app.post('/api/interviews/:id/responses', async (req, res) => {
  try {
    const interviewId = req.params.id;
    const { questionId, audioUrl, transcript } = req.body;
    
    if (!questionId || !audioUrl) {
      return res.status(400).json({ error: 'Question ID and audio URL are required' });
    }
    
    // Verify interview exists
    const interview = await db.getInterviewById(interviewId);
    
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    
    const newResponse = {
      id: uuidv4(),
      interview_id: interviewId,
      question_id: questionId,
      audio_url: audioUrl,
      transcript: transcript || '',
      created_at: new Date().toISOString()
    };
    
    const response = await db.createResponse(newResponse);
      
    if (!response) {
      return res.status(500).json({ error: 'Failed to create response' });
    }
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating response:', error);
    res.status(500).json({ error: 'Failed to create response' });
  }
});

app.put('/api/interviews/:id/complete', async (req, res) => {
  try {
    const interviewId = req.params.id;
    
    // Update interview status
    const interview = await db.updateInterviewStatus(
      interviewId, 
      'completed', 
      new Date().toISOString()
    );
    
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    
    // In a production environment, this would trigger the assessment generation
    // using LLMs to analyze the responses
    setTimeout(() => {
      generateAssessment(interviewId).catch(error => 
        console.error(`Error generating assessment for interview ${interviewId}:`, error)
      );
    }, 0);
    
    res.status(200).json(interview);
  } catch (error) {
    console.error(`Error completing interview ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to complete interview' });
  }
});

// Generate assessment with LLM
async function generateAssessment(interviewId) {
  try {
    // Get interview data
    const interview = await db.getInterviewById(interviewId);
    if (!interview) {
      console.error(`Interview ${interviewId} not found for assessment`);
      return null;
    }
    
    // Get candidate and job data
    const candidate = await db.getCandidateById(interview.candidate_id);
    const job = await db.getJobById(interview.job_id);
    
    // Get questions and responses
    const questions = await db.getInterviewQuestions(interviewId);
    const responses = await db.getInterviewResponses(interviewId);
    
    // Match responses to questions
    const questionResponsePairs = questions.map(question => {
      const response = responses.find(r => r.question_id === question.id);
      return {
        question: question.question,
        response: response ? response.transcript : 'No response provided'
      };
    });
    
    // Create the prompt for the LLM
    const prompt = `
    Analyze the following interview responses for a candidate applying for the job position:
    
    Job Title: ${job.title}
    Job Description: ${job.description}
    Requirements: ${job.requirements.join(', ')}
    
    Candidate: ${candidate.name}
    
    Interview Questions and Responses:
    ${questionResponsePairs.map((pair, index) => 
      `Question ${index + 1}: ${pair.question}\nResponse: ${pair.response}`
    ).join('\n\n')}
    
    Provide a comprehensive assessment in the following JSON format:
    {
      "overall_assessment": "Detailed overall assessment of the candidate",
      "strengths": ["Strength 1", "Strength 2", "Strength 3"],
      "improvements": ["Area for improvement 1", "Area for improvement 2"],
      "job_match_percentage": 85,
      "skill_scores": [
        {"name": "Technical Knowledge", "score": 4.5},
        {"name": "Communication", "score": 4.0},
        {"name": "Problem Solving", "score": 4.2}
      ],
      "question_feedback": [
        {"question_index": 0, "feedback": "Feedback on response to question 1"},
        {"question_index": 1, "feedback": "Feedback on response to question 2"}
      ]
    }
    `;
    
    let assessmentData = null;
    
    // Try OpenRouter first
    if (process.env.OPENROUTER_API_KEY) {
      const model = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat-v3-0324:free';
      
      try {
        // Call OpenRouter API
        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: model,
            messages: [
              { role: 'system', content: 'You are an expert hiring manager with experience in technical interviewing. Provide objective assessments of interview responses.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
              'HTTP-Referer': 'https://giselle-interview.vercel.app'
            }
          }
        );
        
        try {
          // Parse the LLM response
          const content = response.data.choices[0].message.content;
          assessmentData = JSON.parse(content);
        } catch (parseError) {
          console.error('Error parsing OpenRouter response:', parseError);
          // Fall through to OpenAI if available
        }
      } catch (openRouterError) {
        console.error('Error using OpenRouter:', openRouterError);
        // Fall through to OpenAI if available
      }
    }
    
    // Fallback to OpenAI if available and we don't have assessment data yet
    if (!assessmentData && process.env.OPENAI_API_KEY) {
      try {
        // Call OpenAI API
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4',
            messages: [
              { role: 'system', content: 'You are an expert hiring manager with experience in technical interviewing. Provide objective assessments of interview responses.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            }
          }
        );
        
        try {
          // Parse the LLM response
          const content = response.data.choices[0].message.content;
          assessmentData = JSON.parse(content);
        } catch (parseError) {
          console.error('Error parsing OpenAI response:', parseError);
          // Fall through to placeholder assessment
        }
      } catch (openAIError) {
        console.error('Error using OpenAI:', openAIError);
        // Fall through to placeholder assessment
      }
    }
    
    if (assessmentData) {
      // Convert question_feedback to the format expected by the database
      const questionFeedback = assessmentData.question_feedback.map(feedback => {
        const questionIndex = feedback.question_index;
        return {
          question_id: questions[questionIndex].id,
          feedback: feedback.feedback
        };
      });
      
      // Create assessment object
      const assessment = {
        interview_id: interviewId,
        overall_assessment: assessmentData.overall_assessment,
        strengths: assessmentData.strengths,
        improvements: assessmentData.improvements,
        job_match_percentage: assessmentData.job_match_percentage,
        skill_scores: assessmentData.skill_scores,
        question_feedback: questionFeedback,
        created_at: new Date().toISOString()
      };
      
      // Save to database
      return await db.createAssessment(assessment);
    } else {
      // If all else fails, create a placeholder assessment
      return createPlaceholderAssessment(interviewId);
    }
  } catch (error) {
    console.error('Error generating assessment with LLM:', error);
    return createPlaceholderAssessment(interviewId);
  }
}

// Create placeholder assessment if LLM generation fails
async function createPlaceholderAssessment(interviewId) {
  const placeholderAssessment = {
    interview_id: interviewId,
    overall_assessment: "The candidate's responses demonstrated a reasonable understanding of the job requirements and showcased relevant experience.",
    strengths: ["Technical knowledge", "Communication", "Experience"],
    improvements: ["Could provide more specific examples", "Deeper technical expertise in some areas"],
    job_match_percentage: 70,
    skill_scores: [
      { name: "Technical Knowledge", score: 3.5 },
      { name: "Communication", score: 4.0 },
      { name: "Problem Solving", score: 3.5 }
    ],
    question_feedback: [],
    created_at: new Date().toISOString()
  };
  
  return await db.createAssessment(placeholderAssessment);
}

// Assessments routes
app.get('/api/interviews/:id/assessment', async (req, res) => {
  try {
    const interviewId = req.params.id;
    
    // Check if assessment exists
    let assessment = await db.getAssessmentByInterviewId(interviewId);
    
    // If no assessment exists, create a placeholder
    if (!assessment) {
      const placeholderAssessment = {
        interview_id: interviewId,
        overall_assessment: "Assessment is being generated...",
        strengths: [],
        improvements: [],
        job_match_percentage: 0,
        skill_scores: [],
        question_feedback: [],
        created_at: new Date().toISOString()
      };
      
      assessment = await db.createAssessment(placeholderAssessment);
      
      // Start assessment generation in background
      setTimeout(() => {
        generateAssessment(interviewId).catch(error => 
          console.error(`Error generating assessment for interview ${interviewId}:`, error)
        );
      }, 0);
    }
    
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    res.status(200).json(assessment);
  } catch (error) {
    console.error(`Error fetching assessment for interview ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch assessment' });
  }
});

// File upload handler for resumes and audio files
app.post('/api/upload', (req, res) => {
  const form = new formidable.IncomingForm();
  
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      return res.status(500).json({ error: 'Failed to upload file' });
    }
    
    try {
      // In a production environment, this would upload to a storage service like S3
      // and then store the URL in Supabase
      
      // For now, we'll simulate this with a placeholder URL
      const fileId = uuidv4();
      const fileName = files.file ? files.file.originalFilename : 'file';
      const fileUrl = `https://storage.example.com/${fileId}-${fileName}`;
      
      // If this is a resume upload and we have a candidate ID, we would parse it
      if (fields.type === 'resume' && fields.candidateId) {
        // In a production environment, this would use a document parsing service
        // to extract information from the resume
        
        // Simulate parsed resume data
        const parsedData = {
          skills: ["Generated from resume parsing"],
          experience: [{ company: "Example Company", role: "Example Role" }],
          education: [{ institution: "Example University" }]
        };
        
        // Update candidate with resume URL and parsed data
        await db.updateCandidateResume(fields.candidateId, fileUrl, parsedData);
      }
      
      res.status(200).json({ url: fileUrl });
    } catch (error) {
      console.error('Error processing upload:', error);
      res.status(500).json({ error: 'Failed to process upload' });
    }
  });
});

// Export the Express API
module.exports = app; 