// src/pages/Recipes/RecipeList.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';

function RecipeList() {
  const [recipes, setRecipes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/recipes')
      .then((response) => setRecipes(response.data))
      .catch((error) => console.error('Erro ao obter receitas:', error));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta receita?')) {
      try {
        await api.delete(`/recipes/${id}`);
        setRecipes(recipes.filter((recipe) => recipe._id !== id));
      } catch (error) {
        console.error('Erro ao excluir receita:', error);
        alert('Erro ao excluir receita');
      }
    }
  };

  return (
    <div>
      <h2>Receitas</h2>
      <Link to="/recipes/new">Nova Receita</Link>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Preço de Venda</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {recipes.map((recipe) => (
            <tr key={recipe._id}>
              <td>{recipe.nome}</td>
              <td>{recipe.categoria}</td>
              <td>{recipe.precoVenda}</td>
              <td>
                <button onClick={() => navigate(`/recipes/${recipe._id}`)}>Editar</button>
                <button onClick={() => handleDelete(recipe._id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RecipeList;
