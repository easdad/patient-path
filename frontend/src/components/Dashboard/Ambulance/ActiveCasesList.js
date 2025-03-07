import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { useAuth } from '../../../utils/AuthContext';
import './ActiveCasesList.css';

const ActiveCasesList = ({ onCaseSelect }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [assignedCases, setAssignedCases] = useState([]);
  const [availableRequests, setAvailableRequests] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('assigned');

  const fetchActiveCases = useCallback(async () => {
    if (!user) return; // Skip if user isn't loaded yet
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch assigned cases
      const { data: assignments, error: assignmentsError } = await supabase
        .from('transport_assignments')
        .select(`
          *,
          transport_request:transport_requests(*)
        `)
        .eq('ambulance_id', user.id)
        .not('status', 'eq', 'completed')
        .order('assigned_at', { ascending: false });
      
      if (assignmentsError) throw assignmentsError;
      
      // Fetch available transport requests
      const { data: requests, error: requestsError } = await supabase
        .from('transport_requests')
        .select('*')
        .eq('status', 'pending')
        .order('requested_at', { ascending: false });
      
      if (requestsError) throw requestsError;
      
      setAssignedCases(assignments || []);
      setAvailableRequests(requests || []);
    } catch (error) {
      console.error('Error fetching active cases:', error);
      setError('Failed to load active cases. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return; // Skip if user isn't loaded yet
    
    fetchActiveCases();
    
    // Set up real-time listeners
    const assignmentsChannel = supabase
      .channel('assignments_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'transport_assignments',
          filter: `ambulance_id=eq.${user.id}`
        }, 
        () => fetchActiveCases()
      )
      .subscribe();
      
    const requestsChannel = supabase
      .channel('requests_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'transport_requests',
          filter: `status=eq.pending`
        }, 
        () => fetchActiveCases()
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(assignmentsChannel);
      supabase.removeChannel(requestsChannel);
    };
  }, [user, fetchActiveCases]);

  const handleAcceptRequest = async (request) => {
    try {
      // Update the transport request status
      const { error: updateError } = await supabase
        .from('transport_requests')
        .update({ status: 'assigned' })
        .eq('id', request.id);
      
      if (updateError) throw updateError;
      
      // Create new transport assignment
      const { data, error: assignError } = await supabase
        .from('transport_assignments')
        .insert({
          request_id: request.id,
          ambulance_id: user.id,
          ambulance_name: user.user_metadata?.full_name || 'Ambulance Service',
          status: 'assigned',
          assigned_at: new Date().toISOString(),
          estimated_arrival: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes from now
        })
        .select();
      
      if (assignError) throw assignError;
      
      // Refresh data
      fetchActiveCases();
      
      // If successful, select the newly created case
      if (data && data.length > 0) {
        // Fetch the complete case data including the request
        const { data: fullCase, error: fullCaseError } = await supabase
          .from('transport_assignments')
          .select(`
            *,
            transport_request:transport_requests(*)
          `)
          .eq('id', data[0].id)
          .single();
          
        if (fullCaseError) throw fullCaseError;
        
        onCaseSelect(fullCase);
      }
    } catch (error) {
      console.error('Error accepting transport request:', error);
      alert('Failed to accept request. Please try again.');
    }
  };

  const handleViewCase = (caseData) => {
    onCaseSelect(caseData);
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'assigned': return 'status-assigned';
      case 'in_progress': return 'status-in-progress';
      case 'arrived': return 'status-arrived';
      case 'en_route': return 'status-en-route';
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
      case 'arrived': return 'Arrived';
      case 'en_route': return 'En Route';
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

  return (
    <div className="active-cases-list">
      <div className="cases-header">
        <h2>Transport Cases</h2>
        <div className="case-tabs">
          <button 
            className={`case-tab ${activeTab === 'assigned' ? 'active' : ''}`}
            onClick={() => setActiveTab('assigned')}
          >
            Assigned ({assignedCases.length})
          </button>
          <button 
            className={`case-tab ${activeTab === 'available' ? 'active' : ''}`}
            onClick={() => setActiveTab('available')}
          >
            Available ({availableRequests.length})
          </button>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {isLoading ? (
        <div className="loading-spinner">Loading...</div>
      ) : activeTab === 'assigned' ? (
        <div className="cases-container">
          {assignedCases.length === 0 ? (
            <div className="empty-state">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              </svg>
              <p>No active cases assigned to you</p>
              <button onClick={() => setActiveTab('available')}>Browse Available Requests</button>
            </div>
          ) : (
            <div className="cases-grid">
              {assignedCases.map(caseData => (
                <div 
                  key={caseData.id} 
                  className="case-card"
                  onClick={() => handleViewCase(caseData)}
                >
                  <div className="case-card-header">
                    <div className={`status-badge ${getStatusClass(caseData.status)}`}>
                      {getStatusLabel(caseData.status)}
                    </div>
                    {caseData.transport_request.priority && (
                      <div className={`priority-badge ${getPriorityClass(caseData.transport_request.priority)}`}>
                        {caseData.transport_request.priority}
                      </div>
                    )}
                  </div>
                  
                  <div className="case-card-content">
                    <h3 className="patient-name">{caseData.transport_request.patient_name}</h3>
                    
                    <div className="case-details">
                      <div className="detail-row">
                        <span className="detail-label">From:</span>
                        <span className="detail-value">{caseData.transport_request.pickup_location}</span>
                      </div>
                      
                      <div className="detail-row">
                        <span className="detail-label">To:</span>
                        <span className="detail-value">{caseData.transport_request.destination}</span>
                      </div>
                      
                      <div className="detail-row">
                        <span className="detail-label">Hospital:</span>
                        <span className="detail-value">{caseData.transport_request.hospital_name}</span>
                      </div>
                      
                      <div className="detail-row">
                        <span className="detail-label">Assigned:</span>
                        <span className="detail-value">{formatDate(caseData.assigned_at)}</span>
                      </div>
                      
                      {caseData.estimated_arrival && (
                        <div className="detail-row">
                          <span className="detail-label">ETA:</span>
                          <span className="detail-value">{formatDate(caseData.estimated_arrival)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="case-card-footer">
                    <button className="case-details-button">
                      View Details
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="cases-container">
          {availableRequests.length === 0 ? (
            <div className="empty-state">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              <p>No available transport requests</p>
            </div>
          ) : (
            <div className="cases-grid">
              {availableRequests.map(request => (
                <div key={request.id} className="case-card available-request">
                  <div className="case-card-header">
                    {request.priority && (
                      <div className={`priority-badge ${getPriorityClass(request.priority)}`}>
                        {request.priority}
                      </div>
                    )}
                  </div>
                  
                  <div className="case-card-content">
                    <h3 className="patient-name">{request.patient_name}</h3>
                    
                    <div className="case-details">
                      <div className="detail-row">
                        <span className="detail-label">From:</span>
                        <span className="detail-value">{request.pickup_location}</span>
                      </div>
                      
                      <div className="detail-row">
                        <span className="detail-label">To:</span>
                        <span className="detail-value">{request.destination}</span>
                      </div>
                      
                      <div className="detail-row">
                        <span className="detail-label">Hospital:</span>
                        <span className="detail-value">{request.hospital_name}</span>
                      </div>
                      
                      <div className="detail-row">
                        <span className="detail-label">Requested:</span>
                        <span className="detail-value">{formatDate(request.requested_at)}</span>
                      </div>
                      
                      {request.patient_condition && (
                        <div className="detail-row">
                          <span className="detail-label">Condition:</span>
                          <span className="detail-value">{request.patient_condition}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="case-card-footer">
                    <button 
                      className="accept-request-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAcceptRequest(request);
                      }}
                    >
                      Accept Request
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActiveCasesList; 