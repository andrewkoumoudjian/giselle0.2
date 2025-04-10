import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import TailwindLayout from '../../components/TailwindLayout';
import TailwindSpinner from '../../components/ui/TailwindSpinner';
import { withSupabaseAuth } from '../../context/SupabaseAuthContext';
import { FaArrowLeft, FaExclamationCircle, FaCheckCircle, FaPlus, FaTimes } from 'react-icons/fa';
import supabase from '../../utils/supabase';
import dynamic from 'next/dynamic';

// Import rich text editor with dynamic import to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

const JobCreatePage = () => {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [company, setCompany] = useState(null);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    job_type: 'full-time',
    salary_min: '',
    salary_max: '',
    experience_level: '',
    education: '',
    department: '',
    closing_date: '',
    status: 'active',
  });
  
  // Fetch company data
  useEffect(() => {
    const fetchCompanyData = async () => {
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
        
        // Get company details
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', companyUser.company_id)
          .single();
        
        if (companyError) {
          throw companyError;
        }
        
        setCompany(company);
      } catch (err) {
        console.error('Error fetching company data:', err);
        setError('Failed to load company data. Please try again.');
      }
    };
    
    fetchCompanyData();
  }, []);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Handle rich text editor changes
  const handleDescriptionChange = (content) => {
    setFormData(prev => ({
      ...prev,
      description: content,
    }));
  };
  
  // Handle adding a skill
  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };
  
  // Handle removing a skill
  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Validate form
      if (!formData.title || !formData.description || !formData.location || !formData.job_type) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }
      
      // Validate salary range
      if (formData.salary_min && formData.salary_max && Number(formData.salary_min) > Number(formData.salary_max)) {
        setError('Minimum salary cannot be greater than maximum salary');
        setLoading(false);
        return;
      }
      
      // Get company ID
      if (!company) {
        setError('Company information not found');
        setLoading(false);
        return;
      }
      
      // Prepare job data
      const jobData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        job_type: formData.job_type,
        salary_min: formData.salary_min ? Number(formData.salary_min) : null,
        salary_max: formData.salary_max ? Number(formData.salary_max) : null,
        experience_level: formData.experience_level || null,
        education: formData.education || null,
        department: formData.department || null,
        closing_date: formData.closing_date || null,
        status: formData.status,
        company_id: company.id,
        posted_date: new Date().toISOString(),
        created_by: supabase.auth.user().id,
      };
      
      // Create job
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .insert(jobData)
        .select()
        .single();
      
      if (jobError) {
        throw jobError;
      }
      
      // Add skills if provided
      if (skills.length > 0) {
        const skillsToInsert = skills.map(skill => ({
          job_id: job.id,
          skill: skill,
          importance: 'required',
        }));
        
        const { error: skillsError } = await supabase
          .from('job_skills')
          .insert(skillsToInsert);
        
        if (skillsError) {
          throw skillsError;
        }
      }
      
      // Show success message
      setSuccess(true);
      
      // Redirect to job management page after a delay
      setTimeout(() => {
        router.push('/jobs/manage');
      }, 2000);
    } catch (err) {
      console.error('Error creating job:', err);
      setError(err.message || 'Failed to create job. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <TailwindLayout title="Create Job">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <FaArrowLeft className="mr-1 h-4 w-4" />
            Back
          </button>
          <h1 className="ml-4 text-2xl font-bold text-gray-900">Create New Job</h1>
        </div>
        
        {/* Success message */}
        {success && (
          <div className="mb-6 rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaCheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Job created successfully
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    Your job has been created successfully. You will be redirected to the job management page shortly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  There was an error creating the job
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Job form */}
        <div className="bg-white shadow-card rounded-lg overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Job Details</h2>
              <p className="mt-1 text-sm text-gray-500">
                Fill in the details for your new job listing.
              </p>
            </div>
            
            <div className="p-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* Job Title */}
              <div className="sm:col-span-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Senior Software Engineer"
                  />
                </div>
              </div>
              
              {/* Job Description */}
              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Job Description <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <ReactQuill
                    value={formData.description}
                    onChange={handleDescriptionChange}
                    theme="snow"
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                        ['link'],
                        ['clean']
                      ],
                    }}
                    className="h-64"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Provide a detailed description of the job, including responsibilities, requirements, and benefits.
                </p>
              </div>
              
              {/* Location */}
              <div className="sm:col-span-3">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="location"
                    id="location"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. San Francisco, CA"
                  />
                </div>
              </div>
              
              {/* Job Type */}
              <div className="sm:col-span-3">
                <label htmlFor="job_type" className="block text-sm font-medium text-gray-700">
                  Job Type <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    name="job_type"
                    id="job_type"
                    required
                    value={formData.job_type}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="temporary">Temporary</option>
                    <option value="internship">Internship</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>
              </div>
              
              {/* Salary Range */}
              <div className="sm:col-span-3">
                <label htmlFor="salary_min" className="block text-sm font-medium text-gray-700">
                  Minimum Salary
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="salary_min"
                    id="salary_min"
                    value={formData.salary_min}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. 50000"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="salary_max" className="block text-sm font-medium text-gray-700">
                  Maximum Salary
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="salary_max"
                    id="salary_max"
                    value={formData.salary_max}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. 80000"
                  />
                </div>
              </div>
              
              {/* Experience Level */}
              <div className="sm:col-span-3">
                <label htmlFor="experience_level" className="block text-sm font-medium text-gray-700">
                  Experience Level
                </label>
                <div className="mt-1">
                  <select
                    name="experience_level"
                    id="experience_level"
                    value={formData.experience_level}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="">Select Experience Level</option>
                    <option value="entry">Entry Level</option>
                    <option value="junior">Junior</option>
                    <option value="mid-level">Mid-Level</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>
              </div>
              
              {/* Education */}
              <div className="sm:col-span-3">
                <label htmlFor="education" className="block text-sm font-medium text-gray-700">
                  Education
                </label>
                <div className="mt-1">
                  <select
                    name="education"
                    id="education"
                    value={formData.education}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="">Select Education Level</option>
                    <option value="high school">High School</option>
                    <option value="associate">Associate's Degree</option>
                    <option value="bachelor">Bachelor's Degree</option>
                    <option value="master">Master's Degree</option>
                    <option value="phd">PhD</option>
                  </select>
                </div>
              </div>
              
              {/* Department */}
              <div className="sm:col-span-3">
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                  Department
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="department"
                    id="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Engineering"
                  />
                </div>
              </div>
              
              {/* Closing Date */}
              <div className="sm:col-span-3">
                <label htmlFor="closing_date" className="block text-sm font-medium text-gray-700">
                  Closing Date
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="closing_date"
                    id="closing_date"
                    value={formData.closing_date}
                    onChange={handleChange}
                    className="form-input"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              
              {/* Status */}
              <div className="sm:col-span-3">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <div className="mt-1">
                  <select
                    name="status"
                    id="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
              
              {/* Skills */}
              <div className="sm:col-span-6">
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                  Skills
                </label>
                <div className="mt-1 flex">
                  <input
                    type="text"
                    id="skills"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className="form-input flex-1"
                    placeholder="e.g. JavaScript"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <FaPlus className="mr-1 h-4 w-4" />
                    Add
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-1.5 h-3.5 w-3.5 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-500 focus:text-white"
                      >
                        <span className="sr-only">Remove {skill}</span>
                        <FaTimes className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 text-right">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mr-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <TailwindSpinner size="sm" color="white" className="mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Job'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </TailwindLayout>
  );
};

// Protect this page with authentication and role check
export default withSupabaseAuth(JobCreatePage, { 
  requireAuth: true,
  requiredRole: 'employer',
});
