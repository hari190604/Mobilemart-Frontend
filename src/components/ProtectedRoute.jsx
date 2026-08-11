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

  // Redirect if role is unauthorized against explicit permissions
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If Admin hits a customer page explicitly restricting them, route to /admin
    if (user.role === 'ROLE_ADMIN' || user.role === 'ADMIN') {
        return <Navigate to="/admin" replace />;
    }
    // Customers attempting Admin areas go to home
    return <Navigate to="/" replace />;
  }

  // If the route inherently has NO explicit allowedRoles (implicitly signifying a standard Customer view),
  // proactively block Admin users to satisfy architectural segregation requirements.
  if (!allowedRoles && (user.role === 'ROLE_ADMIN' || user.role === 'ADMIN')) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};
export default ProtectedRoute;
