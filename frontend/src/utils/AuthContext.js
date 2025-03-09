import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { AUTH_CONFIG } from '../config/auth.config';

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

  const initializeAuth = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        setLoading(false);
        return;
      }
      
      setSession(data.session);
      
      if (data.session?.user) {
        setUser(data.session.user);
        await fetchUserRole(data.session.user);
      }
    } catch (error) {
      console.error('Error in initializeAuth:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          await fetchUserRole(session.user);
        } else {
          setUserType(null);
          setIsDeveloper(false);
        }
      }
    );
    
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [initializeAuth]);

  const fetchUserRole = async (user) => {
    try {
      console.log("Fetching user role for:", user.id);
      console.log("app_metadata:", user.app_metadata);
      console.log("user_metadata:", user.user_metadata);
      
      // Primary source: Check app_metadata.role (most secure)
      if (user.app_metadata?.role) {
        const role = user.app_metadata.role;
        console.log(`Role found in app_metadata: ${role}`);
        setUserType(role);
        setIsDeveloper(role === 'developer');
        return;
      }
      
      // Secondary check: Check user_metadata for developer role
      if (user.user_metadata?.user_type === 'developer') {
        console.log("Developer role found in user_metadata");
        setUserType('developer');
        setIsDeveloper(true);
        return;
      }
      
      // Fallback: Check profiles table
      console.log("No role in metadata, checking profiles table");
      const { data, error } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user type:', error);
        console.log("Default to hospital role due to error");
        setUserType('hospital'); // Default fallback
        setIsDeveloper(false);
        return;
      }
      
      if (data?.user_type) {
        console.log(`User type from profiles: ${data.user_type}`);
        setUserType(data.user_type);
        setIsDeveloper(data.user_type === 'developer');
        
        // Optionally: You could sync the user_type to app_metadata.role here
        // using a server-side function, but that would require additional setup
      } else {
        console.log("No user_type in profiles, defaulting to hospital");
        setUserType('hospital'); // Default fallback
        setIsDeveloper(false);
      }
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      console.log("Default to hospital role due to error");
      setUserType('hospital'); // Default fallback
      setIsDeveloper(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      console.error('Error signing in:', error);
      return { success: false, error };
    }
  };

  const signUp = async (email, password, userData) => {
    try {
      // Set up user account with user_type in metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      console.error('Error signing up:', error);
      return { success: false, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
      setUserType(null);
      setIsDeveloper(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { success: false, error };
    }
  };

  const updatePassword = async (password) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Error updating password:', error);
      return { success: false, error };
    }
  };

  // Helper to check if current user has developer access
  const hasDevAccess = () => {
    return isDeveloper || user?.app_metadata?.role === 'developer';
  };

  // Helper to check if current user can access a specific dashboard
  const canAccessDashboard = (requiredType) => {
    // Developers can access all dashboards
    if (hasDevAccess()) return true;
    
    // Otherwise, check if user type matches required type
    return userType === requiredType;
  };

  const value = {
    user,
    session,
    loading,
    userType,
    isDeveloper,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    hasDevAccess,
    canAccessDashboard,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext; 