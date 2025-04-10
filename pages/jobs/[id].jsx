import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import TailwindLayout from '../../components/TailwindLayout';
import JobApplicationForm from '../../components/JobApplicationForm';
import TailwindSpinner from '../../components/ui/TailwindSpinner';
import { getJobById, getJobMatch } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { FaMapMarkerAlt, FaBriefcase, FaDollarSign, FaCalendarAlt, FaBuilding, FaGlobe, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const JobDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAuthenticated } = useAuth();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [matchData, setMatchData] = useState(null);
  const [loadingMatch, setLoadingMatch] = useState(false);
  
  // Fetch job details
  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const jobData = await getJobById(id);
        setJob(jobData);
        
        // If user is authenticated and is a job seeker, fetch match data
        if (isAuthenticated() && user?.role === 'jobseeker') {
          fetchMatchData(id);
        }
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError('Failed to load job details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobDetails();
  }, [id, isAuthenticated, user]);
  
  // Fetch job match data
  const fetchMatchData = async (jobId) => {
    try {
      setLoadingMatch(true);
      const data = await getJobMatch(jobId);
      setMatchData(data);
    } catch (err) {
      console.error('Error fetching job match data:', err);
      // Don't set error state, as this is not critical
    } finally {
      setLoadingMatch(false);
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
  
  // Handle apply button click
  const handleApplyClick = () => {
    if (!isAuthenticated()) {
      router.push(`/login?redirect=${router.asPath}`);
      return;
    }
    
    setShowApplicationForm(true);
    
    // Scroll to application form
    setTimeout(() => {
      document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  
  if (loading) {
    return (
      <TailwindLayout title="Loading Job...">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center justify-center py-12">
            <TailwindSpinner size="lg" color="primary" />
            <p className="mt-4 text-gray-600">Loading job details...</p>
          </div>
        </div>
      </TailwindLayout>
    );
  }
  
  if (error || !job) {
    return (
      <TailwindLayout title="Job Not Found">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white shadow-card rounded-lg p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Job Not Found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {error || "We couldn't find the job you're looking for."}
            </p>
            <div className="mt-6">
              <button
                onClick={() => router.push('/jobs')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Browse All Jobs
              </button>
            </div>
          </div>
        </div>
      </TailwindLayout>
    );
  }
  
  return (
    <TailwindLayout title={`${job.title} at ${job.company}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Job Header */}
        <div className="bg-white shadow-card rounded-lg overflow-hidden mb-8">
          <div className="p-6">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div className="sm:flex sm:items-center">
                {job.company_logo ? (
                  <img
                    src={job.company_logo}
                    alt={job.company}
                    className="h-16 w-16 rounded-md object-contain bg-gray-50 p-1 border border-gray-200"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-md bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xl">
                    {job.company?.charAt(0) || 'J'}
                  </div>
                )}
                <div className="mt-4 sm:mt-0 sm:ml-4">
                  <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                  <div className="mt-1 flex items-center">
                    <span className="text-lg text-gray-600">{job.company}</span>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-0 sm:flex-shrink-0">
                <button
                  type="button"
                  onClick={handleApplyClick}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>
          
          {/* Job Details */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center">
                <FaMapMarkerAlt className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">{job.location}</span>
              </div>
              <div className="flex items-center">
                <FaBriefcase className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600 capitalize">{job.job_type}</span>
              </div>
              {job.salary_range && (
                <div className="flex items-center">
                  <FaDollarSign className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">{job.salary_range}</span>
                </div>
              )}
              <div className="flex items-center">
                <FaCalendarAlt className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">Posted {formatDate(job.posted_date)}</span>
              </div>
            </div>
          </div>
          
          {/* Match Score (if available) */}
          {matchData && (
            <div className="border-t border-gray-200 px-6 py-4 bg-blue-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Match Score</h3>
                  <div className="mt-1 flex items-center">
                    <div className="mr-4">
                      <span className={`text-lg font-bold ${
                        matchData.match_score >= 80 ? 'text-green-600' : 
                        matchData.match_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {matchData.match_score}%
                      </span>
                    </div>
                    <div className="w-48 bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${
                          matchData.match_score >= 80 ? 'bg-green-500' : 
                          matchData.match_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${matchData.match_score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                {matchData.has_applied && (
                  <div className="mt-2 sm:mt-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <FaCheckCircle className="mr-1 h-3 w-3" />
                      Applied
                    </span>
                  </div>
                )}
              </div>
              
              {/* Skills Match */}
              {matchData.skills && (
                <div className="mt-3">
                  <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {matchData.skills.matched && matchData.skills.matched.map((skill, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        <FaCheckCircle className="mr-1 h-3 w-3" />
                        {skill}
                      </span>
                    ))}
                    
                    {matchData.skills.missing && matchData.skills.missing.map((skill, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        <FaExclamationTriangle className="mr-1 h-3 w-3" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Job Description */}
            <div className="bg-white shadow-card rounded-lg overflow-hidden mb-8">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Job Description</h2>
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: job.description }} />
                </div>
                
                {/* Skills */}
                {job.skills && job.skills.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-md font-medium text-gray-900 mb-2">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Additional Details */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {job.experience_level && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Experience Level</h3>
                      <p className="mt-1 text-sm text-gray-600">{job.experience_level}</p>
                    </div>
                  )}
                  
                  {job.education && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Education</h3>
                      <p className="mt-1 text-sm text-gray-600">{job.education}</p>
                    </div>
                  )}
                  
                  {job.department && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Department</h3>
                      <p className="mt-1 text-sm text-gray-600">{job.department}</p>
                    </div>
                  )}
                  
                  {job.closing_date && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Application Deadline</h3>
                      <p className="mt-1 text-sm text-gray-600">{formatDate(job.closing_date)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Application Form */}
            {showApplicationForm && (
              <div id="application-form" className="bg-white shadow-card rounded-lg overflow-hidden mb-8">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Apply for this Position</h2>
                  <JobApplicationForm 
                    jobId={job.id}
                    jobTitle={job.title}
                    companyName={job.company}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Company Information */}
            <div className="bg-white shadow-card rounded-lg overflow-hidden mb-8">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">About the Company</h2>
                
                <div className="flex items-center mb-4">
                  <FaBuilding className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">{job.company}</span>
                </div>
                
                {job.company_website && (
                  <div className="flex items-center mb-4">
                    <FaGlobe className="h-5 w-5 text-gray-400 mr-2" />
                    <a 
                      href={job.company_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      {job.company_website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                
                {job.company_description && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">{job.company_description}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Job Stats */}
            <div className="bg-white shadow-card rounded-lg overflow-hidden mb-8">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Job Stats</h2>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Views</span>
                      <span className="text-sm font-medium text-gray-900">{job.views || 0}</span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, (job.views || 0) / 10)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Applications</span>
                      <span className="text-sm font-medium text-gray-900">{job.application_count || 0}</span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-green-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, ((job.application_count || 0) / 20) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Apply Button (Sticky) */}
            <div className="sticky top-8">
              <button
                type="button"
                onClick={handleApplyClick}
                className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Apply Now
              </button>
              
              {matchData && matchData.has_applied && (
                <div className="mt-2 text-center">
                  <span className="text-sm text-gray-500">
                    You have already applied for this job
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TailwindLayout>
  );
};

export default JobDetailPage;
