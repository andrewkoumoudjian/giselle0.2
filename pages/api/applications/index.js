import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import analyzeResume from '../../../utils/langgraph/cv_analyzer';

export default async function handler(req, res) {
  // Create authenticated Supabase client
  const supabase = createServerSupabaseClient({ req, res });
  
  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  // Handle GET request (list applications)
  if (req.method === 'GET') {
    try {
      // Parse query parameters
      const {
        page = 1,
        limit = 10,
        status = '',
        sortBy = 'newest',
      } = req.query;
      
      // Calculate pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      // Get user role
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      if (userError) {
        throw userError;
      }
      
      // Build query based on user role
      let query;
      
      if (userData.role === 'jobseeker') {
        // Job seeker can only see their own applications
        query = supabase
          .from('applications')
          .select(`
            id,
            status,
            applied_date,
            match_score,
            job_id,
            jobs (
              id,
              title,
              location,
              job_type,
              salary_min,
              salary_max,
              company_id,
              companies (
                id,
                name,
                logo_url
              )
            )
          `)
          .eq('user_id', session.user.id)
          .range(from, to);
      } else if (userData.role === 'employer') {
        // Employer can see applications for their company's jobs
        const { data: companyUser, error: companyUserError } = await supabase
          .from('company_users')
          .select('company_id')
          .eq('user_id', session.user.id)
          .single();
        
        if (companyUserError) {
          throw companyUserError;
        }
        
        query = supabase
          .from('applications')
          .select(`
            id,
            status,
            applied_date,
            match_score,
            job_id,
            user_id,
            jobs (
              id,
              title,
              location,
              job_type,
              company_id
            ),
            profiles:user_id (
              id,
              name,
              email,
              phone,
              location
            )
          `)
          .eq('jobs.company_id', companyUser.company_id)
          .range(from, to);
      } else {
        return res.status(403).json({ message: 'Not authorized to view applications' });
      }
      
      // Add status filter
      if (status) {
        query = query.eq('status', status);
      }
      
      // Add sorting
      if (sortBy === 'newest') {
        query = query.order('applied_date', { ascending: false });
      } else if (sortBy === 'oldest') {
        query = query.order('applied_date', { ascending: true });
      } else if (sortBy === 'match-high') {
        query = query.order('match_score', { ascending: false });
      } else if (sortBy === 'match-low') {
        query = query.order('match_score', { ascending: true });
      }
      
      // Execute query
      const { data: applications, error } = await query;
      
      if (error) {
        throw error;
      }
      
      // Get total count for pagination
      let countQuery;
      
      if (userData.role === 'jobseeker') {
        countQuery = supabase
          .from('applications')
          .select('id', { count: 'exact' })
          .eq('user_id', session.user.id);
      } else if (userData.role === 'employer') {
        const { data: companyUser } = await supabase
          .from('company_users')
          .select('company_id')
          .eq('user_id', session.user.id)
          .single();
        
        countQuery = supabase
          .from('applications')
          .select('id', { count: 'exact' })
          .eq('jobs.company_id', companyUser.company_id);
      }
      
      // Add status filter to count query
      if (status) {
        countQuery = countQuery.eq('status', status);
      }
      
      const { count, error: countError } = await countQuery;
      
      if (countError) {
        throw countError;
      }
      
      // Format applications data
      const formattedApplications = applications.map(app => {
        if (userData.role === 'jobseeker') {
          return {
            id: app.id,
            status: app.status,
            applied_date: app.applied_date,
            match_score: app.match_score,
            job_id: app.job_id,
            job_title: app.jobs?.title || 'Unknown Job',
            company_name: app.jobs?.companies?.name || 'Unknown Company',
            company_logo: app.jobs?.companies?.logo_url || null,
            location: app.jobs?.location || 'Unknown Location',
            job_type: app.jobs?.job_type || 'Unknown Type',
            salary_range: app.jobs?.salary_min && app.jobs?.salary_max
              ? `$${app.jobs.salary_min.toLocaleString()} - $${app.jobs.salary_max.toLocaleString()}`
              : null,
          };
        } else {
          return {
            id: app.id,
            status: app.status,
            applied_date: app.applied_date,
            match_score: app.match_score,
            job_id: app.job_id,
            job_title: app.jobs?.title || 'Unknown Job',
            candidate: {
              id: app.profiles?.id || 'Unknown',
              name: app.profiles?.name || 'Unknown Candidate',
              email: app.profiles?.email || 'Unknown Email',
              phone: app.profiles?.phone || null,
              location: app.profiles?.location || null,
            },
          };
        }
      });
      
      // Return applications with pagination info
      return res.status(200).json({
        applications: formattedApplications,
        pagination: {
          totalItems: count,
          totalPages: Math.ceil(count / limit),
          currentPage: parseInt(page),
          itemsPerPage: parseInt(limit),
        },
      });
    } catch (error) {
      console.error('Error fetching applications:', error);
      return res.status(500).json({ message: 'Error fetching applications' });
    }
  }
  
  // Handle POST request (create application)
  if (req.method === 'POST') {
    try {
      // Check if user is a job seeker
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('role, resume_url, resume_text')
        .eq('id', session.user.id)
        .single();
      
      if (userError) {
        throw userError;
      }
      
      if (userData.role !== 'jobseeker') {
        return res.status(403).json({ message: 'Only job seekers can apply for jobs' });
      }
      
      // Parse request body
      const {
        jobId,
        coverLetter,
        resumeAnalysis,
        customQuestions,
        useProfileResume = true,
      } = req.body;
      
      // Validate required fields
      if (!jobId) {
        return res.status(400).json({ message: 'Job ID is required' });
      }
      
      // Check if job exists
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
      
      if (jobError) {
        if (jobError.code === 'PGRST116') {
          return res.status(404).json({ message: 'Job not found' });
        }
        throw jobError;
      }
      
      // Check if user has already applied for this job
      const { data: existingApplication, error: existingError } = await supabase
        .from('applications')
        .select('id')
        .eq('job_id', jobId)
        .eq('user_id', session.user.id)
        .single();
      
      if (!existingError && existingApplication) {
        return res.status(400).json({ message: 'You have already applied for this job' });
      }
      
      // Get resume analysis if not provided
      let analysis = resumeAnalysis;
      
      if (!analysis && useProfileResume && userData.resume_text) {
        // Format job details for analysis
        const jobDetails = {
          id: job.id,
          title: job.title,
          description: job.description,
          experience_level: job.experience_level,
          education: job.education,
          skills: job.job_skills.map(s => s.skill),
        };
        
        // Analyze resume
        analysis = await analyzeResume(userData.resume_text, jobDetails);
      }
      
      // Create application
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .insert({
          job_id: jobId,
          user_id: session.user.id,
          status: 'pending',
          applied_date: new Date().toISOString(),
          cover_letter: coverLetter || null,
          resume_url: useProfileResume ? userData.resume_url : null,
          match_score: analysis?.match_score || null,
          skills_matched: analysis?.skills?.matched || null,
          skills_missing: analysis?.skills?.missing || null,
          custom_questions: customQuestions || null,
        })
        .select()
        .single();
      
      if (applicationError) {
        throw applicationError;
      }
      
      return res.status(201).json({
        message: 'Application submitted successfully',
        application_id: application.id,
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      return res.status(500).json({ message: 'Error submitting application' });
    }
  }
  
  // Handle unsupported methods
  return res.status(405).json({ message: 'Method not allowed' });
}
