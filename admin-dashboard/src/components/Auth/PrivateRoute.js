import React from 'react';
import { Navigate } from 'react-router-dom';

// For this example, we'll assume the user is always authenticated.
// In a real app, you'd use a proper authentication check here.
const isAuthenticated = true;

const PrivateRoute = ({ children }) => {
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;