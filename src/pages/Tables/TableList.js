// src/pages/Tables/TableList.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';

function TableList() {
  const [tables, setTables] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await api.get('/tables');
      setTables(response.data);
    } catch (error) {
      console.error('Erro ao obter mesas:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta mesa?')) {
      try {
        await api.delete(`/tables/${id}`);
        setTables(tables.filter((table) => table._id !== id));
      } catch (error) {
        console.error('Erro ao excluir mesa:', error);
        alert('Erro ao excluir mesa');
      }
    }
  };

  const handleFinalize = async (id) => {
    if (window.confirm('Tem certeza que deseja finalizar esta mesa?')) {
      try {
        await api.post(`/tables/${id}/finalizar`);
        alert('Mesa finalizada com sucesso!');
        fetchTables();
      } catch (error) {
        console.error('Erro ao finalizar mesa:', error);
        alert('Erro ao finalizar mesa: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/tables/${id}/status`, { status: newStatus });
      alert(`Status da mesa alterado para ${newStatus}`);
      fetchTables();
    } catch (error) {
      console.error('Erro ao atualizar status da mesa:', error);
      alert('Erro ao atualizar status da mesa: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div>
      <h2>Mesas</h2>
      <Link to="/tables/new">Nova Mesa</Link>
      <table>
        <thead>
          <tr>
            <th>Número</th>
            <th>Ambiente</th>
            <th>Assentos</th>
            <th>Posição (X, Y)</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {tables.map((table) => (
            <tr key={table._id}>
              <td>{table.numeroMesa}</td>
              <td>{table.ambiente.nome}</td>
              <td>{table.assentos.length}</td>
              <td>
                ({table.position?.x || '-'}, {table.position?.y || '-'})
              </td>
              <td>{table.status}</td>
              <td>
                <button onClick={() => navigate(`/tables/${table._id}`)}>Editar</button>
                <button onClick={() => handleDelete(table._id)}>Excluir</button>
                {table.status === 'OCUPADA' && (
                  <button onClick={() => handleFinalize(table._id)}>Finalizar</button>
                )}
                {table.status === 'DISPONIVEL' && (
                  <button onClick={() => handleStatusChange(table._id, 'OCUPADA')}>
                    Marcar como Ocupada
                  </button>
                )}
                {table.status !== 'DISPONIVEL' && (
                  <button onClick={() => handleStatusChange(table._id, 'DISPONIVEL')}>
                    Marcar como Disponível
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TableList;
