import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const accentColors = {
  blue: {
    name: 'Blue',
    primary: '#007bff',
    'primary-hover': '#0056b3',
    'primary-dark': '#004085',
    'primary-light': 'rgba(0, 123, 255, 0.1)',
    warning: '#ffc107',
  },
  green: {
    name: 'Green',
    primary: '#28a745',
    'primary-hover': '#1e7e34',
    'primary-dark': '#155724',
    'primary-light': 'rgba(40, 167, 69, 0.1)',
    warning: '#fd7e14',
  },
  purple: {
    name: 'Purple',
    primary: '#6f42c1',
    'primary-hover': '#5a32a3',
    'primary-dark': '#4e2a84',
    'primary-light': 'rgba(111, 66, 193, 0.1)',
    warning: '#e83e8c',
  },
  red: {
    name: 'Red',
    primary: '#dc3545',
    'primary-hover': '#c82333',
    'primary-dark': '#bd2130',
    'primary-light': 'rgba(220, 53, 69, 0.1)',
    warning: '#fd7e14',
  },
  orange: {
    name: 'Orange',
    primary: '#fd7e14',
    'primary-hover': '#e8650e',
    'primary-dark': '#d35400',
    'primary-light': 'rgba(253, 126, 20, 0.1)',
    warning: '#ffc107',
  },
  teal: {
    name: 'Teal',
    primary: '#20c997',
    'primary-hover': '#1abc9c',
    'primary-dark': '#17a2b8',
    'primary-light': 'rgba(32, 201, 151, 0.1)',
    warning: '#ffc107',
  }
};

const themes = {
  light: {
    name: 'Light',
    icon: '',
    colors: {
      secondary: '#6c757d',
      background: '#ffffff',
      'background-secondary': '#f8f9fa',
      'background-gradient': 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      surface: '#ffffff',
      text: '#212529',
      'text-secondary': '#6c757d',
      border: '#dee2e6',
      success: '#28a745',
      'success-light': 'rgba(40, 167, 69, 0.1)',
      error: '#dc3545',
      'error-light': 'rgba(220, 53, 69, 0.1)',
      shadow: 'rgba(0, 0, 0, 0.1)',
      'shadow-large': 'rgba(0, 0, 0, 0.15)',
      'shadow-card': '0 2px 4px rgba(0, 0, 0, 0.1)',
      'shadow-hover': '0 4px 8px rgba(0, 0, 0, 0.15)'
    }
  },
  dark: {
    name: 'Dark',
    icon: '',
    colors: {
      secondary: '#6c757d',
      background: '#1a1a1a',
      'background-secondary': '#2d2d2d',
      'background-gradient': 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      surface: '#2d2d2d',
      text: '#ffffff',
      'text-secondary': '#adb5bd',
      border: '#495057',
      success: '#28a745',
      'success-light': 'rgba(40, 167, 69, 0.2)',
      error: '#dc3545',
      'error-light': 'rgba(220, 53, 69, 0.2)',
      shadow: 'rgba(0, 0, 0, 0.3)',
      'shadow-large': 'rgba(0, 0, 0, 0.4)',
      'shadow-card': '0 2px 4px rgba(0, 0, 0, 0.3)',
      'shadow-hover': '0 4px 8px rgba(0, 0, 0, 0.4)'
    }
  }
};

export const ThemeProvider = ({ children }) => {
  // Initialize with saved theme or default to light
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedTheme = localStorage.getItem('selectedTheme');
    return (savedTheme && themes[savedTheme]) ? savedTheme : 'light';
  });

  // Initialize with saved accent color or default to blue
  const [currentAccent, setCurrentAccent] = useState(() => {
    const savedAccent = localStorage.getItem('selectedAccent');
    return (savedAccent && accentColors[savedAccent]) ? savedAccent : 'blue';
  });

  // Apply theme and accent immediately on component mount and when they change
  useEffect(() => {
    const applyTheme = (themeName, accentName) => {
      const theme = themes[themeName];
      const accent = accentColors[accentName];
      if (!theme || !accent) return;

      const root = document.documentElement;

      // Apply theme attribute for CSS selection
      root.setAttribute('data-theme', themeName);

      // Apply accent colors (these override the CSS defaults)
      Object.entries(accent).forEach(([key, value]) => {
        if (key !== 'name') {
          root.style.setProperty(`--color-${key}`, value);
        }
      });

      // Apply body class for legacy support
      document.body.className = `theme-${themeName} accent-${accentName}`;

      // Save to localStorage
      localStorage.setItem('selectedTheme', themeName);
      localStorage.setItem('selectedAccent', accentName);
    };

    // Apply the current theme and accent
    applyTheme(currentTheme, currentAccent);
  }, [currentTheme, currentAccent]);

  // Also apply theme on initial load to handle any timing issues
  useEffect(() => {
    const savedTheme = localStorage.getItem('selectedTheme');
    const savedAccent = localStorage.getItem('selectedAccent');

    if (savedTheme && themes[savedTheme] && savedTheme !== currentTheme) {
      setCurrentTheme(savedTheme);
    }
    if (savedAccent && accentColors[savedAccent] && savedAccent !== currentAccent) {
      setCurrentAccent(savedAccent);
    }
  }, []);

  const switchTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  const switchAccent = (accentName) => {
    if (accentColors[accentName]) {
      setCurrentAccent(accentName);
    }
  };

  const getNextTheme = () => {
    const themeKeys = Object.keys(themes);
    const currentIndex = themeKeys.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    return themeKeys[nextIndex];
  };

  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    switchTheme(newTheme);
  };

  const isDarkMode = currentTheme === 'dark';

  const value = {
    currentTheme,
    currentAccent,
    theme: themes[currentTheme],
    accent: accentColors[currentAccent],
    themes,
    accentColors,
    switchTheme,
    switchAccent,
    toggleTheme,
    isDarkMode,
    getNextTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
