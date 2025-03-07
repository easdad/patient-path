import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { useAuth } from '../../../utils/AuthContext';
import './TransportRequestList.css';

const TransportRequestList = ({ onNewRequest }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState('requested_at');
  const [sortDirection, setSortDirection] = useState('desc');

  const fetchTransportRequests = useCallback(async () => {
    if (!user) return; // Skip if user isn't loaded yet
    
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('transport_requests')
        .select('*')
        .eq('hospital_id', user.id)
        .order(sortField, { ascending: sortDirection === 'asc' });
      
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching transport requests:', error);
      setError('Failed to load transport requests. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [user, filterStatus, sortField, sortDirection]);

  useEffect(() => {
    if (!user) return; // Skip if user isn't loaded yet
    
    fetchTransportRequests();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('transport_requests_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'transport_requests',
          filter: `hospital_id=eq.${user.id}`
        }, 
        (payload) => {
          console.log('Change received!', payload);
          // Update our local state based on the change
          if (payload.eventType === 'INSERT') {
            setRequests(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setRequests(prev => 
              prev.map(request => 
                request.id === payload.new.id ? payload.new : request
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setRequests(prev => 
              prev.filter(request => request.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, fetchTransportRequests]);

  const handleFilterChange = (status) => {
    setFilterStatus(status);
  };

  const handleSortChange = (field) => {
    // If clicking the same field, toggle direction
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // Default to descending for new field
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'assigned': return 'status-assigned';
      case 'in_progress': return 'status-in-progress';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'assigned': return 'Assigned';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'critical': return 'priority-critical';
      case 'emergency': return 'priority-emergency';
      case 'urgent': return 'priority-urgent';
      case 'normal': return 'priority-normal';
      case 'scheduled': return 'priority-scheduled';
      default: return '';
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const filterOptions = [
    { value: 'all', label: 'All Requests' },
    { value: 'pending', label: 'Pending' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <div className="transport-request-list">
      <div className="list-header">
        <h2>Transport Requests</h2>
        <button className="new-request-button" onClick={onNewRequest}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Request
        </button>
      </div>
      
      <div className="filter-container">
        <div className="filter-tabs">
          {filterOptions.map(option => (
            <button
              key={option.value}
              className={`filter-tab ${filterStatus === option.value ? 'active' : ''}`}
              onClick={() => handleFilterChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {isLoading ? (
        <div className="loading-spinner">Loading...</div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          <p>No transport requests found</p>
          <button className="create-first" onClick={onNewRequest}>Create your first request</button>
        </div>
      ) : (
        <div className="request-table-container">
          <table className="request-table">
            <thead>
              <tr>
                <th onClick={() => handleSortChange('patient_name')}>
                  Patient
                  {sortField === 'patient_name' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSortChange('requested_at')}>
                  Date Requested
                  {sortField === 'requested_at' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSortChange('pickup_location')}>
                  Pickup
                  {sortField === 'pickup_location' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSortChange('destination')}>
                  Destination
                  {sortField === 'destination' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSortChange('priority')}>
                  Priority
                  {sortField === 'priority' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th onClick={() => handleSortChange('status')}>
                  Status
                  {sortField === 'status' && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(request => (
                <tr key={request.id} className="request-row">
                  <td>
                    <div className="patient-info">
                      <span className="patient-name">{request.patient_name}</span>
                      {request.patient_age && (
                        <span className="patient-age">{request.patient_age} yrs</span>
                      )}
                    </div>
                  </td>
                  <td>{formatDateTime(request.requested_at)}</td>
                  <td>{request.pickup_location}</td>
                  <td>{request.destination}</td>
                  <td>
                    <span className={`priority-badge ${getPriorityClass(request.priority)}`}>
                      {request.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusClass(request.status)}`}>
                      {getStatusLabel(request.status)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="view-button" title="View details">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </button>
                      {(request.status === 'pending') && (
                        <button className="edit-button" title="Edit request">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                      )}
                      {(request.status === 'pending') && (
                        <button className="cancel-button" title="Cancel request">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransportRequestList; 