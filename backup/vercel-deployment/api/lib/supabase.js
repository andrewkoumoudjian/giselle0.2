const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Check if environment variables are set
if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials are not set. Using mock data instead.');
}

// Create Supabase client
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Database utility functions
const db = {
  // Candidates
  async getCandidates() {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching candidates:', error);
      return [];
    }
    
    return data;
  },
  
  async getCandidateById(id) {
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error(`Error fetching candidate ${id}:`, error);
      return null;
    }
    
    return data;
  },
  
  async createCandidate(candidate) {
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('candidates')
      .insert([candidate])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating candidate:', error);
      return null;
    }
    
    return data;
  },
  
  async updateCandidateResume(id, resumeUrl, parsedData) {
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('candidates')
      .update({ 
        resume_url: resumeUrl,
        resume_parsed: parsedData
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error(`Error updating candidate ${id} resume:`, error);
      return null;
    }
    
    return data;
  },
  
  // Jobs
  async getJobs() {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }
    
    return data;
  },
  
  async getJobById(id) {
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error(`Error fetching job ${id}:`, error);
      return null;
    }
    
    return data;
  },
  
  async createJob(job) {
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('jobs')
      .insert([job])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating job:', error);
      return null;
    }
    
    return data;
  },
  
  // Interviews
  async getInterviews() {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('interviews')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching interviews:', error);
      return [];
    }
    
    return data;
  },
  
  async getInterviewById(id) {
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('interviews')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error(`Error fetching interview ${id}:`, error);
      return null;
    }
    
    return data;
  },
  
  async createInterview(interview) {
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('interviews')
      .insert([interview])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating interview:', error);
      return null;
    }
    
    return data;
  },
  
  async updateInterviewStatus(id, status, completedAt) {
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('interviews')
      .update({ 
        status,
        completed_at: completedAt
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error(`Error updating interview ${id} status:`, error);
      return null;
    }
    
    return data;
  },
  
  // Questions
  async getInterviewQuestions(interviewId) {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('interview_id', interviewId)
      .order('order_index', { ascending: true });
      
    if (error) {
      console.error(`Error fetching questions for interview ${interviewId}:`, error);
      return [];
    }
    
    return data;
  },
  
  async createQuestions(questions) {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('questions')
      .insert(questions)
      .select();
      
    if (error) {
      console.error('Error creating questions:', error);
      return [];
    }
    
    return data;
  },
  
  // Responses
  async createResponse(response) {
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('responses')
      .insert([response])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating response:', error);
      return null;
    }
    
    return data;
  },
  
  async getInterviewResponses(interviewId) {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('responses')
      .select('*')
      .eq('interview_id', interviewId);
      
    if (error) {
      console.error(`Error fetching responses for interview ${interviewId}:`, error);
      return [];
    }
    
    return data;
  },
  
  // Assessments
  async createAssessment(assessment) {
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('assessments')
      .insert([assessment])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating assessment:', error);
      return null;
    }
    
    return data;
  },
  
  async getAssessmentByInterviewId(interviewId) {
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('interview_id', interviewId)
      .single();
      
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" which is expected
      console.error(`Error fetching assessment for interview ${interviewId}:`, error);
      return null;
    }
    
    return data;
  }
};

module.exports = { supabase, db }; 