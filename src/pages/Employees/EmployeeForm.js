// src/pages/Employees/EmployeeForm.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';

function EmployeeForm() {
  const [employee, setEmployee] = useState({
    nome: '',
    funcao: 'Garçom',
    email: '',
    senha: '',
  });
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      api.get(`/employees/${id}`)
        .then((response) => setEmployee(response.data))
        .catch((error) => console.error('Erro ao obter funcionário:', error));
    }
  }, [id]);

  const handleChange = (e) => {
    setEmployee({ ...employee, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await api.put(`/employees/${id}`, employee);
        alert('Funcionário atualizado com sucesso!');
      } else {
        await api.post('/employees', employee);
        alert('Funcionário criado com sucesso!');
      }
      navigate('/employees');
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error);
      alert('Erro ao salvar funcionário');
    }
  };

  return (
    <div>
      <h2>{id ? 'Editar Funcionário' : 'Novo Funcionário'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome:</label>
          <input type="text" name="nome" value={employee.nome} onChange={handleChange} required />
        </div>
        <div>
          <label>Função:</label>
          <select name="funcao" value={employee.funcao} onChange={handleChange}>
            <option value="Garçom">Garçom</option>
            <option value="Cozinheiro">Cozinheiro</option>
            <option value="Gerente">Gerente</option>
          </select>
        </div>
        <div>
          <label>Email:</label>
          <input type="email" name="email" value={employee.email} onChange={handleChange} required />
        </div>
        <div>
          <label>Senha:</label>
          <input type="password" name="senha" value={employee.senha} onChange={handleChange} required={!id} />
        </div>
        <button type="submit">{id ? 'Atualizar' : 'Criar'}</button>
      </form>
    </div>
  );
}

export default EmployeeForm;
