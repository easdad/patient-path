import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Construction from './components/Construction/Construction';
import LandingPage from './components/Landing/LandingPage';
import './App.css';

function App() {
  const [showView, setShowView] = useState('construction');

  const toggleView = () => {
    if (showView === 'landing') {
      setShowView('construction');
    } else {
      setShowView('landing');
    }
  };

  // For development, we'll show a switch button to toggle between views
  return (
    <Router>
      <div className="app-container">
        <button className="toggle-view-button" onClick={toggleView}>
          {showView === 'landing' ? 'Show Construction Page' : 'Show Landing Page'}
        </button>
        
        {/* Only render one view at a time */}
        {showView === 'construction' && <Construction />}
        {showView === 'landing' && <LandingPage />}
      </div>
    </Router>
  );
}

export default App; 