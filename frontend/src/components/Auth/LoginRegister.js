import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import { SUPABASE_CONFIG } from '../../config/supabase.config';
import './LoginRegister.css';

const LoginRegister = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    userType: SUPABASE_CONFIG.USER_TYPES.HOSPITAL // Default user type
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear previous error when user types
    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Please fill all required fields');
      return false;
    }

    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (!formData.fullName) {
        setError('Please enter your full name');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (isLogin) {
        // Handle login
        const { success, error } = await signIn(formData.email, formData.password);
        
        if (success) {
          // Redirect based on user type will happen automatically via ProtectedRoute
          navigate('/');
        } else {
          setError(error.message || 'Failed to sign in');
        }
      } else {
        // Handle registration
        const userData = {
          full_name: formData.fullName,
          user_type: formData.userType
        };
        
        const { success, error } = await signUp(formData.email, formData.password, userData);
        
        if (success) {
          setSuccess('Account created successfully! Please check your email for verification.');
        } else {
          setError(error.message || 'Failed to create account');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-overlay"></div>
      </div>
      <div className="auth-content">
        <div className="logo-container">
          <span className="logo-icon">+</span>
          <span className="logo-text">Patient Path</span>
        </div>

        <div className="auth-card">
          <h1>{isLogin ? 'Welcome back' : 'Create account'}</h1>
          <p className="auth-subtitle">
            {isLogin 
              ? 'Sign in to access your health information' 
              : 'Join Patient Path to manage your healthcare journey'}
          </p>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

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

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="userType">User Type</label>
                <select
                  id="userType"
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
                  required
                >
                  <option value={SUPABASE_CONFIG.USER_TYPES.HOSPITAL}>Hospital</option>
                  <option value={SUPABASE_CONFIG.USER_TYPES.AMBULANCE}>Ambulance</option>
                </select>
              </div>
            )}

            <button 
              type="submit" 
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
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

          <div className="form-footer">
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button" 
                className="toggle-button" 
                onClick={toggleForm}
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>

        <div className="auth-footer">
          <p>&copy; {new Date().getFullYear()} Patient Path, Inc. All rights reserved.</p>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Support</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister; 