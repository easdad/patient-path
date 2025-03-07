import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './utils/AuthContext';
import routes from './routes';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingState from './components/common/LoadingState';
import DevToolbar from './components/Dev/DevToolbar';
import { supabase } from './utils/supabaseClient';

// Developer account email for special permissions
const DEV_EMAIL = 'easdad.jm@gmail.com';

const DevToolbarWrapper = () => {
  const { user, userType } = useAuth();
  const [showDevTools, setShowDevTools] = useState(false);
  
  useEffect(() => {
    const checkDevStatus = async () => {
      if (!user) return setShowDevTools(false);
      
      // Check multiple ways to confirm this is the developer account
      const isDev = 
        user.email === DEV_EMAIL || 
        user.user_metadata?.user_type === 'developer' || 
        userType === 'developer';
      
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