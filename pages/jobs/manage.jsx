import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import TailwindLayout from '../../components/TailwindLayout';
import TailwindSpinner from '../../components/ui/TailwindSpinner';
import { withSupabaseAuth } from '../../context/SupabaseAuthContext';
import { FaPlus, FaEye, FaEdit, FaTrash, FaFilter, FaChevronDown, FaSearch, FaExclamationCircle } from 'react-icons/fa';
import supabase from '../../utils/supabase';

const JobManagementPage = () => {
  const router = useRouter();
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const limit = 10; // Items per page
  
  // Fetch jobs
  useEffect(() => {
    const fetchJobs = async () => {
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
          .from('jobs')
          .select(`
            id,
            title,
            location,
            job_type,
            salary_min,
            salary_max,
            posted_date,
            closing_date,
            status,
            companies (
              name,
              logo_url
            ),
            applications (
              id
            )
          `)
          .eq('company_id', companyId)
          .range(from, to);
        
        // Add search filter
        if (searchTerm) {
          query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
        }
        
        // Add status filter
        if (statusFilter) {
          query = query.eq('status', statusFilter);
        }
        
        // Add sorting
        if (sortBy === 'newest') {
          query = query.order('posted_date', { ascending: false });
        } else if (sortBy === 'oldest') {
          query = query.order('posted_date', { ascending: true });
        } else if (sortBy === 'title-asc') {
          query = query.order('title', { ascending: true });
        } else if (sortBy === 'title-desc') {
          query = query.order('title', { ascending: false });
        }
        
        // Execute query
        const { data: jobs, error } = await query;
        
        if (error) {
          throw error;
        }
        
        // Get total count for pagination
        let countQuery = supabase
          .from('jobs')
          .select('id', { count: 'exact' })
          .eq('company_id', companyId);
        
        // Add search filter to count query
        if (searchTerm) {
          countQuery = countQuery.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
        }
        
        // Add status filter to count query
        if (statusFilter) {
          countQuery = countQuery.eq('status', statusFilter);
        }
        
        const { count, error: countError } = await countQuery;
        
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
          posted_date: job.posted_date,
          closing_date: job.closing_date,
          status: job.status,
          applications_count: job.applications ? job.applications.length : 0,
        }));
        
        setJobs(formattedJobs);
        setTotalJobs(count);
        setTotalPages(Math.ceil(count / limit));
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to load jobs. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, [page, searchTerm, statusFilter, sortBy]);
  
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
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
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
  
  // Handle delete job
  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
    
    try {
      setDeleteLoading(true);
      
      // Delete job skills
      const { error: skillsError } = await supabase
        .from('job_skills')
        .delete()
        .eq('job_id', jobToDelete);
      
      if (skillsError) {
        throw skillsError;
      }
      
      // Delete job
      const { error: deleteError } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobToDelete);
      
      if (deleteError) {
        throw deleteError;
      }
      
      // Close modal and refresh jobs
      setDeleteModalOpen(false);
      setJobToDelete(null);
      
      // Remove job from state
      setJobs(jobs.filter(job => job.id !== jobToDelete));
      setTotalJobs(totalJobs - 1);
      setTotalPages(Math.ceil((totalJobs - 1) / limit));
      
      // If current page is now empty, go to previous page
      if (jobs.length === 1 && page > 1) {
        setPage(page - 1);
      }
    } catch (err) {
      console.error('Error deleting job:', err);
      setError('Failed to delete job. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };
  
  return (
    <TailwindLayout title="Manage Jobs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Manage Jobs</h1>
            <p className="text-gray-600">
              Create, edit, and manage your job listings
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
        
        {/* Filters */}
        <div className="bg-white shadow-card rounded-lg overflow-hidden mb-8">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search jobs by title or description"
                    className="form-input pl-10"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
              
              <div className="md:w-1/4">
                <div className="relative">
                  <select
                    className="form-input appearance-none"
                    value={statusFilter}
                    onChange={handleStatusChange}
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="closed">Closed</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <FaFilter className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
              
              <div className="md:w-1/4">
                <div className="relative">
                  <select
                    className="form-input appearance-none"
                    value={sortBy}
                    onChange={handleSortChange}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="title-asc">Title (A-Z)</option>
                    <option value="title-desc">Title (Z-A)</option>
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
            <p className="mt-4 text-gray-600">Loading jobs...</p>
          </div>
        )}
        
        {/* No jobs */}
        {!loading && jobs.length === 0 && (
          <div className="bg-white shadow-card rounded-lg p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No jobs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter
                ? 'Try adjusting your search filters or create a new job.'
                : 'Get started by creating your first job listing.'}
            </p>
            <div className="mt-6">
              <Link
                href="/jobs/create"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <FaPlus className="mr-2 -ml-1 h-4 w-4" />
                Post New Job
              </Link>
            </div>
          </div>
        )}
        
        {/* Jobs table */}
        {!loading && jobs.length > 0 && (
          <div className="bg-white shadow-card rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posted Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applications
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {job.company_logo ? (
                              <img
                                src={job.company_logo}
                                alt={job.company}
                                className="h-10 w-10 rounded-md object-contain bg-gray-50 p-1 border border-gray-200"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-md bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                                {job.company?.charAt(0) || 'J'}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{job.title}</div>
                            <div className="text-sm text-gray-500">{job.company}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{job.location}</div>
                        <div className="text-sm text-gray-500 capitalize">{job.job_type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(job.posted_date)}</div>
                        {job.closing_date && (
                          <div className="text-sm text-gray-500">
                            Closes: {formatDate(job.closing_date)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(job.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.applications_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
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
                          <button
                            onClick={() => {
                              setJobToDelete(job.id);
                              setDeleteModalOpen(true);
                            }}
                            className="text-gray-400 hover:text-red-500"
                            title="Delete"
                          >
                            <FaTrash className="h-4 w-4" />
                          </button>
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
                  <span className="font-medium">{Math.min(page * limit, totalJobs)}</span> of{' '}
                  <span className="font-medium">{totalJobs}</span> jobs
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
      
      {/* Delete confirmation modal */}
      {deleteModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FaExclamationCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Job
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this job? This action cannot be undone.
                        All applications for this job will also be deleted.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDeleteJob}
                  disabled={deleteLoading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteLoading ? (
                    <>
                      <TailwindSpinner size="sm" color="white" className="mr-2" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setJobToDelete(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </TailwindLayout>
  );
};

// Protect this page with authentication and role check
export default withSupabaseAuth(JobManagementPage, { 
  requireAuth: true,
  requiredRole: 'employer',
});
