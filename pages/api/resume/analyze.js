import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import formidable from 'formidable';
import fs from 'fs';
import analyzeResume from '../../../utils/langgraph/cv_analyzer';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    // Create authenticated Supabase client
    const supabase = createServerSupabaseClient({ req, res });
    
    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Parse form data
    const form = new formidable.IncomingForm();
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });
    
    // Get job ID if provided
    const jobId = fields.jobId?.[0] || null;
    
    // Get resume file
    const resumeFile = files.resume?.[0];
    if (!resumeFile) {
      return res.status(400).json({ message: 'No resume file provided' });
    }
    
    // Read file content
    const fileContent = fs.readFileSync(resumeFile.filepath, 'utf8');
    
    // Get job details if jobId is provided
    let jobDetails = null;
    if (jobId) {
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          description,
          experience_level,
          education,
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
          experience_level: job.experience_level,
          education: job.education,
          skills: job.job_skills.map(s => s.skill),
        };
      }
    }
    
    // Analyze resume using LangGraph
    const analysisResult = await analyzeResume(fileContent, jobDetails);
    
    // If the user is a job seeker and jobId is provided, save the resume to their profile
    if (session.user.role === 'jobseeker' && resumeFile) {
      try {
        // Upload the resume to Supabase Storage
        const fileName = `${Date.now()}-${resumeFile.originalFilename}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(`${session.user.id}/${fileName}`, fs.readFileSync(resumeFile.filepath), {
            contentType: resumeFile.mimetype,
            upsert: true,
          });
        
        if (!uploadError) {
          // Get the public URL
          const { data: urlData } = await supabase.storage
            .from('resumes')
            .getPublicUrl(`${session.user.id}/${fileName}`);
          
          // Update user profile with resume URL
          if (urlData) {
            await supabase
              .from('profiles')
              .update({ resume_url: urlData.publicUrl })
              .eq('id', session.user.id);
          }
        }
      } catch (storageError) {
        console.error('Error saving resume to storage:', storageError);
        // Continue anyway, the analysis was successful
      }
    }
    
    // Return analysis result
    return res.status(200).json(analysisResult);
  } catch (error) {
    console.error('Error analyzing resume:', error);
    return res.status(500).json({ message: 'Error analyzing resume' });
  }
}
