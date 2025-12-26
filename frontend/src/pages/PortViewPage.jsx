import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './PortViewPage.css';

const PortViewPage = () => {
  const { port } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [isDev, setIsDev] = useState(false);
  const [allServerPorts, setAllServerPorts] = useState([]);

  useEffect(() => {
    loadAllPorts();
  }, []);

  const loadAllPorts = async () => {
    try {
      // Load all accessible ports from server
      const response = await api.get('/ports');
      setAllServerPorts(response.data);
    } catch (error) {
      console.error('Failed to load ports:', error);
    }
  };

  useEffect(() => {
    if (user?.profile) {
      const isDevUser = user.profile.email === 'ayushmaurya2003@gmail.com';
      setIsDev(isDevUser);
    }
  }, [user]);

  // Use only server ports (no default ports)
  const allPorts = [...allServerPorts];
  
  const currentPortInfo = allPorts.find(p => p.port === port);

  // Validate port number
  const isValidPort = /^\d+$/.test(port) && parseInt(port) >= 1 && parseInt(port) <= 65535;

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isFullscreen]);

  // Check if port is accessible to current user
  const isPortAccessible = () => {
    if (!currentPortInfo) {
      // For unknown ports, only allow devs to access
      return isDev;
    }
    // Allow access if user is dev OR if port is marked as public
    return isDev || currentPortInfo.isPublic;
  };

  // Show loading while we don't have user data yet
  if (!user) {
    return (
      <div className="port-view-page">
        <div className="port-view-loading">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading while we're processing user profile
  if (user && !user.profile) {
    return (
      <div className="port-view-page">
        <div className="port-view-loading">
          <p>Loading user profile...</p>
        </div>
      </div>
    );
  }

  // Check if user has access to this specific port
  if (user?.profile && !isPortAccessible()) {
    return (
      <div className="port-view-page">
        <div className="port-view-error">
          <h1>Access Denied</h1>
          <p>This port is not available to regular users.</p>
          <p>Only developers or ports marked as public can be accessed.</p>
          <Link to="/dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!isValidPort) {
    return (
      <div className="port-view-page">
        <div className="port-view-error">
          <h1>Invalid Port</h1>
          <p>Port number must be between 1 and 65535.</p>
          <Link to="/dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`port-view-page ${isFullscreen ? 'fullscreen' : ''}`}>
      {!isFullscreen && (
        <div className="port-view-header">
          <div className="port-view-nav">
            <Link to="/dashboard" className="back-to-dashboard">
              ← Dashboard
            </Link>
            <div className="port-title">
              <span className="port-number">:{port}</span>
              {currentPortInfo && (
                <span className="port-service">{currentPortInfo.name}</span>
              )}
            </div>
            <Link to="/" className="back-to-main">
              Home
            </Link>
          </div>
        </div>
      )}

      <div className={`port-viewer ${isFullscreen ? 'fullscreen' : ''}`}>
        <div className="iframe-container">
          <iframe
            src={`http://localhost:${port}`}
            width="100%"
            height={isFullscreen ? "100vh" : "calc(100vh - 60px)"}
            style={{
              border: isFullscreen ? 'none' : '1px solid var(--color-border)',
              borderRadius: isFullscreen ? '0' : '8px',
              backgroundColor: 'var(--color-surface)'
            }}
            title={`Port ${port} View`}
            onError={() => console.log(`Failed to load port ${port}`)}
          >
            <p style={{padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary)'}}>
              Unable to load localhost:{port}. 
              <br />
              Make sure a service is running on this port.
            </p>
          </iframe>
          
          <button 
            className="port-info-btn-overlay"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit fullscreen (Esc)' : `Enter fullscreen - localhost:${port}${currentPortInfo ? ` (${currentPortInfo.name})` : ''}`}
          >
            <span className="fullscreen-icon">
              {isFullscreen ? '⛶' : '⛶'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortViewPage;
