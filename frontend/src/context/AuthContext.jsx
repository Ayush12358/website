import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { authClient } from '../utils/neonAuth';

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

  const checkAuthStatus = useCallback(async () => {
    try {
      const sessionResult = await authClient.getSession();
      const sessionUser = sessionResult?.data?.user;

      if (!sessionUser) {
        setUser(null);
        return;
      }

      try {
        const response = await api.get('/users/profile');
        setUser({ profile: response.data });
      } catch (profileError) {
        setUser({
          profile: {
            name: sessionUser.name || sessionUser.email || 'User',
            email: sessionUser.email,
            neonUserId: sessionUser.id,
            emailVerified: sessionUser.emailVerified || false
          }
        });
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (email, password) => {
    try {
      const result = await authClient.signIn.email({ email, password });
      if (result?.error) {
        return {
          success: false,
          error: result.error.message || 'Login failed'
        };
      }

      await checkAuthStatus();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Login failed'
      };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const result = await authClient.signUp.email({ name, email, password });
      if (result?.error) {
        return {
          success: false,
          error: result.error.message || 'Sign up failed'
        };
      }

      await checkAuthStatus();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Sign up failed'
      };
    }
  };

  const logout = async () => {
    try {
      await authClient.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    loading,
    checkAuthStatus
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
