import React from 'react';

interface AmbulanceIconProps {
  className?: string;
  size?: number;
}

const AmbulanceIcon: React.FC<AmbulanceIconProps> = ({ 
  className = '', 
  size = 24 
}) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={className}
    >
      <circle cx="50" cy="50" r="48" fill="none" stroke="url(#ambulanceIconGradient)" strokeWidth="4"/>
      <path d="M65,45h-5v-5c0-1.1-0.9-2-2-2h-2c-1.1,0-2,0.9-2,2v5h-5c-1.1,0-2,0.9-2,2v2c0,1.1,0.9,2,2,2h5v5c0,1.1,0.9,2,2,2h2c1.1,0,2-0.9,2-2v-5h5c1.1,0,2-0.9,2-2v-2C67,45.9,66.1,45,65,45z" fill="currentColor"/>
      <path d="M70,60H30c-2.2,0-4-1.8-4-4V44c0-2.2,1.8-4,4-4h40c2.2,0,4,1.8,4,4v12C74,58.2,72.2,60,70,60z M30,44v12h40V44H30z" fill="currentColor"/>
      <path d="M36,60v6c0,1.1,0.9,2,2,2h4c1.1,0,2-0.9,2-2v-6" fill="currentColor"/>
      <path d="M56,60v6c0,1.1,0.9,2,2,2h4c1.1,0,2-0.9,2-2v-6" fill="currentColor"/>
      <defs>
        <linearGradient id="ambulanceIconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E90FF" />
          <stop offset="100%" stopColor="#00CED1" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default AmbulanceIcon; 