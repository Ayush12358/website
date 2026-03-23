import axios from 'axios';
import { authClient } from './neonAuth';

const CONFIGURED_API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').trim();

// Automatically detect environment based on current URL
const getAutoDetectedEnvironment = () => {
  const currentHostname = window.location.hostname;
  const isLocalHost =
    currentHostname === 'localhost'
    || currentHostname === '127.0.0.1'
    || currentHostname.startsWith('192.168.')
    || currentHostname.endsWith('.local');

  if (isLocalHost) {
    return 'local';
  }
  
  // For deployed hosts (custom domain and preview URLs), use same-origin /api.
  if (currentHostname === 'ayushmaurya.xyz' || currentHostname.includes('ayushmaurya.xyz') || currentHostname.endsWith('.vercel.app')) {
    return 'production';
  }
  
  // Default to deployed behavior for any non-local host.
  return 'production';
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
  // Explicit env var takes precedence in deployed environments (for example Vercel).
  if (CONFIGURED_API_BASE_URL) {
    return CONFIGURED_API_BASE_URL.replace(/\/+$/, '');
  }

  // Initialize/update environment setting based on current URL
  const useProduction = initializeEnvironmentSetting();
  
  if (useProduction) {
    return '/api';
  }
  
  // Use local backend with explicit port
  return 'http://localhost:5001/api';
};

// Create axios instance with default config
const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true, // Include cookies in requests
});

// Request interceptor to add Neon Auth token and update baseURL
api.interceptors.request.use(
  async (config) => {
    // Update baseURL for each request to handle environment switching
    config.baseURL = getBaseURL();

    const sessionResult = await authClient.getSession();
    const token = sessionResult?.data?.session?.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (config.headers && config.headers.Authorization) {
      delete config.headers.Authorization;
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
    const currentEnv = getCurrentEnvironment();
    const baseURL = getBaseURL();
    
    console.error(`API Error [${currentEnv} - ${baseURL}]:`, error);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      // Network connection error - likely local server not running
      if (currentEnv === 'Local') {
        console.error('Local backend server appears to be offline. Make sure it\'s running on port 5001.');
      }
    }
    
    if (error.response?.status === 401) {
      // Let the auth context and Neon client manage session lifecycle.
    }
    return Promise.reject(error);
  }
);

export default api;

// Helper functions for environment management
export const getCurrentEnvironment = () => {
  if (CONFIGURED_API_BASE_URL) {
    return 'Configured';
  }

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
