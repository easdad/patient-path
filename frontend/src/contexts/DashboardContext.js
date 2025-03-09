import React, { createContext, useState, useContext, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';

// Create context
const DashboardContext = createContext();

// Custom hook for using the context
export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}

// Provider component
export function DashboardProvider({ children }) {
  // Shared state
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // System health data
  const [systemHealth, setSystemHealth] = useState({
    cpu: '23%',
    memory: '45%',
    disk: '34%',
    response: '112ms',
    edgeFunctions: {
      updateUserRole: 'Operational',
      updateUserRoles: 'Operational'
    },
    lastUpdated: new Date().toLocaleTimeString()
  });

  // Refresh all data
  const refreshData = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Function to fetch system health metrics
  const fetchSystemHealth = useCallback(async () => {
    setIsLoading(true);
    try {
      // In a real app, this would fetch actual metrics from an API
      // Mock data for demonstration
      setSystemHealth({
        cpu: Math.floor(Math.random() * 60) + 10 + '%',
        memory: Math.floor(Math.random() * 60) + 20 + '%',
        disk: Math.floor(Math.random() * 30) + 10 + '%',
        response: Math.floor(Math.random() * 200) + 50 + 'ms',
        edgeFunctions: {
          updateUserRole: Math.random() > 0.9 ? 'Degraded' : 'Operational',
          updateUserRoles: Math.random() > 0.9 ? 'Degraded' : 'Operational'
        },
        lastUpdated: new Date().toLocaleTimeString()
      });
    } catch (err) {
      console.error('Error fetching system health:', err);
      setError('Failed to fetch system health data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Provide the context value
  const value = {
    activeTab,
    setActiveTab,
    isLoading,
    setIsLoading,
    error,
    setError,
    refreshTrigger,
    refreshData,
    systemHealth,
    fetchSystemHealth
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export default DashboardContext; 