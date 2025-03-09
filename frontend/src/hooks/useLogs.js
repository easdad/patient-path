import { useState, useCallback, useEffect } from 'react';

export function useLogs(refreshTrigger = 0) {
  const [logs, setLogs] = useState([]);
  const [functionLogs, setFunctionLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch application logs
  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // In a real app, this would be an API call
      setLogs(generateMockLogs());
      setFunctionLogs(generateMockFunctionLogs());
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError(err.message || 'Failed to fetch logs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Filter logs by type
  const filterLogsByType = useCallback((type) => {
    if (!type) return logs;
    return logs.filter(log => log.type.toLowerCase() === type.toLowerCase());
  }, [logs]);

  // Filter function logs by status
  const filterFunctionLogsByStatus = useCallback((status) => {
    if (!status) return functionLogs;
    return functionLogs.filter(log => log.status.toLowerCase() === status.toLowerCase());
  }, [functionLogs]);

  // Generate mock application logs
  const generateMockLogs = () => {
    const logTypes = ['INFO', 'WARNING', 'ERROR', 'DEBUG'];
    const components = ['Auth', 'Database', 'API', 'Frontend', 'Backend'];
    const messages = [
      'User logged in successfully',
      'Failed to connect to database',
      'API rate limit exceeded',
      'Rendering error in component',
      'Request timeout',
      'Session expired',
      'Invalid authentication token',
      'Data fetch completed'
    ];

    return Array(20).fill(0).map((_, i) => ({
      id: i,
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      type: logTypes[Math.floor(Math.random() * logTypes.length)],
      component: components[Math.floor(Math.random() * components.length)],
      message: messages[Math.floor(Math.random() * messages.length)]
    }));
  };

  // Generate mock function logs
  const generateMockFunctionLogs = () => {
    const functions = ['update-user-role', 'update-user-roles'];
    const statuses = ['success', 'error'];
    const messages = [
      'Role updated successfully',
      'Failed to update role: user not found',
      'Role migration completed',
      'Invalid role specified',
      'Permission denied',
      'Database connection error'
    ];

    return Array(15).fill(0).map((_, i) => ({
      id: i,
      timestamp: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
      function: functions[Math.floor(Math.random() * functions.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      userId: `user-${Math.floor(Math.random() * 1000)}`
    }));
  };

  // Effect to fetch logs when the component mounts or refreshTrigger changes
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs, refreshTrigger]);

  return {
    logs,
    functionLogs,
    isLoading,
    error,
    fetchLogs,
    filterLogsByType,
    filterFunctionLogsByStatus
  };
} 