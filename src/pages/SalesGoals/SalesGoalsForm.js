// src/pages/SalesGoals/SalesGoalForm.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';

function SalesGoalForm() {
  const [salesGoal, setSalesGoal] = useState({
    employeeId: '',
    goalName: '',
    goalAmount: '',
    startDate: '',
    endDate: '',
  });
  const [employees, setEmployees] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
    if (id) {
      fetchSalesGoal();
    }
  }, [id]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/users/team-members');
      // Filtrar apenas agentes
      setEmployees(response.data.filter((user) => user.role === 'agent'));
    } catch (error) {
      console.error('Erro ao obter funcionários:', error);
      alert('Erro ao obter funcionários');
    }
  };

  const fetchSalesGoal = async () => {
    try {
      const response = await api.get(`/sales-goals/${id}`);
      const goal = response.data;
      setSalesGoal({
        employeeId: goal.employee._id,
        goalName: goal.goalName,
        goalAmount: goal.goalAmount,
        startDate: goal.startDate.substring(0, 10),
        endDate: goal.endDate ? goal.endDate.substring(0, 10) : '',
      });
    } catch (error) {
      console.error('Erro ao obter meta de vendas:', error);
      alert('Erro ao obter meta de vendas');
    }
  };

  const handleChange = (e) => {
    setSalesGoal({ ...salesGoal, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await api.put(`/sales-goals/${id}`, salesGoal);
        alert('Meta de vendas atualizada com sucesso!');
      } else {
        await api.post('/sales-goals', salesGoal);
        alert('Meta de vendas criada com sucesso!');
      }
      navigate('/sales-goals');
    } catch (error) {
      console.error('Erro ao salvar meta de vendas:', error);
      alert('Erro ao salvar meta de vendas');
    }
  };

  return (
    <div>
      <h2>{id ? 'Editar Meta de Vendas' : 'Nova Meta de Vendas'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Funcionário:</label>
          <select
            name="employeeId"
            value={salesGoal.employeeId}
            onChange={handleChange}
            required
          >
            <option value="">Selecione um funcionário</option>
            {employees.map((employee) => (
              <option key={employee._id} value={employee._id}>
                {employee.nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Nome da Meta:</label>
          <input
            type="text"
            name="goalName"
            value={salesGoal.goalName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Valor da Meta:</label>
          <input
            type="number"
            name="goalAmount"
            value={salesGoal.goalAmount}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Data de Início:</label>
          <input
            type="date"
            name="startDate"
            value={salesGoal.startDate}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Data de Término:</label>
          <input
            type="date"
            name="endDate"
            value={salesGoal.endDate}
            onChange={handleChange}
          />
        </div>
        <button type="submit">{id ? 'Atualizar' : 'Criar'}</button>
      </form>
    </div>
  );
}

export default SalesGoalForm;
