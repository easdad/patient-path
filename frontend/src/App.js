import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Construction from './components/Construction/Construction';
import LoginRegister from './components/Auth/LoginRegister';
import LandingPage from './components/Landing/LandingPage';
import './App.css';

function App() {
  const [showView, setShowView] = useState('landing');

  const toggleView = () => {
    if (showView === 'landing') {
      setShowView('construction');
    } else if (showView === 'construction') {
      setShowView('login');
    } else {
      setShowView('landing');
    }
  };

  // For development, we'll show a switch button to toggle between views
  return (
    <Router>
      <div className="app-container">
        <button className="toggle-view-button" onClick={toggleView}>
          {showView === 'landing' ? 'Show Construction Page' : 
           showView === 'construction' ? 'Show Login Page' : 'Show Landing Page'}
        </button>
        
        {showView === 'construction' && <Construction />}
        {showView === 'login' && <LoginRegister />}
        {showView === 'landing' && <LandingPage />}
      </div>
    </Router>
  );
}

export default App; 