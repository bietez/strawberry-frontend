// src/pages/Employees/EmployeeList.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';

function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/employees')
      .then((response) => setEmployees(response.data))
      .catch((error) => console.error('Erro ao obter funcionários:', error));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este funcionário?')) {
      try {
        await api.delete(`/employees/${id}`);
        setEmployees(employees.filter((employee) => employee._id !== id));
      } catch (error) {
        console.error('Erro ao excluir funcionário:', error);
        alert('Erro ao excluir funcionário');
      }
    }
  };

  return (
    <div>
      <h2>Funcionários</h2>
      <Link to="/employees/new">Novo Funcionário</Link>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Função</th>
            <th>Email</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee._id}>
              <td>{employee.nome}</td>
              <td>{employee.funcao}</td>
              <td>{employee.email}</td>
              <td>
                <button onClick={() => navigate(`/employees/${employee._id}`)}>Editar</button>
                <button onClick={() => handleDelete(employee._id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeList;
