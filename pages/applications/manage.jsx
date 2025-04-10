import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import TailwindLayout from '../../components/TailwindLayout';
import TailwindSpinner from '../../components/ui/TailwindSpinner';
import { withSupabaseAuth } from '../../context/SupabaseAuthContext';
import { FaEye, FaFilter, FaChevronDown, FaSearch, FaExclamationCircle, FaCheckCircle, FaHourglass, FaUserCheck, FaTimes } from 'react-icons/fa';
import supabase from '../../utils/supabase';

const ApplicationManagementPage = () => {
  const router = useRouter();
  
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [jobFilter, setJobFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalApplications, setTotalApplications] = useState(0);
  const [jobs, setJobs] = useState([]);
  
  const limit = 10; // Items per page
  
  // Fetch jobs for filter
  useEffect(() => {
    const fetchJobs = async () => {
      try {
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
        
        // Fetch jobs
        const { data: jobs, error } = await supabase
          .from('jobs')
          .select('id, title')
          .eq('company_id', companyId)
          .order('title', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        setJobs(jobs);
      } catch (err) {
        console.error('Error fetching jobs:', err);
      }
    };
    
    fetchJobs();
  }, []);
  
  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
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
        
        // Calculate pagination
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        
        // Build query
        let query = supabase
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
          .eq('jobs.company_id', companyId)
          .range(from, to);
        
        // Add search filter
        if (searchTerm) {
          query = query.or(`profiles.name.ilike.%${searchTerm}%,profiles.email.ilike.%${searchTerm}%,jobs.title.ilike.%${searchTerm}%`);
        }
        
        // Add status filter
        if (statusFilter) {
          query = query.eq('status', statusFilter);
        }
        
        // Add job filter
        if (jobFilter) {
          query = query.eq('job_id', jobFilter);
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
        let countQuery = supabase
          .from('applications')
          .select('id', { count: 'exact' })
          .eq('jobs.company_id', companyId);
        
        // Add search filter to count query
        if (searchTerm) {
          countQuery = countQuery.or(`profiles.name.ilike.%${searchTerm}%,profiles.email.ilike.%${searchTerm}%,jobs.title.ilike.%${searchTerm}%`);
        }
        
        // Add status filter to count query
        if (statusFilter) {
          countQuery = countQuery.eq('status', statusFilter);
        }
        
        // Add job filter to count query
        if (jobFilter) {
          countQuery = countQuery.eq('job_id', jobFilter);
        }
        
        const { count, error: countError } = await countQuery;
        
        if (countError) {
          throw countError;
        }
        
        // Format applications data
        const formattedApplications = applications.map(app => ({
          id: app.id,
          status: app.status,
          applied_date: app.applied_date,
          match_score: app.match_score,
          job_id: app.job_id,
          job_title: app.jobs?.title || 'Unknown Job',
          location: app.jobs?.location || 'Unknown Location',
          job_type: app.jobs?.job_type || 'Unknown Type',
          candidate: {
            id: app.profiles?.id || 'Unknown',
            name: app.profiles?.name || 'Unknown Candidate',
            email: app.profiles?.email || 'Unknown Email',
            phone: app.profiles?.phone || null,
            location: app.profiles?.location || null,
          },
        }));
        
        setApplications(formattedApplications);
        setTotalApplications(count);
        setTotalPages(Math.ceil(count / limit));
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError('Failed to load applications. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, [page, searchTerm, statusFilter, jobFilter, sortBy]);
  
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
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <FaHourglass className="mr-1 h-3 w-3" />
            Pending
          </span>
        );
      case 'reviewing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <FaUserCheck className="mr-1 h-3 w-3" />
            Reviewing
          </span>
        );
      case 'interviewing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <FaUserCheck className="mr-1 h-3 w-3" />
            Interviewing
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FaCheckCircle className="mr-1 h-3 w-3" />
            Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FaTimes className="mr-1 h-3 w-3" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <FaExclamationCircle className="mr-1 h-3 w-3" />
            {status}
          </span>
        );
    }
  };
  
  // Handle search input change with debounce
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when search changes
  };
  
  // Handle status filter change
  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1); // Reset to first page when filter changes
  };
  
  // Handle job filter change
  const handleJobChange = (e) => {
    setJobFilter(e.target.value);
    setPage(1); // Reset to first page when filter changes
  };
  
  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1); // Reset to first page when sort changes
  };
  
  // Handle pagination
  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo(0, 0); // Scroll to top when page changes
  };
  
  // Handle status update
  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      // Update application status
      const { error } = await supabase
        .from('applications')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));
    } catch (err) {
      console.error('Error updating application status:', err);
      setError('Failed to update application status. Please try again.');
    }
  };
  
  return (
    <TailwindLayout title="Manage Applications">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Manage Applications</h1>
            <p className="text-gray-600">
              Review and manage candidate applications
            </p>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white shadow-card rounded-lg overflow-hidden mb-8">
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by candidate name, email or job title"
                    className="form-input pl-10"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
              
              <div>
                <div className="relative">
                  <select
                    className="form-input appearance-none"
                    value={statusFilter}
                    onChange={handleStatusChange}
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <FaFilter className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
              
              <div>
                <div className="relative">
                  <select
                    className="form-input appearance-none"
                    value={jobFilter}
                    onChange={handleJobChange}
                  >
                    <option value="">All Jobs</option>
                    {jobs.map(job => (
                      <option key={job.id} value={job.id}>{job.title}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <FaFilter className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <div className="relative">
                  <select
                    className="form-input appearance-none"
                    value={sortBy}
                    onChange={handleSortChange}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="match-high">Highest Match</option>
                    <option value="match-low">Lowest Match</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <FaChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <TailwindSpinner size="lg" color="primary" />
            <p className="mt-4 text-gray-600">Loading applications...</p>
          </div>
        )}
        
        {/* No applications */}
        {!loading && applications.length === 0 && (
          <div className="bg-white shadow-card rounded-lg p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No applications found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter || jobFilter
                ? 'Try adjusting your search filters.'
                : 'There are no applications for your jobs yet.'}
            </p>
          </div>
        )}
        
        {/* Applications table */}
        {!loading && applications.length > 0 && (
          <div className="bg-white shadow-card rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidate
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Match Score
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((application) => (
                    <tr key={application.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg">
                              {application.candidate?.name?.charAt(0) || 'U'}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{application.candidate.name}</div>
                            <div className="text-sm text-gray-500">{application.candidate.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{application.job_title}</div>
                        <div className="text-sm text-gray-500">{application.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(application.applied_date)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative">
                          {getStatusBadge(application.status)}
                          <div className="absolute mt-1 w-40 bg-white shadow-lg rounded-md overflow-hidden z-10 hidden group-hover:block">
                            <div className="py-1">
                              <button
                                onClick={() => handleStatusUpdate(application.id, 'pending')}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Pending
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(application.id, 'reviewing')}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Reviewing
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(application.id, 'interviewing')}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Interviewing
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(application.id, 'accepted')}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Accepted
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(application.id, 'rejected')}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Rejected
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {application.match_score ? (
                          <div className="flex items-center">
                            <span className={`text-sm font-medium ${
                              application.match_score >= 80 ? 'text-green-600' : 
                              application.match_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {application.match_score}%
                            </span>
                            <div className="ml-2 w-16 bg-gray-200 rounded-full h-1.5">
                              <div 
                                className={`h-1.5 rounded-full ${
                                  application.match_score >= 80 ? 'bg-green-500' : 
                                  application.match_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${application.match_score}%` }}
                              ></div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/applications/${application.id}`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            View
                          </Link>
                          <div className="relative group">
                            <button
                              className="text-gray-500 hover:text-gray-700"
                            >
                              Change Status
                            </button>
                            <div className="absolute right-0 mt-1 w-40 bg-white shadow-lg rounded-md overflow-hidden z-10 hidden group-hover:block">
                              <div className="py-1">
                                <button
                                  onClick={() => handleStatusUpdate(application.id, 'pending')}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  Pending
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(application.id, 'reviewing')}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  Reviewing
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(application.id, 'interviewing')}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  Interviewing
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(application.id, 'accepted')}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  Accepted
                                </button>
                                <button
                                  onClick={() => handleStatusUpdate(application.id, 'rejected')}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  Rejected
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(page * limit, totalApplications)}</span> of{' '}
                  <span className="font-medium">{totalApplications}</span> applications
                </div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      page === 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === i + 1
                          ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      page === totalPages
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            )}
          </div>
        )}
      </div>
    </TailwindLayout>
  );
};

// Protect this page with authentication and role check
export default withSupabaseAuth(ApplicationManagementPage, { 
  requireAuth: true,
  requiredRole: 'employer',
});
