import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LandingPage.css';
import supabase from '../../utils/supabaseClient';
import { SUPABASE_CONFIG } from '../../config/supabase.config';

const LandingPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Simple function to create a test user for development
  const registerTestUser = async () => {
    try {
      setIsSubmitting(true);
      setError('');
      
      // Get hospital test user from config
      const testUser = SUPABASE_CONFIG.DEV_TEST_USERS.HOSPITAL;
      
      // Check if user already exists
      // eslint-disable-next-line no-unused-vars
      const { data: existingUser, error: _checkError } = await supabase.auth.signInWithPassword({
        email: testUser.email,
        password: testUser.password
      });
      
      if (existingUser?.user) {
        console.log('Test user already exists, signing in');
        setFormData({
          email: testUser.email,
          password: testUser.password
        });
        // Redirect to dashboard
        navigate('/hospital-dashboard');
        return;
      }
      
      // Register the test user
      const { data, error } = await supabase.auth.signUp({
        email: testUser.email,
        password: testUser.password,
        options: {
          data: {
            full_name: 'Test Hospital User',
            user_type: SUPABASE_CONFIG.USER_TYPES.HOSPITAL
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      console.log('Test user created successfully:', data);
      setFormData({
        email: testUser.email,
        password: testUser.password
      });
      
      alert(`Test user created! Email: ${testUser.email}, Password: ${testUser.password}`);
    } catch (err) {
      console.error('Error creating test user:', err);
      setError(err.message || 'Failed to create test user');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      console.log('Starting login process with email:', formData.email);

      // Login with Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });
      
      if (signInError) {
        console.error('Sign in error:', signInError);
        throw signInError;
      }
      
      if (!data?.user) {
        console.error('No user returned from authentication');
        throw new Error('No user returned from authentication. Account may not exist.');
      }
      
      console.log('Login successful, user data:', data.user.id);
      
      // Get user details
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error getting user details:', userError);
        throw userError;
      }
      
      const user = userData?.user;
      if (!user) {
        console.error('Failed to retrieve user details after login');
        throw new Error('Failed to retrieve user details after login.');
      }
      
      console.log('User details retrieved successfully');
      console.log('app_metadata:', user.app_metadata);
      console.log('user_metadata:', user.user_metadata);
      
      // Get user type to determine which dashboard to navigate to
      const userType = user.app_metadata?.role || user.user_metadata?.user_type || 'hospital';
      
      // Navigate to the appropriate dashboard based on user type
      if (userType === SUPABASE_CONFIG.USER_TYPES.HOSPITAL) {
        navigate('/hospital-dashboard');
      } else if (userType === SUPABASE_CONFIG.USER_TYPES.AMBULANCE) {
        navigate('/ambulance-dashboard');
      } else {
        // Default to hospital dashboard if user type is not recognized
        navigate('/hospital-dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in. Please check your credentials and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for forgot password button
  const handleForgotPassword = async () => {
    // If they haven't entered an email, prompt them
    if (!formData.email) {
      setError('Please enter your email address first');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Call Supabase's password reset functionality
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      // Show success message
      alert('Password reset link sent to your email');
    } catch (err) {
      console.error('Error sending password reset:', err);
      setError(err.message || 'Failed to send password reset email');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Only in development mode - a way to quickly update Supabase credentials
  const showCredentialsForm = () => {
    if (process.env.NODE_ENV !== 'development') return;
    
    // Only show for development
    const currentUrl = localStorage.getItem('supabase_url') || SUPABASE_CONFIG.URL;
    const currentKey = localStorage.getItem('supabase_key') || SUPABASE_CONFIG.ANON_KEY;
    
    const newUrl = prompt('Enter Supabase URL:', currentUrl);
    if (newUrl && newUrl.includes('supabase.co')) {
      localStorage.setItem('supabase_url', newUrl);
      
      const newKey = prompt('Enter Supabase Anon Key:', currentKey);
      if (newKey && newKey.startsWith('eyJ')) {
        localStorage.setItem('supabase_key', newKey);
        alert('Credentials updated! Refresh the page to apply changes.');
        window.location.reload();
      }
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

              {process.env.NODE_ENV === 'development' && (
                <button 
                  type="button" 
                  className="auth-button auth-button-secondary"
                  onClick={registerTestUser}
                  disabled={isSubmitting}
                  style={{ marginTop: '10px', backgroundColor: '#6c757d' }}
                >
                  Create Test User
                </button>
              )}

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

            {/* Social Auth Buttons */}
            <div className="social-auth-wrapper">
              <button className="social-auth-button google">
                <svg viewBox="0 0 24 24" className="social-icon">
                  <path fill="currentColor" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              <button className="social-auth-button apple">
                <svg viewBox="0 0 24 24" className="social-icon">
                  <path fill="currentColor" d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3z"/>
                </svg>
                <span>Continue with Apple</span>
              </button>
            </div>

            <div className="create-account">
              <p>Don't have an account?</p>
              <Link to="/register" className="create-account-link">Register Here</Link>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-heading">Why Choose Patient PATH?</h2>
        
        <div className="feature-cards">
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h3>Secure Communication</h3>
            <p>End-to-end encrypted communication between healthcare providers and ambulance services.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                <line x1="4" y1="22" x2="4" y2="15"></line>
              </svg>
            </div>
            <h3>Simplified Workflow</h3>
            <p>Streamlined processes reduce administrative burden and minimize errors.</p>
          </div>
        </div>
      </section>

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
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span>Contact Us</span>
            </div>
          </div>
          
          <div className="footer-legal">
            <span>&copy; {new Date().getFullYear()} Patient Path Inc.</span>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-of-service">Terms of Service</Link>
          </div>
        </div>
      </footer>

      {/* Development tools - only visible in development mode */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ position: 'fixed', bottom: '10px', right: '10px', zIndex: 1000 }}>
          <button 
            onClick={showCredentialsForm}
            style={{ 
              background: '#333', 
              color: '#fff', 
              border: 'none', 
              padding: '5px 10px', 
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Update Supabase Credentials
          </button>
        </div>
      )}
    </div>
  );
};

export default LandingPage; 