import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

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
  
  // Handle GET request (list jobs)
  if (req.method === 'GET') {
    try {
      // Parse query parameters
      const {
        page = 1,
        limit = 10,
        search = '',
        location = '',
        jobType = '',
        sortBy = 'newest',
      } = req.query;
      
      // Calculate pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      // Build query
      let query = supabase
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
            logo_url
          ),
          job_skills (
            skill,
            importance
          )
        `)
        .eq('status', 'active')
        .range(from, to);
      
      // Add search filter
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }
      
      // Add location filter
      if (location) {
        query = query.ilike('location', `%${location}%`);
      }
      
      // Add job type filter
      if (jobType) {
        query = query.eq('job_type', jobType);
      }
      
      // Add sorting
      if (sortBy === 'newest') {
        query = query.order('posted_date', { ascending: false });
      } else if (sortBy === 'oldest') {
        query = query.order('posted_date', { ascending: true });
      } else if (sortBy === 'salary-high') {
        query = query.order('salary_max', { ascending: false });
      } else if (sortBy === 'salary-low') {
        query = query.order('salary_min', { ascending: true });
      }
      
      // Execute query
      const { data: jobs, error } = await query;
      
      if (error) {
        throw error;
      }
      
      // Get total count for pagination
      const { count, error: countError } = await supabase
        .from('jobs')
        .select('id', { count: 'exact' })
        .eq('status', 'active');
      
      if (countError) {
        throw countError;
      }
      
      // Format jobs data
      const formattedJobs = jobs.map(job => ({
        id: job.id,
        title: job.title,
        company: job.companies?.name || 'Unknown Company',
        company_logo: job.companies?.logo_url || null,
        location: job.location,
        job_type: job.job_type,
        salary_range: job.salary_min && job.salary_max
          ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
          : null,
        experience_level: job.experience_level,
        posted_date: job.posted_date,
        closing_date: job.closing_date,
        skills: job.job_skills?.map(skill => skill.skill) || [],
      }));
      
      // Return jobs with pagination info
      return res.status(200).json({
        jobs: formattedJobs,
        pagination: {
          totalItems: count,
          totalPages: Math.ceil(count / limit),
          currentPage: parseInt(page),
          itemsPerPage: parseInt(limit),
        },
      });
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return res.status(500).json({ message: 'Error fetching jobs' });
    }
  }
  
  // Handle POST request (create job)
  if (req.method === 'POST') {
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
        return res.status(403).json({ message: 'Not authorized to create jobs' });
      }
      
      // Get company ID for the employer
      const { data: companyUser, error: companyUserError } = await supabase
        .from('company_users')
        .select('company_id')
        .eq('user_id', session.user.id)
        .single();
      
      if (companyUserError) {
        throw companyUserError;
      }
      
      if (!companyUser) {
        return res.status(400).json({ message: 'No company associated with this user' });
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
        skills,
      } = req.body;
      
      // Validate required fields
      if (!title || !description || !location || !job_type) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      // Create job
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .insert({
          title,
          description,
          location,
          job_type,
          salary_min,
          salary_max,
          experience_level,
          education,
          department,
          posted_date: new Date().toISOString(),
          closing_date: closing_date || null,
          status: 'active',
          company_id: companyUser.company_id,
          created_by: session.user.id,
        })
        .select()
        .single();
      
      if (jobError) {
        throw jobError;
      }
      
      // Add skills if provided
      if (skills && Array.isArray(skills) && skills.length > 0) {
        const skillsToInsert = skills.map(skill => ({
          job_id: job.id,
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
      
      return res.status(201).json({
        message: 'Job created successfully',
        job_id: job.id,
      });
    } catch (error) {
      console.error('Error creating job:', error);
      return res.status(500).json({ message: 'Error creating job' });
    }
  }
  
  // Handle unsupported methods
  return res.status(405).json({ message: 'Method not allowed' });
}
