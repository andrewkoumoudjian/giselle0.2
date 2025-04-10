import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import supabase from '../utils/supabase';

// Create context
const SupabaseAuthContext = createContext();

// Auth provider component
export const SupabaseAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  
  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        setSession(session);
        
        if (session) {
          // Get user data
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (userError && userError.code !== 'PGRST116') {
            // PGRST116 is "no rows returned" error, which is fine for new users
            console.error('Error fetching user profile:', userError);
          }
          
          // Combine auth data with profile data
          setUser({
            ...session.user,
            profile: userData || {},
          });
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Supabase auth event: ${event}`);
      setSession(session);
      
      if (session) {
        // Get user profile data
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (userError && userError.code !== 'PGRST116') {
          console.error('Error fetching user profile:', userError);
        }
        
        // Combine auth data with profile data
        setUser({
          ...session.user,
          profile: userData || {},
        });
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });
    
    // Clean up subscription
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);
  
  // Sign up with email and password
  const signUp = async (email, password, userData = {}) => {
    try {
      setError(null);
      
      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name || '',
            role: userData.role || 'jobseeker',
          },
        },
      });
      
      if (error) {
        throw error;
      }
      
      // Create profile record
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              name: userData.name || '',
              role: userData.role || 'jobseeker',
              ...userData,
            },
          ]);
        
        if (profileError) {
          console.error('Error creating user profile:', profileError);
        }
      }
      
      return data;
    } catch (error) {
      console.error('Sign up error:', error);
      setError(error.message);
      throw error;
    }
  };
  
  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      setError(error.message);
      throw error;
    }
  };
  
  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Sign out error:', error);
      setError(error.message);
    }
  };
  
  // Reset password
  const resetPassword = async (email) => {
    try {
      setError(null);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      setError(error.message);
      throw error;
    }
  };
  
  // Update password
  const updatePassword = async (newPassword) => {
    try {
      setError(null);
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Update password error:', error);
      setError(error.message);
      throw error;
    }
  };
  
  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setError(null);
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Update auth metadata if name is provided
      if (profileData.name) {
        const { error: authError } = await supabase.auth.updateUser({
          data: { name: profileData.name },
        });
        
        if (authError) {
          throw authError;
        }
      }
      
      // Update profile data
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Update user state
      setUser({
        ...user,
        profile: data,
      });
      
      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      setError(error.message);
      throw error;
    }
  };
  
  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };
  
  // Check if user has a specific role
  const hasRole = (role) => {
    if (!user) return false;
    
    const userRole = user.profile?.role || user.user_metadata?.role;
    
    if (Array.isArray(role)) {
      return role.includes(userRole);
    }
    
    return userRole === role;
  };
  
  // Context value
  const value = {
    user,
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    isAuthenticated,
    hasRole,
  };
  
  return <SupabaseAuthContext.Provider value={value}>{children}</SupabaseAuthContext.Provider>;
};

// Custom hook to use auth context
export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (!context) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};

// Higher-order component to protect routes
export const withSupabaseAuth = (Component, options = {}) => {
  const AuthenticatedComponent = (props) => {
    const { isAuthenticated, hasRole, loading, user } = useSupabaseAuth();
    const router = useRouter();
    
    useEffect(() => {
      // Skip if still loading
      if (loading) return;
      
      // Check if authentication is required
      if (options.requireAuth && !isAuthenticated()) {
        router.push(`/auth/login?redirect=${router.pathname}`);
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

export default SupabaseAuthContext;
