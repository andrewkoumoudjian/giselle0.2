import React, { useState, useEffect } from 'react';
import TailwindLayout from '../../components/TailwindLayout';
import { withAuth } from '../../context/AuthContext';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaKey, FaBell, FaCamera, FaLinkedin, FaGithub, FaGlobe } from 'react-icons/fa';

const TailwindProfilePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
  });
  
  // Load user data
  useEffect(() => {
    if (user) {
      // In a real app, we would fetch the full profile from the API
      // For now, we'll use the data from the auth context
      const nameParts = (user.name || '').split(' ');
      setProfileData({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: '',
        bio: '',
        location: '',
        linkedin: '',
        github: '',
        portfolio: '',
      });
    }
  }, [user]);
  
  // Handle profile form changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    try {
      // In a real app, we would call the API
      // await updateProfile(profileData);
      
      // For demo purposes, we'll just simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Profile updated successfully');
    } catch (error) {
      alert('Failed to update profile');
    }
  };
  
  return (
    <TailwindLayout title="Profile Settings">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Profile Settings
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your personal information and account settings
            </p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('personal')}
              className={`${
                activeTab === 'personal'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <FaUser className="mr-2 h-4 w-4" />
              Personal Information
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`${
                activeTab === 'password'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <FaKey className="mr-2 h-4 w-4" />
              Password
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`${
                activeTab === 'notifications'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <FaBell className="mr-2 h-4 w-4" />
              Notifications
            </button>
          </nav>
        </div>
        
        {/* Personal Information Tab */}
        {activeTab === 'personal' && (
          <div className="bg-white shadow-card rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
              <p className="mt-1 text-sm text-gray-500">
                Update your personal information and how others see you on the platform
              </p>
            </div>
            <form onSubmit={handleUpdateProfile} className="p-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-2xl font-bold overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{profileData.firstName.charAt(0)}{profileData.lastName.charAt(0)}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 border border-gray-300 shadow-sm hover:bg-gray-50"
                  >
                    <FaCamera className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Click the camera icon to change your profile picture
                </p>
              </div>
              
              {/* Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleProfileChange}
                    className="form-input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleProfileChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>
              
              {/* Contact Information */}
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  className="form-input bg-gray-50"
                  readOnly
                />
                <p className="mt-1 text-xs text-gray-500">
                  Email cannot be changed. Contact support if you need to update your email.
                </p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  placeholder="Enter your phone number"
                  className="form-input"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={profileData.location}
                  onChange={handleProfileChange}
                  placeholder="City, State, Country"
                  className="form-input"
                />
              </div>
              
              {/* Professional Information */}
              <div className="mb-6">
                <h3 className="text-base font-medium text-gray-900 mb-4">Professional Information</h3>
                
                <div className="mb-4">
                  <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1">
                    <FaLinkedin className="inline mr-1 text-blue-600" /> LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    id="linkedin"
                    name="linkedin"
                    value={profileData.linkedin}
                    onChange={handleProfileChange}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="form-input"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="github" className="block text-sm font-medium text-gray-700 mb-1">
                    <FaGithub className="inline mr-1 text-gray-800" /> GitHub Profile
                  </label>
                  <input
                    type="url"
                    id="github"
                    name="github"
                    value={profileData.github}
                    onChange={handleProfileChange}
                    placeholder="https://github.com/yourusername"
                    className="form-input"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700 mb-1">
                    <FaGlobe className="inline mr-1 text-green-600" /> Portfolio Website
                  </label>
                  <input
                    type="url"
                    id="portfolio"
                    name="portfolio"
                    value={profileData.portfolio}
                    onChange={handleProfileChange}
                    placeholder="https://yourportfolio.com"
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={profileData.bio}
                  onChange={handleProfileChange}
                  placeholder="Tell us about yourself"
                  rows={4}
                  className="form-input"
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="bg-white shadow-card rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Change Password</h2>
              <p className="mt-1 text-sm text-gray-500">
                Update your password to keep your account secure
              </p>
            </div>
            <div className="p-6">
              <p className="text-center text-gray-500 py-10">
                Password management functionality will be implemented in the next update.
              </p>
            </div>
          </div>
        )}
        
        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white shadow-card rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Notification Preferences</h2>
              <p className="mt-1 text-sm text-gray-500">
                Choose which notifications you'd like to receive
              </p>
            </div>
            <div className="p-6">
              <p className="text-center text-gray-500 py-10">
                Notification preferences will be implemented in the next update.
              </p>
            </div>
          </div>
        )}
      </div>
    </TailwindLayout>
  );
};

export default withAuth(TailwindProfilePage);
