import { supabase } from '../supabase';
import type { User, UserType } from '@/types/database.types';

// Create a new user (this is separate from auth signup)
export const createUser = async (userData: Omit<User, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('users')
    .insert([userData])
    .select()
    .single();
  
  return { data, error };
};

// Get user by ID
export const getUserById = async (id: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  
  return { data, error };
};

// Get user by email
export const getUserByEmail = async (email: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  
  return { data, error };
};

// Update user
export const updateUser = async (id: string, userData: Partial<User>) => {
  const { data, error } = await supabase
    .from('users')
    .update(userData)
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
};

// Get users by type
export const getUsersByType = async (userType: UserType) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('userType', userType);
  
  return { data, error };
}; 