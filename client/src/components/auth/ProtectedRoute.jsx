import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from './AuthModal';

// In ProtectedRoute.jsx
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated); // Add this
  
  if (!isAuthenticated) {
    return <AuthModal isOpen={true} onClose={() => {}} />;
  }

  console.log('ProtectedRoute - rendering children'); // Add this
  return children;
};

export default ProtectedRoute;