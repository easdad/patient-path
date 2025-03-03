import { supabase } from '../supabase';
import type { TransportBid } from '@/types/database.types';

// Create a new transport bid
export const createTransportBid = async (bidData: Omit<TransportBid, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('transport_bids')
    .insert([bidData])
    .select()
    .single();
  
  return { data, error };
};

// Get transport bid by ID
export const getTransportBidById = async (id: string) => {
  const { data, error } = await supabase
    .from('transport_bids')
    .select('*')
    .eq('id', id)
    .single();
  
  return { data, error };
};

// Get bids for a transport request
export const getBidsByTransportRequestId = async (transportRequestId: string) => {
  const { data, error } = await supabase
    .from('transport_bids')
    .select('*')
    .eq('transportRequestId', transportRequestId)
    .order('price', { ascending: true });
  
  return { data, error };
};

// Get bids by ambulance service ID
export const getBidsByAmbulanceServiceId = async (ambulanceServiceId: string) => {
  const { data, error } = await supabase
    .from('transport_bids')
    .select('*')
    .eq('ambulanceServiceId', ambulanceServiceId)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

// Update transport bid
export const updateTransportBid = async (id: string, bidData: Partial<TransportBid>) => {
  const { data, error } = await supabase
    .from('transport_bids')
    .update(bidData)
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
};

// Accept a bid
export const acceptBid = async (bidId: string) => {
  const { data: bid, error: bidError } = await supabase
    .from('transport_bids')
    .select('*')
    .eq('id', bidId)
    .single();

  if (bidError || !bid) {
    return { data: null, error: bidError || new Error('Bid not found') };
  }

  // First, update this bid to accepted
  const { error: updateError } = await supabase
    .from('transport_bids')
    .update({ status: 'accepted' })
    .eq('id', bidId);

  if (updateError) {
    return { data: null, error: updateError };
  }

  // Then, update all other bids for this transport to rejected
  const { error: rejectError } = await supabase
    .from('transport_bids')
    .update({ status: 'rejected' })
    .eq('transportRequestId', bid.transportRequestId)
    .neq('id', bidId);

  if (rejectError) {
    return { data: null, error: rejectError };
  }

  // Finally, update the transport request to assigned
  const { data, error } = await supabase
    .from('transport_requests')
    .update({ status: 'assigned' })
    .eq('id', bid.transportRequestId)
    .select()
    .single();

  return { data, error };
}; 