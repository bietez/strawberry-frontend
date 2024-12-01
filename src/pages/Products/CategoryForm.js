// src/pages/Categories/CategoryForm.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';

function CategoryForm() {
  const [category, setCategory] = useState({
    categoria: '',
    descricao: '',
    habilitado: true,
  });
  const [loading, setLoading] = useState(false);
  const { id } = useParams(); // Obtemos o id da categoria caso estejamos editando
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/categories/${id}`);
      setCategory(response.data);
    } catch (error) {
      console.error('Erro ao obter categoria:', error);
      alert('Erro ao obter categoria');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCategory({
      ...category,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        // Atualizar categoria existente
        await api.put(`/categories/${id}`, category);
        alert('Categoria atualizada com sucesso!');
      } else {
        // Criar nova categoria
        await api.post('/categories', category);
        alert('Categoria criada com sucesso!');
      }
      navigate('/categories'); // Redireciona para a lista de categorias
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      alert('Erro ao salvar categoria');
    }
  };

  return (
    <div>
      <h2>{id ? 'Editar Categoria' : 'Nova Categoria'}</h2>
      {loading ? (
        <p>Carregando categoria...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Categoria:</label>
            <input
              type="text"
              name="categoria"
              value={category.categoria}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Descrição:</label>
            <textarea
              name="descricao"
              value={category.descricao}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                name="habilitado"
                checked={category.habilitado}
                onChange={handleChange}
              />
              Habilitado
            </label>
          </div>
          <button type="submit">{id ? 'Atualizar' : 'Criar'}</button>
        </form>
      )}
    </div>
  );
}

export default CategoryForm;
