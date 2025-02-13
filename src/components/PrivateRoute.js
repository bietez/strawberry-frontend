// src/components/PrivateRoute.js

import React from 'react';
import { Navigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // Importação padrão

function PrivateRoute({ children, permissions = [] }) {
  const token = localStorage.getItem('token');
  let user = null;

  if (token) {
    try {
      user = jwtDecode(token);
      // Verifique se o token contém as permissões necessárias
      if (!user.permissions) {
        throw new Error('Permissões não encontradas no token.');
      }
    } catch (error) {
      console.error("Token inválido ou faltando permissões:", error);
      return <Navigate to="/login" replace />;
    }
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Verificar se o usuário tem todas as permissões necessárias
  const hasPermission = permissions.every(permission => user.permissions.includes(permission));

  if (!hasPermission) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default PrivateRoute;
