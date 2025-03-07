import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Construction from './components/Construction/Construction';
import LandingPage from './components/Landing/LandingPage';
import LoginPage from './components/Auth/LoginPage';
import RegistrationPage from './components/Auth/RegistrationPage';
import AuthCallback from './components/Auth/AuthCallback';
import VerificationSuccess from './components/Auth/VerificationSuccess';
import ResetPassword from './components/Auth/ResetPassword';
import { AuthProvider } from './utils/AuthContext';
import ProtectedRoute from './utils/ProtectedRoute';
import Navbar from './components/common/Navbar';
import SupabaseTest from './components/common/SupabaseTest';
import HospitalDashboard from './components/Dashboard/Hospital/HospitalDashboard';
import DevNavigation from './components/common/DevNavigation';
import AmbulanceDashboard from './components/Dashboard/Ambulance/AmbulanceDashboard';
import './App.css';

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
              path="/login" 
              element={<LoginPage />} 
            />
            
            <Route 
              path="/register" 
              element={<Layout><RegistrationPage /></Layout>} 
            />
            
            {/* Auth related routes */}
            <Route 
              path="/auth/callback" 
              element={<AuthCallback />} 
            />
            
            <Route 
              path="/auth/verification-success" 
              element={<VerificationSuccess />} 
            />
            
            <Route 
              path="/auth/reset-password" 
              element={<ResetPassword />} 
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