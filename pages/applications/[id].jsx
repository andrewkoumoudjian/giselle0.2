import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import TailwindLayout from '../../components/TailwindLayout';
import TailwindSpinner from '../../components/ui/TailwindSpinner';
import { getApplicationById } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { withAuth } from '../../context/AuthContext';
import { FaMapMarkerAlt, FaBriefcase, FaDollarSign, FaCalendarAlt, FaCheckCircle, FaHourglass, FaUserCheck, FaTimes, FaExclamationCircle, FaFileAlt, FaEnvelope, FaPhone, FaLinkedin, FaGithub, FaGlobe } from 'react-icons/fa';

const ApplicationDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch application details
  useEffect(() => {
    const fetchApplicationDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await getApplicationById(id);
        setApplication(data);
      } catch (err) {
        console.error('Error fetching application details:', err);
        setError('Failed to load application details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplicationDetails();
  }, [id]);
  
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
  
  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <FaHourglass className="mr-2 h-4 w-4" />
            Pending Review
          </span>
        );
      case 'reviewing':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <FaUserCheck className="mr-2 h-4 w-4" />
            Under Review
          </span>
        );
      case 'interviewing':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
            <FaUserCheck className="mr-2 h-4 w-4" />
            Interviewing
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <FaCheckCircle className="mr-2 h-4 w-4" />
            Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <FaTimes className="mr-2 h-4 w-4" />
            Not Selected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            <FaExclamationCircle className="mr-2 h-4 w-4" />
            {status}
          </span>
        );
    }
  };
  
  // Get status description
  const getStatusDescription = (status) => {
    switch (status) {
      case 'pending':
        return "Your application has been submitted and is waiting to be reviewed by the hiring team.";
      case 'reviewing':
        return "The hiring team is currently reviewing your application and qualifications.";
      case 'interviewing':
        return "Congratulations! You've been selected for an interview. The hiring team will contact you soon with more details.";
      case 'accepted':
        return "Congratulations! Your application has been accepted. The hiring team will contact you with next steps.";
      case 'rejected':
        return "Thank you for your interest. The hiring team has decided to move forward with other candidates at this time.";
      default:
        return "Your application status is being updated.";
    }
  };
  
  if (loading) {
    return (
      <TailwindLayout title="Loading Application...">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center justify-center py-12">
            <TailwindSpinner size="lg" color="primary" />
            <p className="mt-4 text-gray-600">Loading application details...</p>
          </div>
        </div>
      </TailwindLayout>
    );
  }
  
  if (error || !application) {
    return (
      <TailwindLayout title="Application Not Found">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white shadow-card rounded-lg p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Application Not Found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {error || "We couldn't find the application you're looking for."}
            </p>
            <div className="mt-6">
              <button
                onClick={() => router.push('/applications')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                View All Applications
              </button>
            </div>
          </div>
        </div>
      </TailwindLayout>
    );
  }
  
  return (
    <TailwindLayout title={`Application for ${application.job.title}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/applications')}
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <svg className="mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to Applications
          </button>
        </div>
        
        {/* Application Header */}
        <div className="bg-white shadow-card rounded-lg overflow-hidden mb-8">
          <div className="p-6">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div className="sm:flex sm:items-center">
                {application.job.company.logo_url ? (
                  <img
                    src={application.job.company.logo_url}
                    alt={application.job.company.name}
                    className="h-16 w-16 rounded-md object-contain bg-gray-50 p-1 border border-gray-200"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-md bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xl">
                    {application.job.company.name?.charAt(0) || 'C'}
                  </div>
                )}
                <div className="mt-4 sm:mt-0 sm:ml-4">
                  <h1 className="text-2xl font-bold text-gray-900">{application.job.title}</h1>
                  <div className="mt-1 flex items-center">
                    <span className="text-lg text-gray-600">{application.job.company.name}</span>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-0">
                {getStatusBadge(application.status)}
              </div>
            </div>
          </div>
          
          {/* Application Details */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center">
                <FaMapMarkerAlt className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">{application.job.location}</span>
              </div>
              <div className="flex items-center">
                <FaBriefcase className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600 capitalize">{application.job.job_type}</span>
              </div>
              {application.job.salary_range && (
                <div className="flex items-center">
                  <FaDollarSign className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">{application.job.salary_range}</span>
                </div>
              )}
              <div className="flex items-center">
                <FaCalendarAlt className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">Applied on {formatDate(application.applied_date)}</span>
              </div>
            </div>
          </div>
          
          {/* Application Status */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Application Status</h3>
            <p className="text-sm text-gray-600">{getStatusDescription(application.status)}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Match Score */}
            {application.match_score && (
              <div className="bg-white shadow-card rounded-lg overflow-hidden mb-8">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Match Score</h2>
                  
                  <div className="flex items-center mb-4">
                    <div className="mr-4">
                      <span className={`text-2xl font-bold ${
                        application.match_score >= 80 ? 'text-green-600' : 
                        application.match_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {application.match_score}%
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            application.match_score >= 80 ? 'bg-green-500' : 
                            application.match_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${application.match_score}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Skills Match */}
                  {application.skills && (
                    <div>
                      <h3 className="text-md font-medium text-gray-900 mb-2">Skills</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {application.skills.matched && application.skills.matched.map((skill, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            <FaCheckCircle className="mr-1 h-3 w-3" />
                            {skill}
                          </span>
                        ))}
                        
                        {application.skills.missing && application.skills.missing.map((skill, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            <FaExclamationCircle className="mr-1 h-3 w-3" />
                            {skill}
                          </span>
                        ))}
                        
                        {application.skills.additional && application.skills.additional.map((skill, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Cover Letter */}
            {application.cover_letter && (
              <div className="bg-white shadow-card rounded-lg overflow-hidden mb-8">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Cover Letter</h2>
                  <div className="prose max-w-none">
                    <p className="text-gray-600 whitespace-pre-line">{application.cover_letter}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Custom Questions */}
            {application.custom_questions && Object.keys(application.custom_questions).length > 0 && (
              <div className="bg-white shadow-card rounded-lg overflow-hidden mb-8">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h2>
                  
                  <div className="space-y-6">
                    {application.custom_questions.yearsOfExperience && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-1">Years of Experience</h3>
                        <p className="text-gray-600">{application.custom_questions.yearsOfExperience}</p>
                      </div>
                    )}
                    
                    {application.custom_questions.relevantProjects && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-1">Relevant Projects</h3>
                        <p className="text-gray-600 whitespace-pre-line">{application.custom_questions.relevantProjects}</p>
                      </div>
                    )}
                    
                    {application.custom_questions.salary && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-1">Expected Salary</h3>
                        <p className="text-gray-600">{application.custom_questions.salary}</p>
                      </div>
                    )}
                    
                    {application.custom_questions.startDate && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-1">Earliest Start Date</h3>
                        <p className="text-gray-600">{application.custom_questions.startDate}</p>
                      </div>
                    )}
                    
                    {application.custom_questions.relocation !== undefined && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-1">Willing to Relocate</h3>
                        <p className="text-gray-600">{application.custom_questions.relocation ? 'Yes' : 'No'}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Job Description */}
            <div className="bg-white shadow-card rounded-lg overflow-hidden mb-8">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Job Description</h2>
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: application.job.description }} />
                </div>
                
                {/* Skills */}
                {application.job.skills && application.job.skills.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-md font-medium text-gray-900 mb-2">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {application.job.skills.map((skill, index) => (
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
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Resume */}
            <div className="bg-white shadow-card rounded-lg overflow-hidden mb-8">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Resume</h2>
                
                {application.resume_url ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FaFileAlt className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">Resume</span>
                    </div>
                    <a
                      href={application.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      View Resume
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No resume available</p>
                )}
              </div>
            </div>
            
            {/* Contact Information */}
            <div className="bg-white shadow-card rounded-lg overflow-hidden mb-8">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h2>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <FaEnvelope className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">{application.candidate.email}</span>
                  </div>
                  
                  {application.candidate.phone && (
                    <div className="flex items-center">
                      <FaPhone className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">{application.candidate.phone}</span>
                    </div>
                  )}
                  
                  {application.candidate.location && (
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">{application.candidate.location}</span>
                    </div>
                  )}
                </div>
                
                {/* Professional Profiles */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Professional Profiles</h3>
                  
                  <div className="space-y-3">
                    {application.candidate.linkedin_url && (
                      <div className="flex items-center">
                        <FaLinkedin className="h-5 w-5 text-blue-500 mr-2" />
                        <a
                          href={application.candidate.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          LinkedIn Profile
                        </a>
                      </div>
                    )}
                    
                    {application.candidate.github_url && (
                      <div className="flex items-center">
                        <FaGithub className="h-5 w-5 text-gray-800 mr-2" />
                        <a
                          href={application.candidate.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          GitHub Profile
                        </a>
                      </div>
                    )}
                    
                    {application.candidate.portfolio_url && (
                      <div className="flex items-center">
                        <FaGlobe className="h-5 w-5 text-green-500 mr-2" />
                        <a
                          href={application.candidate.portfolio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 hover:text-primary-700"
                        >
                          Portfolio Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="bg-white shadow-card rounded-lg overflow-hidden mb-8">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Actions</h2>
                
                <div className="space-y-4">
                  <Link
                    href={`/jobs/${application.job.id}`}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    View Job Posting
                  </Link>
                  
                  {application.status === 'rejected' && (
                    <Link
                      href="/jobs"
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Browse Similar Jobs
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TailwindLayout>
  );
};

// Protect this page with authentication
export default withAuth(ApplicationDetailPage, { requireAuth: true });
