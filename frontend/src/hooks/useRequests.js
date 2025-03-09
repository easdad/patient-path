import { useState, useCallback, useEffect } from 'react';
import dataService from '../services/dataService';

export function useRequests(refreshTrigger = 0) {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all transport requests
  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await dataService.getTransportRequests();
      
      if (fetchError) throw fetchError;
      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching transport requests:', err);
      setError(err.message || 'Failed to fetch transport requests');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear all transport requests
  const clearRequests = useCallback(async () => {
    if (!window.confirm('Are you sure you want to clear all transport requests?')) {
      return { success: false };
    }
    
    setIsLoading(true);
    try {
      const { success, error: clearError } = await dataService.clearTransportRequests();
      
      if (!success) throw clearError;
      
      setRequests([]);
      return { success: true };
    } catch (err) {
      console.error('Error clearing requests:', err);
      setError(err.message || 'Failed to clear transport requests');
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get request counts by status
  const getRequestCounts = useCallback(() => {
    const pending = requests.filter(r => r.status === 'pending').length;
    const inProgress = requests.filter(r => r.status === 'in-progress').length;
    const completed = requests.filter(r => r.status === 'completed').length;
    const cancelled = requests.filter(r => r.status === 'cancelled').length;
    const total = requests.length;
    
    return { pending, inProgress, completed, cancelled, total };
  }, [requests]);

  // Effect to fetch requests when the component mounts or refreshTrigger changes
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests, refreshTrigger]);

  return {
    requests,
    isLoading,
    error,
    fetchRequests,
    clearRequests,
    getRequestCounts
  };
} 