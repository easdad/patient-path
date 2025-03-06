import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LandingPage.css';
import supabase from '../../utils/supabaseClient';

const LandingPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Login with Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });
      
      if (signInError) throw signInError;
      
      console.log('Login successful', data);
      
      // Route to appropriate dashboard based on user type
      const { data: { user } } = await supabase.auth.getUser();
      const userType = user?.user_metadata?.user_type || 'hospital';
      
      const dashboardRoute = userType === 'hospital' ? '/hospital-dashboard' : '/ambulance-dashboard';
      navigate(dashboardRoute);
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = formData.email;
    if (!email) {
      setError('Please enter your email address first');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) throw error;
      
      alert(`Password reset instructions have been sent to ${email}`);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to send password reset email');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      setIsSubmitting(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) throw error;
      
      // The redirect will happen automatically, but we set isSubmitting to true
      // to disable buttons and prevent multiple clicks
    } catch (err) {
      console.error(`${provider} login error:`, err);
      setError(err.message || `Failed to sign in with ${provider}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="landing-container">
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
            <h1>Welcome back</h1>
            <p className="auth-subtitle">
              Sign in to access your health information
            </p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit}>
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

              <button 
                type="submit" 
                className="auth-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Sign In'}
              </button>

              <div className="forgot-password">
                <button 
                  type="button" 
                  className="forgot-password-link"
                  onClick={handleForgotPassword}
                >
                  Forgot your password?
                </button>
              </div>
            </form>

            <div className="auth-divider">
              <span>OR</span>
            </div>

            <button 
              className="social-auth-button google-button" 
              disabled={isSubmitting}
              onClick={() => handleSocialLogin('google')}
            >
              <span className="social-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                </svg>
              </span>
              Continue with Google
            </button>

            <button 
              className="social-auth-button apple-button" 
              disabled={isSubmitting}
              onClick={() => handleSocialLogin('apple')}
            >
              <span className="social-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="18px" height="18px">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                </svg>
              </span>
              Continue with Apple
            </button>

            <p className="auth-toggle">
              Don't have an account?{" "}
              <Link to="/register" className="toggle-button">
                Create account
              </Link>
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