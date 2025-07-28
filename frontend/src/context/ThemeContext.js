import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const themes = {
  light: {
    name: 'Light',
    icon: '',
    colors: {
      primary: '#007bff',
      'primary-hover': '#0056b3',
      'primary-dark': '#004085',
      'primary-light': 'rgba(0, 123, 255, 0.1)',
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
      warning: '#ffc107',
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
      primary: '#007bff',
      'primary-hover': '#0056b3',
      'primary-dark': '#004085',
      'primary-light': 'rgba(0, 123, 255, 0.2)',
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
      warning: '#ffc107',
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

  // Apply theme immediately on component mount and when theme changes
  useEffect(() => {
    const applyTheme = (themeName) => {
      const theme = themes[themeName];
      if (!theme) return;
      
      const root = document.documentElement;
      
      // Apply CSS custom properties
      Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
      });
      
      // Apply body class for theme-specific styles
      document.body.className = `theme-${themeName}`;
      
      // Save to localStorage
      localStorage.setItem('selectedTheme', themeName);
    };

    // Apply the current theme
    applyTheme(currentTheme);
  }, [currentTheme]);

  // Also apply theme on initial load to handle any timing issues
  useEffect(() => {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme && themes[savedTheme] && savedTheme !== currentTheme) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  const switchTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
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
    theme: themes[currentTheme],
    themes,
    switchTheme,
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
