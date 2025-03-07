import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error('ErrorBoundary caught an error', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReset = () => {
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-container">
            <h2>Something went wrong</h2>
            <p>
              We're sorry, but an error occurred. Our team has been notified.
            </p>
            <div className="error-actions">
              <button 
                onClick={() => window.location.reload()}
                className="primary-button"
              >
                Reload Page
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                className="secondary-button"
              >
                Back to Home
              </button>
            </div>
            {this.props.showError && (
              <div className="error-details">
                <h3>Error Details:</h3>
                <p>{this.state.error && this.state.error.toString()}</p>
                <details>
                  <summary>Stack Trace</summary>
                  <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
                </details>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 