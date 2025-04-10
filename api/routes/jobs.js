const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route GET /api/jobs
 * @description Get all jobs with optional filtering
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      location,
      jobType,
      sortBy = 'newest',
      companyId,
    } = req.query;

    // Calculate pagination
    const offset = (page - 1) * limit;
    
    // Start query
    let query = supabase
      .from('jobs')
      .select(`
        *,
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
      .eq('status', 'active');
    
    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }
    
    if (jobType) {
      query = query.eq('job_type', jobType);
    }
    
    if (companyId) {
      query = query.eq('company_id', companyId);
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'newest':
        query = query.order('posted_date', { ascending: false });
        break;
      case 'oldest':
        query = query.order('posted_date', { ascending: true });
        break;
      case 'salary-high':
        query = query.order('salary_max', { ascending: false });
        break;
      case 'salary-low':
        query = query.order('salary_min', { ascending: true });
        break;
      default:
        query = query.order('posted_date', { ascending: false });
    }
    
    // Get total count for pagination
    const { count } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    // Execute query
    const { data: jobs, error } = await query;
    
    if (error) {
      console.error('Error fetching jobs:', error);
      return res.status(500).json({ message: 'Error fetching jobs' });
    }
    
    // Format jobs data
    const formattedJobs = jobs.map(job => {
      // Extract skills from job_skills
      const skills = job.job_skills.map(skill => skill.skill);
      
      // Format job data
      return {
        id: job.id,
        title: job.title,
        company: job.companies.name,
        company_id: job.companies.id,
        company_logo: job.companies.logo_url,
        location: job.location,
        description: job.description,
        job_type: job.job_type,
        salary_range: job.salary_min && job.salary_max 
          ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
          : null,
        experience_level: job.experience_level,
        education: job.education,
        department: job.department,
        posted_date: job.posted_date,
        closing_date: job.closing_date,
        skills,
      };
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(count / limit);
    
    return res.status(200).json({
      jobs: formattedJobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems: count,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Server error in GET /jobs:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/jobs/:id
 * @description Get job by ID
 * @access Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get job data
    const { data: job, error } = await supabase
      .from('jobs')
      .select(`
        *,
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
      console.error('Error fetching job:', error);
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Get application count
    const { count: application_count } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('job_id', id);
    
    // Format job data
    const formattedJob = {
      id: job.id,
      title: job.title,
      company: job.companies.name,
      company_id: job.companies.id,
      company_logo: job.companies.logo_url,
      company_description: job.companies.description,
      company_website: job.companies.website,
      location: job.location,
      description: job.description,
      job_type: job.job_type,
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      salary_range: job.salary_min && job.salary_max 
        ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
        : null,
      experience_level: job.experience_level,
      education: job.education,
      department: job.department,
      posted_date: job.posted_date,
      closing_date: job.closing_date,
      skills: job.job_skills.map(skill => skill.skill),
      application_count,
      // Mock data for frontend
      views: Math.floor(Math.random() * 1000) + 500,
    };
    
    return res.status(200).json(formattedJob);
  } catch (error) {
    console.error('Server error in GET /jobs/:id:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/jobs
 * @description Create a new job
 * @access Private (Employers only)
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { role } = req.user;
    
    // Check if user is an employer
    if (role !== 'employer' && role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to create jobs' });
    }
    
    const {
      title,
      company_id,
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
    if (!title || !company_id || !description || !location || !job_type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check if user belongs to the company
    const { data: companyUser, error: companyUserError } = await supabase
      .from('company_users')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('company_id', company_id)
      .single();
    
    if (companyUserError || !companyUser) {
      return res.status(403).json({ message: 'Not authorized to create jobs for this company' });
    }
    
    // Create job
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        title,
        company_id,
        description,
        location,
        job_type,
        salary_min,
        salary_max,
        experience_level,
        education,
        department,
        closing_date,
        status: 'active',
        created_by: req.user.id,
      })
      .select()
      .single();
    
    if (jobError) {
      console.error('Error creating job:', jobError);
      return res.status(500).json({ message: 'Error creating job' });
    }
    
    // Add skills if provided
    if (skills && skills.length > 0) {
      const skillsData = skills.map(skill => ({
        job_id: job.id,
        skill: skill.name,
        importance: skill.importance || 'preferred',
      }));
      
      const { error: skillsError } = await supabase
        .from('job_skills')
        .insert(skillsData);
      
      if (skillsError) {
        console.error('Error adding job skills:', skillsError);
        // Continue anyway, job was created successfully
      }
    }
    
    return res.status(201).json({
      message: 'Job created successfully',
      job_id: job.id,
    });
  } catch (error) {
    console.error('Server error in POST /jobs:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route PUT /api/jobs/:id
 * @description Update a job
 * @access Private (Employers only)
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.user;
    
    // Check if user is an employer
    if (role !== 'employer' && role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update jobs' });
    }
    
    // Get the job to check ownership
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('company_id')
      .eq('id', id)
      .single();
    
    if (jobError || !job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Check if user belongs to the company
    const { data: companyUser, error: companyUserError } = await supabase
      .from('company_users')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('company_id', job.company_id)
      .single();
    
    if (companyUserError || !companyUser) {
      return res.status(403).json({ message: 'Not authorized to update jobs for this company' });
    }
    
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
      })
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating job:', updateError);
      return res.status(500).json({ message: 'Error updating job' });
    }
    
    // Update skills if provided
    if (skills && skills.length > 0) {
      // First delete existing skills
      await supabase
        .from('job_skills')
        .delete()
        .eq('job_id', id);
      
      // Then add new skills
      const skillsData = skills.map(skill => ({
        job_id: id,
        skill: skill.name,
        importance: skill.importance || 'preferred',
      }));
      
      const { error: skillsError } = await supabase
        .from('job_skills')
        .insert(skillsData);
      
      if (skillsError) {
        console.error('Error updating job skills:', skillsError);
        // Continue anyway, job was updated successfully
      }
    }
    
    return res.status(200).json({
      message: 'Job updated successfully',
      job_id: id,
    });
  } catch (error) {
    console.error('Server error in PUT /jobs/:id:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route DELETE /api/jobs/:id
 * @description Delete a job
 * @access Private (Employers only)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.user;
    
    // Check if user is an employer
    if (role !== 'employer' && role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete jobs' });
    }
    
    // Get the job to check ownership
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('company_id')
      .eq('id', id)
      .single();
    
    if (jobError || !job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Check if user belongs to the company
    const { data: companyUser, error: companyUserError } = await supabase
      .from('company_users')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('company_id', job.company_id)
      .single();
    
    if (companyUserError || !companyUser) {
      return res.status(403).json({ message: 'Not authorized to delete jobs for this company' });
    }
    
    // Delete job (this will cascade to job_skills due to foreign key constraints)
    const { error: deleteError } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      console.error('Error deleting job:', deleteError);
      return res.status(500).json({ message: 'Error deleting job' });
    }
    
    return res.status(200).json({
      message: 'Job deleted successfully',
    });
  } catch (error) {
    console.error('Server error in DELETE /jobs/:id:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/jobs/:id/match
 * @description Get job match data for the current user
 * @access Private (Job seekers only)
 */
router.get('/:id/match', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user;
    
    // Check if user is a job seeker
    if (role !== 'jobseeker') {
      return res.status(403).json({ message: 'Not authorized to access match data' });
    }
    
    // Get job data
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select(`
        *,
        job_skills (
          skill,
          importance
        )
      `)
      .eq('id', id)
      .single();
    
    if (jobError || !job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Get user profile and resume data
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return res.status(500).json({ message: 'Error fetching user profile' });
    }
    
    // Check if user has applied to this job
    const { data: application, error: applicationError } = await supabase
      .from('applications')
      .select(`
        *,
        application_skills (
          skill,
          match_type
        )
      `)
      .eq('job_id', id)
      .eq('user_id', userId)
      .single();
    
    // If user has applied, return the match data from the application
    if (application && !applicationError) {
      // Format skills
      const matchedSkills = application.application_skills
        .filter(skill => skill.match_type === 'matched')
        .map(skill => skill.skill);
      
      const missingSkills = application.application_skills
        .filter(skill => skill.match_type === 'missing')
        .map(skill => skill.skill);
      
      const additionalSkills = application.application_skills
        .filter(skill => skill.match_type === 'additional')
        .map(skill => skill.skill);
      
      return res.status(200).json({
        match_score: application.match_score,
        skills: {
          matched: matchedSkills,
          missing: missingSkills,
          additional: additionalSkills,
        },
        has_applied: true,
        application_id: application.id,
        application_status: application.status,
      });
    }
    
    // If user hasn't applied, generate a mock match score
    // In a real app, this would use AI to analyze the user's resume against the job
    const requiredSkills = job.job_skills
      .filter(skill => skill.importance === 'required')
      .map(skill => skill.skill);
    
    const preferredSkills = job.job_skills
      .filter(skill => skill.importance === 'preferred')
      .map(skill => skill.skill);
    
    // Mock user skills (in a real app, these would come from the user's resume)
    const userSkills = [
      'JavaScript',
      'React',
      'Node.js',
      'HTML',
      'CSS',
      'Git',
    ];
    
    // Calculate match score
    const matchedRequiredSkills = requiredSkills.filter(skill => 
      userSkills.includes(skill)
    );
    
    const matchedPreferredSkills = preferredSkills.filter(skill => 
      userSkills.includes(skill)
    );
    
    const requiredSkillsScore = requiredSkills.length > 0
      ? (matchedRequiredSkills.length / requiredSkills.length) * 70
      : 70;
    
    const preferredSkillsScore = preferredSkills.length > 0
      ? (matchedPreferredSkills.length / preferredSkills.length) * 30
      : 30;
    
    const matchScore = Math.round(requiredSkillsScore + preferredSkillsScore);
    
    // Determine missing and additional skills
    const missingRequiredSkills = requiredSkills.filter(skill => 
      !userSkills.includes(skill)
    );
    
    const missingPreferredSkills = preferredSkills.filter(skill => 
      !userSkills.includes(skill)
    );
    
    const additionalSkills = userSkills.filter(skill => 
      !requiredSkills.includes(skill) && !preferredSkills.includes(skill)
    );
    
    return res.status(200).json({
      match_score: matchScore,
      skills: {
        matched: [...matchedRequiredSkills, ...matchedPreferredSkills],
        missing: [...missingRequiredSkills, ...missingPreferredSkills],
        additional: additionalSkills,
      },
      has_applied: false,
    });
  } catch (error) {
    console.error('Server error in GET /jobs/:id/match:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/jobs/:id/apply
 * @description Apply for a job
 * @access Private (Job seekers only)
 */
router.post('/:id/apply', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user;
    
    // Check if user is a job seeker
    if (role !== 'jobseeker') {
      return res.status(403).json({ message: 'Not authorized to apply for jobs' });
    }
    
    // Check if job exists
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();
    
    if (jobError || !job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Check if user has already applied
    const { data: existingApplication, error: applicationError } = await supabase
      .from('applications')
      .select('*')
      .eq('job_id', id)
      .eq('user_id', userId)
      .single();
    
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }
    
    const {
      coverLetter,
      linkedin,
      portfolio,
      github,
      customQuestions,
      resumeAnalysis,
    } = req.body;
    
    // Get resume URL from user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('resume_url')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return res.status(500).json({ message: 'Error fetching user profile' });
    }
    
    // Calculate match score (in a real app, this would be more sophisticated)
    let matchScore = 75; // Default score
    
    if (resumeAnalysis && resumeAnalysis.match_score) {
      matchScore = resumeAnalysis.match_score;
    }
    
    // Create application
    const { data: application, error: createError } = await supabase
      .from('applications')
      .insert({
        job_id: id,
        user_id: userId,
        resume_url: userProfile.resume_url,
        cover_letter: coverLetter,
        status: 'pending',
        match_score: matchScore,
      })
      .select()
      .single();
    
    if (createError) {
      console.error('Error creating application:', createError);
      return res.status(500).json({ message: 'Error creating application' });
    }
    
    // Add custom question answers
    if (customQuestions) {
      const questionAnswers = Object.entries(customQuestions).map(([question, answer]) => ({
        application_id: application.id,
        question,
        answer: String(answer),
      }));
      
      const { error: answersError } = await supabase
        .from('application_answers')
        .insert(questionAnswers);
      
      if (answersError) {
        console.error('Error adding question answers:', answersError);
        // Continue anyway, application was created successfully
      }
    }
    
    // Add skills from resume analysis
    if (resumeAnalysis && resumeAnalysis.skills) {
      const skillsData = [];
      
      // Add matched skills
      if (resumeAnalysis.skills.matched) {
        resumeAnalysis.skills.matched.forEach(skill => {
          skillsData.push({
            application_id: application.id,
            skill,
            match_type: 'matched',
          });
        });
      }
      
      // Add missing skills
      if (resumeAnalysis.skills.missing) {
        resumeAnalysis.skills.missing.forEach(skill => {
          skillsData.push({
            application_id: application.id,
            skill,
            match_type: 'missing',
          });
        });
      }
      
      // Add additional skills
      if (resumeAnalysis.skills.additional) {
        resumeAnalysis.skills.additional.forEach(skill => {
          skillsData.push({
            application_id: application.id,
            skill,
            match_type: 'additional',
          });
        });
      }
      
      if (skillsData.length > 0) {
        const { error: skillsError } = await supabase
          .from('application_skills')
          .insert(skillsData);
        
        if (skillsError) {
          console.error('Error adding application skills:', skillsError);
          // Continue anyway, application was created successfully
        }
      }
    }
    
    // Update user profile with professional links if provided
    const profileUpdates = {};
    if (linkedin) profileUpdates.linkedin_url = linkedin;
    if (portfolio) profileUpdates.portfolio_url = portfolio;
    if (github) profileUpdates.github_url = github;
    
    if (Object.keys(profileUpdates).length > 0) {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update(profileUpdates)
        .eq('id', userId);
      
      if (updateError) {
        console.error('Error updating user profile:', updateError);
        // Continue anyway, application was created successfully
      }
    }
    
    return res.status(201).json({
      message: 'Application submitted successfully',
      application_id: application.id,
    });
  } catch (error) {
    console.error('Server error in POST /jobs/:id/apply:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
