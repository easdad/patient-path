import { useState, useCallback, useEffect } from 'react';
import dataService from '../services/dataService';

export function useUsers(refreshTrigger = 0) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await dataService.getProfiles();
      
      if (fetchError) throw fetchError;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete a user
  const deleteUser = useCallback(async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return { success: false };
    }
    
    setIsLoading(true);
    try {
      const { success, error: deleteError } = await dataService.deleteUser(userId);
      
      if (!success) throw deleteError;
      
      setUsers(prev => prev.filter(user => user.id !== userId));
      return { success: true };
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.message || 'Failed to delete user');
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Change user type
  const changeUserType = useCallback(async (userId, newType) => {
    setIsLoading(true);
    try {
      const { success, error: updateError } = await dataService.updateUserType(userId, newType);
      
      if (!success) throw updateError;
      
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, user_type: newType } : user
      ));
      return { success: true };
    } catch (err) {
      console.error('Error updating user type:', err);
      setError(err.message || 'Failed to update user type');
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect to fetch users when the component mounts or refreshTrigger changes
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, refreshTrigger]);

  return {
    users,
    isLoading,
    error,
    fetchUsers,
    deleteUser,
    changeUserType
  };
} 