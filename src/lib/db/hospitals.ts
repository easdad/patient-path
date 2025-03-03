import { supabase } from '../supabase';
import type { Hospital } from '@/types/database.types';

// Create a new hospital
export const createHospital = async (hospitalData: Omit<Hospital, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('hospitals')
    .insert([hospitalData])
    .select()
    .single();
  
  return { data, error };
};

// Get hospital by ID
export const getHospitalById = async (id: string) => {
  const { data, error } = await supabase
    .from('hospitals')
    .select('*')
    .eq('id', id)
    .single();
  
  return { data, error };
};

// Get hospital by user ID
export const getHospitalByUserId = async (userId: string) => {
  const { data, error } = await supabase
    .from('hospitals')
    .select('*')
    .eq('userId', userId)
    .single();
  
  return { data, error };
};

// Update hospital
export const updateHospital = async (id: string, hospitalData: Partial<Hospital>) => {
  const { data, error } = await supabase
    .from('hospitals')
    .update(hospitalData)
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
};

// Get all hospitals
export const getAllHospitals = async () => {
  const { data, error } = await supabase
    .from('hospitals')
    .select('*')
    .order('name', { ascending: true });
  
  return { data, error };
}; 