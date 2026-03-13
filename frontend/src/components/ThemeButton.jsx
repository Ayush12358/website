import React from 'react';
import { useTheme } from '../context/ThemeContext';
import './ThemeButton.css';

const ThemeButton = ({ size = 'medium' }) => {
  const { toggleTheme, isDarkMode } = useTheme();

  const sizeClass = `theme-toggle-${size}`;

  return (
    <div className={`theme-toggle-container theme-toggle-inline ${sizeClass}`}>
      <button
        className={`theme-toggle ${isDarkMode ? 'dark' : 'light'}`}
        onClick={toggleTheme}
        title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      >
        <span className="toggle-track">
          <span className="toggle-thumb"></span>
        </span>
        <span className="toggle-label">
          {isDarkMode ? 'Dark' : 'Light'}
        </span>
      </button>
    </div>
  );
};

export default ThemeButton;
