import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { SUPABASE_CONFIG } from '../config/supabase.config';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null);

  // Use the user types from our centralized config
  const USER_TYPES = SUPABASE_CONFIG.USER_TYPES;

  // Simplified user role fetching with prioritized fallbacks
  const fetchUserRole = async (user) => {
    try {
      // Simplified approach: check app_metadata first, then profiles table
      if (user.app_metadata?.role) {
        setUserType(user.app_metadata.role);
        return;
      }
      
      // Check profiles table as fallback
      const { data, error } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single();
      
      if (!error && data?.user_type) {
        setUserType(data.user_type);
      } else {
        // Default fallback - set as hospital user
        setUserType(USER_TYPES.HOSPITAL);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserType(USER_TYPES.HOSPITAL); // Default fallback
    }
  };

  const initializeAuth = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error.message);
        setLoading(false);
        return;
      }
      
      setSession(data.session);
      
      if (data.session?.user) {
        setUser(data.session.user);
        await fetchUserRole(data.session.user);
      }
    } catch (error) {
      console.error('Auth initialization error:', error.message);
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
        }
      }
    );
    
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [initializeAuth]);

  // Basic auth functions
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Sign in error:', error.message);
      return { success: false, error };
    }
  };

  const signUp = async (email, password, userData) => {
    try {
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
      console.error('Sign up error:', error.message);
      return { success: false, error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setUserType(null);
    } catch (error) {
      console.error('Sign out error:', error.message);
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
      console.error('Password reset error:', error.message);
      return { success: false, error };
    }
  };

  const updatePassword = async (password) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Password update error:', error.message);
      return { success: false, error };
    }
  };

  // Role checking utilities
  const hasDevAccess = () => userType === USER_TYPES.DEVELOPER;
  
  const canAccessDashboard = (requiredType) => {
    // Developers can access all dashboards
    if (userType === USER_TYPES.DEVELOPER) return true;
    // Otherwise, check specific type
    return userType === requiredType;
  };

  const value = {
    user,
    session,
    loading,
    userType,
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