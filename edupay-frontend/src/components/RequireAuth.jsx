// src/components/RequireAuth.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Wrap protected routes with <RequireAuth> children
 * Example: <Route path="/" element={<RequireAuth><TransactionsPage/></RequireAuth>} />
 */
export default function RequireAuth({ children }) {
  const { token } = useAuth();
  const location = useLocation();

  if (!token) {
    // redirect to login with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
