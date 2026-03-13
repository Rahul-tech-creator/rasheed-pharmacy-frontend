import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, setTokens, clearTokens, getAccessToken, getRefreshToken } from '../api/pharmacyApi';

const AuthContext = createContext(null);

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
  const [error, setError] = useState(null);

  const isAuthenticated = !!user;
  const isOwner = user?.role === 'owner';
  const isCustomer = user?.role === 'customer';

  // Try to restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const token = getAccessToken();
      const refresh = getRefreshToken();
      if (token || refresh) {
        try {
          const result = await authApi.getMe();
          setUser(result.data);
        } catch {
          // Token invalid — try refresh
          if (refresh) {
            try {
              const refreshResult = await authApi.refresh();
              if (refreshResult.success) {
                setTokens(refreshResult.data.accessToken, refresh);
                setUser(refreshResult.data.user);
              } else {
                clearTokens();
              }
            } catch {
              clearTokens();
            }
          } else {
            clearTokens();
          }
        }
      }
      setLoading(false);
    };
    restoreSession();
  }, []);

  const sendOtp = useCallback(async (phone, name) => {
    setError(null);
    try {
      const result = await authApi.sendOtp(phone, name);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const verifyOtp = useCallback(async (phone, otp, name) => {
    setError(null);
    try {
      const result = await authApi.verifyOtp(phone, otp, name);
      if (result.success && result.data) {
        setTokens(result.data.accessToken, result.data.refreshToken);
        setUser(result.data.user);
        return result.data;
      }
      throw new Error('Verification failed');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore errors on logout
    }
    setUser(null);
    clearTokens();
  }, []);

  const clearError = () => setError(null);

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    isOwner,
    isCustomer,
    sendOtp,
    verifyOtp,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
