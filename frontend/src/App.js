import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './utils/AuthContext';
import routes from './routes';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingState from './components/common/LoadingState';
import DevToolbar from './components/Dev/DevToolbar';
import SecurityHelmet from './components/common/SecurityHelmet';
import './styles/GlobalStyles.css'; // Import global styles

const DevToolbarWrapper = () => {
  const { user, userType } = useAuth();
  const [showDevTools, setShowDevTools] = useState(false);
  
  useEffect(() => {
    const checkDevStatus = async () => {
      if (!user) return setShowDevTools(false);
      
      // Only show dev tools if user has developer role in app_metadata
      const isDev = user.app_metadata?.role === 'developer';
      
      setShowDevTools(isDev);
    };
    
    checkDevStatus();
  }, [user, userType]);
  
  return showDevTools ? <DevToolbar /> : null;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <SecurityHelmet />
          <Suspense fallback={<LoadingState.Page />}>
            <Routes>
              {routes.map((route, index) => (
                <Route 
                  key={index}
                  path={route.path}
                  element={route.element}
                />
              ))}
            </Routes>
            <DevToolbarWrapper />
          </Suspense>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App; 