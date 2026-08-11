import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="shimmer" style={{ width: '80px', height: '80px', borderRadius: '50%' }}></div>
      </div>
    );
  }

  // Redirect actively authenticated users safely based on their strict role boundaries
  if (user) {
    if (user.role === 'ROLE_ADMIN' || user.role === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default GuestRoute;
