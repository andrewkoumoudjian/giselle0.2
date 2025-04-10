import React, { useState, useEffect } from 'react';
import TailwindLayout from '../../components/TailwindLayout';
import TailwindDashboardStats from '../../components/TailwindDashboardStats';
import Link from 'next/link';
import { withAuth } from '../../context/AuthContext';
import { FaPlus, FaSearch, FaFilter, FaEllipsisH, FaEye, FaEdit, FaTrash, FaChartBar, FaUsers, FaFileAlt, FaUserCheck } from 'react-icons/fa';

// Mock job listings data
const mockJobs = [
  {
    id: '1',
    title: 'Software Engineer',
    location: 'Remote',
    department: 'Engineering',
    posted_date: '2023-06-01',
    status: 'active',
    applications: 45,
    views: 1250,
  },
  {
    id: '2',
    title: 'Product Manager',
    location: 'New York, NY',
    department: 'Product',
    posted_date: '2023-06-05',
    status: 'active',
    applications: 32,
    views: 980,
  },
  {
    id: '3',
    title: 'UX Designer',
    location: 'San Francisco, CA',
    department: 'Design',
    posted_date: '2023-06-08',
    status: 'active',
    applications: 28,
    views: 870,
  },
  {
    id: '4',
    title: 'Marketing Specialist',
    location: 'Chicago, IL',
    department: 'Marketing',
    posted_date: '2023-05-20',
    status: 'closed',
    applications: 18,
    views: 650,
  },
  {
    id: '5',
    title: 'Data Scientist',
    location: 'Remote',
    department: 'Data',
    posted_date: '2023-05-15',
    status: 'draft',
    applications: 0,
    views: 0,
  },
];

// Mock recent applications data
const mockApplications = [
  {
    id: '1',
    candidate_name: 'John Smith',
    job_title: 'Software Engineer',
    applied_date: '2023-06-15',
    status: 'reviewing',
    match_score: 85,
  },
  {
    id: '2',
    candidate_name: 'Sarah Johnson',
    job_title: 'Product Manager',
    applied_date: '2023-06-14',
    status: 'interviewing',
    match_score: 92,
  },
  {
    id: '3',
    candidate_name: 'Michael Brown',
    job_title: 'UX Designer',
    applied_date: '2023-06-13',
    status: 'pending',
    match_score: 78,
  },
  {
    id: '4',
    candidate_name: 'Emily Davis',
    job_title: 'Software Engineer',
    applied_date: '2023-06-12',
    status: 'rejected',
    match_score: 65,
  },
  {
    id: '5',
    candidate_name: 'David Wilson',
    job_title: 'Software Engineer',
    applied_date: '2023-06-10',
    status: 'accepted',
    match_score: 95,
  },
];

// Status badge color mapping
const statusColors = {
  active: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
  draft: 'bg-yellow-100 text-yellow-800',
  pending: 'bg-yellow-100 text-yellow-800',
  reviewing: 'bg-blue-100 text-blue-800',
  interviewing: 'bg-purple-100 text-purple-800',
  rejected: 'bg-red-100 text-red-800',
  accepted: 'bg-green-100 text-green-800',
};

const TailwindDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [jobsFilter, setJobsFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Filter jobs based on status and search term
  const filteredJobs = mockJobs.filter(job => {
    const matchesStatus = jobsFilter === 'all' || job.status === jobsFilter;
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });
  
  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  return (
    <TailwindLayout title="HR Dashboard">
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                HR Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your job listings, applications, and hiring process
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <Link
                href="/jobs/create"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <FaPlus className="-ml-1 mr-2 h-4 w-4" />
                Post New Job
              </Link>
            </div>
          </div>
          
          {/* Dashboard Stats */}
          <TailwindDashboardStats />
          
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`${
                  activeTab === 'overview'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('jobs')}
                className={`${
                  activeTab === 'jobs'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Job Listings
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                className={`${
                  activeTab === 'applications'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Applications
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`${
                  activeTab === 'analytics'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Analytics
              </button>
            </nav>
          </div>
          
          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Recent Job Listings */}
                <div className="bg-white shadow-card rounded-lg overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-900">Recent Job Listings</h2>
                    <Link
                      href="/jobs"
                      className="text-sm font-medium text-primary-600 hover:text-primary-500"
                    >
                      View all
                    </Link>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {loading ? (
                      <div className="p-6 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                      </div>
                    ) : (
                      mockJobs.slice(0, 3).map((job) => (
                        <div key={job.id} className="px-6 py-4 flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">{job.title}</h3>
                            <p className="text-xs text-gray-500 mt-1">{job.location} • {job.department}</p>
                          </div>
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[job.status]}`}>
                              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                            </span>
                            <Link
                              href={`/jobs/${job.id}`}
                              className="ml-4 text-gray-400 hover:text-gray-500"
                            >
                              <FaEye className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                {/* Recent Applications */}
                <div className="bg-white shadow-card rounded-lg overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-900">Recent Applications</h2>
                    <Link
                      href="/applications/analysis"
                      className="text-sm font-medium text-primary-600 hover:text-primary-500"
                    >
                      View all
                    </Link>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {loading ? (
                      <div className="p-6 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                      </div>
                    ) : (
                      mockApplications.slice(0, 3).map((application) => (
                        <div key={application.id} className="px-6 py-4 flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">{application.candidate_name}</h3>
                            <p className="text-xs text-gray-500 mt-1">{application.job_title} • Applied {formatDate(application.applied_date)}</p>
                          </div>
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[application.status]}`}>
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </span>
                            <Link
                              href={`/applications/${application.id}`}
                              className="ml-4 text-gray-400 hover:text-gray-500"
                            >
                              <FaEye className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="bg-white shadow-card rounded-lg overflow-hidden mb-8">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Link
                    href="/jobs/create"
                    className="group p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="p-3 rounded-full bg-primary-100 text-primary-600 mb-3">
                        <FaFileAlt className="h-6 w-6" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary-700">Post New Job</h3>
                      <p className="mt-1 text-xs text-gray-500">Create a new job listing</p>
                    </div>
                  </Link>
                  
                  <Link
                    href="/applications/analysis"
                    className="group p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="p-3 rounded-full bg-blue-100 text-blue-600 mb-3">
                        <FaUsers className="h-6 w-6" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary-700">Review Applications</h3>
                      <p className="mt-1 text-xs text-gray-500">Review and manage applications</p>
                    </div>
                  </Link>
                  
                  <Link
                    href="/dashboard/schedule"
                    className="group p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="p-3 rounded-full bg-green-100 text-green-600 mb-3">
                        <FaUserCheck className="h-6 w-6" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary-700">Schedule Interviews</h3>
                      <p className="mt-1 text-xs text-gray-500">Manage interview schedules</p>
                    </div>
                  </Link>
                  
                  <Link
                    href="/dashboard/analytics"
                    className="group p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="p-3 rounded-full bg-purple-100 text-purple-600 mb-3">
                        <FaChartBar className="h-6 w-6" />
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary-700">View Analytics</h3>
                      <p className="mt-1 text-xs text-gray-500">See hiring metrics and trends</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'jobs' && (
            <div>
              {/* Filters */}
              <div className="bg-white shadow-card rounded-lg overflow-hidden mb-6">
                <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between gap-4">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search jobs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="form-input pl-10"
                    />
                  </div>
                  <div className="flex items-center">
                    <div className="relative inline-block text-left">
                      <div className="flex items-center">
                        <FaFilter className="mr-2 h-4 w-4 text-gray-500" />
                        <select
                          value={jobsFilter}
                          onChange={(e) => setJobsFilter(e.target.value)}
                          className="form-input py-2"
                        >
                          <option value="all">All Jobs</option>
                          <option value="active">Active</option>
                          <option value="closed">Closed</option>
                          <option value="draft">Draft</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Jobs Table */}
              <div className="bg-white shadow-card rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Job Title
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
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
                      {loading ? (
                        <tr>
                          <td colSpan="7" className="px-6 py-4 text-center">
                            <div className="flex justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                            </div>
                          </td>
                        </tr>
                      ) : filteredJobs.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                            No jobs found matching your criteria
                          </td>
                        </tr>
                      ) : (
                        filteredJobs.map((job) => (
                          <tr key={job.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{job.title}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{job.location}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{job.department}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{formatDate(job.posted_date)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[job.status]}`}>
                                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {job.applications}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <Link
                                  href={`/jobs/${job.id}`}
                                  className="text-gray-400 hover:text-gray-500"
                                >
                                  <FaEye className="h-4 w-4" />
                                </Link>
                                <Link
                                  href={`/jobs/${job.id}/edit`}
                                  className="text-gray-400 hover:text-gray-500"
                                >
                                  <FaEdit className="h-4 w-4" />
                                </Link>
                                <button
                                  className="text-gray-400 hover:text-red-500"
                                  onClick={() => alert(`Delete job: ${job.title}`)}
                                >
                                  <FaTrash className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'applications' && (
            <div>
              <div className="bg-white shadow-card rounded-lg overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Recent Applications</h2>
                </div>
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
                      {loading ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 text-center">
                            <div className="flex justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        mockApplications.map((application) => (
                          <tr key={application.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{application.candidate_name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{application.job_title}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{formatDate(application.applied_date)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[application.status]}`}>
                                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                                  <div 
                                    className={`h-2.5 rounded-full ${
                                      application.match_score >= 80 ? 'bg-green-500' : 
                                      application.match_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${application.match_score}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-500">{application.match_score}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <Link
                                  href={`/applications/${application.id}`}
                                  className="text-gray-400 hover:text-gray-500"
                                >
                                  <FaEye className="h-4 w-4" />
                                </Link>
                                <button
                                  className="text-gray-400 hover:text-gray-500"
                                  onClick={() => alert(`More options for: ${application.candidate_name}`)}
                                >
                                  <FaEllipsisH className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 border-t border-gray-200">
                  <Link
                    href="/applications/analysis"
                    className="text-sm font-medium text-primary-600 hover:text-primary-500"
                  >
                    View all applications
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'analytics' && (
            <div>
              <div className="bg-white shadow-card rounded-lg overflow-hidden p-6 mb-6">
                <div className="text-center mb-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h2>
                  <p className="text-sm text-gray-500">
                    For detailed analytics and reports, please visit the full analytics page.
                  </p>
                </div>
                <div className="flex justify-center">
                  <Link
                    href="/applications/analysis"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <FaChartBar className="-ml-1 mr-2 h-4 w-4" />
                    View Full Analytics
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </TailwindLayout>
  );
};

export default withAuth(TailwindDashboardPage, { requiredRole: 'employer' });
