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
      {isOpen && <div className={`sidebar-overlay ${isOpen ? 'visible' : ''}`} onClick={onToggle}></div>}

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h3>Settings</h3>
          <button className="sidebar-close" onClick={onToggle}>
            ×
          </button>
        </div>

        <div className="sidebar-content">
          {/* Theme Section */}
          <div className="sidebar-section">
            <h4>Theme Settings</h4>
            <div className="sidebar-item">
              <div className="sidebar-item-info">
                <span>Dark Mode Toggle</span>
                <p>Switch between light and dark themes</p>
              </div>
              <ThemeButton position="inline" size="small" />
            </div>
            <div className="sidebar-item sidebar-item-vertical">
              <div className="sidebar-item-info">
                <span>Accent Color</span>
                <p>Choose your preferred color scheme</p>
              </div>
              <AccentSelector />
            </div>
          </div>

          {/* Connection Status Section */}
          <div className="sidebar-section">
            <h4>Connection Status</h4>
            <div className="sidebar-item">
              <div className="sidebar-item-info">
                <span>API Status</span>
                <p>Environment: <strong>{useProduction ? 'Production' : 'Local'}</strong></p>
                <div style={{
                  marginTop: '0.5rem',
                  fontSize: '0.75rem',
                  color: connectionStatus === 'connected' ? 'var(--color-success)' :
                    connectionStatus === 'error' ? 'var(--color-error)' : 'var(--color-text-secondary)'
                }}>
                  Status: {connectionStatus === 'checking' ? 'Checking...' :
                    connectionStatus === 'connected' ? '✓ Connected' : '✗ Connection Error'}
                  {connectionInfo && connectionInfo.ping && (
                    <span style={{ marginLeft: '0.5rem', opacity: 0.8 }}>
                      ({connectionInfo.ping}ms)
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  className="server-btn"
                  onClick={checkConnection}
                  title="Test connection to current environment"
                  style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                >
                  Test Connection
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
