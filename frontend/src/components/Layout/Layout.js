import React from 'react';
import Navbar from '../common/Navbar';
import './Layout.css';

const Layout = ({ children, hideNavbar = false }) => {
  return (
    <div className="layout">
      {!hideNavbar && <Navbar />}
      <main className="layout-content">
        {children}
      </main>
    </div>
  );
};

export default Layout; 