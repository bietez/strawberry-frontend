// src/pages/Auth/Logout.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Remove o token de autenticação
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    toast.success('Você saiu com sucesso.');
    navigate('/login');
  }, [navigate]);

  return null;
}

export default Logout;
