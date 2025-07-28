import React, { useState, useEffect } from 'react';
import './EnvSwitcher.css';

const EnvSwitcher = () => {
  const [useProduction, setUseProduction] = useState(true); // Default to production

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
    <button 
      className="env-switcher"
      onClick={toggleEnvironment}
      title={`Currently using: ${useProduction ? 'Production (ayushmaurya.xyz)' : 'Local (localhost:5001)'} API`}
    >
      {useProduction ? '🌐' : '🏠'}
    </button>
  );
};

export default EnvSwitcher;
