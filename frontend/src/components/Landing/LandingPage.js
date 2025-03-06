import React from 'react';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-container">
      {/* Header */}
      <header className="landing-header">
        <div className="logo-area">
          <div className="logo-circle">+</div>
          <div className="logo-text">
            <h1>PATIENT PATH</h1>
            <p>Patient Transport Hub</p>
          </div>
        </div>
        <button className="menu-button">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </header>

      {/* Main Content */}
      <main className="landing-main">
        <div className="icon-circle">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13" rx="2" ry="2"></rect>
            <line x1="16" y1="8" x2="20" y2="8"></line>
            <line x1="16" y1="16" x2="23" y2="16"></line>
            <rect x="12" y="5" width="3" height="9"></rect>
            <circle cx="7" cy="16" r="3"></circle>
            <circle cx="17" cy="16" r="3"></circle>
          </svg>
        </div>
        
        <h2 className="welcome-heading">Welcome to Patient PATH</h2>
        
        <p className="welcome-text">
          Streamlining patient transport coordination between healthcare facilities and 
          ambulance services. Please log in or create an account to continue.
        </p>
        
        <div className="action-buttons">
          <button className="login-button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" y1="12" x2="3" y2="12"></line>
            </svg>
            Login to Your Account
          </button>
          <button className="register-button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
            Register New Account
          </button>
        </div>
        
        <div className="feature-cards">
          <div className="feature-card">
            <div className="feature-icon hospital">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
            </div>
            <h3>For Hospitals</h3>
            <p>Easily request patient transports, track their status, and choose from available providers.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon ambulance">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" rx="2" ry="2"></rect>
                <circle cx="7" cy="16" r="3"></circle>
                <circle cx="17" cy="16" r="3"></circle>
                <line x1="16" y1="9" x2="22" y2="9"></line>
              </svg>
            </div>
            <h3>For Ambulance Services</h3>
            <p>Find transport requests, submit bids, and efficiently manage your fleet.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon patient">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <h3>For Patients</h3>
            <p>Better coordination means faster transports and improved quality of care.</p>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <div className="logo-circle small">+</div>
            <div className="logo-text">
              <h3>PATIENT PATH</h3>
              <p>Connecting Care Through Transport</p>
            </div>
          </div>
          
          <div className="footer-links">
            <div className="footer-link">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span>(800) 555-PATH</span>
            </div>
            <div className="footer-link">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
              </svg>
              <span>Find Us</span>
            </div>
            <div className="footer-link">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4"></circle>
                <path d="M12 2v2"></path>
                <path d="M12 18v2"></path>
                <path d="M4.93 4.93l1.41 1.41"></path>
                <path d="M17.66 17.66l1.41 1.41"></path>
                <path d="M2 12h2"></path>
                <path d="M18 12h2"></path>
                <path d="M4.93 19.07l1.41-1.41"></path>
                <path d="M17.66 6.34l1.41-1.41"></path>
              </svg>
              <span>Support</span>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© 2025 PATH - Patient Ambulance Transport Hub</p>
          <div className="footer-bottom-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#contact">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 