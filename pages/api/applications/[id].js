import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  // Get application ID from query
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ message: 'Application ID is required' });
  }
  
  // Create authenticated Supabase client
  const supabase = createServerSupabaseClient({ req, res });
  
  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  // Handle GET request (get application details)
  if (req.method === 'GET') {
    try {
      // Get application details
      const { data: application, error } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          applied_date,
          cover_letter,
          resume_url,
          match_score,
          skills_matched,
          skills_missing,
          custom_questions,
          job_id,
          user_id,
          jobs (
            id,
            title,
            description,
            location,
            job_type,
            salary_min,
            salary_max,
            experience_level,
            education,
            department,
            posted_date,
            closing_date,
            company_id,
            companies (
              id,
              name,
              logo_url,
              description,
              website,
              location,
              size,
              industry
            ),
            job_skills (
              skill,
              importance
            )
          ),
          profiles:user_id (
            id,
            name,
            email,
            phone,
            location,
            linkedin_url,
            github_url,
            portfolio_url,
            bio
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ message: 'Application not found' });
        }
        throw error;
      }
      
      // Check if user is authorized to view this application
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      if (userError) {
        throw userError;
      }
      
      if (userData.role === 'jobseeker' && application.user_id !== session.user.id) {
        return res.status(403).json({ message: 'Not authorized to view this application' });
      } else if (userData.role === 'employer') {
        // Check if employer is associated with the job's company
        const { data: companyUser, error: companyUserError } = await supabase
          .from('company_users')
          .select('company_id')
          .eq('user_id', session.user.id)
          .single();
        
        if (companyUserError) {
          throw companyUserError;
        }
        
        if (application.jobs.company_id !== companyUser.company_id) {
          return res.status(403).json({ message: 'Not authorized to view this application' });
        }
      }
      
      // Format application data
      const formattedApplication = {
        id: application.id,
        status: application.status,
        applied_date: application.applied_date,
        cover_letter: application.cover_letter,
        resume_url: application.resume_url,
        match_score: application.match_score,
        skills: {
          matched: application.skills_matched || [],
          missing: application.skills_missing || [],
        },
        custom_questions: application.custom_questions || {},
        job: {
          id: application.jobs.id,
          title: application.jobs.title,
          description: application.jobs.description,
          location: application.jobs.location,
          job_type: application.jobs.job_type,
          salary_range: application.jobs.salary_min && application.jobs.salary_max
            ? `$${application.jobs.salary_min.toLocaleString()} - $${application.jobs.salary_max.toLocaleString()}`
            : null,
          experience_level: application.jobs.experience_level,
          education: application.jobs.education,
          department: application.jobs.department,
          posted_date: application.jobs.posted_date,
          closing_date: application.jobs.closing_date,
          skills: application.jobs.job_skills?.map(skill => skill.skill) || [],
          company: {
            id: application.jobs.companies.id,
            name: application.jobs.companies.name,
            logo_url: application.jobs.companies.logo_url,
            description: application.jobs.companies.description,
            website: application.jobs.companies.website,
            location: application.jobs.companies.location,
            size: application.jobs.companies.size,
            industry: application.jobs.companies.industry,
          },
        },
        candidate: {
          id: application.profiles.id,
          name: application.profiles.name,
          email: application.profiles.email,
          phone: application.profiles.phone,
          location: application.profiles.location,
          linkedin_url: application.profiles.linkedin_url,
          github_url: application.profiles.github_url,
          portfolio_url: application.profiles.portfolio_url,
          bio: application.profiles.bio,
        },
      };
      
      return res.status(200).json(formattedApplication);
    } catch (error) {
      console.error('Error fetching application details:', error);
      return res.status(500).json({ message: 'Error fetching application details' });
    }
  }
  
  // Handle PATCH request (update application status)
  if (req.method === 'PATCH') {
    try {
      // Check if user is an employer
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      if (userError) {
        throw userError;
      }
      
      if (userData.role !== 'employer') {
        return res.status(403).json({ message: 'Only employers can update application status' });
      }
      
      // Get application details
      const { data: application, error } = await supabase
        .from('applications')
        .select(`
          id,
          job_id,
          jobs (
            company_id
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ message: 'Application not found' });
        }
        throw error;
      }
      
      // Check if employer is associated with the job's company
      const { data: companyUser, error: companyUserError } = await supabase
        .from('company_users')
        .select('company_id, role')
        .eq('user_id', session.user.id)
        .single();
      
      if (companyUserError) {
        throw companyUserError;
      }
      
      if (application.jobs.company_id !== companyUser.company_id) {
        return res.status(403).json({ message: 'Not authorized to update this application' });
      }
      
      // Parse request body
      const { status, feedback } = req.body;
      
      // Validate status
      const validStatuses = ['pending', 'reviewing', 'interviewing', 'accepted', 'rejected'];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      
      // Update application
      const { data: updatedApplication, error: updateError } = await supabase
        .from('applications')
        .update({
          status,
          feedback: feedback || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (updateError) {
        throw updateError;
      }
      
      return res.status(200).json({
        message: 'Application status updated successfully',
        application_id: updatedApplication.id,
        status: updatedApplication.status,
      });
    } catch (error) {
      console.error('Error updating application status:', error);
      return res.status(500).json({ message: 'Error updating application status' });
    }
  }
  
  // Handle unsupported methods
  return res.status(405).json({ message: 'Method not allowed' });
}
