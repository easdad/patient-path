import React, { useState } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { useAuth } from '../../../utils/AuthContext';
import './TransportRequestForm.css';

const TransportRequestForm = ({ onRequestCreated, onCancel }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    patientName: '',
    patientAge: '',
    patientGender: 'male',
    patientCondition: '',
    urgencyLevel: 'normal',
    pickupLocation: '',
    pickupDetails: '',
    destination: '',
    destinationDetails: '',
    specialEquipment: [],
    additionalNotes: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      // Handle special equipment checkboxes
      if (checked) {
        setFormData(prev => ({
          ...prev,
          specialEquipment: [...prev.specialEquipment, value]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          specialEquipment: prev.specialEquipment.filter(item => item !== value)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const newTransportRequest = {
        hospital_id: user.id,
        hospital_name: user.user_metadata?.full_name || 'Unknown Hospital',
        patient_name: formData.patientName,
        patient_age: formData.patientAge,
        patient_gender: formData.patientGender,
        patient_condition: formData.patientCondition,
        pickup_location: formData.pickupLocation,
        pickup_details: formData.pickupDetails,
        destination: formData.destination,
        destination_details: formData.destinationDetails,
        priority: formData.urgencyLevel,
        special_equipment: formData.specialEquipment,
        notes: formData.additionalNotes,
        status: 'pending',
        requested_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('transport_requests')
        .insert(newTransportRequest)
        .select();
      
      if (error) throw error;
      
      console.log('Transport request created:', data);
      onRequestCreated(data[0]);
    } catch (error) {
      console.error('Error creating transport request:', error);
      setError('Failed to create transport request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const urgencyOptions = [
    { value: 'critical', label: 'Critical - Immediate (Life-threatening)' },
    { value: 'emergency', label: 'Emergency (1-2 hours)' },
    { value: 'urgent', label: 'Urgent (2-4 hours)' },
    { value: 'normal', label: 'Normal (Today)' },
    { value: 'scheduled', label: 'Scheduled (Future date)' }
  ];

  const equipmentOptions = [
    { value: 'ventilator', label: 'Ventilator' },
    { value: 'cardiac_monitor', label: 'Cardiac Monitor' },
    { value: 'iv_pump', label: 'IV Pump' },
    { value: 'oxygen', label: 'Oxygen' },
    { value: 'stretcher', label: 'Specialized Stretcher' },
    { value: 'isolation', label: 'Isolation Equipment' },
    { value: 'wheelchair', label: 'Wheelchair' }
  ];

  return (
    <div className="transport-request-form-container">
      <div className="form-header">
        <h2>New Transport Request</h2>
        <button className="close-button" onClick={onCancel}>×</button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Patient Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="patientName">Patient Name*</label>
              <input
                type="text"
                id="patientName"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                required
                placeholder="Full name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="patientAge">Age</label>
              <input
                type="number"
                id="patientAge"
                name="patientAge"
                value={formData.patientAge}
                onChange={handleChange}
                placeholder="Years"
                min="0"
                max="120"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="patientGender">Gender</label>
              <select
                id="patientGender"
                name="patientGender"
                value={formData.patientGender}
                onChange={handleChange}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="undisclosed">Prefer not to say</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="patientCondition">Patient Condition/Diagnosis</label>
            <textarea
              id="patientCondition"
              name="patientCondition"
              value={formData.patientCondition}
              onChange={handleChange}
              placeholder="Brief description of patient's condition"
            />
          </div>
        </div>
        
        <div className="form-section">
          <h3>Transport Details</h3>
          
          <div className="form-group">
            <label htmlFor="urgencyLevel">Urgency Level*</label>
            <select
              id="urgencyLevel"
              name="urgencyLevel"
              value={formData.urgencyLevel}
              onChange={handleChange}
              required
            >
              {urgencyOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pickupLocation">Pickup Location*</label>
              <input
                type="text"
                id="pickupLocation"
                name="pickupLocation"
                value={formData.pickupLocation}
                onChange={handleChange}
                required
                placeholder="Hospital, Department, Room #"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="destination">Destination*</label>
              <input
                type="text"
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                required
                placeholder="Facility name, address"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pickupDetails">Pickup Details</label>
              <textarea
                id="pickupDetails"
                name="pickupDetails"
                value={formData.pickupDetails}
                onChange={handleChange}
                placeholder="Additional pickup instructions"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="destinationDetails">Destination Details</label>
              <textarea
                id="destinationDetails"
                name="destinationDetails"
                value={formData.destinationDetails}
                onChange={handleChange}
                placeholder="Additional destination instructions"
              />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Equipment & Notes</h3>
          
          <div className="form-group">
            <label>Special Equipment Required</label>
            <div className="checkbox-group">
              {equipmentOptions.map(option => (
                <div key={option.value} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={option.value}
                    name="specialEquipment"
                    value={option.value}
                    checked={formData.specialEquipment.includes(option.value)}
                    onChange={handleChange}
                  />
                  <label htmlFor={option.value}>{option.label}</label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="additionalNotes">Additional Notes</label>
            <textarea
              id="additionalNotes"
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleChange}
              placeholder="Any other important information"
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransportRequestForm; 