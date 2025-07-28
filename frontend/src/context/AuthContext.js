import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  const checkAuthStatus = useCallback(async () => {
    if (initialCheckDone) return; // Prevent multiple initial checks
    
    try {
      const response = await api.get('/users/profile');
      setUser({ profile: response.data });
    } catch (error) {
      // Not authenticated or token expired
      setUser(null);
      // Clean up any old localStorage token
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
      setInitialCheckDone(true);
    }
  }, [initialCheckDone]);

  useEffect(() => {
    // Check authentication status by trying to fetch profile
    // This will work with cookies automatically
    if (!initialCheckDone) {
      checkAuthStatus();
    }
  }, [checkAuthStatus, initialCheckDone]); // Empty dependency array to run only once on mount

  const login = async (email, password) => {
    try {
      await api.post('/users/login', { email, password });
      // Cookie is set automatically by the server
      // Fetch user profile to update state
      const profileResponse = await api.get('/users/profile');
      setUser({ profile: profileResponse.data });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/users/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clean up state and localStorage regardless of API call result
      setUser(null);
      localStorage.removeItem('token');
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
    checkAuthStatus
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
