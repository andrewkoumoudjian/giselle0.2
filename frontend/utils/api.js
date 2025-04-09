/**
 * API utility functions for making requests to the backend
 */

// Base API URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Get the authentication token from local storage
 * @returns {string|null} - The authentication token or null if not found
 */
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

/**
 * Generic fetch function with error handling and authentication
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @param {boolean} requiresAuth - Whether the request requires authentication
 * @returns {Promise<Object>} - Response data
 */
async function fetchAPI(endpoint, options = {}, requiresAuth = true) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;

    // Set default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authentication token if required
    if (requiresAuth) {
      const token = getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else if (requiresAuth) {
        throw new Error('Authentication required');
      }
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle authentication errors
    if (response.status === 401) {
      // Clear token if it's invalid or expired
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
      throw new Error('Authentication failed. Please log in again.');
    }

    // Handle non-2xx responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }

    // Parse JSON response
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

/**
 * Get all job listings
 * @returns {Promise<Array>} - Array of job listings
 */
export async function getJobs() {
  return fetchAPI('/api/jobs');
}

/**
 * Get a specific job by ID
 * @param {string} id - Job ID
 * @returns {Promise<Object>} - Job details
 */
export async function getJob(id) {
  return fetchAPI(`/api/jobs/${id}`);
}

/**
 * Create a new job listing
 * @param {Object} jobData - Job data
 * @returns {Promise<Object>} - Created job
 */
export async function createJob(jobData) {
  return fetchAPI('/api/jobs', {
    method: 'POST',
    body: JSON.stringify(jobData),
  });
}

/**
 * Update an existing job
 * @param {string} id - Job ID
 * @param {Object} jobData - Updated job data
 * @returns {Promise<Object>} - Updated job
 */
export async function updateJob(id, jobData) {
  return fetchAPI(`/api/jobs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(jobData),
  });
}

/**
 * Delete a job
 * @param {string} id - Job ID
 * @returns {Promise<Object>} - Response data
 */
export async function deleteJob(id) {
  return fetchAPI(`/api/jobs/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Submit a job application
 * @param {FormData} formData - Application form data including resume file
 * @returns {Promise<Object>} - Submitted application
 */
export async function submitApplication(formData) {
  try {
    const url = `${API_BASE_URL}/api/applications`;

    const response = await fetch(url, {
      method: 'POST',
      body: formData, // FormData for file uploads
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Application submission error:', error);
    throw error;
  }
}

/**
 * Get all applications for a job
 * @param {string} jobId - Job ID
 * @returns {Promise<Array>} - Array of applications
 */
export async function getJobApplications(jobId) {
  return fetchAPI(`/api/jobs/${jobId}/applications`);
}

/**
 * Get all applications for the current HR user
 * @returns {Promise<Array>} - Array of applications
 */
export async function getApplications() {
  return fetchAPI('/api/applications');
}

/**
 * Update application status
 * @param {string} id - Application ID
 * @param {string} status - New status
 * @returns {Promise<Object>} - Updated application
 */
export async function updateApplicationStatus(id, status) {
  return fetchAPI(`/api/applications/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

/**
 * Check if the API is available
 * @returns {Promise<boolean>} - True if API is available
 */
export async function checkApiAvailability() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    return response.ok;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
}

/**
 * Authentication Functions
 */

/**
 * Login with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - User data and token
 */
export async function login(email, password) {
  return fetchAPI('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }, false);
}

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} - User data and token
 */
export async function register(userData) {
  return fetchAPI('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }, false);
}

/**
 * Get the current user's profile
 * @returns {Promise<Object>} - User profile data
 */
export async function getCurrentUser() {
  return fetchAPI('/api/auth/me', {
    method: 'GET',
  });
}

/**
 * Update the current user's profile
 * @param {Object} profileData - Updated profile data
 * @returns {Promise<Object>} - Updated user profile
 */
export async function updateProfile(profileData) {
  return fetchAPI('/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
}

/**
 * Change the user's password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} - Response data
 */
export async function changePassword(currentPassword, newPassword) {
  return fetchAPI('/api/auth/password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}
