import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import supabase from '../../utils/supabaseClient';
import './AuthStyles.css';

const RegistrationPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    // User account details
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    
    // Role selection
    userType: 'hospital',
    
    // Organization information
    organizationName: '',
    organizationAddress: '',
    organizationCity: '',
    organizationState: '',
    organizationZip: '',
    organizationPhone: '',
    
    // Additional fields for hospitals
    hospitalType: 'general',
    numberOfBeds: '',
    
    // Additional fields for ambulance services
    fleetSize: '',
    serviceArea: '',
    
    // Terms agreement
    acceptedTerms: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const validateStep = (step) => {
    setError('');
    
    if (step === 1) {
      // Validate role selection
      if (!formData.userType) {
        setError('Please select a role');
        return false;
      }
    } else if (step === 2) {
      // Validate organization information
      if (!formData.organizationName) {
        setError('Organization name is required');
        return false;
      }
      if (!formData.organizationAddress) {
        setError('Organization address is required');
        return false;
      }
      if (!formData.organizationCity) {
        setError('City is required');
        return false;
      }
      if (!formData.organizationState) {
        setError('State is required');
        return false;
      }
      if (!formData.organizationZip) {
        setError('ZIP code is required');
        return false;
      }
      if (!formData.organizationPhone) {
        setError('Phone number is required');
        return false;
      }
      
      // Validate role-specific fields
      if (formData.userType === 'hospital') {
        if (!formData.hospitalType) {
          setError('Hospital type is required');
          return false;
        }
        if (!formData.numberOfBeds) {
          setError('Number of beds is required');
          return false;
        }
      } else {
        if (!formData.fleetSize) {
          setError('Fleet size is required');
          return false;
        }
        if (!formData.serviceArea) {
          setError('Service area is required');
          return false;
        }
      }
    } else if (step === 3) {
      // Validate user account details
      if (!formData.fullName) {
        setError('Full name is required');
        return false;
      }
      if (!formData.email) {
        setError('Email is required');
        return false;
      }
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        setError('Please enter a valid email address');
        return false;
      }
      if (!formData.password) {
        setError('Password is required');
        return false;
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (!formData.acceptedTerms) {
        setError('You must accept the terms of service and privacy policy');
        return false;
      }
    }
    
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Register with Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            user_type: formData.userType,
            organization_name: formData.organizationName,
            organization_address: formData.organizationAddress,
            organization_city: formData.organizationCity,
            organization_state: formData.organizationState,
            organization_zip: formData.organizationZip,
            organization_phone: formData.organizationPhone,
            hospital_type: formData.userType === 'hospital' ? formData.hospitalType : null,
            number_of_beds: formData.userType === 'hospital' ? formData.numberOfBeds : null,
            fleet_size: formData.userType === 'ambulance' ? formData.fleetSize : null,
            service_area: formData.userType === 'ambulance' ? formData.serviceArea : null
          }
        }
      });
      
      if (signUpError) throw signUpError;
      
      // Create an entry in the organization profiles table
      const { error: profileError } = await supabase
        .from(formData.userType === 'hospital' ? 'hospital_profiles' : 'ambulance_profiles')
        .insert([
          {
            user_id: data.user.id,
            organization_name: formData.organizationName,
            address: formData.organizationAddress,
            city: formData.organizationCity,
            state: formData.organizationState,
            zip: formData.organizationZip,
            phone: formData.organizationPhone,
            ...(formData.userType === 'hospital' 
              ? { 
                  hospital_type: formData.hospitalType,
                  number_of_beds: formData.numberOfBeds
                } 
              : {
                  fleet_size: formData.fleetSize,
                  service_area: formData.serviceArea
                }
            )
          }
        ]);
      
      if (profileError) throw profileError;
      
      // Set the final step to show verification message
      setCurrentStep(4);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'An error occurred during registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1: Role Selection
  const renderRoleSelection = () => (
    <div className="registration-step role-selection">
      <h2>Choose Your Role</h2>
      <p className="step-description">
        Select the role that best describes your organization to help us customize your experience.
      </p>
      
      <div className="role-options">
        <div 
          className={`role-option ${formData.userType === 'hospital' ? 'selected' : ''}`}
          onClick={() => setFormData({...formData, userType: 'hospital'})}
        >
          <div className="role-icon hospital-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
          </div>
          <h3>Hospital / Healthcare Facility</h3>
          <p>Request patient transports, track their status, and manage patient transfers</p>
        </div>
        
        <div 
          className={`role-option ${formData.userType === 'ambulance' ? 'selected' : ''}`}
          onClick={() => setFormData({...formData, userType: 'ambulance'})}
        >
          <div className="role-icon ambulance-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13" rx="2" ry="2"></rect>
              <circle cx="7" cy="16" r="3"></circle>
              <circle cx="17" cy="16" r="3"></circle>
              <line x1="16" y1="9" x2="22" y2="9"></line>
            </svg>
          </div>
          <h3>Ambulance Service Provider</h3>
          <p>Receive transport requests, manage your fleet, and optimize your operations</p>
        </div>
      </div>
      
      <div className="step-buttons">
        <Link to="/" className="secondary-button">Back to Login</Link>
        <button className="primary-button" onClick={nextStep}>Continue</button>
      </div>
    </div>
  );

  // Step 2: Organization Information
  const renderOrganizationInfo = () => (
    <div className="registration-step org-info">
      <h2>Organization Information</h2>
      <p className="step-description">
        Tell us about your organization so we can customize your experience.
      </p>
      
      <div className="form-grid">
        <div className="form-group full-width">
          <label htmlFor="organizationName">Organization Name</label>
          <input
            type="text"
            id="organizationName"
            name="organizationName"
            value={formData.organizationName}
            onChange={handleChange}
            placeholder="Enter your organization's name"
            required
          />
        </div>
        
        <div className="form-group full-width">
          <label htmlFor="organizationAddress">Street Address</label>
          <input
            type="text"
            id="organizationAddress"
            name="organizationAddress"
            value={formData.organizationAddress}
            onChange={handleChange}
            placeholder="Enter your street address"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="organizationCity">City</label>
          <input
            type="text"
            id="organizationCity"
            name="organizationCity"
            value={formData.organizationCity}
            onChange={handleChange}
            placeholder="City"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="organizationState">State</label>
          <input
            type="text"
            id="organizationState"
            name="organizationState"
            value={formData.organizationState}
            onChange={handleChange}
            placeholder="State"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="organizationZip">ZIP Code</label>
          <input
            type="text"
            id="organizationZip"
            name="organizationZip"
            value={formData.organizationZip}
            onChange={handleChange}
            placeholder="ZIP Code"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="organizationPhone">Phone Number</label>
          <input
            type="tel"
            id="organizationPhone"
            name="organizationPhone"
            value={formData.organizationPhone}
            onChange={handleChange}
            placeholder="(XXX) XXX-XXXX"
            required
          />
        </div>
        
        {formData.userType === 'hospital' ? (
          // Hospital-specific fields
          <>
            <div className="form-group">
              <label htmlFor="hospitalType">Hospital Type</label>
              <select
                id="hospitalType"
                name="hospitalType"
                value={formData.hospitalType}
                onChange={handleChange}
                required
              >
                <option value="general">General Hospital</option>
                <option value="specialty">Specialty Hospital</option>
                <option value="teaching">Teaching Hospital</option>
                <option value="clinic">Clinic/Outpatient Facility</option>
                <option value="rehabilitation">Rehabilitation Center</option>
                <option value="longterm">Long-term Care Facility</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="numberOfBeds">Number of Beds</label>
              <input
                type="number"
                id="numberOfBeds"
                name="numberOfBeds"
                value={formData.numberOfBeds}
                onChange={handleChange}
                placeholder="Number of beds"
                min="1"
                required
              />
            </div>
          </>
        ) : (
          // Ambulance service-specific fields
          <>
            <div className="form-group">
              <label htmlFor="fleetSize">Fleet Size</label>
              <input
                type="number"
                id="fleetSize"
                name="fleetSize"
                value={formData.fleetSize}
                onChange={handleChange}
                placeholder="Number of vehicles"
                min="1"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="serviceArea">Service Area (miles)</label>
              <input
                type="number"
                id="serviceArea"
                name="serviceArea"
                value={formData.serviceArea}
                onChange={handleChange}
                placeholder="Service radius in miles"
                min="1"
                required
              />
            </div>
          </>
        )}
      </div>
      
      <div className="step-buttons">
        <button className="secondary-button" onClick={prevStep}>Back</button>
        <button className="primary-button" onClick={nextStep}>Continue</button>
      </div>
    </div>
  );

  // Step 3: Account Details and Terms
  const renderAccountDetails = () => (
    <div className="registration-step account-details">
      <h2>Create Your Account</h2>
      <p className="step-description">
        Set up your account credentials and accept our terms to complete registration.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email address"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password (8+ characters)"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            required
          />
        </div>
        
        <div className="terms-container">
          <div className="form-checkbox">
            <input
              type="checkbox"
              id="acceptedTerms"
              name="acceptedTerms"
              checked={formData.acceptedTerms}
              onChange={handleChange}
              required
            />
            <label htmlFor="acceptedTerms">
              I accept the <a href="#terms" className="terms-link">Terms of Service</a> and <a href="#privacy" className="terms-link">Privacy Policy</a>
            </label>
          </div>
        </div>
        
        {error && <div className="auth-error">{error}</div>}
        
        <div className="step-buttons">
          <button type="button" className="secondary-button" onClick={prevStep}>Back</button>
          <button 
            type="submit" 
            className="primary-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </div>
      </form>
    </div>
  );

  // Step 4: Verification Notice
  const renderVerificationNotice = () => (
    <div className="registration-step verification-notice">
      <div className="verification-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      
      <h2>Verification Email Sent</h2>
      
      <p className="verification-message">
        We've sent a verification email to <strong>{formData.email}</strong>.
        Please check your inbox and click the verification link to activate your account.
      </p>
      
      <p className="verification-note">
        After verifying your email, you'll be redirected to your personalized onboarding process.
      </p>
      
      <div className="verification-actions">
        <Link to="/" className="primary-button">Return to Login</Link>
      </div>
    </div>
  );

  // Progress indicator
  const renderProgressIndicator = () => {
    if (currentStep === 4) return null; // Don't show progress on final step
    
    return (
      <div className="progress-indicator">
        <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
          <div className="step-number">1</div>
          <span className="step-name">Role</span>
        </div>
        <div className="progress-line"></div>
        <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
          <div className="step-number">2</div>
          <span className="step-name">Organization</span>
        </div>
        <div className="progress-line"></div>
        <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <span className="step-name">Account</span>
        </div>
      </div>
    );
  };

  return (
    <div className="auth-container registration-container">
      <div className="auth-form-container">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Sign up to continue to Patient PATH</p>
        
        {renderProgressIndicator()}
        
        {error && currentStep !== 3 && <div className="auth-error">{error}</div>}
        
        {currentStep === 1 && renderRoleSelection()}
        {currentStep === 2 && renderOrganizationInfo()}
        {currentStep === 3 && renderAccountDetails()}
        {currentStep === 4 && renderVerificationNotice()}
      </div>
      
      <div className="auth-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <div className="logo-circle small">+</div>
            <div className="logo-text">
              <h3>PATIENT PATH</h3>
              <p>Connecting Care Through Transport</p>
            </div>
          </div>
          
          <div className="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#contact">Contact Us</a>
            <a href="#help">Help Center</a>
          </div>
          
          <p className="copyright">© 2025 PATH - Patient Ambulance Transport Hub</p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage; 