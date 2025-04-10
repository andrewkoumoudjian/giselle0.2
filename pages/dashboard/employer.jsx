import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import TailwindLayout from '../../components/TailwindLayout';
import TailwindSpinner from '../../components/ui/TailwindSpinner';
import { withSupabaseAuth } from '../../context/SupabaseAuthContext';
import { FaBriefcase, FaUsers, FaUserCheck, FaChartLine, FaPlus, FaEye, FaEdit, FaTrash, FaFilter, FaChevronDown } from 'react-icons/fa';
import supabase from '../../utils/supabase';

const EmployerDashboard = () => {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    newApplications: 0,
    averageScore: 0,
  });
  const [jobs, setJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get company ID for the employer
        const { data: companyUser, error: companyUserError } = await supabase
          .from('company_users')
          .select('company_id')
          .eq('user_id', supabase.auth.user().id)
          .single();
        
        if (companyUserError) {
          throw companyUserError;
        }
        
        const companyId = companyUser.company_id;
        
        // Fetch active jobs count
        const { count: activeJobsCount, error: jobsError } = await supabase
          .from('jobs')
          .select('id', { count: 'exact' })
          .eq('company_id', companyId)
          .eq('status', 'active');
        
        if (jobsError) {
          throw jobsError;
        }
        
        // Fetch total applications count
        const { count: totalApplicationsCount, error: applicationsError } = await supabase
          .from('applications')
          .select('id', { count: 'exact' })
          .eq('jobs.company_id', companyId);
        
        if (applicationsError) {
          throw applicationsError;
        }
        
        // Fetch new applications count (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { count: newApplicationsCount, error: newApplicationsError } = await supabase
          .from('applications')
          .select('id', { count: 'exact' })
          .eq('jobs.company_id', companyId)
          .gte('applied_date', sevenDaysAgo.toISOString());
        
        if (newApplicationsError) {
          throw newApplicationsError;
        }
        
        // Fetch average match score
        const { data: matchScores, error: matchScoresError } = await supabase
          .from('applications')
          .select('match_score')
          .eq('jobs.company_id', companyId)
          .not('match_score', 'is', null);
        
        if (matchScoresError) {
          throw matchScoresError;
        }
        
        let averageScore = 0;
        if (matchScores.length > 0) {
          const sum = matchScores.reduce((acc, app) => acc + app.match_score, 0);
          averageScore = Math.round(sum / matchScores.length);
        }
        
        // Fetch recent jobs
        const { data: recentJobs, error: recentJobsError } = await supabase
          .from('jobs')
          .select(`
            id,
            title,
            location,
            job_type,
            posted_date,
            status,
            companies (
              name,
              logo_url
            )
          `)
          .eq('company_id', companyId)
          .order('posted_date', { ascending: false })
          .limit(5);
        
        if (recentJobsError) {
          throw recentJobsError;
        }
        
        // Fetch recent applications
        const { data: applications, error: recentApplicationsError } = await supabase
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
              title
            ),
            profiles:user_id (
              id,
              name,
              email
            )
          `)
          .eq('jobs.company_id', companyId)
          .order('applied_date', { ascending: false })
          .limit(5);
        
        if (recentApplicationsError) {
          throw recentApplicationsError;
        }
        
        // Update state
        setStats({
          activeJobs: activeJobsCount,
          totalApplications: totalApplicationsCount,
          newApplications: newApplicationsCount,
          averageScore: averageScore,
        });
        
        setJobs(recentJobs);
        setRecentApplications(applications);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Active
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Draft
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Closed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
      case 'reviewing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Reviewing
          </span>
        );
      case 'interviewing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Interviewing
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };
  
  if (loading) {
    return (
      <TailwindLayout title="Employer Dashboard">
        <div className="flex items-center justify-center min-h-screen">
          <TailwindSpinner size="lg" color="primary" />
        </div>
      </TailwindLayout>
    );
  }
  
  return (
    <TailwindLayout title="Employer Dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Employer Dashboard</h1>
            <p className="text-gray-600">
              Manage your job listings and applications
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              href="/jobs/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <FaPlus className="mr-2 -ml-1 h-4 w-4" />
              Post New Job
            </Link>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Active Jobs */}
          <div className="bg-white shadow-card rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FaBriefcase className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Jobs</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.activeJobs}</h3>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/jobs/manage"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                View all jobs
              </Link>
            </div>
          </div>
          
          {/* Total Applications */}
          <div className="bg-white shadow-card rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FaUsers className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Applications</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.totalApplications}</h3>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/applications/manage"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                View all applications
              </Link>
            </div>
          </div>
          
          {/* New Applications */}
          <div className="bg-white shadow-card rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <FaUserCheck className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">New Applications</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.newApplications}</h3>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">Last 7 days</p>
            </div>
          </div>
          
          {/* Average Match Score */}
          <div className="bg-white shadow-card rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <FaChartLine className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Average Match Score</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.averageScore}%</h3>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${
                    stats.averageScore >= 80 ? 'bg-green-500' : 
                    stats.averageScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${stats.averageScore}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Jobs */}
          <div className="bg-white shadow-card rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Jobs</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {jobs.length === 0 ? (
                <div className="px-6 py-5 text-center">
                  <p className="text-gray-500">No jobs found</p>
                  <div className="mt-4">
                    <Link
                      href="/jobs/create"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <FaPlus className="mr-2 -ml-1 h-4 w-4" />
                      Post New Job
                    </Link>
                  </div>
                </div>
              ) : (
                jobs.map((job) => (
                  <div key={job.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {job.companies?.logo_url ? (
                          <img
                            src={job.companies.logo_url}
                            alt={job.companies.name}
                            className="h-10 w-10 rounded-md object-contain bg-gray-50 p-1 border border-gray-200"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                            {job.companies?.name?.charAt(0) || 'J'}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-900">{job.title}</h3>
                        <div className="flex items-center mt-1">
                          <p className="text-xs text-gray-500">{job.location}</p>
                          <span className="mx-1 text-gray-300">•</span>
                          <p className="text-xs text-gray-500 capitalize">{job.job_type}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(job.status)}
                      <div className="flex items-center space-x-1">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="text-gray-400 hover:text-gray-500"
                          title="View"
                        >
                          <FaEye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/jobs/edit/${job.id}`}
                          className="text-gray-400 hover:text-gray-500"
                          title="Edit"
                        >
                          <FaEdit className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {jobs.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <Link
                  href="/jobs/manage"
                  className="text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  View all jobs
                </Link>
              </div>
            )}
          </div>
          
          {/* Recent Applications */}
          <div className="bg-white shadow-card rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Applications</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {recentApplications.length === 0 ? (
                <div className="px-6 py-5 text-center">
                  <p className="text-gray-500">No applications found</p>
                </div>
              ) : (
                recentApplications.map((application) => (
                  <div key={application.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg">
                          {application.profiles?.name?.charAt(0) || 'U'}
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-900">{application.profiles?.name}</h3>
                        <div className="flex items-center mt-1">
                          <p className="text-xs text-gray-500">{application.jobs?.title}</p>
                          <span className="mx-1 text-gray-300">•</span>
                          <p className="text-xs text-gray-500">{formatDate(application.applied_date)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(application.status)}
                      {application.match_score && (
                        <span className={`text-xs font-medium ${
                          application.match_score >= 80 ? 'text-green-600' : 
                          application.match_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {application.match_score}%
                        </span>
                      )}
                      <Link
                        href={`/applications/${application.id}`}
                        className="text-gray-400 hover:text-gray-500"
                        title="View"
                      >
                        <FaEye className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
            {recentApplications.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <Link
                  href="/applications/manage"
                  className="text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  View all applications
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </TailwindLayout>
  );
};

// Protect this page with authentication and role check
export default withSupabaseAuth(EmployerDashboard, { 
  requireAuth: true,
  requiredRole: 'employer',
});
