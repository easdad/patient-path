import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// Regular imports for smaller components
import Layout from './components/Layout/Layout';
import Construction from './components/Construction/Construction';
import AuthCallback from './components/Auth/AuthCallback';
import DevToolbar from './components/Dev/DevToolbar';
import ProtectedRoute from './utils/ProtectedRoute';

// Lazy-loaded components for code splitting
const LandingPage = lazy(() => import('./components/Landing/LandingPage'));
const RegistrationPage = lazy(() => import('./components/Auth/RegistrationPage'));
const ResetPassword = lazy(() => import('./components/Auth/ResetPassword'));
const HospitalDashboard = lazy(() => import('./components/Dashboard/Hospital/HospitalDashboard'));
const AmbulanceDashboard = lazy(() => import('./components/Dashboard/Ambulance/AmbulanceDashboard'));
const DevDashboard = lazy(() => import('./components/Dev/DevDashboard'));

// Route configuration
const routes = [
  // Public routes
  {
    path: '/',
    element: <LandingPage />,
    exact: true
  },
  {
    path: '/register',
    element: <RegistrationPage />,
    exact: true
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
    exact: true
  },
  {
    path: '/auth/callback',
    element: <AuthCallback />,
    exact: true
  },
  {
    path: '/construction',
    element: <Construction />,
    exact: true
  },
  
  // Protected routes with Layout
  {
    path: '/hospital-dashboard/*',
    element: (
      <ProtectedRoute requiredUserType="hospital">
        <Layout>
          <HospitalDashboard />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/ambulance-dashboard/*',
    element: (
      <ProtectedRoute requiredUserType="ambulance">
        <Layout>
          <AmbulanceDashboard />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dev-dashboard/*',
    element: (
      <ProtectedRoute requiredUserType="developer">
        <Layout>
          <DevDashboard />
        </Layout>
      </ProtectedRoute>
    ),
  },
  
  // Fallback route
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
];

export default routes; 