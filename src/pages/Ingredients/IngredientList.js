// src/pages/Ingredients/IngredientList.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';

function IngredientList() {
  const [ingredients, setIngredients] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/ingredients')
      .then((response) => setIngredients(response.data))
      .catch((error) => console.error('Erro ao obter ingredientes:', error));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este ingrediente?')) {
      try {
        await api.delete(`/ingredients/${id}`);
        setIngredients(ingredients.filter((ingredient) => ingredient._id !== id));
      } catch (error) {
        console.error('Erro ao excluir ingrediente:', error);
        alert('Erro ao excluir ingrediente');
      }
    }
  };

  return (
    <div>
      <h2>Ingredientes</h2>
      <Link to="/ingredients/new">Novo Ingrediente</Link>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Unidade de Medida</th>
            <th>Quantidade em Estoque</th>
            <th>Preço de Custo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((ingredient) => (
            <tr key={ingredient._id}>
              <td>{ingredient.nome}</td>
              <td>{ingredient.unidadeMedida}</td>
              <td>{ingredient.quantidadeEstoque}</td>
              <td>{ingredient.precoCusto}</td>
              <td>
                <button onClick={() => navigate(`/ingredients/${ingredient._id}`)}>Editar</button>
                <button onClick={() => handleDelete(ingredient._id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default IngredientList;
