// src/services/ifoodApi.js

import axios from 'axios';

// Cria uma instância do Axios para as rotas de autenticação do iFood
const ifoodApi = axios.create({
  baseURL: 'http://localhost:8000/api', // Atualize conforme a URL do seu backend
  withCredentials: true, // Mantém os cookies se necessário
});

// Você pode adicionar interceptadores específicos para ifoodApi, se necessário

export default ifoodApi;
