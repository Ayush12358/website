import React, { useState, useEffect } from 'react';
import ThemeButton from './ThemeButton';
import AccentSelector from './AccentSelector';
import { getCurrentEnvironment, getCurrentBaseURL, testConnection, getEnvironmentInfo } from '../utils/api';
import './Sidebar.css';

const Sidebar = ({ isOpen, onToggle }) => {
  const [useProduction, setUseProduction] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [connectionInfo, setConnectionInfo] = useState(null);
  const [environmentInfo, setEnvironmentInfo] = useState(null);

  useEffect(() => {
    // Get environment info (this will auto-detect and set based on URL)
    const envInfo = getEnvironmentInfo();
    setEnvironmentInfo(envInfo);
    setUseProduction(envInfo.useProduction);

    // Test connection status
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setConnectionStatus('checking');
    setConnectionInfo(null);
    const result = await testConnection();
    setConnectionStatus(result.success ? 'connected' : 'error');
    setConnectionInfo(result);
  };


  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
          onClick={onToggle}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h3>Settings</h3>
          <button className="sidebar-close" onClick={onToggle} aria-label="Close sidebar">
            &times;
          </button>
        </div>

        <div className="sidebar-content">
          {/* Theme Section */}
          <div className="sidebar-section">
            <h4>Appearance</h4>
            <div className="sidebar-item">
              <div className="sidebar-item-info">
                <span>Dark Mode</span>
                <p>Toggle between light and dark themes</p>
              </div>
              <ThemeButton position="inline" size="small" />
            </div>
            <div className="sidebar-item">
              <div className="sidebar-item-info">
                <span>Accent Color</span>
                <p>Personalize your experience</p>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <AccentSelector />
              </div>
            </div>
          </div>

          {/* Connection Status Section */}
          <div className="sidebar-section">
            <h4>Connectivity</h4>
            <div className="sidebar-item">
              <div className="sidebar-item-info">
                <span>API Status</span>
                <div className="info-row" style={{ marginTop: '0.5rem' }}>
                  <span>Environment</span>
                  <strong>{useProduction ? 'Production' : 'Local'}</strong>
                </div>
                <div className="info-row">
                  <span>Connection</span>
                  <strong style={{
                    color: connectionStatus === 'connected' ? 'var(--color-success)' :
                      connectionStatus === 'error' ? 'var(--color-error)' : 'var(--color-text-secondary)'
                  }}>
                    {connectionStatus === 'checking' ? 'Checking...' :
                      connectionStatus === 'connected' ? 'Connected' : 'Error'}
                  </strong>
                </div>
                {connectionInfo && connectionInfo.ping && (
                  <div className="info-row">
                    <span>Latency</span>
                    <strong>{connectionInfo.ping}ms</strong>
                  </div>
                )}
              </div>
              <button
                className={`server-btn ${connectionStatus === 'connected' ? 'connected' : ''}`}
                onClick={checkConnection}
                disabled={connectionStatus === 'checking'}
              >
                {connectionStatus === 'checking' ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
