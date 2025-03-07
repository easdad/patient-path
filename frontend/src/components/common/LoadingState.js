import React from 'react';
import './LoadingState.css';

const LoadingState = ({ type = 'full', text = 'Loading...', size = 'medium' }) => {
  // Different types of loading states
  const renderLoadingState = () => {
    switch (type) {
      case 'inline':
        return (
          <div className={`loading-inline loading-${size}`}>
            <div className="loading-spinner"></div>
            {text && <span className="loading-text">{text}</span>}
          </div>
        );
      
      case 'overlay':
        return (
          <div className="loading-overlay">
            <div className={`loading-content loading-${size}`}>
              <div className="loading-spinner"></div>
              {text && <span className="loading-text">{text}</span>}
            </div>
          </div>
        );
      
      case 'skeleton':
        return (
          <div className="loading-skeleton">
            <div className="skeleton-header"></div>
            <div className="skeleton-content">
              <div className="skeleton-line"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line"></div>
            </div>
          </div>
        );
      
      case 'full':
      default:
        return (
          <div className="loading-full">
            <div className={`loading-content loading-${size}`}>
              <div className="loading-spinner"></div>
              {text && <span className="loading-text">{text}</span>}
            </div>
          </div>
        );
    }
  };

  return renderLoadingState();
};

// Additional components for different loading contexts
LoadingState.Page = ({ text = 'Loading page...' }) => (
  <LoadingState type="full" text={text} size="large" />
);

LoadingState.Section = ({ text = 'Loading...' }) => (
  <LoadingState type="overlay" text={text} size="medium" />
);

LoadingState.Inline = ({ text = 'Loading...' }) => (
  <LoadingState type="inline" text={text} size="small" />
);

LoadingState.Skeleton = () => (
  <LoadingState type="skeleton" />
);

export default LoadingState; 