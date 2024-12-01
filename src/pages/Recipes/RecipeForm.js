// src/pages/Recipes/RecipeForm.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';

function RecipeForm() {
  const [recipe, setRecipe] = useState({
    nome: '',
    categoria: '',
    precoVenda: 0,
    descricao: '',
    ingredientes: [],
  });
  const [allIngredients, setAllIngredients] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/ingredients')
      .then((response) => setAllIngredients(response.data))
      .catch((error) => console.error('Erro ao obter ingredientes:', error));

    if (id) {
      api.get(`/recipes/${id}`)
        .then((response) => setRecipe(response.data))
        .catch((error) => console.error('Erro ao obter receita:', error));
    }
  }, [id]);

  const handleChange = (e) => {
    setRecipe({ ...recipe, [e.target.name]: e.target.value });
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...recipe.ingredientes];
    newIngredients[index][field] = value;
    setRecipe({ ...recipe, ingredientes: newIngredients });
  };

  const addIngredient = () => {
    setRecipe({
      ...recipe,
      ingredientes: [...recipe.ingredientes, { ingrediente: '', quantidade: 0 }],
    });
  };

  const removeIngredient = (index) => {
    const newIngredients = [...recipe.ingredientes];
    newIngredients.splice(index, 1);
    setRecipe({ ...recipe, ingredientes: newIngredients });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await api.put(`/recipes/${id}`, recipe);
        alert('Receita atualizada com sucesso!');
      } else {
        await api.post('/recipes', recipe);
        alert('Receita criada com sucesso!');
      }
      navigate('/recipes');
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
      alert('Erro ao salvar receita');
    }
  };

  return (
    <div>
      <h2>{id ? 'Editar Receita' : 'Nova Receita'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome:</label>
          <input type="text" name="nome" value={recipe.nome} onChange={handleChange} required />
        </div>
        <div>
          <label>Categoria:</label>
          <input type="text" name="categoria" value={recipe.categoria} onChange={handleChange} required />
        </div>
        <div>
          <label>Preço de Venda:</label>
          <input type="number" name="precoVenda" value={recipe.precoVenda} onChange={handleChange} required />
        </div>
        <div>
          <label>Descrição:</label>
          <textarea name="descricao" value={recipe.descricao} onChange={handleChange} />
        </div>
        <div>
          <h3>Ingredientes</h3>
          {recipe.ingredientes.map((ing, index) => (
            <div key={index}>
              <select
                value={ing.ingrediente}
                onChange={(e) => handleIngredientChange(index, 'ingrediente', e.target.value)}
              >
                <option value="">Selecione um ingrediente</option>
                {allIngredients.map((ingredient) => (
                  <option key={ingredient._id} value={ingredient._id}>
                    {ingredient.nome}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Quantidade"
                value={ing.quantidade}
                onChange={(e) => handleIngredientChange(index, 'quantidade', e.target.value)}
              />
              <button type="button" onClick={() => removeIngredient(index)}>Remover</button>
            </div>
          ))}
          <button type="button" onClick={addIngredient}>Adicionar Ingrediente</button>
        </div>
        <button type="submit">{id ? 'Atualizar' : 'Criar'}</button>
      </form>
    </div>
  );
}

export default RecipeForm;
