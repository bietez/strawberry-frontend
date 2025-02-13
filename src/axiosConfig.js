import axios from 'axios';
import { toast } from 'react-toastify';

// Criação da instância do Axios
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api', // Verifique se está correto para todos os ambientes.
  withCredentials: true,  // <= IMPORTANTE

});

// Interceptor de Resposta
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          if (data.message?.includes('jwt expired')) {
            localStorage.removeItem('token');
            toast.error('Sua sessão expirou. Por favor, faça login novamente.');
            window.location.href = '/login';
          } else {
            toast.error(data.message || 'Não autorizado.');
          }
          break;
        case 404:
          toast.error('Endpoint não encontrado.');
          break;
        default:
          toast.error(data.message || 'Erro inesperado. Tente novamente.');
      }
    } else {
      toast.error('Erro ao se conectar ao servidor.');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
