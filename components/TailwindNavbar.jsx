import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { 
  FaUserCircle, 
  FaBars, 
  FaTimes, 
  FaChevronDown, 
  FaBell, 
  FaSignOutAlt,
  FaUserCog,
  FaClipboardList,
  FaTachometerAlt
} from 'react-icons/fa';

const TailwindNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated, logout, hasRole } = useAuth();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Check if the current route matches the link
  const isActive = (path) => {
    return router.pathname === path || router.pathname.startsWith(`${path}/`);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-primary-600">
                HR Talent
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link 
                href="/jobs"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/jobs') 
                    ? 'border-primary-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Jobs
              </Link>
              
              {isAuthenticated() && hasRole('employer') && (
                <Link 
                  href="/dashboard"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/dashboard') 
                      ? 'border-primary-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Dashboard
                </Link>
              )}
              
              {isAuthenticated() && hasRole('jobseeker') && (
                <Link 
                  href="/applications"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/applications') 
                      ? 'border-primary-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  My Applications
                </Link>
              )}
              
              <Link 
                href="/about"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/about') 
                    ? 'border-primary-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                About
              </Link>
            </div>
          </div>
          
          {/* Right side navigation */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isAuthenticated() ? (
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none relative">
                  <span className="sr-only">View notifications</span>
                  <FaBell className="h-6 w-6" />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                </button>
                
                {/* Profile dropdown */}
                <div className="relative">
                  <button 
                    onClick={toggleProfile}
                    className="flex items-center space-x-2 text-sm focus:outline-none"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                      {user?.name?.charAt(0) || <FaUserCircle className="h-8 w-8" />}
                    </div>
                    <span className="hidden md:block font-medium text-gray-700">{user?.name || 'User'}</span>
                    <FaChevronDown className="h-4 w-4 text-gray-500" />
                  </button>
                  
                  {/* Dropdown menu */}
                  {isProfileOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                      {hasRole('employer') && (
                        <Link 
                          href="/dashboard"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <FaTachometerAlt className="mr-3 h-4 w-4 text-gray-500" />
                          Dashboard
                        </Link>
                      )}
                      
                      {hasRole('jobseeker') && (
                        <Link 
                          href="/applications"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <FaClipboardList className="mr-3 h-4 w-4 text-gray-500" />
                          My Applications
                        </Link>
                      )}
                      
                      <Link 
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FaUserCog className="mr-3 h-4 w-4 text-gray-500" />
                        Profile Settings
                      </Link>
                      
                      <button 
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                      >
                        <FaSignOutAlt className="mr-3 h-4 w-4 text-red-500" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/login"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register"
                  className="btn-primary"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button 
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <FaTimes className="block h-6 w-6" />
              ) : (
                <FaBars className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link 
              href="/jobs"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/jobs') 
                  ? 'border-primary-500 text-primary-700 bg-primary-50' 
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              }`}
            >
              Jobs
            </Link>
            
            {isAuthenticated() && hasRole('employer') && (
              <Link 
                href="/dashboard"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive('/dashboard') 
                    ? 'border-primary-500 text-primary-700 bg-primary-50' 
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                }`}
              >
                Dashboard
              </Link>
            )}
            
            {isAuthenticated() && hasRole('jobseeker') && (
              <Link 
                href="/applications"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive('/applications') 
                    ? 'border-primary-500 text-primary-700 bg-primary-50' 
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                }`}
              >
                My Applications
              </Link>
            )}
            
            <Link 
              href="/about"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/about') 
                  ? 'border-primary-500 text-primary-700 bg-primary-50' 
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              }`}
            >
              About
            </Link>
          </div>
          
          {/* Mobile authentication */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            {isAuthenticated() ? (
              <>
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white">
                      {user?.name?.charAt(0) || <FaUserCircle className="h-10 w-10" />}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user?.name || 'User'}</div>
                    <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                  </div>
                  <button className="ml-auto p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none">
                    <span className="sr-only">View notifications</span>
                    <FaBell className="h-6 w-6" />
                  </button>
                </div>
                <div className="mt-3 space-y-1">
                  <Link 
                    href="/profile"
                    className="block px-4 py-2 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  >
                    Profile Settings
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:text-red-800 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-3 space-y-1 px-2">
                <Link 
                  href="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white bg-primary-500 hover:bg-primary-600"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default TailwindNavbar;
