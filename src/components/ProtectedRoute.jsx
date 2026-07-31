import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="shimmer" style={{ width: '80px', height: '80px', borderRadius: '50%' }}></div>
      </div>
    );
  }

  // Redirect to Login if anonymous
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect if role is unauthorized
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If standard customer attempts admin, block with unauthorized
    return <Navigate to="/" replace />;
  }

  return children;
};
export default ProtectedRoute;
