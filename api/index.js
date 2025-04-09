// Main API entry point for Vercel serverless functions
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { OpenAI } = require('openai');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configure multer for file uploads (using memory storage for serverless)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '0.2.0',
    message: 'HR Candidate Filtering API is running'
  });
});

// Companies endpoints
app.get('/api/companies', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*');

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/companies', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Company name is required' });
    }

    const { data, error } = await supabase
      .from('companies')
      .insert([{ name }])
      .select();

    if (error) throw error;

    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Jobs endpoints
app.get('/api/jobs', async (req, res) => {
  try {
    const { search, page = 1, limit = 10, company_id } = req.query;
    const pageSize = parseInt(limit);
    const offset = (parseInt(page) - 1) * pageSize;

    // Build the query
    let query = supabase
      .from('job_descriptions')
      .select(`
        *,
        companies:company_id (*)
      `);

    // Apply filters if provided
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (company_id) {
      query = query.eq('company_id', company_id);
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('job_descriptions')
      .count();

    if (countError) throw countError;

    // Apply pagination
    query = query.range(offset, offset + pageSize - 1);

    // Execute the query
    const { data, error } = await query;

    if (error) throw error;

    res.json({
      jobs: data,
      pagination: {
        total: count,
        page: parseInt(page),
        pageSize,
        totalPages: Math.ceil(count / pageSize)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('job_descriptions')
      .select(`
        *,
        companies:company_id (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Job not found' });
      }
      throw error;
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/jobs', async (req, res) => {
  try {
    const { company_id, title, description, department, required_skills, soft_skills_priorities } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const { data, error } = await supabase
      .from('job_descriptions')
      .insert([{
        company_id,
        title,
        description,
        department,
        required_skills,
        soft_skills_priorities
      }])
      .select();

    if (error) throw error;

    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Candidates endpoints
app.get('/api/candidates', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('candidates')
      .select('*');

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/candidates', async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const { data, error } = await supabase
      .from('candidates')
      .insert([{ name, email }])
      .select();

    if (error) throw error;

    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Job Applications endpoints
app.post('/api/applications', upload.single('resume'), async (req, res) => {
  try {
    const { job_id, name, email, phone, linkedin, github, cover_letter, skills } = req.body;

    if (!job_id || !name || !email || !phone || !req.file) {
      return res.status(400).json({
        error: 'Job ID, candidate name, email, phone, and resume file are required'
      });
    }

    // First, create or get the candidate
    let candidate;
    const { data: existingCandidates, error: candidateError } = await supabase
      .from('candidates')
      .select('*')
      .eq('email', email)
      .limit(1);

    if (candidateError) throw candidateError;

    if (existingCandidates.length > 0) {
      // Update existing candidate with new information
      const { data: updatedCandidate, error: updateError } = await supabase
        .from('candidates')
        .update({
          name,
          phone,
          linkedin,
          github
        })
        .eq('email', email)
        .select();

      if (updateError) throw updateError;
      candidate = updatedCandidate[0];
    } else {
      // Create new candidate
      const { data: newCandidate, error: createError } = await supabase
        .from('candidates')
        .insert([{
          name,
          email,
          phone,
          linkedin,
          github
        }])
        .select();

      if (createError) throw createError;
      candidate = newCandidate[0];
    }

    // Upload resume to Supabase Storage
    const fileExt = path.extname(req.file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = `${candidate.id}/${fileName}`;

    const { error: uploadError } = await supabase
      .storage
      .from('resumes')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
      });

    if (uploadError) throw uploadError;

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase
      .storage
      .from('resumes')
      .getPublicUrl(filePath);

    // Parse resume using OpenAI
    let resumeData = {};
    if (fileExt.toLowerCase() === '.pdf' || fileExt.toLowerCase() === '.docx' || fileExt.toLowerCase() === '.txt') {
      try {
        // For simplicity, we're assuming the file content can be processed directly
        // In a real implementation, you'd need to extract text from PDFs/DOCXs
        const resumeText = req.file.buffer.toString('utf-8');

        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are a professional resume analyzer. Extract structured data from the resume.`
            },
            {
              role: "user",
              content: `Extract the following information from this resume text and return it as JSON:
              {
                "skills": ["skill1", "skill2", ...],
                "experience": [
                  {"title": "Job Title", "company": "Company Name", "duration": "X years", "description": "Brief summary"}
                ],
                "education": [
                  {"degree": "Degree Name", "institution": "Institution Name", "year": "Year"}
                ]
              }

              Resume text:
              ${resumeText}`
            }
          ],
          response_format: { type: "json_object" }
        });

        resumeData = JSON.parse(completion.choices[0].message.content);
      } catch (parseError) {
        console.error('Error parsing resume:', parseError);
        resumeData = {
          skills: [],
          experience: [],
          education: []
        };
      }
    }

    // Update candidate with resume URL and parsed data
    const { error: updateError } = await supabase
      .from('candidates')
      .update({
        resume_url: publicUrl,
        resume_parsed: resumeData
      })
      .eq('id', candidate.id);

    if (updateError) throw updateError;

    // Parse skills if provided
    let parsedSkills = [];
    if (skills) {
      try {
        parsedSkills = JSON.parse(skills);
      } catch (e) {
        console.error('Error parsing skills:', e);
      }
    }

    // Create job application
    const { data: application, error: applicationError } = await supabase
      .from('job_applications')
      .insert([{
        job_id,
        candidate_id: candidate.id,
        status: 'pending',
        resume_url: publicUrl,
        cover_letter: cover_letter || null,
        skills: parsedSkills.length > 0 ? parsedSkills : null
      }])
      .select();

    if (applicationError) throw applicationError;

    // Analyze the application against job requirements
    const { data: jobData, error: jobError } = await supabase
      .from('job_descriptions')
      .select('*')
      .eq('id', job_id)
      .limit(1);

    if (jobError) throw jobError;

    if (jobData.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = jobData[0];

    // Analyze match between candidate and job
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an unbiased professional skills assessor.`
          },
          {
            role: "user",
            content: `
            Job Description:
            ${job.description}

            Required Skills:
            ${JSON.stringify(job.required_skills)}

            Candidate Resume Data:
            ${JSON.stringify(resumeData)}

            Analyze how well this candidate matches the job requirements. For each key skill or requirement, assign a score from 0-100.
            Return your analysis as JSON in this format:
            {
              "overall_match_score": 85,
              "skill_scores": [
                {"skill": "skill_name", "score": 90, "evidence": "evidence from resume"}
              ],
              "strengths": ["strength1", "strength2"],
              "gaps": ["gap1", "gap2"],
              "recommendation": "brief recommendation"
            }
            `
          }
        ],
        response_format: { type: "json_object" }
      });

      const analysisResults = JSON.parse(completion.choices[0].message.content);

      // Update application with analysis results
      const { error: analysisError } = await supabase
        .from('job_applications')
        .update({
          analysis_results: analysisResults,
          match_score: analysisResults.overall_match_score
        })
        .eq('id', application[0].id);

      if (analysisError) throw analysisError;

      res.status(201).json({
        message: 'Application submitted and analyzed successfully',
        application: {
          ...application[0],
          analysis_results: analysisResults
        }
      });
    } catch (analysisError) {
      console.error('Error analyzing application:', analysisError);

      // Still return success but note the analysis failed
      res.status(201).json({
        message: 'Application submitted successfully, but analysis failed',
        application: application[0]
      });
    }
  } catch (error) {
    console.error('Error processing application:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get applications for a job
app.get('/api/jobs/:jobId/applications', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status, minScore, page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    const pageSize = parseInt(limit);
    const offset = (parseInt(page) - 1) * pageSize;

    // Verify the job exists
    const { data: jobData, error: jobError } = await supabase
      .from('job_descriptions')
      .select('id, title')
      .eq('id', jobId)
      .single();

    if (jobError) {
      if (jobError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Job not found' });
      }
      throw jobError;
    }

    // Build the query
    let query = supabase
      .from('job_applications')
      .select(`
        *,
        candidates:candidate_id (*),
        job:job_id (*)
      `)
      .eq('job_id', jobId);

    // Apply filters if provided
    if (status) {
      query = query.eq('status', status);
    }

    if (minScore) {
      query = query.gte('match_score', parseInt(minScore));
    }

    // Get total count for pagination
    const countQuery = supabase
      .from('job_applications')
      .select('id', { count: 'exact', head: true })
      .eq('job_id', jobId);

    // Apply the same filters to the count query
    if (status) {
      countQuery.eq('status', status);
    }

    if (minScore) {
      countQuery.gte('match_score', parseInt(minScore));
    }

    const { count, error: countError } = await countQuery;

    if (countError) throw countError;

    // Apply sorting and pagination
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })
                .range(offset, offset + pageSize - 1);

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      job: jobData,
      applications: data,
      pagination: {
        total: count,
        page: parseInt(page),
        pageSize,
        totalPages: Math.ceil(count / pageSize)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single application
app.get('/api/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        candidates:candidate_id (*),
        job:job_id (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Application not found' });
      }
      throw error;
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update application status
app.patch('/api/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const { data, error } = await supabase
      .from('job_applications')
      .update({ status, notes })
      .eq('id', id)
      .select();

    if (error) throw error;

    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Interview endpoints (optional feature)
app.post('/api/applications/:id/interview', async (req, res) => {
  try {
    const { id } = req.params;

    // Get the application
    const { data: applications, error: appError } = await supabase
      .from('job_applications')
      .select(`
        *,
        job:job_id (*)
      `)
      .eq('id', id)
      .limit(1);

    if (appError) throw appError;

    if (applications.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const application = applications[0];

    // Create an interview
    const { data: interview, error: interviewError } = await supabase
      .from('interviews')
      .insert([{
        job_id: application.job_id,
        candidate_id: application.candidate_id,
        status: 'pending'
      }])
      .select();

    if (interviewError) throw interviewError;

    // Generate questions based on job and candidate
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert interview question generator.`
          },
          {
            role: "user",
            content: `
            Generate 5 interview questions for this job and candidate.

            Job Description:
            ${application.job.description}

            Required Skills:
            ${JSON.stringify(application.job.required_skills)}

            Analysis of Candidate:
            ${JSON.stringify(application.analysis_results)}

            Return the questions as JSON in this format:
            [
              {
                "text": "question text",
                "type": "technical|behavioral",
                "skill_assessed": "skill being assessed"
              }
            ]

            Include a mix of technical and behavioral questions. Focus on areas where the candidate might have gaps.
            `
          }
        ],
        response_format: { type: "json_object" }
      });

      const questions = JSON.parse(completion.choices[0].message.content);

      // Insert questions
      const questionsToInsert = questions.map((q, index) => ({
        interview_id: interview[0].id,
        text: q.text,
        type: q.type,
        skill_assessed: q.skill_assessed,
        order_index: index
      }));

      const { data: insertedQuestions, error: questionError } = await supabase
        .from('questions')
        .insert(questionsToInsert)
        .select();

      if (questionError) throw questionError;

      // Update application status
      await supabase
        .from('job_applications')
        .update({ status: 'interviewing' })
        .eq('id', id);

      res.status(201).json({
        message: 'Interview created successfully',
        interview: interview[0],
        questions: insertedQuestions
      });
    } catch (questionError) {
      console.error('Error generating questions:', questionError);

      // Return basic success even if question generation failed
      res.status(201).json({
        message: 'Interview created, but question generation failed',
        interview: interview[0]
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export the Express API for Vercel
module.exports = app;
