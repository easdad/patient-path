import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

// Developer account email for special permissions
const DEV_EMAIL = 'easdad.jm@gmail.com';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null);
  const [isDeveloper, setIsDeveloper] = useState(false);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
      }
      
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        fetchUserType(session.user);
      }
      
      setLoading(false);
    };

    initializeAuth();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Auth event: ${event}`);
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          fetchUserType(session.user);
        } else {
          setUserType(null);
          setIsDeveloper(false);
        }
        
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const fetchUserType = async (user) => {
    try {
      // Special case for developer account
      if (user.email === DEV_EMAIL) {
        setUserType('developer');
        setIsDeveloper(true);
        return;
      }
      
      // First check user metadata
      if (user.user_metadata && user.user_metadata.user_type) {
        setUserType(user.user_metadata.user_type);
        setIsDeveloper(user.user_metadata.user_type === 'developer');
        return;
      }
      
      // If not in metadata, check profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user type:', error);
        return;
      }
      
      if (data) {
        setUserType(data.user_type);
        setIsDeveloper(data.user_type === 'developer');
      }
    } catch (error) {
      console.error('Error in fetchUserType:', error);
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { data: null, error };
    }
  };

  const signUp = async (email, password, userData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { error };
    }
  };

  const updatePassword = async (password) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      console.error('Error updating password:', error);
      return { error };
    }
  };

  // Check if user has developer access
  const hasDevAccess = () => {
    return isDeveloper;
  };

  // Check if user can access a specific dashboard
  const canAccessDashboard = (requiredType) => {
    if (isDeveloper) return true; // Developers can access all dashboards
    return userType === requiredType;
  };

  const value = {
    user,
    session,
    userType,
    isDeveloper,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    hasDevAccess,
    canAccessDashboard
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext; 