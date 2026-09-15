import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import client from '@krishiai/api/client';
import authStorage from './authStorage.js';
import roleUtils, { ROLES } from './roleUtils.js';

const AuthContext = createContext(null);

export function AuthProvider({ children, defaultDomain = 'farmer' }) {
  const [user, setUser] = useState(() => authStorage.getUserProfile());
  const [token, setToken] = useState(() => authStorage.getAccessToken());
  const [loading, setLoading] = useState(true);
  const [activeDomain, setActiveDomain] = useState(() => {
    return authStorage.getActiveDomain() || defaultDomain;
  });

  const refreshUser = useCallback(async () => {
    const currentToken = authStorage.getAccessToken();
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await client.get('/api/v1/auth/me');
      if (res?.user) {
        setUser(res.user);
        authStorage.setUserProfile(res.user);
      }
    } catch (err) {
      console.warn('[AuthContext] Session validation failed:', err.message);
      if (err.status === 401) {
        client.clearTokens();
        authStorage.clearAll();
        setUser(null);
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (identifier, password, targetDomain) => {
    const res = await client.post('/api/v1/auth/login', {
      identifier,
      password,
      target_domain: targetDomain || activeDomain,
    });

    if (res?.access_token) {
      client.setTokens(res.access_token, res.refresh_token);
      authStorage.setTokens(res.access_token, res.refresh_token);
      setToken(res.access_token);
      setUser(res.user);
      authStorage.setUserProfile(res.user);
      return res.user;
    }
    throw new Error('Authentication failed: No token returned');
  };

  const register = async (payload) => {
    const res = await client.post('/api/v1/auth/register', payload);
    if (res?.access_token) {
      client.setTokens(res.access_token, res.refresh_token);
      authStorage.setTokens(res.access_token, res.refresh_token);
      setToken(res.access_token);
      setUser(res.user);
      authStorage.setUserProfile(res.user);
      return res.user;
    }
    throw new Error('Registration failed: No token returned');
  };

  const logout = async () => {
    try {
      await client.post('/api/v1/auth/logout', {});
    } catch {
      // Ignore network errors on logout
    } finally {
      client.clearTokens();
      authStorage.clearAll();
      setUser(null);
      setToken(null);
    }
  };

  const switchDomain = (domain) => {
    setActiveDomain(domain);
    authStorage.setActiveDomain(domain);
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!user && !!token,
    isAdmin: roleUtils.isAdmin(user),
    isVendor: roleUtils.isVendor(user),
    isFarmer: roleUtils.isFarmer(user),
    activeDomain,
    loading,
    login,
    register,
    logout,
    switchDomain,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
