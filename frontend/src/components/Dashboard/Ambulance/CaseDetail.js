import React, { useState } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { useAuth } from '../../../utils/AuthContext';
import './CaseDetail.css';

const CaseDetail = ({ caseData, onClose, onCommunicate }) => {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  const transportRequest = caseData.transport_request || {};
  
  const handleStatusUpdate = async (newStatus) => {
    setIsUpdating(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Update the assignment status
      const { error: updateError } = await supabase
        .from('transport_assignments')
        .update({ 
          status: newStatus,
          ...(newStatus === 'completed' ? { completion_time: new Date().toISOString() } : {}),
          ...(newStatus === 'arrived' ? { actual_arrival: new Date().toISOString() } : {})
        })
        .eq('id', caseData.id);
      
      if (updateError) throw updateError;
      
      // If completed, also update the transport request
      if (newStatus === 'completed') {
        const { error: requestUpdateError } = await supabase
          .from('transport_requests')
          .update({ status: 'completed' })
          .eq('id', transportRequest.id);
        
        if (requestUpdateError) throw requestUpdateError;
      }
      
      setSuccessMessage(`Status updated to ${newStatus}`);
      
      // Refresh the case data
      const { data: updatedCase, error: fetchError } = await supabase
        .from('transport_assignments')
        .select(`
          *,
          transport_request:transport_requests(*)
        `)
        .eq('id', caseData.id)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Update the case data in the parent component
      if (updatedCase) {
        caseData = updatedCase;
      }
      
      // If completed, close after a delay
      if (newStatus === 'completed') {
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
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

  const getNextStatusOptions = () => {
    const { status } = caseData;
    
    switch (status) {
      case 'assigned':
        return [
          { value: 'in_progress', label: 'Start Transport' },
          { value: 'cancelled', label: 'Cancel Transport' }
        ];
      case 'in_progress':
        return [
          { value: 'arrived', label: 'Arrived at Pickup' },
          { value: 'cancelled', label: 'Cancel Transport' }
        ];
      case 'arrived':
        return [
          { value: 'en_route', label: 'En Route to Destination' },
          { value: 'cancelled', label: 'Cancel Transport' }
        ];
      case 'en_route':
        return [
          { value: 'completed', label: 'Complete Transport' },
          { value: 'cancelled', label: 'Cancel Transport' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="case-detail">
      <div className="case-detail-header">
        <div className="header-content">
          <h2>Transport Case Details</h2>
          <div className="case-status">
            <div className={`status-badge ${getStatusClass(caseData.status)}`}>
              {getStatusLabel(caseData.status)}
            </div>
            {transportRequest.priority && (
              <div className={`priority-badge ${getPriorityClass(transportRequest.priority)}`}>
                {transportRequest.priority}
              </div>
            )}
          </div>
        </div>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <div className="case-detail-content">
        <div className="detail-section">
          <h3>Patient Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Name</span>
              <span className="detail-value">{transportRequest.patient_name}</span>
            </div>
            
            {transportRequest.patient_age && (
              <div className="detail-item">
                <span className="detail-label">Age</span>
                <span className="detail-value">{transportRequest.patient_age} years</span>
              </div>
            )}
            
            {transportRequest.patient_gender && (
              <div className="detail-item">
                <span className="detail-label">Gender</span>
                <span className="detail-value">{transportRequest.patient_gender}</span>
              </div>
            )}
            
            {transportRequest.patient_condition && (
              <div className="detail-item full-width">
                <span className="detail-label">Condition</span>
                <span className="detail-value">{transportRequest.patient_condition}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="detail-section">
          <h3>Transport Details</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">From</span>
              <span className="detail-value">{transportRequest.pickup_location}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">To</span>
              <span className="detail-value">{transportRequest.destination}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Hospital</span>
              <span className="detail-value">{transportRequest.hospital_name}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Requested</span>
              <span className="detail-value">{formatDate(transportRequest.requested_at)}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Assigned</span>
              <span className="detail-value">{formatDate(caseData.assigned_at)}</span>
            </div>
            
            {caseData.estimated_arrival && (
              <div className="detail-item">
                <span className="detail-label">ETA</span>
                <span className="detail-value">{formatDate(caseData.estimated_arrival)}</span>
              </div>
            )}
            
            {caseData.actual_arrival && (
              <div className="detail-item">
                <span className="detail-label">Arrived</span>
                <span className="detail-value">{formatDate(caseData.actual_arrival)}</span>
              </div>
            )}
            
            {caseData.completion_time && (
              <div className="detail-item">
                <span className="detail-label">Completed</span>
                <span className="detail-value">{formatDate(caseData.completion_time)}</span>
              </div>
            )}
          </div>
          
          {transportRequest.pickup_details && (
            <div className="detail-notes">
              <span className="detail-label">Pickup Details</span>
              <p className="detail-value">{transportRequest.pickup_details}</p>
            </div>
          )}
          
          {transportRequest.destination_details && (
            <div className="detail-notes">
              <span className="detail-label">Destination Details</span>
              <p className="detail-value">{transportRequest.destination_details}</p>
            </div>
          )}
        </div>
        
        <div className="detail-section">
          <h3>Additional Information</h3>
          <div className="detail-grid">
            {transportRequest.special_equipment && transportRequest.special_equipment.length > 0 && (
              <div className="detail-item full-width">
                <span className="detail-label">Special Equipment</span>
                <div className="equipment-list">
                  {transportRequest.special_equipment.map(item => (
                    <span key={item} className="equipment-item">{item}</span>
                  ))}
                </div>
              </div>
            )}
            
            {transportRequest.notes && (
              <div className="detail-item full-width">
                <span className="detail-label">Notes</span>
                <p className="detail-value">{transportRequest.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="case-detail-footer">
        <div className="action-buttons">
          <button 
            className="communicate-button"
            onClick={onCommunicate}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Contact Hospital
          </button>
          
          {getNextStatusOptions().map(option => (
            <button
              key={option.value}
              className={`status-button ${option.value === 'cancelled' ? 'cancel-button' : ''}`}
              onClick={() => handleStatusUpdate(option.value)}
              disabled={isUpdating}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CaseDetail; 