import React from 'react';
import './App.css';

function App() {
  return (
    <div className="maintenance-page">
      <div className="update-banner">
        🚀 Auto-Deployment Test - Updated on {new Date().toLocaleString()} 🚀
      </div>
      <div className="container">
        <h1>Patient Path</h1>
        <h2>Our healthcare coordination platform is currently under development</h2>
        
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
