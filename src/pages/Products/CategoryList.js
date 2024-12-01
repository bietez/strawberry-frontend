// src/pages/Products/CategoryList.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

function CategoryList() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/categories')
      .then((response) => setCategories(response.data))
      .catch((error) => console.error('Erro ao obter categorias:', error));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      try {
        await api.delete(`/categories/${id}`);
        setCategories(categories.filter((category) => category._id !== id));
      } catch (error) {
        console.error('Erro ao excluir categoria:', error);
        alert('Erro ao excluir categoria');
      }
    }
  };

  return (
    <div>
      <h2>Categorias</h2>
      <button onClick={() => navigate('/categories/new')}>Nova Categoria</button>
      <table>
        <thead>
          <tr>
            <th>Categoria</th>
            <th>Descrição</th>
            <th>Habilitado</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category._id}>
              <td>{category.categoria}</td>
              <td>{category.descricao}</td>
              <td>{category.habilitado ? 'Sim' : 'Não'}</td>
              <td>
                <button onClick={() => navigate(`/categories/${category._id}`)}>Editar</button>
                <button onClick={() => handleDelete(category._id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CategoryList;
