import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req, res) {
  // Get job ID from query
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ message: 'Job ID is required' });
  }
  
  // Create authenticated Supabase client
  const supabase = createServerSupabaseClient({ req, res });
  
  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  // Handle GET request (get job details)
  if (req.method === 'GET') {
    try {
      // Get job details
      const { data: job, error } = await supabase
        .from('jobs')
        .select(`
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
          status,
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
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ message: 'Job not found' });
        }
        throw error;
      }
      
      // Get application count
      const { count: applicationCount, error: countError } = await supabase
        .from('applications')
        .select('id', { count: 'exact' })
        .eq('job_id', id);
      
      if (countError) {
        throw countError;
      }
      
      // Increment view count
      await supabase.rpc('increment_job_views', { job_id: id });
      
      // Format job data
      const formattedJob = {
        id: job.id,
        title: job.title,
        description: job.description,
        company: job.companies?.name || 'Unknown Company',
        company_logo: job.companies?.logo_url || null,
        company_description: job.companies?.description || null,
        company_website: job.companies?.website || null,
        company_location: job.companies?.location || null,
        company_size: job.companies?.size || null,
        company_industry: job.companies?.industry || null,
        location: job.location,
        job_type: job.job_type,
        salary_range: job.salary_min && job.salary_max
          ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
          : null,
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        experience_level: job.experience_level,
        education: job.education,
        department: job.department,
        posted_date: job.posted_date,
        closing_date: job.closing_date,
        skills: job.job_skills?.map(skill => skill.skill) || [],
        application_count: applicationCount,
      };
      
      // Get job match score if user is authenticated and is a job seeker
      if (session && session.user) {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (!userError && userData.role === 'jobseeker') {
          // Check if user has applied for this job
          const { data: application, error: applicationError } = await supabase
            .from('applications')
            .select('id')
            .eq('job_id', id)
            .eq('user_id', session.user.id)
            .single();
          
          if (!applicationError && application) {
            formattedJob.has_applied = true;
          }
          
          // Get user's resume for matching
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('resume_text, skills')
            .eq('id', session.user.id)
            .single();
          
          if (!profileError && profile && (profile.resume_text || profile.skills)) {
            // Calculate match score based on skills
            const userSkills = profile.skills || [];
            const jobSkills = formattedJob.skills || [];
            
            if (jobSkills.length > 0 && userSkills.length > 0) {
              const matchedSkills = [];
              const missingSkills = [];
              
              for (const skill of jobSkills) {
                const found = userSkills.some(s => 
                  s.toLowerCase().includes(skill.toLowerCase()) || 
                  skill.toLowerCase().includes(s.toLowerCase())
                );
                
                if (found) {
                  matchedSkills.push(skill);
                } else {
                  missingSkills.push(skill);
                }
              }
              
              const matchScore = Math.round((matchedSkills.length / jobSkills.length) * 100);
              
              formattedJob.match = {
                score: matchScore,
                matched_skills: matchedSkills,
                missing_skills: missingSkills,
              };
            }
          }
        }
      }
      
      return res.status(200).json(formattedJob);
    } catch (error) {
      console.error('Error fetching job details:', error);
      return res.status(500).json({ message: 'Error fetching job details' });
    }
  }
  
  // Handle PATCH request (update job)
  if (req.method === 'PATCH') {
    try {
      // Check if user is authenticated
      if (!session) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      // Check if user is authorized to update this job
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('created_by, company_id')
        .eq('id', id)
        .single();
      
      if (jobError) {
        if (jobError.code === 'PGRST116') {
          return res.status(404).json({ message: 'Job not found' });
        }
        throw jobError;
      }
      
      // Check if user is the creator of the job or a company admin
      const { data: companyUser, error: companyUserError } = await supabase
        .from('company_users')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('company_id', job.company_id)
        .single();
      
      if (job.created_by !== session.user.id && (!companyUser || companyUser.role !== 'admin')) {
        return res.status(403).json({ message: 'Not authorized to update this job' });
      }
      
      // Parse request body
      const {
        title,
        description,
        location,
        job_type,
        salary_min,
        salary_max,
        experience_level,
        education,
        department,
        closing_date,
        status,
        skills,
      } = req.body;
      
      // Update job
      const { data: updatedJob, error: updateError } = await supabase
        .from('jobs')
        .update({
          title,
          description,
          location,
          job_type,
          salary_min,
          salary_max,
          experience_level,
          education,
          department,
          closing_date,
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (updateError) {
        throw updateError;
      }
      
      // Update skills if provided
      if (skills && Array.isArray(skills)) {
        // First, delete existing skills
        const { error: deleteError } = await supabase
          .from('job_skills')
          .delete()
          .eq('job_id', id);
        
        if (deleteError) {
          throw deleteError;
        }
        
        // Then, insert new skills
        if (skills.length > 0) {
          const skillsToInsert = skills.map(skill => ({
            job_id: id,
            skill: skill.name,
            importance: skill.importance || 'preferred',
          }));
          
          const { error: skillsError } = await supabase
            .from('job_skills')
            .insert(skillsToInsert);
          
          if (skillsError) {
            throw skillsError;
          }
        }
      }
      
      return res.status(200).json({
        message: 'Job updated successfully',
        job_id: updatedJob.id,
      });
    } catch (error) {
      console.error('Error updating job:', error);
      return res.status(500).json({ message: 'Error updating job' });
    }
  }
  
  // Handle DELETE request (delete job)
  if (req.method === 'DELETE') {
    try {
      // Check if user is authenticated
      if (!session) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      // Check if user is authorized to delete this job
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('created_by, company_id')
        .eq('id', id)
        .single();
      
      if (jobError) {
        if (jobError.code === 'PGRST116') {
          return res.status(404).json({ message: 'Job not found' });
        }
        throw jobError;
      }
      
      // Check if user is the creator of the job or a company admin
      const { data: companyUser, error: companyUserError } = await supabase
        .from('company_users')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('company_id', job.company_id)
        .single();
      
      if (job.created_by !== session.user.id && (!companyUser || companyUser.role !== 'admin')) {
        return res.status(403).json({ message: 'Not authorized to delete this job' });
      }
      
      // Delete job skills
      const { error: skillsError } = await supabase
        .from('job_skills')
        .delete()
        .eq('job_id', id);
      
      if (skillsError) {
        throw skillsError;
      }
      
      // Delete job
      const { error: deleteError } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        throw deleteError;
      }
      
      return res.status(200).json({
        message: 'Job deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting job:', error);
      return res.status(500).json({ message: 'Error deleting job' });
    }
  }
  
  // Handle unsupported methods
  return res.status(405).json({ message: 'Method not allowed' });
}
