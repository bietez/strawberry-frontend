// src/pages/Ambientes/AmbienteForm.js

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';

function AmbienteForm() {
  const [ambiente, setAmbiente] = useState({
    nome: '',
    limitePessoas: 0,
  });
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      api
        .get(`/ambientes/${id}`)
        .then((response) => setAmbiente(response.data))
        .catch((error) => console.error('Erro ao obter ambiente:', error));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAmbiente({
      ...ambiente,
      [name]: name === 'limitePessoas' ? Number(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await api.put(`/ambientes/${id}`, ambiente);
        alert('Ambiente atualizado com sucesso!');
      } else {
        await api.post('/ambientes', ambiente);
        alert('Ambiente criado com sucesso!');
      }
      navigate('/ambientes');
    } catch (error) {
      console.error('Erro ao salvar ambiente:', error);
      if (error.response && error.response.data && error.response.data.message) {
        alert('Erro ao salvar ambiente: ' + error.response.data.message);
      } else {
        alert('Erro ao salvar ambiente');
      }
    }
  };

  return (
    <div>
      <h2>{id ? 'Editar Ambiente' : 'Novo Ambiente'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome:</label>
          <input
            type="text"
            name="nome"
            value={ambiente.nome}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Limite de Pessoas:</label>
          <input
            type="number"
            name="limitePessoas"
            value={ambiente.limitePessoas}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">{id ? 'Atualizar' : 'Criar'}</button>
      </form>
    </div>
  );
}

export default AmbienteForm;
