// src/pages/SalesGoals/SalesGoalsList.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';

function SalesGoalsList() {
  const [salesGoals, setSalesGoals] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSalesGoals();
  }, []);

  const fetchSalesGoals = async () => {
    try {
      const response = await api.get('/sales-goals');
      setSalesGoals(response.data);
    } catch (error) {
      console.error('Erro ao obter metas de vendas:', error);
      alert('Erro ao obter metas de vendas');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta meta de vendas?')) {
      try {
        await api.delete(`/sales-goals/${id}`);
        setSalesGoals(salesGoals.filter((goal) => goal._id !== id));
      } catch (error) {
        console.error('Erro ao excluir meta de vendas:', error);
        alert('Erro ao excluir meta de vendas');
      }
    }
  };

  return (
    <div>
      <h2>Metas de Vendas</h2>
      <Link to="/sales-goals/new">Nova Meta de Vendas</Link>
      <table>
        <thead>
          <tr>
            <th>Funcionário</th>
            <th>Nome da Meta</th>
            <th>Valor da Meta</th>
            <th>Início</th>
            <th>Término</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {salesGoals.map((goal) => (
            <tr key={goal._id}>
              <td>{goal.employee ? goal.employee.nome : 'N/A'}</td>
              <td>{goal.goalName}</td>
              <td>{goal.goalAmount}</td>
              <td>{new Date(goal.startDate).toLocaleDateString()}</td>
              <td>{goal.endDate ? new Date(goal.endDate).toLocaleDateString() : 'N/A'}</td>
              <td>
                <button onClick={() => navigate(`/sales-goals/${goal._id}`)}>Editar</button>
                <button onClick={() => handleDelete(goal._id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SalesGoalsList;
