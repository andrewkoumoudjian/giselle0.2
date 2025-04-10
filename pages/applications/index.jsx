import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import TailwindLayout from '../../components/TailwindLayout';
import TailwindSpinner from '../../components/ui/TailwindSpinner';
import { getApplications } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { withAuth } from '../../context/AuthContext';
import { FaFilter, FaChevronDown, FaMapMarkerAlt, FaBriefcase, FaCalendarAlt, FaCheckCircle, FaHourglass, FaUserCheck, FaTimes, FaExclamationCircle } from 'react-icons/fa';

const ApplicationsPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        
        // Prepare query parameters
        const params = {
          page,
          limit: 10,
          sortBy,
        };
        
        if (statusFilter) {
          params.status = statusFilter;
        }
        
        // Call the API
        const response = await getApplications(params);
        
        // Update state with response data
        setApplications(response.applications || []);
        setTotalPages(response.pagination?.totalPages || 1);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError('Failed to load applications. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, [page, statusFilter, sortBy]);
  
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
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  return (
    <TailwindLayout title="My Applications">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">My Applications</h1>
            <p className="text-gray-600">
              Track the status of your job applications
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              href="/jobs"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Browse More Jobs
            </Link>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-white shadow-card rounded-lg overflow-hidden mb-8">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="sm:w-1/3">
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
              
              <div className="sm:w-1/3">
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
        
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <TailwindSpinner size="lg" color="primary" />
            <p className="mt-4 text-gray-600">Loading applications...</p>
          </div>
        )}
        
        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* No Applications */}
        {!loading && !error && applications.length === 0 && (
          <div className="bg-white shadow-card rounded-lg p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No applications found</h3>
            <p className="mt-1 text-sm text-gray-500">
              You haven't applied to any jobs yet.
            </p>
            <div className="mt-6">
              <Link
                href="/jobs"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Browse Jobs
              </Link>
            </div>
          </div>
        )}
        
        {/* Applications List */}
        {!loading && !error && applications.length > 0 && (
          <>
            <div className="bg-white shadow-card rounded-lg overflow-hidden mb-8">
              <ul className="divide-y divide-gray-200">
                {applications.map((application) => (
                  <li key={application.id} className="p-6 hover:bg-gray-50">
                    <Link href={`/applications/${application.id}`} className="block">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            {application.company_logo ? (
                              <img
                                src={application.company_logo}
                                alt={application.company_name}
                                className="h-10 w-10 rounded-md object-contain bg-gray-50 p-1 border border-gray-200"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-md bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                                {application.company_name?.charAt(0) || 'C'}
                              </div>
                            )}
                            <div className="ml-4">
                              <h2 className="text-lg font-medium text-gray-900">{application.job_title}</h2>
                              <p className="text-sm text-gray-600">{application.company_name}</p>
                            </div>
                          </div>
                          
                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                            <div className="flex items-center">
                              <FaMapMarkerAlt className="mr-1 h-4 w-4 text-gray-400" />
                              {application.location}
                            </div>
                            <div className="flex items-center">
                              <FaBriefcase className="mr-1 h-4 w-4 text-gray-400" />
                              {application.job_type}
                            </div>
                            <div className="flex items-center">
                              <FaCalendarAlt className="mr-1 h-4 w-4 text-gray-400" />
                              Applied on {formatDate(application.applied_date)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4 md:mt-0 flex flex-col items-end">
                          {getStatusBadge(application.status)}
                          
                          {application.match_score && (
                            <div className="mt-2 flex items-center">
                              <span className="text-xs text-gray-500 mr-2">Match:</span>
                              <span className={`text-xs font-medium ${
                                application.match_score >= 80 ? 'text-green-600' : 
                                application.match_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {application.match_score}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
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
          </>
        )}
      </div>
    </TailwindLayout>
  );
};

// Protect this page with authentication
export default withAuth(ApplicationsPage, { requireAuth: true });
