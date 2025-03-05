import React, { useEffect, useState } from 'react';
import './Construction.css';

const Construction = () => {
  const [dots, setDots] = useState('');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="construction-page">
      <div className="construction-container">
        <div className="logo">
          <span className="logo-icon">+</span>
          <span className="logo-text">Patient Path</span>
        </div>
        <h1>App Under Construction</h1>
        <p>Coming Soon{dots}</p>
        
        <div className="launch-info">
          <p className="launch-msg">Transforming healthcare coordination through seamless technology</p>
        </div>
        
        <div className="divider"></div>
        <p className="footer-text">&copy; {new Date().getFullYear()} Patient Path, Inc.</p>
      </div>
    </div>
  );
};

export default Construction; 