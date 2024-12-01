// src/pages/Ingredients/IngredientForm.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';

function IngredientForm() {
  const [ingredient, setIngredient] = useState({
    nome: '',
    unidadeMedida: '',
    quantidadeEstoque: 0,
    precoCusto: 0,
  });
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      api.get(`/ingredients/${id}`)
        .then((response) => setIngredient(response.data))
        .catch((error) => console.error('Erro ao obter ingrediente:', error));
    }
  }, [id]);

  const handleChange = (e) => {
    setIngredient({ ...ingredient, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await api.put(`/ingredients/${id}`, ingredient);
        alert('Ingrediente atualizado com sucesso!');
      } else {
        await api.post('/ingredients', ingredient);
        alert('Ingrediente criado com sucesso!');
      }
      navigate('/ingredients');
    } catch (error) {
      console.error('Erro ao salvar ingrediente:', error);
      alert('Erro ao salvar ingrediente');
    }
  };

  return (
    <div>
      <h2>{id ? 'Editar Ingrediente' : 'Novo Ingrediente'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome:</label>
          <input type="text" name="nome" value={ingredient.nome} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="unidadeMedida">Unidade de Medida:</label>
          <select type="text" name="unidadeMedida" value={ingredient.unidadeMedida} onChange={handleChange} required >
            <option value="kg">Kg</option>
            <option value="g">Grama</option>
            <option value="unidade">Unidade</option>
            <option value="litro">Litro</option>
            <option value="ml">Mililitro</option>
          </select>
        </div>
        <div>
          <label>Quantidade em Estoque:</label>
          <input type="number" name="quantidadeEstoque" value={ingredient.quantidadeEstoque} onChange={handleChange} required />
        </div>
        <div>
          <label>Preço de Custo:</label>
          <input type="number" name="precoCusto" value={ingredient.precoCusto} onChange={handleChange} required />
        </div>
        <button type="submit">{id ? 'Atualizar' : 'Criar'}</button>
      </form>
    </div>
  );
}

export default IngredientForm;
