import React, { useState } from 'react';
import Link from 'next/link';
import TailwindLayout from '../components/TailwindLayout';
import TailwindJobCard from '../components/TailwindJobCard';
import { FaSearch, FaMapMarkerAlt, FaBriefcase, FaUsers, FaLaptopCode, FaChartLine, FaBuilding, FaGraduationCap } from 'react-icons/fa';

// Mock featured jobs data
const featuredJobs = [
  {
    id: '1',
    title: 'Software Engineer',
    company: 'Tech Solutions Inc.',
    location: 'Remote',
    description: 'We are looking for a talented software engineer to join our team with experience in React, Node.js, and cloud platforms.',
    posted_date: '2023-06-01',
    salary_range: '$100,000 - $130,000',
    job_type: 'Full-time',
    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'HTML/CSS'],
  },
  {
    id: '2',
    title: 'Product Manager',
    company: 'Innovative Products',
    location: 'New York, NY',
    description: 'Experienced product manager needed to lead our product development efforts. Must have 3+ years of experience in SaaS products.',
    posted_date: '2023-06-05',
    salary_range: '$110,000 - $140,000',
    job_type: 'Full-time',
    skills: ['Product Management', 'Agile', 'User Research', 'Roadmapping', 'SaaS'],
  },
  {
    id: '3',
    title: 'UX Designer',
    company: 'Creative Designs',
    location: 'San Francisco, CA',
    description: 'Join our design team to create beautiful and intuitive user experiences. Experience with Figma and user research required.',
    posted_date: '2023-06-08',
    salary_range: '$90,000 - $120,000',
    job_type: 'Full-time',
    skills: ['UI/UX Design', 'Figma', 'User Research', 'Wireframing', 'Prototyping'],
  },
];

// Mock categories data
const categories = [
  { name: 'Technology', icon: FaLaptopCode, count: 1243 },
  { name: 'Business', icon: FaChartLine, count: 873 },
  { name: 'Marketing', icon: FaBuilding, count: 642 },
  { name: 'Education', icon: FaGraduationCap, count: 528 },
  { name: 'Healthcare', icon: FaUsers, count: 419 },
  { name: 'Engineering', icon: FaBriefcase, count: 371 },
];

const TailwindHomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // In a real app, this would redirect to the search results page
    console.log('Searching for:', searchTerm, 'in', location);
  };

  return (
    <TailwindLayout title="HR Talent - Find Your Dream Job">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Find Your Dream Job Today
            </h1>
            <p className="text-xl mb-10 text-primary-100">
              Connect with top employers and discover opportunities that match your skills and experience.
            </p>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="bg-white p-3 rounded-lg shadow-lg flex flex-col md:flex-row">
              <div className="flex-1 flex items-center px-3 mb-3 md:mb-0">
                <FaSearch className="text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="Job title, keywords, or company"
                  className="w-full outline-none text-gray-700"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex-1 flex items-center px-3 border-t md:border-t-0 md:border-l border-gray-200 py-3 md:py-0 mb-3 md:mb-0">
                <FaMapMarkerAlt className="text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="City, state, or remote"
                  className="w-full outline-none text-gray-700"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              
              <button
                type="submit"
                className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-md transition-colors duration-200"
              >
                Search Jobs
              </button>
            </form>
            
            <div className="mt-6 text-primary-100 text-sm">
              Popular: Software Engineer, Product Manager, Data Scientist, UX Designer
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Jobs Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Jobs</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our handpicked selection of top job opportunities from leading companies.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredJobs.map((job) => (
              <TailwindJobCard key={job.id} job={job} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link 
              href="/jobs"
              className="btn-primary"
            >
              Browse All Jobs
            </Link>
          </div>
        </div>
      </section>
      
      {/* Job Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Job Categories</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore opportunities across various industries and find your perfect match.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <Link 
                key={index} 
                href={`/jobs?category=${category.name.toLowerCase()}`}
                className="bg-white rounded-lg shadow-card hover:shadow-card-hover p-6 flex items-center transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-4">
                  <category.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                  <p className="text-gray-500">{category.count} jobs available</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform makes it easy to find and apply for jobs that match your skills and experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mx-auto mb-4">
                <FaSearch className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">1. Search Jobs</h3>
              <p className="text-gray-600">
                Browse through thousands of job listings or use our advanced search to find the perfect match.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mx-auto mb-4">
                <FaUsers className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">2. Apply with Ease</h3>
              <p className="text-gray-600">
                Submit your application with just a few clicks and track your application status.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mx-auto mb-4">
                <FaBriefcase className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">3. Land Your Dream Job</h3>
              <p className="text-gray-600">
                Get hired by top companies and start your journey towards a fulfilling career.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Find Your Next Opportunity?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-primary-100">
            Join thousands of job seekers who have found their dream jobs through our platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/register"
              className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-md transition-colors duration-200"
            >
              Sign Up Now
            </Link>
            <Link 
              href="/jobs"
              className="bg-transparent hover:bg-primary-700 border border-white font-semibold py-3 px-8 rounded-md transition-colors duration-200"
            >
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>
    </TailwindLayout>
  );
};

export default TailwindHomePage;
