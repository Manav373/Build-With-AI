/**
 * shared/context/AuthContext.jsx — Unified Authentication & Role State
 * -------------------------------------------------------------------
 * Provides single source of user identity and domain verification for:
 * - Farmer Domain (farmer.krishiai.com)
 * - Vendor Domain (vendor.krishiai.com)
 * - Admin Domain (admin.krishiai.com)
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import client from '../services/api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('krishi_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('krishi_access_token'));
  const [loading, setLoading] = useState(true);
  const [activeDomain, setActiveDomain] = useState(() => {
    const host = window.location.hostname;
    if (host.startsWith('farmer.')) return 'farmer';
    if (host.startsWith('vendor.')) return 'vendor';
    if (host.startsWith('admin.')) return 'admin';
    return localStorage.getItem('krishi_active_domain') || 'public';
  });

  const refreshUser = useCallback(async () => {
    const currentToken = localStorage.getItem('krishi_access_token');
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await client.get('/api/v1/auth/me');
      if (res?.user) {
        setUser(res.user);
        localStorage.setItem('krishi_user_profile', JSON.stringify(res.user));
      }
    } catch (err) {
      console.warn('[AuthContext] Session validation failed:', err.message);
      if (err.status === 401) {
        client.clearTokens();
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
      target_domain: targetDomain || (activeDomain !== 'public' ? activeDomain : undefined),
    });

    if (res?.access_token) {
      client.setTokens(res.access_token, res.refresh_token);
      setToken(res.access_token);
      setUser(res.user);
      localStorage.setItem('krishi_user_profile', JSON.stringify(res.user));
      return res.user;
    }
    throw new Error('Authentication failed: No token returned');
  };

  const register = async (payload) => {
    const res = await client.post('/api/v1/auth/register', payload);
    if (res?.access_token) {
      client.setTokens(res.access_token, res.refresh_token);
      setToken(res.access_token);
      setUser(res.user);
      localStorage.setItem('krishi_user_profile', JSON.stringify(res.user));
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
      setUser(null);
      setToken(null);
    }
  };

  const switchDomain = (domain) => {
    setActiveDomain(domain);
    localStorage.setItem('krishi_active_domain', domain);
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN',
    isVendor: user?.role === 'VENDOR',
    isFarmer: user?.role === 'FARMER',
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
