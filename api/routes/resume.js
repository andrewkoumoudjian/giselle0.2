const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { authenticateToken } = require('../middleware/auth');
const { analyzeResume } = require('../lib/openrouter');
const supabase = require('../lib/supabase');

// Configure multer for file uploads (using memory storage for serverless)
const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * @route POST /api/resume/analyze
 * @description Analyze a resume and optionally match it with a job
 * @access Private
 */
router.post('/analyze', authenticateToken, upload.single('resume'), async (req, res) => {
  try {
    const { file } = req;
    const { jobId } = req.body;
    
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Create a temporary file
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `${uuidv4()}-${file.originalname}`);
    fs.writeFileSync(tempFilePath, file.buffer);
    
    // Read the file content
    let resumeText;
    try {
      resumeText = fs.readFileSync(tempFilePath, 'utf8');
    } catch (error) {
      // If reading as text fails, it might be a PDF or other format
      // In a real app, we would use a library like pdf-parse or docx-parser
      resumeText = `[File content could not be read as text. File type: ${file.mimetype}]`;
    }
    
    // Get job details if jobId is provided
    let jobDetails = null;
    if (jobId) {
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          description,
          job_skills (
            skill,
            importance
          )
        `)
        .eq('id', jobId)
        .single();
      
      if (!jobError && job) {
        jobDetails = {
          id: job.id,
          title: job.title,
          description: job.description,
          skills: job.job_skills.map(s => s.skill),
        };
      }
    }
    
    // Analyze the resume
    const analysisResult = await analyzeResume(resumeText, jobDetails);
    
    // Clean up the temporary file
    fs.unlinkSync(tempFilePath);
    
    // If the user is a job seeker and jobId is provided, save the resume to their profile
    if (req.user.role === 'jobseeker' && file) {
      try {
        // Upload the resume to Supabase Storage
        const fileName = `${uuidv4()}-${file.originalname}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(`${req.user.id}/${fileName}`, file.buffer, {
            contentType: file.mimetype,
            upsert: true,
          });
        
        if (!uploadError) {
          // Get the public URL
          const { data: urlData } = await supabase.storage
            .from('resumes')
            .getPublicUrl(`${req.user.id}/${fileName}`);
          
          // Update user profile with resume URL
          if (urlData) {
            await supabase
              .from('user_profiles')
              .update({ resume_url: urlData.publicUrl })
              .eq('id', req.user.id);
          }
        }
      } catch (storageError) {
        console.error('Error saving resume to storage:', storageError);
        // Continue anyway, the analysis was successful
      }
    }
    
    return res.status(200).json(analysisResult);
  } catch (error) {
    console.error('Error analyzing resume:', error);
    return res.status(500).json({ message: 'Error analyzing resume' });
  }
});

module.exports = router;
