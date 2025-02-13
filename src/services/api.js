// src/services/api.js

import axios from 'axios';
import { toast } from 'react-toastify';

// Criação da instância do axios
const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Atualize conforme necessário
  withCredentials: true,
});

// Interceptador de requisições para adicionar os tokens de autenticação
api.interceptors.request.use(
  (config) => {
    // Token de autenticação geral (do sistema)
    const authToken = localStorage.getItem('token'); 
    if (authToken) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Token de autenticação do iFood (usando chave "ifoodAccessToken")
    const ifoodToken = localStorage.getItem('ifoodAccessToken'); 
    if (ifoodToken) {
      config.headers['Ifood-Authorization'] = `Bearer ${ifoodToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptador de respostas para tratar erros globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const requestUrl = error.config.url || '';
      const requestHeaders = error.config.headers || {};

      console.log(`Erro na requisição para ${requestUrl}`);
      console.log(`Status: ${status}`);
      console.log(`Headers:`, requestHeaders);
      console.log(`Dados:`, data);

      if (status === 401) {
        // Se a URL da requisição, em minúsculas, começar com "/ifood/" ou conter "/ifood/"
        if (requestUrl.toLowerCase().startsWith('/ifood/') || requestUrl.toLowerCase().includes('/ifood/')) {
          // Remover apenas o token do iFood
          localStorage.removeItem('ifoodAccessToken');
          toast.error('Token do iFood expirado ou inválido. Por favor, reautentique-se.');
        } else if (requestHeaders['Authorization']) {
          // Para outras rotas, remova o token de login e redirecione para login
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      } else if (status === 403) {
        toast.error('Você não tem permissão para realizar esta ação.', {
          position: "top-right",
          autoClose: 5000,
        });
      } else if (status >= 500) {
        toast.error('Erro no servidor. Por favor, tente novamente mais tarde.', {
          position: "top-right",
          autoClose: 5000,
        });
      } else if (status >= 400) {
        toast.error(data.message || 'Erro na requisição.', {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } else {
      toast.error('Erro de conexão. Verifique sua internet.', {
        position: "top-right",
        autoClose: 5000,
      });
    }
    return Promise.reject(error);
  }
);

export default api;
