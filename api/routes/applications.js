const express = require('express');
const router = express.Router();
const supabase = require('../lib/supabase');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route GET /api/applications
 * @description Get applications for the current user (job seeker) or for jobs in the user's company (employer)
 * @access Private
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    const {
      page = 1,
      limit = 12,
      status,
      jobId,
      sortBy = 'newest',
    } = req.query;
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    
    // Different queries based on user role
    if (role === 'jobseeker') {
      // Job seeker can only see their own applications
      let query = supabase
        .from('applications')
        .select(`
          *,
          jobs (
            id,
            title,
            location,
            job_type,
            companies (
              id,
              name,
              logo_url
            )
          )
        `)
        .eq('user_id', userId);
      
      // Apply filters
      if (status) {
        query = query.eq('status', status);
      }
      
      if (jobId) {
        query = query.eq('job_id', jobId);
      }
      
      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('applied_date', { ascending: false });
          break;
        case 'oldest':
          query = query.order('applied_date', { ascending: true });
          break;
        case 'match-high':
          query = query.order('match_score', { ascending: false });
          break;
        case 'match-low':
          query = query.order('match_score', { ascending: true });
          break;
        default:
          query = query.order('applied_date', { ascending: false });
      }
      
      // Get total count for pagination
      const { count } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      // Apply pagination
      query = query.range(offset, offset + limit - 1);
      
      // Execute query
      const { data: applications, error } = await query;
      
      if (error) {
        console.error('Error fetching applications:', error);
        return res.status(500).json({ message: 'Error fetching applications' });
      }
      
      // Format applications data
      const formattedApplications = applications.map(app => ({
        id: app.id,
        job_id: app.job_id,
        job_title: app.jobs.title,
        company_name: app.jobs.companies.name,
        company_logo: app.jobs.companies.logo_url,
        location: app.jobs.location,
        job_type: app.jobs.job_type,
        status: app.status,
        match_score: app.match_score,
        applied_date: app.applied_date,
      }));
      
      // Calculate total pages
      const totalPages = Math.ceil(count / limit);
      
      return res.status(200).json({
        applications: formattedApplications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalItems: count,
          totalPages,
        },
      });
    } else if (role === 'employer' || role === 'admin') {
      // Employer can see applications for jobs in their company
      // First, get the companies the user belongs to
      const { data: companies, error: companiesError } = await supabase
        .from('company_users')
        .select('company_id')
        .eq('user_id', userId);
      
      if (companiesError) {
        console.error('Error fetching companies:', companiesError);
        return res.status(500).json({ message: 'Error fetching companies' });
      }
      
      if (!companies || companies.length === 0) {
        return res.status(200).json({
          applications: [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            totalItems: 0,
            totalPages: 0,
          },
        });
      }
      
      const companyIds = companies.map(c => c.company_id);
      
      // Get applications for jobs in the user's companies
      let query = supabase
        .from('applications')
        .select(`
          *,
          jobs!inner (
            id,
            title,
            company_id,
            location,
            job_type
          ),
          users (
            id,
            name,
            email
          )
        `)
        .in('jobs.company_id', companyIds);
      
      // Apply filters
      if (status) {
        query = query.eq('status', status);
      }
      
      if (jobId) {
        query = query.eq('job_id', jobId);
      }
      
      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('applied_date', { ascending: false });
          break;
        case 'oldest':
          query = query.order('applied_date', { ascending: true });
          break;
        case 'match-high':
          query = query.order('match_score', { ascending: false });
          break;
        case 'match-low':
          query = query.order('match_score', { ascending: true });
          break;
        default:
          query = query.order('applied_date', { ascending: false });
      }
      
      // Get total count for pagination
      const countQuery = supabase
        .from('applications')
        .select(`
          id,
          jobs!inner (
            company_id
          )
        `, { count: 'exact', head: true })
        .in('jobs.company_id', companyIds);
      
      if (status) {
        countQuery.eq('status', status);
      }
      
      if (jobId) {
        countQuery.eq('job_id', jobId);
      }
      
      const { count } = await countQuery;
      
      // Apply pagination
      query = query.range(offset, offset + limit - 1);
      
      // Execute query
      const { data: applications, error } = await query;
      
      if (error) {
        console.error('Error fetching applications:', error);
        return res.status(500).json({ message: 'Error fetching applications' });
      }
      
      // Format applications data
      const formattedApplications = applications.map(app => ({
        id: app.id,
        job_id: app.job_id,
        job_title: app.jobs.title,
        candidate_id: app.users.id,
        candidate_name: app.users.name,
        candidate_email: app.users.email,
        location: app.jobs.location,
        job_type: app.jobs.job_type,
        status: app.status,
        match_score: app.match_score,
        applied_date: app.applied_date,
      }));
      
      // Calculate total pages
      const totalPages = Math.ceil(count / limit);
      
      return res.status(200).json({
        applications: formattedApplications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalItems: count,
          totalPages,
        },
      });
    } else {
      return res.status(403).json({ message: 'Not authorized to access applications' });
    }
  } catch (error) {
    console.error('Server error in GET /applications:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/applications/:id
 * @description Get application by ID
 * @access Private
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user;
    
    // Get application data
    const { data: application, error } = await supabase
      .from('applications')
      .select(`
        *,
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
          companies (
            id,
            name,
            logo_url
          ),
          job_skills (
            skill,
            importance
          )
        ),
        users (
          id,
          name,
          email
        ),
        application_answers (
          question,
          answer
        ),
        application_skills (
          skill,
          match_type
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching application:', error);
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Check authorization
    if (role === 'jobseeker' && application.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to access this application' });
    } else if (role === 'employer') {
      // Check if user belongs to the company that posted the job
      const { data: companyUser, error: companyUserError } = await supabase
        .from('company_users')
        .select('*')
        .eq('user_id', userId)
        .eq('company_id', application.jobs.companies.id)
        .single();
      
      if (companyUserError || !companyUser) {
        return res.status(403).json({ message: 'Not authorized to access this application' });
      }
    }
    
    // Get user profile data
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', application.user_id)
      .single();
    
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      // Continue anyway, we'll just have less data
    }
    
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
    
    // Format custom questions and answers
    const customQuestions = application.application_answers.reduce((acc, qa) => {
      acc[qa.question] = qa.answer;
      return acc;
    }, {});
    
    // Format application data
    const formattedApplication = {
      id: application.id,
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
        company: {
          id: application.jobs.companies.id,
          name: application.jobs.companies.name,
          logo_url: application.jobs.companies.logo_url,
        },
        skills: application.jobs.job_skills.map(skill => skill.skill),
      },
      candidate: {
        id: application.users.id,
        name: application.users.name,
        email: application.users.email,
        phone: userProfile?.phone || null,
        location: userProfile?.location || null,
        linkedin_url: userProfile?.linkedin_url || null,
        github_url: userProfile?.github_url || null,
        portfolio_url: userProfile?.portfolio_url || null,
      },
      resume_url: application.resume_url,
      cover_letter: application.cover_letter,
      status: application.status,
      match_score: application.match_score,
      applied_date: application.applied_date,
      skills: {
        matched: matchedSkills,
        missing: missingSkills,
        additional: additionalSkills,
      },
      custom_questions: customQuestions,
    };
    
    return res.status(200).json(formattedApplication);
  } catch (error) {
    console.error('Server error in GET /applications/:id:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route PUT /api/applications/:id/status
 * @description Update application status
 * @access Private (Employers only)
 */
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { role, id: userId } = req.user;
    
    // Check if user is an employer
    if (role !== 'employer' && role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update application status' });
    }
    
    // Validate status
    const validStatuses = ['pending', 'reviewing', 'interviewing', 'rejected', 'accepted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    // Get application data to check authorization
    const { data: application, error } = await supabase
      .from('applications')
      .select(`
        *,
        jobs (
          company_id
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching application:', error);
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Check if user belongs to the company that posted the job
    const { data: companyUser, error: companyUserError } = await supabase
      .from('company_users')
      .select('*')
      .eq('user_id', userId)
      .eq('company_id', application.jobs.company_id)
      .single();
    
    if (companyUserError || !companyUser) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }
    
    // Update application status
    const { data: updatedApplication, error: updateError } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating application status:', updateError);
      return res.status(500).json({ message: 'Error updating application status' });
    }
    
    return res.status(200).json({
      message: 'Application status updated successfully',
      application_id: id,
      status: updatedApplication.status,
    });
  } catch (error) {
    console.error('Server error in PUT /applications/:id/status:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/applications/analytics
 * @description Get application analytics
 * @access Private (Employers only)
 */
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const { role, id: userId } = req.user;
    const { jobId, timeFrame } = req.query;
    
    // Check if user is an employer
    if (role !== 'employer' && role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access analytics' });
    }
    
    // Get companies the user belongs to
    const { data: companies, error: companiesError } = await supabase
      .from('company_users')
      .select('company_id')
      .eq('user_id', userId);
    
    if (companiesError) {
      console.error('Error fetching companies:', companiesError);
      return res.status(500).json({ message: 'Error fetching companies' });
    }
    
    if (!companies || companies.length === 0) {
      return res.status(200).json({
        total_applications: 0,
        new_applications: 0,
        application_trends: [],
        status_distribution: [],
        match_score_distribution: [],
      });
    }
    
    const companyIds = companies.map(c => c.company_id);
    
    // Calculate date range based on timeFrame
    let startDate = new Date();
    if (timeFrame === '7') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeFrame === '30') {
      startDate.setDate(startDate.getDate() - 30);
    } else if (timeFrame === '90') {
      startDate.setDate(startDate.getDate() - 90);
    } else {
      // Default to all time
      startDate = new Date(0); // January 1, 1970
    }
    
    // Base query for applications in the user's companies
    let baseQuery = supabase
      .from('applications')
      .select(`
        *,
        jobs!inner (
          company_id
        )
      `)
      .in('jobs.company_id', companyIds)
      .gte('applied_date', startDate.toISOString());
    
    // Apply job filter if provided
    if (jobId && jobId !== 'all') {
      baseQuery = baseQuery.eq('job_id', jobId);
    }
    
    // Get total applications
    const { count: totalApplications } = await baseQuery.select('id', { count: 'exact', head: true });
    
    // Get new applications (last 7 days)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const { count: newApplications } = await baseQuery
      .gte('applied_date', lastWeek.toISOString())
      .select('id', { count: 'exact', head: true });
    
    // Get application status distribution
    const { data: statusData, error: statusError } = await baseQuery
      .select('status')
      .order('status');
    
    if (statusError) {
      console.error('Error fetching status distribution:', statusError);
      return res.status(500).json({ message: 'Error fetching analytics data' });
    }
    
    // Count applications by status
    const statusCounts = statusData.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});
    
    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    }));
    
    // Get match score distribution
    const { data: scoreData, error: scoreError } = await baseQuery
      .select('match_score')
      .order('match_score');
    
    if (scoreError) {
      console.error('Error fetching match score distribution:', scoreError);
      return res.status(500).json({ message: 'Error fetching analytics data' });
    }
    
    // Group match scores into ranges
    const scoreRanges = {
      '90-100%': 0,
      '80-89%': 0,
      '70-79%': 0,
      '60-69%': 0,
      'Below 60%': 0,
    };
    
    scoreData.forEach(app => {
      const score = app.match_score;
      if (score >= 90) {
        scoreRanges['90-100%']++;
      } else if (score >= 80) {
        scoreRanges['80-89%']++;
      } else if (score >= 70) {
        scoreRanges['70-79%']++;
      } else if (score >= 60) {
        scoreRanges['60-69%']++;
      } else {
        scoreRanges['Below 60%']++;
      }
    });
    
    const matchScoreDistribution = Object.entries(scoreRanges).map(([range, count]) => ({
      range,
      count,
    }));
    
    // Get application trends (applications per week)
    const { data: trendData, error: trendError } = await baseQuery
      .select('applied_date')
      .order('applied_date');
    
    if (trendError) {
      console.error('Error fetching application trends:', trendError);
      return res.status(500).json({ message: 'Error fetching analytics data' });
    }
    
    // Group applications by week
    const weeklyTrends = {};
    trendData.forEach(app => {
      const date = new Date(app.applied_date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0];
      
      weeklyTrends[weekKey] = (weeklyTrends[weekKey] || 0) + 1;
    });
    
    const applicationTrends = Object.entries(weeklyTrends).map(([date, count]) => ({
      date,
      count,
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Get average match score
    const averageScore = scoreData.length > 0
      ? Math.round(scoreData.reduce((sum, app) => sum + app.match_score, 0) / scoreData.length)
      : 0;
    
    return res.status(200).json({
      total_applications: totalApplications,
      new_applications: newApplications,
      average_score: averageScore,
      status_distribution: statusDistribution,
      match_score_distribution: matchScoreDistribution,
      application_trends: applicationTrends,
    });
  } catch (error) {
    console.error('Server error in GET /applications/analytics:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
