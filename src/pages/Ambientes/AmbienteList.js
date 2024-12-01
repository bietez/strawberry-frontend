// src/pages/Ambientes/AmbienteList.js

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';

function AmbienteList() {
  const [ambientes, setAmbientes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/ambientes')
      .then((response) => {
        setAmbientes(response.data);
        console.log('Ambientes carregados:', response.data);
      })
      .catch((error) => {
        console.error('Erro ao obter ambientes:', error);
        alert('Erro ao obter ambientes: ' + (error.response?.data?.message || error.message));
      });
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este ambiente?')) {
      try {
        await api.delete(`/ambientes/${id}`);
        setAmbientes(ambientes.filter((ambiente) => ambiente._id !== id));
      } catch (error) {
        console.error('Erro ao excluir ambiente:', error);
        alert('Erro ao excluir ambiente: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  return (
    <div>
      <h2>Ambientes</h2>
      <Link to="/ambientes/new">Novo Ambiente</Link>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Limite de Pessoas</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {ambientes.map((ambiente) => (
            <tr key={ambiente._id}>
              <td>{ambiente.nome}</td>
              <td>{ambiente.limitePessoas}</td>
              <td>
                <button onClick={() => navigate(`/ambientes/${ambiente._id}`)}>
                  Editar
                </button>
                <button onClick={() => handleDelete(ambiente._id)}>
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AmbienteList;
