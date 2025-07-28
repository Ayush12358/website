import React, { useState, useEffect } from 'react';
import ThemeButton from './ThemeButton';
import './Sidebar.css';

const Sidebar = ({ isOpen, onToggle }) => {
  const [useProduction, setUseProduction] = useState(true);

  useEffect(() => {
    // Check localStorage for saved preference, default to production
    const saved = localStorage.getItem('useProductionAPI');
    if (saved !== null) {
      setUseProduction(JSON.parse(saved));
    } else {
      // Set default to production if no preference saved
      localStorage.setItem('useProductionAPI', JSON.stringify(true));
    }
  }, []);

  const toggleEnvironment = () => {
    const newValue = !useProduction;
    
    // If switching FROM production TO local, show confirmation
    if (useProduction && !newValue) {
      const confirmed = window.confirm(
        'Are you sure you want to switch to LOCAL backend?\n\n' +
        'This will:\n' +
        '• Connect to localhost instead of production\n' +
        '• Use local database and data\n' +
        '• Require local backend server to be running\n\n' +
        'Click OK to continue or Cancel to stay on production.'
      );
      
      if (!confirmed) {
        return; // User cancelled, don't switch
      }
    }
    
    setUseProduction(newValue);
    localStorage.setItem('useProductionAPI', JSON.stringify(newValue));
    
    // Reload page to apply new API settings
    window.location.reload();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={onToggle}></div>}
      
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
          </div>

          {/* Environment Section */}
          <div className="sidebar-section">
            <h4>Development Environment</h4>
            <div className="sidebar-item">
              <div className="sidebar-item-info">
                <span>API Environment</span>
                <p>Currently using: <strong>{useProduction ? 'Production' : 'Local'}</strong></p>
                <small>{useProduction ? 'ayushmaurya.xyz' : 'localhost:5001'}</small>
              </div>
              <button 
                className="env-toggle-btn"
                onClick={toggleEnvironment}
                title={`Switch to ${useProduction ? 'Local' : 'Production'} environment`}
              >
                {useProduction ? '🏠 Local' : '🌐 Production'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
