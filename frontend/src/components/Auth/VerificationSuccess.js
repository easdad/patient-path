import React from 'react';
import { Link } from 'react-router-dom';
import './AuthStyles.css';

const VerificationSuccess = () => {
  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="verification-success">
          <div className="success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          
          <h2>Email Verified Successfully!</h2>
          <p>Your account has been verified and is now ready to use.</p>
          
          <div className="success-actions">
            <Link to="/" className="primary-button">
              Sign In to Your Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationSuccess; 