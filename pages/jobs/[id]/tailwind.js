import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import TailwindLayout from '../../../components/TailwindLayout';
import { FaArrowLeft, FaMapMarkerAlt, FaCalendarAlt, FaDollarSign, FaClock, FaBuilding, FaCheckCircle, FaUsers, FaBriefcase, FaShare, FaBookmark, FaChartLine } from 'react-icons/fa';

// Mock job data (in a real app, this would come from an API)
const mockJobs = [
  {
    id: '1',
    title: 'Software Engineer',
    company: 'Tech Solutions Inc.',
    location: 'Remote',
    description: 'We are looking for a talented software engineer to join our team with experience in React, Node.js, and cloud platforms.',
    posted_date: '2023-06-01',
    salary_range: '$100,000 - $130,000',
    job_type: 'Full-time',
    experience_level: '3-5 years',
    education: "Bachelor's degree in Computer Science or related field",
    skills: [
      'JavaScript',
      'React',
      'Node.js',
      'TypeScript',
      'HTML/CSS',
      'Git',
      'RESTful APIs',
    ],
    responsibilities: [
      'Develop and maintain web applications using React and Node.js',
      'Collaborate with cross-functional teams to define, design, and ship new features',
      'Ensure the technical feasibility of UI/UX designs',
      'Optimize applications for maximum speed and scalability',
      'Participate in code reviews and mentor junior developers',
    ],
    requirements: [
      '3+ years of experience in frontend development',
      'Strong proficiency in JavaScript, including DOM manipulation and the JavaScript object model',
      'Experience with React.js and its core principles',
      'Experience with popular React workflows (Redux, Hooks, etc.)',
      'Familiarity with RESTful APIs',
      'Knowledge of modern authorization mechanisms, such as JSON Web Tokens',
      'Experience with common frontend development tools such as Babel, Webpack, NPM, etc.',
    ],
    benefits: [
      'Competitive salary and equity',
      'Health, dental, and vision insurance',
      'Flexible work hours and remote work options',
      '401(k) with company match',
      'Professional development budget',
      'Unlimited PTO',
    ],
    company_description: 'Tech Solutions Inc. is a leading software development company specializing in creating innovative solutions for businesses of all sizes. We are passionate about technology and committed to delivering high-quality products that solve real-world problems.',
    application_count: 45,
    views: 1250,
    match_score: 85,
  },
];

const TailwindJobDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  
  // Fetch job details
  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        // In a real app, we would call the API
        // const data = await getJobById(id);
        
        // For demo purposes, we'll use mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        const foundJob = mockJobs.find(job => job.id === id);
        
        if (foundJob) {
          setJob(foundJob);
        } else {
          setError('Job not found');
        }
      } catch (err) {
        console.error('Error fetching job:', err);
        setError('Failed to load job details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJob();
  }, [id]);
  
  const toggleSaveJob = () => {
    setIsSaved(!isSaved);
  };
  
  const shareJob = () => {
    // In a real app, this would open a share dialog
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: `Check out this ${job.title} job at ${job.company}`,
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Job URL copied to clipboard!');
    }
  };
  
  if (loading) {
    return (
      <TailwindLayout title="Loading Job Details">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            <span className="ml-4 text-lg text-gray-700">Loading job details...</span>
          </div>
        </div>
      </TailwindLayout>
    );
  }
  
  if (error) {
    return (
      <TailwindLayout title="Error - Job Not Found">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
          <Link 
            href="/jobs"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <FaArrowLeft className="mr-2" />
            Back to Jobs
          </Link>
        </div>
      </TailwindLayout>
    );
  }
  
  if (!job) {
    return (
      <TailwindLayout title="Job Not Found">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">Job not found</p>
              </div>
            </div>
          </div>
          <Link 
            href="/jobs"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <FaArrowLeft className="mr-2" />
            Back to Jobs
          </Link>
        </div>
      </TailwindLayout>
    );
  }
  
  return (
    <TailwindLayout title={`${job.title} at ${job.company}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-6">
          <Link 
            href="/jobs"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <FaArrowLeft className="mr-2" />
            Back to Jobs
          </Link>
          
          <div className="flex space-x-2">
            <button 
              onClick={shareJob}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <FaShare className="mr-2" />
              Share
            </button>
            <button 
              onClick={toggleSaveJob}
              className={`inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                isSaved 
                  ? 'text-primary-700 bg-primary-50 border-primary-500' 
                  : 'text-gray-700 bg-white hover:bg-gray-50'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
            >
              <FaBookmark className={`mr-2 ${isSaved ? 'text-primary-500' : ''}`} />
              {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-card p-6 mb-6">
              <div className="border-b border-gray-200 pb-6 mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                <div className="flex items-center text-gray-700 mb-2">
                  <FaBuilding className="mr-2 text-gray-500" />
                  <span className="text-lg">{job.company}</span>
                </div>
                <div className="flex flex-wrap gap-4 text-gray-600">
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="mr-1 text-gray-500" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-1 text-gray-500" />
                    <span>Posted on {new Date(job.posted_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-start">
                  <div className="rounded-full bg-blue-100 p-2 mr-3">
                    <FaBriefcase className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Experience</p>
                    <p className="font-medium">{job.experience_level}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="rounded-full bg-green-100 p-2 mr-3">
                    <FaUsers className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Education</p>
                    <p className="font-medium">{job.education}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="rounded-full bg-purple-100 p-2 mr-3">
                    <FaClock className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Job Type</p>
                    <p className="font-medium">{job.job_type}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
                <p className="text-gray-700 whitespace-pre-line mb-4">{job.description}</p>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Responsibilities</h2>
                <ul className="space-y-2">
                  {job.responsibilities.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <FaCheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {job.requirements.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <FaCheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefits</h2>
                <ul className="space-y-2">
                  {job.benefits.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <FaCheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About {job.company}</h2>
                <p className="text-gray-700">{job.company_description}</p>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Apply Button */}
              <div className="bg-white rounded-lg shadow-card p-6">
                <div className="space-y-4">
                  <Link 
                    href={`/jobs/${job.id}/apply`}
                    className="w-full flex justify-center items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Apply Now
                  </Link>
                  
                  <div className="flex items-center justify-center text-gray-500 text-sm">
                    <FaUsers className="mr-2" />
                    <span>{job.application_count} people have applied</span>
                  </div>
                </div>
              </div>
              
              {/* Job Stats */}
              <div className="bg-white rounded-lg shadow-card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Stats</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Views</p>
                    <p className="text-2xl font-semibold text-gray-900">{job.views}</p>
                    <p className="text-xs text-gray-500">Last 30 days</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Applications</p>
                    <p className="text-2xl font-semibold text-gray-900">{job.application_count}</p>
                    <p className="text-xs text-gray-500">
                      {Math.round((job.application_count / job.views) * 100)}% conversion
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Match Score */}
              <div className="bg-blue-50 rounded-lg shadow-card p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Match Score</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Overall Match</span>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                      job.match_score >= 80 
                        ? 'bg-green-100 text-green-800' 
                        : job.match_score >= 60 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {job.match_score}%
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    Your profile matches {job.match_score}% of the requirements for this job.
                  </p>
                  
                  <Link 
                    href={`/jobs/${job.id}/match`}
                    className="inline-flex items-center px-4 py-2 border border-primary-500 text-sm font-medium rounded-md text-primary-700 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <FaChartLine className="mr-2" />
                    View Detailed Match
                  </Link>
                </div>
              </div>
              
              {/* Similar Jobs */}
              <div className="bg-white rounded-lg shadow-card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Similar Jobs</h3>
                
                <div className="space-y-4">
                  <div className="p-3 border border-gray-200 rounded-md hover:border-primary-500 hover:shadow-sm transition-all">
                    <h4 className="font-medium text-gray-900">Frontend Developer</h4>
                    <p className="text-sm text-gray-500">Web Solutions • Remote</p>
                    <p className="text-sm text-gray-500">$85,000 - $110,000</p>
                  </div>
                  
                  <div className="p-3 border border-gray-200 rounded-md hover:border-primary-500 hover:shadow-sm transition-all">
                    <h4 className="font-medium text-gray-900">React Developer</h4>
                    <p className="text-sm text-gray-500">Creative Designs • San Francisco, CA</p>
                    <p className="text-sm text-gray-500">$90,000 - $120,000</p>
                  </div>
                  
                  <div className="p-3 border border-gray-200 rounded-md hover:border-primary-500 hover:shadow-sm transition-all">
                    <h4 className="font-medium text-gray-900">Full Stack Engineer</h4>
                    <p className="text-sm text-gray-500">Tech Innovations • New York, NY</p>
                    <p className="text-sm text-gray-500">$110,000 - $140,000</p>
                  </div>
                  
                  <Link 
                    href="/jobs"
                    className="text-primary-600 hover:text-primary-800 text-sm font-medium block text-center"
                  >
                    View all similar jobs
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TailwindLayout>
  );
};

export default TailwindJobDetailPage;
