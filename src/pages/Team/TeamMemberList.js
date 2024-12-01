// src/pages/Team/TeamMembersList.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';

function TeamMembersList() {
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const response = await api.get('/users/team-members');
      setTeamMembers(response.data);
    } catch (error) {
      console.error('Erro ao obter membros da equipe:', error);
      alert('Erro ao obter membros da equipe');
    }
  };

  return (
    <div>
      <h2>Membros da Equipe</h2>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {teamMembers.map((member) => (
            <tr key={member._id}>
              <td>{member.nome}</td>
              <td>{member.email}</td>
              <td>{member.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TeamMembersList;
