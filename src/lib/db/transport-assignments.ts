import { supabase } from '../supabase';
import type { TransportAssignment } from '@/types/database.types';

// Create a new transport assignment
export const createTransportAssignment = async (assignmentData: Omit<TransportAssignment, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('transport_assignments')
    .insert([assignmentData])
    .select()
    .single();
  
  return { data, error };
};

// Get transport assignment by ID
export const getTransportAssignmentById = async (id: string) => {
  const { data, error } = await supabase
    .from('transport_assignments')
    .select('*')
    .eq('id', id)
    .single();
  
  return { data, error };
};

// Get assignment by transport request ID
export const getAssignmentByTransportRequestId = async (transportRequestId: string) => {
  const { data, error } = await supabase
    .from('transport_assignments')
    .select('*')
    .eq('transportRequestId', transportRequestId)
    .single();
  
  return { data, error };
};

// Get assignments by ambulance service ID
export const getAssignmentsByAmbulanceServiceId = async (ambulanceServiceId: string) => {
  const { data, error } = await supabase
    .from('transport_assignments')
    .select('*, transport_requests(*)')
    .eq('ambulanceServiceId', ambulanceServiceId)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

// Update transport assignment
export const updateTransportAssignment = async (id: string, assignmentData: Partial<TransportAssignment>) => {
  const { data, error } = await supabase
    .from('transport_assignments')
    .update(assignmentData)
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
};

// Mark a transport as in-progress
export const startTransport = async (assignmentId: string) => {
  const currentTime = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('transport_assignments')
    .update({
      status: 'in-progress',
      startTime: currentTime,
    })
    .eq('id', assignmentId)
    .select()
    .single();
  
  if (error) {
    return { data: null, error };
  }
  
  // Also update the transport request status
  await supabase
    .from('transport_requests')
    .update({ status: 'in-progress' })
    .eq('id', data.transportRequestId);
  
  return { data, error };
};

// Mark a transport as completed
export const completeTransport = async (assignmentId: string, notes: string = '') => {
  const currentTime = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('transport_assignments')
    .update({
      status: 'completed',
      endTime: currentTime,
      notes,
    })
    .eq('id', assignmentId)
    .select()
    .single();
  
  if (error) {
    return { data: null, error };
  }
  
  // Also update the transport request status
  await supabase
    .from('transport_requests')
    .update({ status: 'completed' })
    .eq('id', data.transportRequestId);
  
  return { data, error };
}; 