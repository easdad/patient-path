import React, { useState, useEffect } from 'react';
import supabase from '../../../utils/supabaseClient';
import './AmbulanceDashboard.css';

const AmbulanceDashboard = () => {
  const [user, setUser] = useState(null);
  const [transportRequests, setTransportRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('available');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (currentUser) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
            
          if (error) throw error;
          setUser({ ...currentUser, profile: data });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    const fetchTransportRequests = async () => {
      try {
        const { data, error } = await supabase
          .from('transport_requests')
          .select('*')
          .eq('status', 'pending')
          .order('requested_time', { ascending: false });
          
        if (error) throw error;
        setTransportRequests(data || []);
      } catch (error) {
        console.error('Error fetching transport requests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
    fetchTransportRequests();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        alert('You must be logged in to accept a request');
        return;
      }
      
      // Update the transport request
      const { error: updateError } = await supabase
        .from('transport_requests')
        .update({ 
          status: 'assigned'
        })
        .eq('id', requestId);
        
      if (updateError) throw updateError;
      
      // Create assignment record
      const { error: assignmentError } = await supabase
        .from('transport_assignments')
        .insert({
          request_id: requestId,
          ambulance_id: currentUser.id,
          assigned_at: new Date().toISOString(),
          status: 'accepted',
          estimated_arrival: new Date(Date.now() + 30*60000).toISOString() // 30 minutes in the future
        });
        
      if (assignmentError) throw assignmentError;
      
      // Refresh the list
      setTransportRequests(transportRequests.filter(req => req.id !== requestId));
      alert('Transport request accepted successfully!');
    } catch (error) {
      console.error('Error accepting transport request:', error);
      alert('Failed to accept transport request. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1>Ambulance Service Dashboard</h1>
      <p>Welcome to your ambulance service provider dashboard!</p>
      
      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'available' ? 'active' : ''}`}
          onClick={() => handleTabChange('available')}
        >
          Available Requests
        </button>
        <button 
          className={`tab-button ${activeTab === 'my-transports' ? 'active' : ''}`}
          onClick={() => handleTabChange('my-transports')}
        >
          My Transports
        </button>
      </div>
      
      {activeTab === 'available' && (
        <div className="dashboard-content">
          <h2>Available Transport Requests</h2>
          
          {transportRequests.length === 0 ? (
            <div className="empty-state">
              <p>No transport requests available at the moment.</p>
            </div>
          ) : (
            <div className="transport-requests">
              {transportRequests.map((request) => (
                <div key={request.id} className="request-card">
                  <div className="request-header">
                    <h3>Patient: {request.patient_name}</h3>
                    <span className={`priority-badge ${request.priority.toLowerCase()}`}>
                      {request.priority}
                    </span>
                  </div>
                  
                  <div className="request-details">
                    <div className="detail-row">
                      <span className="detail-label">From:</span>
                      <span className="detail-value">{request.pickup_location}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">To:</span>
                      <span className="detail-value">{request.destination}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Time:</span>
                      <span className="detail-value">
                        {new Date(request.requested_time).toLocaleString()}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Notes:</span>
                      <span className="detail-value">{request.notes || 'No notes provided'}</span>
                    </div>
                  </div>
                  
                  <div className="request-actions">
                    <button 
                      className="accept-button"
                      onClick={() => handleAcceptRequest(request.id)}
                    >
                      Accept Request
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'my-transports' && (
        <div className="dashboard-content">
          <h2>My Scheduled Transports</h2>
          <div className="empty-state">
            <p>Your assigned transports will appear here.</p>
            <p>Currently this feature is under development.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AmbulanceDashboard; 