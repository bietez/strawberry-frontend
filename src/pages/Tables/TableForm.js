// src/pages/Tables/TableForm.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';

function TableForm() {
  const [table, setTable] = useState({
    numeroMesa: '',
    ambienteId: '',
    numeroAssentos: 0,
    status: 'DISPONIVEL',
  });
  const [ambientes, setAmbientes] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAmbientes();
    if (id) {
      fetchTable();
    }
  }, [id]);

  const fetchAmbientes = async () => {
    try {
      const response = await api.get('/ambientes');
      setAmbientes(response.data);
    } catch (error) {
      console.error('Erro ao obter ambientes:', error);
    }
  };

  const fetchTable = async () => {
    try {
      const response = await api.get(`/tables/${id}`);
      setTable(response.data);
    } catch (error) {
      console.error('Erro ao obter mesa:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTable({
      ...table,
      [name]: name === 'numeroAssentos' ? Number(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await api.put(`/tables/${id}`, table);
        alert('Mesa atualizada com sucesso!');
      } else {
        await api.post('/tables', table);
        alert('Mesa criada com sucesso!');
      }
      navigate('/tables');
    } catch (error) {
      console.error('Erro ao salvar mesa:', error);
      if (error.response && error.response.data && error.response.data.message) {
        alert('Erro ao salvar mesa: ' + error.response.data.message);
      } else {
        alert('Erro ao salvar mesa');
      }
    }
  };

  const handleFinalize = async () => {
    try {
      await api.post(`/tables/${id}/finalizar`);
      alert('Mesa finalizada com sucesso!');
      navigate('/tables');
    } catch (error) {
      console.error('Erro ao finalizar mesa:', error);
      alert('Erro ao finalizar mesa: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.put(`/tables/${id}/status`, { status: newStatus });
      alert(`Status da mesa alterado para ${newStatus}`);
      fetchTable();
    } catch (error) {
      console.error('Erro ao atualizar status da mesa:', error);
      alert('Erro ao atualizar status da mesa: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div>
      <h2>{id ? 'Editar Mesa' : 'Nova Mesa'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Número da Mesa:</label>
          <input
            type="text"
            name="numeroMesa"
            value={table.numeroMesa}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Ambiente:</label>
          <select
            name="ambienteId"
            value={table.ambienteId}
            onChange={handleChange}
            required
          >
            <option value="">Selecione um Ambiente</option>
            {ambientes.map((ambiente) => (
              <option key={ambiente._id} value={ambiente._id}>
                {ambiente.nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Número de Assentos:</label>
          <input
            type="number"
            name="numeroAssentos"
            value={table.numeroAssentos}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">{id ? 'Atualizar' : 'Criar'}</button>
      </form>

      {id && (
        <div className="mt-4">
          <h3>Status da Mesa</h3>
          <p>Status Atual: {table.status}</p>
          {table.status === 'OCUPADA' && (
            <button onClick={handleFinalize}>Finalizar Mesa</button>
          )}
          {table.status !== 'DISPONIVEL' && (
            <button onClick={() => handleStatusChange('DISPONIVEL')}>Marcar como Disponível</button>
          )}
          {table.status === 'DISPONIVEL' && (
            <button onClick={() => handleStatusChange('OCUPADA')}>Marcar como Ocupada</button>
          )}
        </div>
      )}
    </div>
  );
}

export default TableForm;
