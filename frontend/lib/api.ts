import axios, { AxiosError } from 'axios';

// Get the API URL from environment variables or use a default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create an axios instance with default configs
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add a longer timeout for API calls
  timeout: 15000, // 15 seconds
});

// Add request interceptor for authentication
apiClient.interceptors.request.use((config) => {
  // Get auth token from local storage if available
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Customize error handling
    const errorResponse = {
      status: error.response?.status || 500,
      message: 'An unexpected error occurred',
      details: null as any,
    };

    // Extract error details from response
    if (error.response?.data) {
      const data = error.response.data as Record<string, any>;
      if (typeof data === 'object' && data !== null) {
        errorResponse.message = data.detail || data.message || errorResponse.message;
        errorResponse.details = data;
      } else if (typeof error.response.data === 'string') {
        errorResponse.message = error.response.data;
      }
    }

    // Check for network errors
    if (error.code === 'ECONNABORTED') {
      errorResponse.message = 'Request timed out. Please try again.';
    } else if (!error.response) {
      errorResponse.message = 'Network error. The API server might be down.';
    }

    // Log error in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('API Error:', errorResponse);
    }

    return Promise.reject(errorResponse);
  }
);

// Types for API requests and responses
export interface Company {
  id: string;
  name: string;
  created_at: string;
}

export interface Job {
  id: string;
  company_id: string;
  title: string;
  description: string;
  department?: string;
  required_skills?: string[];
  soft_skills_priorities?: Record<string, number>;
  created_at: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  resume_url?: string;
  resume_parsed?: any;
  created_at: string;
}

export interface Question {
  id: string;
  interview_id: string;
  text: string;
  type: 'technical' | 'behavioral';
  skill_assessed?: string;
  order_index: number;
}

export interface Interview {
  id: string;
  job_id: string;
  candidate_id: string;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
  completed_at?: string;
}

export interface Assessment {
  id: string;
  interview_id: string;
  empathy_score: number;
  collaboration_score: number;
  confidence_score: number;
  english_proficiency: number;
  professionalism: number;
  field_importance?: any;
  candidate_skills?: any;
  correlation_matrix?: any;
  created_at: string;
}

// API endpoints for the interview system
export const api = {
  // Health check 
  healthCheck: () => apiClient.get('/health'),
  
  // Authentication
  auth: {
    register: (data: any) => apiClient.post('/auth/register', data),
    login: (data: any) => apiClient.post('/auth/login', data),
    logout: () => apiClient.post('/auth/logout'),
    verifyToken: () => apiClient.get('/auth/verify'),
  },
  
  // Job descriptions
  jobs: {
    getAll: () => apiClient.get('/jobs'),
    getById: (id: string) => apiClient.get(`/jobs/${id}`),
    create: (data: any) => apiClient.post('/jobs', data),
  },
  
  // Candidates
  candidates: {
    getAll: () => apiClient.get('/candidates'),
    getById: (id: string) => apiClient.get(`/candidates/${id}`),
    create: (data: any) => apiClient.post('/candidates', data),
    uploadResume: (candidateId: string, file: File) => {
      const formData = new FormData();
      formData.append('resume', file);
      
      return apiClient.post(`/candidates/${candidateId}/resume`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
  },
  
  // Interviews
  interviews: {
    getAll: () => apiClient.get('/interviews'),
    getById: (id: string) => apiClient.get(`/interviews/${id}`),
    create: (data: any) => apiClient.post('/interviews', data),
    getQuestions: (interviewId: string) => apiClient.get(`/interviews/${interviewId}/questions`),
    submitResponse: (questionId: string, audioBlob: Blob) => {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      
      return apiClient.post(`/responses/${questionId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    complete: (interviewId: string) => apiClient.post(`/interviews/${interviewId}/complete`),
    getAssessment: (interviewId: string) => apiClient.get(`/interviews/${interviewId}/assessment`),
  },
};

// Helper to check if API is available
export const checkApiAvailability = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get('/health', {
      timeout: 3000, // Shorter timeout for health check
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    return response.status === 200;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

export default api; 