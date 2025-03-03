import { supabase } from '../supabase';
import type { TransportRequest } from '@/types/database.types';

// Create a new transport request
export const createTransportRequest = async (requestData: Omit<TransportRequest, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('transport_requests')
    .insert([requestData])
    .select()
    .single();
  
  return { data, error };
};

// Get transport request by ID
export const getTransportRequestById = async (id: string) => {
  const { data, error } = await supabase
    .from('transport_requests')
    .select('*')
    .eq('id', id)
    .single();
  
  return { data, error };
};

// Get transport requests by hospital ID
export const getTransportRequestsByHospitalId = async (hospitalId: string) => {
  const { data, error } = await supabase
    .from('transport_requests')
    .select('*')
    .eq('hospitalId', hospitalId)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

// Get transport requests by status
export const getTransportRequestsByStatus = async (status: TransportRequest['status']) => {
  const { data, error } = await supabase
    .from('transport_requests')
    .select('*')
    .eq('status', status)
    .order('transportDate', { ascending: true });
  
  return { data, error };
};

// Update transport request
export const updateTransportRequest = async (id: string, requestData: Partial<TransportRequest>) => {
  const { data, error } = await supabase
    .from('transport_requests')
    .update(requestData)
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
};

// Get all pending transport requests (for ambulance services to bid on)
export const getPendingTransportRequests = async () => {
  const { data, error } = await supabase
    .from('transport_requests')
    .select('*')
    .eq('status', 'pending')
    .order('transportDate', { ascending: true });
  
  return { data, error };
}; 