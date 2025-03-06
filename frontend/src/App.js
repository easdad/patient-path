import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Construction from './components/Construction/Construction';
import LandingPage from './components/Landing/LandingPage';
import RegistrationPage from './components/Auth/RegistrationPage';
import { AuthProvider } from './utils/AuthContext';
import ProtectedRoute from './utils/ProtectedRoute';
import Navbar from './components/common/Navbar';
import SupabaseTest from './components/common/SupabaseTest';
import HospitalDashboard from './components/Dashboard/Hospital/HospitalDashboard';
import DevNavigation from './components/common/DevNavigation';
import './App.css';

// Ambulance Dashboard component - no longer needs to include the Navbar
const AmbulanceDashboard = () => (
  <div className="dashboard-container">
    <h1>Ambulance Service Dashboard</h1>
    <p>Welcome to your ambulance service provider dashboard!</p>
    
    <div className="dashboard-cards">
      <div className="dashboard-card">
        <h2>Available Transport Requests</h2>
        <p>View and accept patient transport requests.</p>
        <button className="dashboard-button">View Requests</button>
      </div>
      
      <div className="dashboard-card">
        <h2>My Scheduled Transports</h2>
        <p>View your upcoming scheduled transports.</p>
        <button className="dashboard-button">View Schedule</button>
      </div>
    </div>
  </div>
);

// Layout component to handle navbar rendering
const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

function App() {
  return (
    <div className="app-container">
      <AuthProvider>
        <Router>
          {/* The DevNavigation component is now positioned via CSS */}
          <DevNavigation />
          
          <Routes>
            {/* Root route - Construction page loads first */}
            <Route 
              path="/" 
              element={<Construction />} 
            />
            
            {/* Landing page now has its own route */}
            <Route 
              path="/landing" 
              element={<Layout><LandingPage /></Layout>} 
            />
            
            <Route 
              path="/register" 
              element={<Layout><RegistrationPage /></Layout>} 
            />
            
            {/* Protected routes */}
            <Route 
              path="/hospital-dashboard" 
              element={
                <ProtectedRoute requiredUserType="hospital">
                  <Layout>
                    <HospitalDashboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/ambulance-dashboard" 
              element={
                <ProtectedRoute requiredUserType="ambulance">
                  <Layout>
                    <AmbulanceDashboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />

            {/* Development/testing routes - unprotected */}
            <Route path="/dev-hospital-dashboard" element={<Layout><HospitalDashboard /></Layout>} />
            
            {/* Direct path to test component */}
            <Route path="/test-supabase" element={<Layout><SupabaseTest /></Layout>} />
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App; 