import axios from 'axios';
import config from './config';

// Create an axios instance with default config
const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage (only in browser)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      
      // If token exists, add it to request headers
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear local storage (only in browser)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login page if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = `/login?redirect=${window.location.pathname}`;
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Add logging in development mode
if (config.isDevelopment) {
  api.interceptors.request.use(request => {
    console.log('API Request:', request.method, request.url);
    return request;
  });
  
  api.interceptors.response.use(response => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  }, error => {
    console.error('API Error:', error.response?.status, error.response?.data, error.config?.url);
    return Promise.reject(error);
  });
}

// Authentication API calls
export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    
    // Store token and user in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    
    // Store token and user in localStorage if returned
    if (response.data.token && typeof window !== 'undefined') {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

export const logoutUser = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    
    // Update user in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get user data');
  }
};

// User profile API calls
export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/users/profile', profileData);
    
    // Update user in localStorage
    if (typeof window !== 'undefined') {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({
        ...currentUser,
        ...response.data,
      }));
    }
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
};

export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.put('/users/password', { currentPassword, newPassword });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to change password');
  }
};

export const uploadResume = async (file) => {
  try {
    const formData = new FormData();
    formData.append('resume', file);
    
    const response = await api.post('/users/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to upload resume');
  }
};

// Job API calls
export const getJobs = async (params = {}) => {
  try {
    // Apply default pagination if not provided
    if (!params.limit) {
      params.limit = config.pagination.defaultPageSize;
    }
    
    const response = await api.get('/jobs', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch jobs');
  }
};

export const getJobById = async (id) => {
  try {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch job details');
  }
};

export const createJob = async (jobData) => {
  try {
    const response = await api.post('/jobs', jobData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create job');
  }
};

export const updateJob = async (id, jobData) => {
  try {
    const response = await api.put(`/jobs/${id}`, jobData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update job');
  }
};

export const deleteJob = async (id) => {
  try {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete job');
  }
};

// Application API calls
export const getApplications = async (params = {}) => {
  try {
    // Apply default pagination if not provided
    if (!params.limit) {
      params.limit = config.pagination.defaultPageSize;
    }
    
    const response = await api.get('/applications', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch applications');
  }
};

export const getApplicationById = async (id) => {
  try {
    const response = await api.get(`/applications/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch application details');
  }
};

export const submitApplication = async (jobId, applicationData, resumeFile) => {
  try {
    const formData = new FormData();
    
    // Add application data as JSON
    formData.append('data', JSON.stringify(applicationData));
    
    // Add resume file if provided
    if (resumeFile) {
      formData.append('resume', resumeFile);
    }
    
    const response = await api.post(`/jobs/${jobId}/apply`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to submit application');
  }
};

export const updateApplicationStatus = async (id, status) => {
  try {
    const response = await api.put(`/applications/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update application status');
  }
};

// Analytics API calls
export const getApplicationAnalytics = async (jobId, timeFrame) => {
  try {
    const params = {};
    if (jobId && jobId !== 'all') {
      params.jobId = jobId;
    }
    if (timeFrame) {
      params.timeFrame = timeFrame;
    }
    
    const response = await api.get('/analytics/applications', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch analytics data');
  }
};

export const getJobMatch = async (jobId) => {
  try {
    const response = await api.get(`/jobs/${jobId}/match`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch job match data');
  }
};

export const analyzeResume = async (file, jobId) => {
  try {
    const formData = new FormData();
    formData.append('resume', file);
    
    if (jobId) {
      formData.append('jobId', jobId);
    }
    
    const response = await api.post('/resume/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to analyze resume');
  }
};

export default api;
