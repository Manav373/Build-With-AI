import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider.jsx';
import roleUtils from './roleUtils.js';

export default function ProtectedRoute({
  children,
  allowedRoles = [],
  requiredDomain,
  fallbackUrl = '/sign-in',
}) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 text-sm">
        Authenticating session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={fallbackUrl} state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0) {
    const userRole = user?.role?.toUpperCase();
    const hasRole = allowedRoles.some((r) => r.toUpperCase() === userRole);
    if (!hasRole && !roleUtils.isAdmin(user)) {
      return <Navigate to="/" replace />;
    }
  }

  if (requiredDomain && !roleUtils.canAccessDomain(user, requiredDomain)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
