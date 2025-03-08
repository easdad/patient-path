import React from 'react';
import { Helmet } from 'react-helmet';

/**
 * SecurityHelmet component that adds security headers
 * Implement this at the top level of your app
 */
const SecurityHelmet = () => {
  // Content Security Policy directives
  const cspDirectives = {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "https://aadkpnqvfnqzxruvbqfa.supabase.co"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    imgSrc: ["'self'", "data:", "https://aadkpnqvfnqzxruvbqfa.supabase.co"],
    connectSrc: ["'self'", "https://aadkpnqvfnqzxruvbqfa.supabase.co"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'self'"],
  };

  // Convert CSP object to string format
  const cspString = Object.entries(cspDirectives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');

  return (
    <Helmet>
      {/* Content Security Policy */}
      <meta httpEquiv="Content-Security-Policy" content={cspString} />
      
      {/* Prevent XSS attacks */}
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      
      {/* Prevent MIME type sniffing */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      
      {/* Referrer Policy */}
      <meta name="referrer" content="strict-origin-when-cross-origin" />
      
      {/* Frame options to prevent clickjacking */}
      <meta httpEquiv="X-Frame-Options" content="SAMEORIGIN" />
      
      {/* Feature Policy/Permissions Policy */}
      <meta httpEquiv="Permissions-Policy" content="geolocation=(), camera=(), microphone=()" />
    </Helmet>
  );
};

export default SecurityHelmet; 