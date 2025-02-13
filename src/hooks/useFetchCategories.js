// src/hooks/useFetchCategories.js
import { useEffect, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

function useFetchCategories() {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories'); // Endpoint corrigido
        setCategories(response.data);
      } catch (error) {
        console.error('Erro ao obter categorias:', error);
        setErrorCategories('Erro ao obter categorias: ' + (error.response?.data?.message || error.message));
        toast.error('Erro ao obter categorias: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loadingCategories, errorCategories };
}

export default useFetchCategories;
