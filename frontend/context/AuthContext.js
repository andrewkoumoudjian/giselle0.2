import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

// Create the auth context
const AuthContext = createContext();

// JWT token handling
const setToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
};

const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated on initial load
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getToken();
        if (token) {
          // In a real app, you would verify the token with the server
          // For now, we'll just decode it and set the user
          const decodedUser = parseJwt(token);

          // Check if token is expired
          if (decodedUser && decodedUser.exp * 1000 > Date.now()) {
            setUser(decodedUser);
          } else {
            // Token expired, remove it
            removeToken();
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Authentication error:', error);
        removeToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Parse JWT token
  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      // In a real app, you would call the API
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // });
      // const data = await response.json();

      // For demo purposes, we'll create a mock token
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock user data
      const userData = {
        id: '123',
        email,
        name: email.split('@')[0],
        role: email.includes('hr') || email.includes('admin') ? 'employer' : 'jobseeker',
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours from now
      };

      // Create a mock token
      const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
        JSON.stringify(userData)
      )}.MOCK_SIGNATURE`;

      // Set token and user
      setToken(mockToken);
      setUser(userData);

      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      // In a real app, you would call the API
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(userData),
      // });
      // const data = await response.json();

      // For demo purposes, we'll create a mock token
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock user data
      const newUser = {
        id: '123',
        email: userData.email,
        name: `${userData.firstName} ${userData.lastName}`,
        role: userData.accountType,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours from now
      };

      // Create a mock token
      const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
        JSON.stringify(newUser)
      )}.MOCK_SIGNATURE`;

      // Set token and user
      setToken(mockToken);
      setUser(newUser);

      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  // Logout function
  const logout = () => {
    removeToken();
    setUser(null);
    router.push('/');
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    return user && user.role === role;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Import dynamically to avoid SSR issues
const LoadingScreen = dynamic(() => import('../components/LoadingScreen'), {
  ssr: false,
});

// HOC to protect routes
export const withAuth = (WrappedComponent, options = {}) => {
  const { requiredRole } = options;

  const AuthenticatedComponent = (props) => {
    const { user, loading, isAuthenticated, hasRole } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!isAuthenticated()) {
          router.replace('/login?redirect=' + router.asPath);
        } else if (requiredRole && !hasRole(requiredRole)) {
          router.replace('/unauthorized');
        }
      }
    }, [loading, isAuthenticated, hasRole, router]);

    if (loading) {
      return <LoadingScreen message="Checking authentication..." />;
    }

    if (!isAuthenticated()) {
      return <LoadingScreen message="Redirecting to login..." />;
    }

    if (requiredRole && !hasRole(requiredRole)) {
      return <LoadingScreen message="Checking permissions..." />;
    }

    return <WrappedComponent {...props} />;
  };

  return AuthenticatedComponent;
};
