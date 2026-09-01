import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, role, mfaVerified, mfaEnrolled, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-950">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
          <span className="absolute text-[10px] uppercase font-bold text-brand-300">SEC</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/india/admin/login" state={{ from: location }} replace />;
  }

  if (role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (!mfaEnrolled) {
    return <Navigate to="/india/admin/mfa-enroll" state={{ from: location }} replace />;
  }

  if (!mfaVerified) {
    return <Navigate to="/india/admin/mfa" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminProtectedRoute;

