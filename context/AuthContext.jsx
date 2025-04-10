import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { loginUser, registerUser, logoutUser, getCurrentUser } from '../utils/api';

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  
  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if token exists in localStorage
        const token = localStorage.getItem('token');
        
        if (token) {
          // Get current user data
          const userData = await getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Authentication error:', error);
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      const data = await loginUser(email, password);
      
      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Set user state
      setUser(data.user);
      
      return data;
    } catch (error) {
      setError(error.message || 'Login failed');
      throw error;
    }
  };
  
  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      const data = await registerUser(userData);
      
      // Store token and user data if returned
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Set user state
        setUser(data.user);
      }
      
      return data;
    } catch (error) {
      setError(error.message || 'Registration failed');
      throw error;
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };
  
  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };
  
  // Check if user has a specific role
  const hasRole = (role) => {
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    
    return user.role === role;
  };
  
  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
    hasRole,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Higher-order component to protect routes
export const withAuth = (Component, options = {}) => {
  const AuthenticatedComponent = (props) => {
    const { isAuthenticated, hasRole, loading, user } = useAuth();
    const router = useRouter();
    
    useEffect(() => {
      // Skip if still loading
      if (loading) return;
      
      // Check if authentication is required
      if (options.requireAuth && !isAuthenticated()) {
        router.push(`/login?redirect=${router.pathname}`);
        return;
      }
      
      // Check if specific role is required
      if (options.requiredRole && !hasRole(options.requiredRole)) {
        router.push('/unauthorized');
        return;
      }
    }, [loading, router]);
    
    // Show loading state
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      );
    }
    
    // If authentication is required and user is not authenticated, don't render component
    if (options.requireAuth && !isAuthenticated()) {
      return null;
    }
    
    // If specific role is required and user doesn't have it, don't render component
    if (options.requiredRole && !hasRole(options.requiredRole)) {
      return null;
    }
    
    // Render the component with all props
    return <Component {...props} />;
  };
  
  // Copy getInitialProps if it exists
  if (Component.getInitialProps) {
    AuthenticatedComponent.getInitialProps = Component.getInitialProps;
  }
  
  return AuthenticatedComponent;
};

export default AuthContext;
