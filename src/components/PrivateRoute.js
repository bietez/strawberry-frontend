// src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Importação nomeada

function PrivateRoute({ permissions, children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const user = jwtDecode(token);
    const userPermissions = user.permissions || [];

    const hasPermission = permissions.every((perm) =>
      userPermissions.includes(perm)
    );

    if (!hasPermission) {
      return <Navigate to="/unauthorized" />;
    }

    return children;
  } catch (error) {
    console.error('Token inválido:', error);
    return <Navigate to="/login" />;
  }
}

export default PrivateRoute;
