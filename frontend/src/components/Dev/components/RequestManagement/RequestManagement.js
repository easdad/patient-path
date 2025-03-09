import React from 'react';
import { useRequests } from '../../../../hooks/useRequests';
import { useDashboard } from '../../../../contexts/DashboardContext';
import '../shared/SharedStyles.css';

const RequestManagement = () => {
  const { refreshTrigger } = useDashboard();
  const { requests, isLoading, error, clearRequests } = useRequests(refreshTrigger);
  
  if (isLoading) {
    return <div className="loading-indicator">Loading requests...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  return (
    <div className="request-management">
      <div className="section-header">
        <h2>Transport Requests</h2>
        <div className="request-actions">
          <button 
            className="clear-button"
            onClick={clearRequests}
            disabled={requests.length === 0}
          >
            Clear All Requests
          </button>
        </div>
      </div>
      
      {requests.length === 0 ? (
        <div className="empty-state">
          <p>No transport requests found</p>
        </div>
      ) : (
        <div className="table-container requests-table-container">
          <table className="requests-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Hospital</th>
                <th>Patient</th>
                <th>Status</th>
                <th>Created</th>
                <th>Pickup</th>
                <th>Destination</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(request => (
                <tr key={request.id}>
                  <td>{request.id}</td>
                  <td>{request.hospital_id}</td>
                  <td>{request.patient_name}</td>
                  <td>
                    <span className={`status-badge ${request.status}`}>
                      {request.status}
                    </span>
                  </td>
                  <td>{new Date(request.created_at).toLocaleDateString()}</td>
                  <td>{request.pickup_location}</td>
                  <td>{request.destination}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RequestManagement; 