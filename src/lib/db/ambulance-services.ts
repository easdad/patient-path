import { supabase } from '../supabase';
import type { AmbulanceService } from '@/types/database.types';

// Create a new ambulance service
export const createAmbulanceService = async (serviceData: Omit<AmbulanceService, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('ambulance_services')
    .insert([serviceData])
    .select()
    .single();
  
  return { data, error };
};

// Get ambulance service by ID
export const getAmbulanceServiceById = async (id: string) => {
  const { data, error } = await supabase
    .from('ambulance_services')
    .select('*')
    .eq('id', id)
    .single();
  
  return { data, error };
};

// Get ambulance service by user ID
export const getAmbulanceServiceByUserId = async (userId: string) => {
  const { data, error } = await supabase
    .from('ambulance_services')
    .select('*')
    .eq('userId', userId)
    .single();
  
  return { data, error };
};

// Update ambulance service
export const updateAmbulanceService = async (id: string, serviceData: Partial<AmbulanceService>) => {
  const { data, error } = await supabase
    .from('ambulance_services')
    .update(serviceData)
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
};

// Get all ambulance services
export const getAllAmbulanceServices = async () => {
  const { data, error } = await supabase
    .from('ambulance_services')
    .select('*')
    .order('name', { ascending: true });
  
  return { data, error };
}; 