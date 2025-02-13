// src/components/TokenWatcher.jsx

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import { toast } from 'react-toastify';
import api from '../services/api';

// Define uma margem de segurança para renovar o token antes de expirar (ex.: 60 segundos)
const REFRESH_THRESHOLD = 60; // segundos

function TokenWatcher() {
  const navigate = useNavigate();
  // Utiliza uma ref para armazenar o timeout de renovação
  const refreshTimeoutRef = useRef(null);

  useEffect(() => {
    setupTokenRefresh();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
    // Rode apenas na montagem, ou quando o token (no localStorage) mudar
  }, [navigate]);

  // Agenda a renovação do token com base no tempo restante até a expiração
  const setupTokenRefresh = () => {
    const token = localStorage.getItem('token');
    if (!token) return; // Se não houver token, sai

    try {
      const decoded = jwtDecode(token);
      if (!decoded.exp) {
        // Se não houver exp, token inválido
        handleLogout('Token inválido. Faça login novamente.');
        return;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = decoded.exp - currentTime;
      if (timeUntilExpiry <= 0) {
        // Token já expirado
        handleLogout('Sua sessão expirou. Faça login novamente.');
        return;
      }

      // Calcula o delay para renovar o token: o tempo restante menos o threshold (em milissegundos)
      const refreshDelay = (timeUntilExpiry - REFRESH_THRESHOLD) * 1000;

      if (refreshDelay <= 0) {
        // Se já está perto ou passou da margem, tenta renovar imediatamente
        refreshToken();
      } else {
        refreshTimeoutRef.current = setTimeout(() => {
          refreshToken();
        }, refreshDelay);
      }
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      handleLogout('Token inválido. Faça login novamente.');
    }
  };

  // Função que chama o endpoint de refresh para renovar o access token
  const refreshToken = async () => {
    try {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (!storedRefreshToken) {
        handleLogout('Refresh token ausente. Faça login novamente.');
        return;
      }

      const response = await api.post('/auth/refresh', { refreshToken: storedRefreshToken });
      if (response.data && response.data.token) {
        // Atualiza o access token no localStorage
        localStorage.setItem('token', response.data.token);
        toast.success('Token renovado com sucesso.');

        // Reagenda a próxima renovação com base no novo token
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current);
        }
        setupTokenRefresh();
      } else {
        handleLogout('Falha ao renovar token. Faça login novamente.');
      }
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      handleLogout('Erro ao renovar token. Faça login novamente.');
    }
  };

  // Limpa os tokens e redireciona para o login, exibindo uma mensagem
  const handleLogout = (message) => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    toast.info(message);
    navigate('/login');
  };

  return null; // Componente não renderiza nada visível
}

export default TokenWatcher;
