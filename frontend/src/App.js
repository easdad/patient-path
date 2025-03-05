import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // Set launch date to 30 days from now
  const launchDate = new Date();
  launchDate.setDate(launchDate.getDate() + 30);
  
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
    <div className="maintenance-page">
      <div className="update-banner">
        🚀 Auto-Deployment Test - Updated on {new Date().toLocaleString()} 🚀
      </div>
      <div className="container">
        <h1>Patient Path</h1>
        <h2>Our healthcare coordination platform is currently under development</h2>
        
        <div className="countdown-container">
          <h3>Launching In:</h3>
          <div className="countdown">
            <div className="countdown-item">
              <span className="countdown-number">{timeLeft.days}</span>
              <span className="countdown-label">Days</span>
            </div>
            <div className="countdown-item">
              <span className="countdown-number">{timeLeft.hours}</span>
              <span className="countdown-label">Hours</span>
            </div>
            <div className="countdown-item">
              <span className="countdown-number">{timeLeft.minutes}</span>
              <span className="countdown-label">Minutes</span>
            </div>
            <div className="countdown-item">
              <span className="countdown-number">{timeLeft.seconds}</span>
              <span className="countdown-label">Seconds</span>
            </div>
          </div>
        </div>
        
        <div className="progress-bar">
          <div className="progress"></div>
        </div>
        
        <div className="features">
          <div className="feature">
            <div className="feature-icon">🏥</div>
            <h3>Care Coordination</h3>
            <p>Seamless communication between healthcare providers</p>
          </div>
          <div className="feature">
            <div className="feature-icon">📱</div>
            <h3>Patient Portal</h3>
            <p>Secure access to your medical information</p>
          </div>
          <div className="feature">
            <div className="feature-icon">📊</div>
            <h3>Health Analytics</h3>
            <p>Data-driven insights for better care</p>
          </div>
        </div>
        
        <p>We're working hard to bring you a revolutionary healthcare experience. Check back soon!</p>
        
        <div className="contact">
          <p>Contact us at <a href="mailto:info@patientpath.com">info@patientpath.com</a></p>
          <p>© 2023 Patient Path. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default App;
