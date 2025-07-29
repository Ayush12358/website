import axios from 'axios';

// Automatically detect environment based on current URL
const getAutoDetectedEnvironment = () => {
  const currentHostname = window.location.hostname;
  
  // If running on ayushmaurya.xyz domain, use production
  if (currentHostname === 'ayushmaurya.xyz' || currentHostname.includes('ayushmaurya.xyz')) {
    return 'production';
  }
  
  // For all other domains (localhost, LAN IPs, etc.), use local
  return 'local';
};

// Initialize environment setting based on URL if not already set
const initializeEnvironmentSetting = () => {
  const savedPreference = localStorage.getItem('useProductionAPI');
  const autoDetected = getAutoDetectedEnvironment();
  
  // If no saved preference exists, set it based on current URL
  if (savedPreference === null) {
    const shouldUseProduction = autoDetected === 'production';
    localStorage.setItem('useProductionAPI', JSON.stringify(shouldUseProduction));
    return shouldUseProduction;
  }
  
  // If URL doesn't match saved preference, update it automatically
  const savedUseProduction = JSON.parse(savedPreference);
  const urlSuggestsProduction = autoDetected === 'production';
  
  if (savedUseProduction !== urlSuggestsProduction) {
    console.log(`Auto-switching API environment: URL suggests ${autoDetected}, updating setting`);
    localStorage.setItem('useProductionAPI', JSON.stringify(urlSuggestsProduction));
    return urlSuggestsProduction;
  }
  
  return savedUseProduction;
};

// Determine the base URL based on environment and user preference
const getBaseURL = () => {
  // Initialize/update environment setting based on current URL
  const useProduction = initializeEnvironmentSetting();
  
  if (useProduction) {
    return 'https://ayushmaurya.xyz/api';
  }
  
  // Use local backend with explicit port
  return 'http://localhost:5001/api';
};

// Create axios instance with default config
const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true, // Include cookies in requests
});

// Request interceptor to add auth token and update baseURL
api.interceptors.request.use(
  (config) => {
    // Update baseURL for each request to handle environment switching
    config.baseURL = getBaseURL();
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration and provide better error messages
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Add environment context to error for debugging
    const currentEnv = localStorage.getItem('useProductionAPI') === 'true' ? 'Production' : 'Local';
    const baseURL = getBaseURL();
    
    console.error(`API Error [${currentEnv} - ${baseURL}]:`, error);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      // Network connection error - likely local server not running
      if (currentEnv === 'Local') {
        console.error('Local backend server appears to be offline. Make sure it\'s running on port 5001.');
      }
    }
    
    if (error.response?.status === 401) {
      // Token is invalid or expired - just clean up localStorage
      // Let the AuthContext handle the redirect logic
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;

// Helper functions for environment management
export const getCurrentEnvironment = () => {
  // Initialize environment setting based on URL
  const useProduction = initializeEnvironmentSetting();
  return useProduction ? 'Production' : 'Local';
};

export const getCurrentBaseURL = () => getBaseURL();

export const getEnvironmentInfo = () => {
  const currentHostname = window.location.hostname;
  const autoDetected = getAutoDetectedEnvironment();
  const useProduction = JSON.parse(localStorage.getItem('useProductionAPI') || 'false');
  
  return {
    currentHostname,
    autoDetected,
    useProduction,
    environment: useProduction ? 'Production' : 'Local',
    baseURL: getBaseURL()
  };
};

export const testConnection = async () => {
  const startTime = performance.now();
  try {
    const response = await api.get('/health');
    const endTime = performance.now();
    const pingTime = Math.round(endTime - startTime);
    
    return { 
      success: true, 
      data: response.data,
      ping: pingTime,
      environment: getCurrentEnvironment(),
      baseURL: getCurrentBaseURL()
    };
  } catch (error) {
    const endTime = performance.now();
    const pingTime = Math.round(endTime - startTime);
    
    return { 
      success: false, 
      error: error.message,
      ping: pingTime,
      environment: getCurrentEnvironment(),
      baseURL: getCurrentBaseURL()
    };
  }
};
