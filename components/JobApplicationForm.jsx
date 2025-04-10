import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import ResumeUploader from './ResumeUploader';
import TailwindSpinner from './ui/TailwindSpinner';
import { submitApplication } from '../utils/api';
import { FaUser, FaEnvelope, FaPhone, FaLinkedin, FaGithub, FaGlobe } from 'react-icons/fa';

const JobApplicationForm = ({ jobId, jobTitle, companyName }) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    coverLetter: '',
    linkedin: '',
    portfolio: '',
    github: '',
    useProfileResume: true,
    customQuestions: {
      yearsOfExperience: '',
      relevantProjects: '',
      salary: '',
      startDate: '',
      relocation: false,
    },
  });
  
  // Form submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  
  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setFormData(prevData => ({
        ...prevData,
        fullName: user.name || '',
        email: user.email || '',
        phone: user.profile?.phone || '',
        linkedin: user.profile?.linkedin_url || '',
        portfolio: user.profile?.portfolio_url || '',
        github: user.profile?.github_url || '',
      }));
    }
  }, [user]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested fields (custom questions)
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value,
        },
      }));
    } else {
      // Handle top-level fields
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };
  
  // Handle resume analysis completion
  const handleResumeAnalysis = (analysis) => {
    setResumeAnalysis(analysis);
    
    // Auto-fill years of experience if available
    if (analysis.experience && (analysis.experience.years || analysis.experience.relevant_years)) {
      const years = analysis.experience.years || analysis.experience.relevant_years;
      setFormData(prev => ({
        ...prev,
        customQuestions: {
          ...prev.customQuestions,
          yearsOfExperience: years.toString(),
        },
      }));
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push(`/login?redirect=${router.asPath}`);
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Validate form
      if (!formData.fullName || !formData.email || !formData.phone) {
        setError('Please fill in all required fields');
        setSubmitting(false);
        return;
      }
      
      // Submit application
      const applicationData = {
        ...formData,
        resumeAnalysis,
      };
      
      await submitApplication(jobId, applicationData);
      
      // Show success message
      setSuccess(true);
      
      // Redirect to applications page after a delay
      setTimeout(() => {
        router.push('/applications');
      }, 3000);
    } catch (err) {
      console.error('Application submission error:', err);
      setError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // If application was successfully submitted
  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-4">
          <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
        <p className="text-gray-600 mb-6">
          Your application for <span className="font-medium">{jobTitle}</span> at <span className="font-medium">{companyName}</span> has been successfully submitted.
        </p>
        <p className="text-gray-600 mb-6">
          You will be redirected to your applications page shortly.
        </p>
        <button
          type="button"
          onClick={() => router.push('/applications')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          View My Applications
        </button>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
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
      
      {/* Personal Information */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="form-input pl-10"
                placeholder="Enter your full name"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input pl-10"
                placeholder="Enter your email address"
                required
              />
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaPhone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-input pl-10"
              placeholder="Enter your phone number"
              required
            />
          </div>
        </div>
      </div>
      
      {/* Resume Upload */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Resume</h2>
        
        {user?.profile?.resume_url && (
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="useProfileResume"
                checked={formData.useProfileResume}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Use resume from my profile
              </span>
            </label>
          </div>
        )}
        
        {!formData.useProfileResume && (
          <div className="mb-6">
            <ResumeUploader 
              onAnalysisComplete={handleResumeAnalysis}
              jobId={jobId}
            />
          </div>
        )}
      </div>
      
      {/* Cover Letter */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Cover Letter</h2>
        <div className="mb-6">
          <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-1">
            Cover Letter
          </label>
          <textarea
            id="coverLetter"
            name="coverLetter"
            value={formData.coverLetter}
            onChange={handleChange}
            rows={6}
            className="form-input"
            placeholder="Introduce yourself and explain why you're a good fit for this position"
          ></textarea>
          <p className="mt-1 text-sm text-gray-500">
            A personalized cover letter can significantly increase your chances of getting an interview.
          </p>
        </div>
      </div>
      
      {/* Professional Profiles */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Professional Profiles</h2>
        
        <div className="mb-6">
          <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1">
            LinkedIn Profile
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLinkedin className="h-5 w-5 text-blue-500" />
            </div>
            <input
              type="url"
              id="linkedin"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              className="form-input pl-10"
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="github" className="block text-sm font-medium text-gray-700 mb-1">
              GitHub Profile
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaGithub className="h-5 w-5 text-gray-800" />
              </div>
              <input
                type="url"
                id="github"
                name="github"
                value={formData.github}
                onChange={handleChange}
                className="form-input pl-10"
                placeholder="https://github.com/yourusername"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700 mb-1">
              Portfolio Website
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaGlobe className="h-5 w-5 text-green-500" />
              </div>
              <input
                type="url"
                id="portfolio"
                name="portfolio"
                value={formData.portfolio}
                onChange={handleChange}
                className="form-input pl-10"
                placeholder="https://yourportfolio.com"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional Questions */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Questions</h2>
        
        <div className="mb-6">
          <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700 mb-1">
            How many years of relevant experience do you have?
          </label>
          <input
            type="text"
            id="yearsOfExperience"
            name="customQuestions.yearsOfExperience"
            value={formData.customQuestions.yearsOfExperience}
            onChange={handleChange}
            className="form-input"
            placeholder="e.g. 3 years"
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="relevantProjects" className="block text-sm font-medium text-gray-700 mb-1">
            Describe relevant projects you've worked on
          </label>
          <textarea
            id="relevantProjects"
            name="customQuestions.relevantProjects"
            value={formData.customQuestions.relevantProjects}
            onChange={handleChange}
            rows={4}
            className="form-input"
            placeholder="Describe your most relevant projects and your role in them"
          ></textarea>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1">
              Expected salary
            </label>
            <input
              type="text"
              id="salary"
              name="customQuestions.salary"
              value={formData.customQuestions.salary}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g. $80,000 - $100,000"
            />
          </div>
          
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Earliest start date
            </label>
            <input
              type="text"
              id="startDate"
              name="customQuestions.startDate"
              value={formData.customQuestions.startDate}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g. Immediately, 2 weeks notice"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="customQuestions.relocation"
              checked={formData.customQuestions.relocation}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              I am willing to relocate for this position
            </span>
          </label>
        </div>
      </div>
      
      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <TailwindSpinner size="sm" color="white" className="mr-2" />
              Submitting...
            </>
          ) : (
            'Submit Application'
          )}
        </button>
      </div>
    </form>
  );
};

export default JobApplicationForm;
