import axios from 'axios';

// Determine the base URL based on environment and user preference
const getBaseURL = () => {
  // Check if user has manually selected local API
  const useProduction = localStorage.getItem('useProductionAPI');
  
  // Default to production if no preference is set, or if explicitly set to true
  if (useProduction === null || useProduction === 'true') {
    return 'https://ayushmaurya.xyz/api';
  }
  
  // Only use local if explicitly set to false
  return '/api';
};

// Create axios instance with default config
const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true, // Include cookies in requests
});

// Request interceptor to add auth token (for backward compatibility)
api.interceptors.request.use(
  (config) => {
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

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired - just clean up localStorage
      // Let the AuthContext handle the redirect logic
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;
