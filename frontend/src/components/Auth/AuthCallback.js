import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import supabase from '../../utils/supabaseClient';
import './AuthStyles.css';

const AuthCallback = () => {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the hash parameters
        const params = new URLSearchParams(location.hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const type = params.get('type');

        if (!accessToken) {
          throw new Error('No access token found');
        }

        // Set the session with the tokens
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (sessionError) throw sessionError;

        // Handle different callback types
        switch (type) {
          case 'signup':
          case 'email_confirmation':
            // For new signups or email confirmations, go to success page
            navigate('/auth/verification-success');
            break;
          case 'recovery':
            // For password reset flows
            navigate('/auth/reset-password', { 
              state: { access_token: accessToken }
            });
            break;
          case 'magiclink':
            // For magic link logins, go to dashboard based on user type
            const { data: { user } } = await supabase.auth.getUser();
            const { data: profile } = await supabase
              .from('profiles')
              .select('user_type')
              .eq('id', user.id)
              .single();

            if (profile?.user_type === 'hospital') {
              navigate('/hospital-dashboard');
            } else if (profile?.user_type === 'ambulance') {
              navigate('/ambulance-dashboard');
            } else {
              navigate('/');
            }
            break;
          default:
            // Default to home page for unknown types
            navigate('/');
        }
      } catch (err) {
        console.error('Error during auth callback:', err);
        setError(err.message);
      }
    };

    // Only run the callback handler if we have a hash in the URL
    if (location.hash) {
      handleEmailConfirmation();
    } else {
      setError('No authentication data found in URL');
    }
  }, [location, navigate]);

  if (error) {
    return (
      <div className="auth-container">
        <div className="auth-form-container">
          <div className="auth-error">
            <h2>Verification Failed</h2>
            <p>{error}</p>
            <button 
              className="primary-button"
              onClick={() => navigate('/')}
            >
              Return to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="verification-progress">
          <div className="loading-spinner"></div>
          <p>Processing your request...</p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback; 