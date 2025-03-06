import React, { useState } from 'react';
import './LandingPage.css';

const LandingPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would add authentication logic
    console.log('Form submitted:', formData);
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

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

      {/* Centered Content */}
      <main className="landing-main centered-layout">
        {/* Centered Icon and Welcome Text */}
        <div className="centered-welcome">
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
        </div>

        {/* Auth Card */}
        <div className="auth-section">
          <div className="auth-card">
            <h1>{isLogin ? 'Welcome back' : 'Create account'}</h1>
            <p className="auth-subtitle">
              {isLogin 
                ? 'Sign in to access your health information' 
                : 'Join Patient Path to manage your healthcare journey'}
            </p>

            <form onSubmit={handleSubmit}>
              {!isLogin && (
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
              )}

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
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
                  placeholder="Enter your password"
                  required
                />
              </div>

              {!isLogin && (
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
              )}

              <button type="submit" className="auth-button">
                {isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <button className="social-auth-button google-button">
              <span className="social-icon">G</span>
              Continue with Google
            </button>

            <button className="social-auth-button apple-button">
              <span className="social-icon">a</span>
              Continue with Apple
            </button>

            <p className="auth-toggle">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button type="button" onClick={toggleForm} className="toggle-button">
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

        {/* Feature Cards Side by Side */}
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