import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // Set launch date to 30 days from now
  const launchDate = new Date();
  launchDate.setDate(launchDate.getDate() + 30);
  
  // Deployment timestamp - this will change with each deployment
  const deploymentTime = new Date().toISOString();
  const buildVersion = "FINAL VERIFICATION v" + (Math.floor(Math.random() * 9000) + 1000);
  
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
        🎯 FINAL VERIFICATION TEST - {buildVersion} 🎯
      </div>
      
      <div className="container new-container">
        <h1 className="new-title">Patient Path - FINAL TEST!</h1>
        
        {/* New notification badge */}
        <div className="notification-badge">
          <div className="notification-pulse"></div>
          <div className="notification-content">
            <span className="notification-icon">🔔</span>
            <span className="notification-text">New feature: 3D Deployment Statistics added!</span>
            <span className="notification-time">{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
        
        <div className="dramatic-change-notice">
          <h2>GitHub Actions Workflow Verified!</h2>
          <p>Auto-deployment is working correctly via GitHub Actions.</p>
          <p className="deploy-time">Last verified: {new Date().toLocaleString()}</p>
        </div>
        
        <div className="animated-callout">
          <div className="pulse-circle"></div>
          <div className="callout-content">
            <h3>MAJOR UPDATE DETECTED!</h3>
            <p>This is the final verification test with obvious visual changes.</p>
            <p>If you see this animated section with rotating borders, the deployment is successful!</p>
          </div>
        </div>
        
        {/* New 3D Rotating Cube Component */}
        <div className="cube-container">
          <h3 className="new-subtitle">Deployment Statistics</h3>
          <div className="scene">
            <div className="cube">
              <div className="cube__face cube__face--front">
                <div className="cube-content">
                  <h4>Build Info</h4>
                  <p>Version: {buildVersion}</p>
                  <p>Deploy Time: {new Date().toLocaleTimeString()}</p>
                </div>
              </div>
              <div className="cube__face cube__face--back">
                <div className="cube-content">
                  <h4>Server Status</h4>
                  <p>Environment: Production</p>
                  <p>Region: US-East</p>
                </div>
              </div>
              <div className="cube__face cube__face--right">
                <div className="cube-content">
                  <h4>Performance</h4>
                  <p>Load Time: 1.2s</p>
                  <p>Cache: Enabled</p>
                </div>
              </div>
              <div className="cube__face cube__face--left">
                <div className="cube-content">
                  <h4>Tech Stack</h4>
                  <p>Frontend: React</p>
                  <p>Backend: Node.js</p>
                </div>
              </div>
              <div className="cube__face cube__face--top">
                <div className="cube-content">
                  <h4>GitHub</h4>
                  <p>Commit: {buildVersion.slice(-4)}</p>
                  <p>Branch: main</p>
                </div>
              </div>
              <div className="cube__face cube__face--bottom">
                <div className="cube-content">
                  <h4>Next Update</h4>
                  <p>{timeLeft.days} days</p>
                  <p>{timeLeft.hours}h {timeLeft.minutes}m</p>
                </div>
              </div>
            </div>
          </div>
          <p className="cube-instructions">Hover to rotate the cube</p>
        </div>
        
        <div className="countdown-container">
          <h3 className="new-subtitle">Launching In:</h3>
          <div className="countdown hexagon-countdown">
            <div className="countdown-item hexagon-item">
              <span className="countdown-number">{timeLeft.days}</span>
              <span className="countdown-label">Days</span>
            </div>
            <div className="countdown-item hexagon-item">
              <span className="countdown-number">{timeLeft.hours}</span>
              <span className="countdown-label">Hours</span>
            </div>
            <div className="countdown-item hexagon-item">
              <span className="countdown-number">{timeLeft.minutes}</span>
              <span className="countdown-label">Minutes</span>
            </div>
            <div className="countdown-item hexagon-item">
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
