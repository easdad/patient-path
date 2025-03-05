import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Construction from './components/Construction/Construction';
import LoginRegister from './components/Auth/LoginRegister';
import './App.css';

function App() {
  const [showConstruction, setShowConstruction] = useState(false);

  const toggleView = () => {
    setShowConstruction(!showConstruction);
  };

  // For development, we'll show a switch button to toggle between views
  return (
    <Router>
      <div className="app-container">
        <button className="toggle-view-button" onClick={toggleView}>
          {showConstruction ? 'Show Login Page' : 'Show Construction Page'}
        </button>
        
        {showConstruction ? (
          <Construction />
        ) : (
          <LoginRegister />
        )}
      </div>
    </Router>
  );
}

export default App; 