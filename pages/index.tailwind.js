import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import TailwindLayout from '../components/TailwindLayout';
import { FaSearch, FaBriefcase, FaUsers, FaLightbulb } from 'react-icons/fa';

const HomePage = () => {
  return (
    <TailwindLayout title="HR Talent Platform - Home">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Find the Perfect Talent for Your Company
              </h1>
              <p className="text-xl mb-8 text-primary-100">
                Connect with qualified candidates and streamline your hiring process with our AI-powered platform.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  href="/jobs"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-primary-700 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Browse Jobs
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-500 hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Sign Up Now
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img
                src="/images/hero-illustration.svg"
                alt="HR Talent Platform"
                className="max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Search Section */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg -mt-16 md:-mt-24 p-6 relative z-10">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Job title, keywords, or company"
                    className="form-input pl-10"
                  />
                </div>
              </div>
              <div className="md:w-1/4">
                <select className="form-input">
                  <option value="">All Locations</option>
                  <option value="remote">Remote</option>
                  <option value="new-york">New York, NY</option>
                  <option value="san-francisco">San Francisco, CA</option>
                  <option value="london">London, UK</option>
                </select>
              </div>
              <div>
                <button className="w-full md:w-auto inline-flex items-center justify-center px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose HR Talent Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform uses advanced AI to match the right candidates with the right jobs, saving you time and resources.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-card text-center">
              <div className="inline-flex items-center justify-center p-3 bg-primary-100 rounded-full text-primary-600 mb-4">
                <FaSearch className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Smart Matching
              </h3>
              <p className="text-gray-600">
                Our AI analyzes resumes and job descriptions to find the perfect match, saving you hours of manual screening.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-card text-center">
              <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full text-blue-600 mb-4">
                <FaBriefcase className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Streamlined Hiring
              </h3>
              <p className="text-gray-600">
                Manage your entire hiring process in one place, from job posting to candidate selection and onboarding.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-card text-center">
              <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full text-green-600 mb-4">
                <FaLightbulb className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Data-Driven Insights
              </h3>
              <p className="text-gray-600">
                Get valuable insights into your hiring process with detailed analytics and reporting tools.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Hiring Process?
          </h2>
          <p className="text-xl mb-8 text-primary-100 max-w-3xl mx-auto">
            Join thousands of companies that have streamlined their recruitment with HR Talent Platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-primary-700 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
            >
              Sign Up for Free
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 border border-white rounded-md shadow-sm text-base font-medium text-white bg-transparent hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </TailwindLayout>
  );
};

export default HomePage;
