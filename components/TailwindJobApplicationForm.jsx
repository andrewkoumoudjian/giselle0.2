import React, { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { FaUpload, FaFile, FaFilePdf, FaFileWord, FaTrash, FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

const TailwindJobApplicationForm = ({ jobId }) => {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const { user } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
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
  
  // File upload state
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested fields (custom questions)
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: type === 'checkbox' ? checked : value,
        },
      });
    } else {
      // Handle top-level fields
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
  };
  
  // Handle resume file upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PDF or Word document');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Please upload a file smaller than 5MB');
      return;
    }
    
    setResumeFile(file);
    
    // Simulate file upload and analysis
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
    
    // Simulate resume analysis after upload completes
    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      setIsUploading(false);
      
      // Mock resume analysis result
      setResumeAnalysis({
        match_score: 85,
        skills: {
          matched: ['JavaScript', 'React', 'Node.js', 'HTML/CSS'],
          missing: ['GraphQL', 'AWS'],
        },
        experience_years: 4,
        education: "Bachelor's Degree in Computer Science",
        recommendations: [
          'Consider highlighting your React project experience in your cover letter',
          'Add more details about your cloud platform experience',
        ],
      });
    }, 3000);
  };
  
  // Remove uploaded resume
  const handleRemoveResume = () => {
    setResumeFile(null);
    setUploadProgress(0);
    setResumeAnalysis(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Get file icon based on file type
  const getFileIcon = (file) => {
    if (!file) return FaFile;
    
    if (file.type === 'application/pdf') {
      return FaFilePdf;
    } else if (file.type.includes('word')) {
      return FaFileWord;
    } else {
      return FaFile;
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    // Basic validation
    if (!formData.fullName || !formData.email || !formData.phone) {
      setError('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }
    
    if (!formData.useProfileResume && !resumeFile) {
      setError('Please upload your resume');
      setIsSubmitting(false);
      return;
    }
    
    try {
      // In a real app, we would call the API
      // await submitApplication(jobId, formData, resumeFile);
      
      // For demo purposes, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(true);
      
      // Redirect to applications page after a delay
      setTimeout(() => {
        router.push('/applications');
      }, 3000);
    } catch (error) {
      setError(error.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If application was successfully submitted
  if (success) {
    return (
      <div className="bg-blue-50 border border-blue-100 rounded-lg shadow-md p-8 text-center">
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
          <FaCheckCircle className="h-8 w-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
        <p className="text-lg text-gray-700 mb-6">
          Your application has been successfully submitted. You will be redirected to your applications page shortly.
        </p>
        <Link 
          href="/applications"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          View My Applications
        </Link>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Personal Information */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="form-input"
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              className="form-input"
              required
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            className="form-input"
            required
          />
        </div>
      </div>
      
      <hr className="border-gray-200" />
      
      {/* Resume Upload */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Resume</h2>
        
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="useProfileResume"
              checked={formData.useProfileResume}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-gray-700">Use resume from my profile</span>
          </label>
          <p className="mt-1 text-sm text-gray-500">
            You can upload a different resume specifically for this application
          </p>
        </div>
        
        {!formData.useProfileResume && (
          <div className={`border-2 border-dashed rounded-lg p-6 mb-6 ${
            resumeFile ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
          }`}>
            {!resumeFile ? (
              <div className="text-center">
                <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm font-medium text-gray-900">Upload your resume</p>
                <p className="mt-1 text-xs text-gray-500">PDF or Word document, max 5MB</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Select File
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                />
              </div>
            ) : (
              <div>
                {isUploading ? (
                  <div className="text-center">
                    <p className="font-medium text-gray-900 mb-2">Uploading resume...</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                      <div 
                        className="bg-primary-600 h-2.5 rounded-full" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500">{uploadProgress}% complete</p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center">
                      {React.createElement(getFileIcon(resumeFile), { className: "h-6 w-6 text-green-500 mr-3" })}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{resumeFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveResume}
                        className="ml-4 inline-flex items-center p-1.5 border border-transparent rounded-full text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {resumeAnalysis && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-md">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Resume Analysis</h3>
                        
                        <div className="flex items-center mb-3">
                          <span className="text-sm font-medium text-gray-700 mr-2">Match Score:</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            resumeAnalysis.match_score >= 80 
                              ? 'bg-green-100 text-green-800' 
                              : resumeAnalysis.match_score >= 60 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {resumeAnalysis.match_score}%
                          </span>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Skills:</p>
                          <div className="flex flex-wrap gap-1">
                            {resumeAnalysis.skills.matched.map((skill, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <FaCheckCircle className="mr-1 h-3 w-3" />
                                {skill}
                              </span>
                            ))}
                            {resumeAnalysis.skills.missing.map((skill, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <FaExclamationTriangle className="mr-1 h-3 w-3" />
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-700 mb-1">
                          <FaInfoCircle className="inline mr-1 text-blue-500" />
                          Experience: {resumeAnalysis.experience_years} years
                        </p>
                        <p className="text-xs text-gray-700 mb-3">
                          <FaInfoCircle className="inline mr-1 text-blue-500" />
                          Education: {resumeAnalysis.education}
                        </p>
                        
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-1">Recommendations:</p>
                          <ul className="text-xs text-gray-700 space-y-1">
                            {resumeAnalysis.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-primary-500 mr-1">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      <hr className="border-gray-200" />
      
      {/* Cover Letter */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Cover Letter</h2>
        
        <div className="mb-6">
          <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-1">
            Cover Letter
          </label>
          <textarea
            id="coverLetter"
            name="coverLetter"
            value={formData.coverLetter}
            onChange={handleChange}
            placeholder="Introduce yourself and explain why you're a good fit for this position"
            rows={8}
            className="form-input"
          ></textarea>
          <p className="mt-1 text-sm text-gray-500">
            A personalized cover letter can significantly increase your chances of getting an interview
          </p>
        </div>
      </div>
      
      <hr className="border-gray-200" />
      
      {/* Professional Profiles */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Professional Profiles</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1">
              LinkedIn Profile
            </label>
            <input
              type="url"
              id="linkedin"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/yourprofile"
              className="form-input"
            />
          </div>
          
          <div>
            <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700 mb-1">
              Portfolio Website
            </label>
            <input
              type="url"
              id="portfolio"
              name="portfolio"
              value={formData.portfolio}
              onChange={handleChange}
              placeholder="https://yourportfolio.com"
              className="form-input"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="github" className="block text-sm font-medium text-gray-700 mb-1">
            GitHub Profile
          </label>
          <input
            type="url"
            id="github"
            name="github"
            value={formData.github}
            onChange={handleChange}
            placeholder="https://github.com/yourusername"
            className="form-input"
          />
        </div>
      </div>
      
      <hr className="border-gray-200" />
      
      {/* Additional Questions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Questions</h2>
        
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
            placeholder="e.g. 3 years"
            className="form-input"
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
            placeholder="Describe your most relevant projects and your role in them"
            rows={5}
            className="form-input"
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
              placeholder="e.g. $80,000 - $100,000"
              className="form-input"
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
              placeholder="e.g. Immediately, 2 weeks notice"
              className="form-input"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="relocation"
              name="customQuestions.relocation"
              checked={formData.customQuestions.relocation}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="relocation" className="ml-2 block text-sm text-gray-700">
              I am willing to relocate for this position
            </label>
          </div>
        </div>
      </div>
      
      <hr className="border-gray-200" />
      
      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
          isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting...
          </>
        ) : (
          'Submit Application'
        )}
      </button>
    </form>
  );
};

export default TailwindJobApplicationForm;
