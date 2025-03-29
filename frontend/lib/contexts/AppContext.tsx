import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

// Define types for the app state
type User = {
  id: string;
  name: string;
  email: string;
  role: 'candidate' | 'hr';
};

type Interview = {
  id: string;
  status: 'pending' | 'in_progress' | 'completed';
  jobId: string;
  candidateId: string;
  createdAt: string;
};

type InterviewContext = {
  currentInterview: Interview | null;
  setCurrentInterview: (interview: Interview | null) => void;
};

type AuthContext = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: 'candidate' | 'hr') => Promise<void>;
  logout: () => Promise<void>;
};

// Create contexts
const AuthContext = createContext<AuthContext | undefined>(undefined);
const InterviewContext = createContext<InterviewContext | undefined>(undefined);

// Create provider components
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on initial load
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          // Verify token validity and get user data
          const response = await api.auth.verifyToken();
          setUser(response.data.user);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        localStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.auth.login({ email, password });
      localStorage.setItem('auth_token', response.data.token);
      setUser(response.data.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: 'candidate' | 'hr') => {
    setIsLoading(true);
    try {
      const response = await api.auth.register({ name, email, password, role });
      localStorage.setItem('auth_token', response.data.token);
      setUser(response.data.user);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.auth.logout();
      localStorage.removeItem('auth_token');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const InterviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentInterview, setCurrentInterview] = useState<Interview | null>(null);

  return (
    <InterviewContext.Provider
      value={{
        currentInterview,
        setCurrentInterview,
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
};

// Create combined provider
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <InterviewProvider>
        {children}
      </InterviewProvider>
    </AuthProvider>
  );
};

// Create custom hooks for using the contexts
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useInterview = () => {
  const context = useContext(InterviewContext);
  if (context === undefined) {
    throw new Error('useInterview must be used within an InterviewProvider');
  }
  return context;
}; 