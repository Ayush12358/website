import React from 'react';
import { useTheme } from '../context/ThemeContext';
import './AccentSelector.css';

const AccentSelector = () => {
  const { currentAccent, accentColors, switchAccent } = useTheme();

  return (
    <div className="accent-selector">
      <div className="accent-colors">
        {Object.entries(accentColors).map(([key, accent]) => (
          <button
            key={key}
            className={`accent-color-btn ${currentAccent === key ? 'active' : ''}`}
            onClick={() => switchAccent(key)}
            title={`Switch to ${accent.name} theme`}
            style={{
              backgroundColor: accent.primary,
              border: currentAccent === key ? `2px solid ${accent.primary}` : '2px solid transparent'
            }}
          >
            {currentAccent === key && <span className="accent-check">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AccentSelector;
