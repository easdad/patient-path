import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // Set launch date to 30 days from now
  const launchDate = new Date();
  launchDate.setDate(launchDate.getDate() + 30);
  
  // Deployment timestamp - this will change with each deployment
  const deploymentTime = new Date().toISOString();
  const buildVersion = "MAJOR VISUAL CHANGE v" + (Math.floor(Math.random() * 9000) + 1000);
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = launchDate - new Date();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };
    
    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="maintenance-page new-theme">
      <div className="update-banner new-banner">
        💥 LATEST UPDATE: March 5, 2025 - {buildVersion} 💥
      </div>
      
      <div className="container new-container">
        <h1 className="new-title">Patient Path - FRESH UPDATE!</h1>
        <div className="dramatic-change-notice">
          <h2>This page was just updated!</h2>
          <p>The deployment system is working if you see this message.</p>
          <p className="deploy-time">Deployed: {new Date().toLocaleString()}</p>
        </div>
        
        <div className="countdown-container">
          <h3 className="new-subtitle">Launching In:</h3>
          <div className="countdown">
            <div className="countdown-item new-countdown-item">
              <span className="countdown-number">{timeLeft.days}</span>
              <span className="countdown-label">Days</span>
            </div>
            <div className="countdown-item new-countdown-item">
              <span className="countdown-number">{timeLeft.hours}</span>
              <span className="countdown-label">Hours</span>
            </div>
            <div className="countdown-item new-countdown-item">
              <span className="countdown-number">{timeLeft.minutes}</span>
              <span className="countdown-label">Minutes</span>
            </div>
            <div className="countdown-item new-countdown-item">
              <span className="countdown-number">{timeLeft.seconds}</span>
              <span className="countdown-label">Seconds</span>
            </div>
          </div>
        </div>
        
        <div className="progress-bar new-progress-bar">
          <div className="progress new-progress"></div>
        </div>
        
        <div className="features new-features">
          <div className="feature new-feature">
            <div className="feature-icon">🏥</div>
            <h3>Care Coordination</h3>
            <p>Seamless communication between healthcare providers</p>
          </div>
          <div className="feature new-feature">
            <div className="feature-icon">📱</div>
            <h3>Patient Portal</h3>
            <p>Secure access to your medical information</p>
          </div>
          <div className="feature new-feature">
            <div className="feature-icon">📊</div>
            <h3>Health Analytics</h3>
            <p>Data-driven insights for better care</p>
          </div>
        </div>
        
        <p className="new-text">We're working hard to bring you a revolutionary healthcare experience. Check back soon!</p>
        
        <div className="contact new-contact">
          <p>Contact us at <a href="mailto:info@patientpath.com" className="new-link">info@patientpath.com</a></p>
          <p>© 2023 Patient Path. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default App;
