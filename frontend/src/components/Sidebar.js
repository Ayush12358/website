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

  const toggleEnvironment = () => {
    const newValue = !useProduction;
    const currentHostname = window.location.hostname;
    const isOnProductionDomain = currentHostname === 'ayushmaurya.xyz' || currentHostname.includes('ayushmaurya.xyz');
    
    // Show different warnings based on context
    let confirmMessage = '';
    
    if (newValue) {
      // Switching TO production
      if (!isOnProductionDomain) {
        confirmMessage = 
          'Are you sure you want to switch to PRODUCTION backend?\n\n' +
          'This will:\n' +
          '• Connect to ayushmaurya.xyz instead of localhost\n' +
          '• Use production database and data\n' +
          '• Note: You\'re currently on a local/development domain\n\n' +
          'Click OK to continue or Cancel to stay on local.';
      } else {
        confirmMessage = 
          'Switch to PRODUCTION backend?\n\n' +
          'This will connect to the production server.';
      }
    } else {
      // Switching TO local
      if (isOnProductionDomain) {
        confirmMessage = 
          'Are you sure you want to switch to LOCAL backend?\n\n' +
          'This will:\n' +
          '• Connect to localhost:5001 instead of production\n' +
          '• Use local database and data\n' +
          '• Require local backend server to be running\n' +
          '• Note: You\'re currently on the production domain\n\n' +
          'Click OK to continue or Cancel to stay on production.';
      } else {
        confirmMessage = 
          'Switch to LOCAL backend?\n\n' +
          'This will connect to your local development server.';
      }
    }
    
    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) {
      return; // User cancelled, don't switch
    }
    
    setUseProduction(newValue);
    localStorage.setItem('useProductionAPI', JSON.stringify(newValue));
    
    // Check connection to new environment before reloading
    setTimeout(() => {
      checkConnection();
    }, 100);
    
    // Reload page to apply new API settings
    setTimeout(() => {
      window.location.reload();
    }, 500);
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

          {/* Environment Section */}
          <div className="sidebar-section">
            <h4>Development Environment</h4>
            <div className="sidebar-item">
              <div className="sidebar-item-info">
                <span>API Environment</span>
                <p>Currently using: <strong>{useProduction ? 'Production' : 'Local'}</strong></p>
                <small>{useProduction ? 'ayushmaurya.xyz' : 'localhost:5001'}</small>
                {environmentInfo && (
                  <small style={{ 
                    display: 'block', 
                    marginTop: '0.25rem', 
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.7rem',
                    opacity: 0.8
                  }}>
                    Auto-detected: {environmentInfo.autoDetected === 'production' ? 'Production' : 'Local'} 
                    (on {environmentInfo.currentHostname})
                  </small>
                )}
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
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                <button 
                  className="env-toggle-btn"
                  onClick={toggleEnvironment}
                  title={`Switch to ${useProduction ? 'Local' : 'Production'} environment`}
                >
                  {useProduction ? 'Production' : 'Local'}
                </button>
                <button 
                  className="server-btn"
                  onClick={checkConnection}
                  title="Test connection to current environment"
                  style={{fontSize: '0.75rem', padding: '0.4rem 0.8rem'}}
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
