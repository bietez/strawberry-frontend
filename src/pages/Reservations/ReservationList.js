// components/ReservationList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Container, Alert, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function ReservationList() {
  const [reservations, setReservations] = useState([]);
  const navigate = useNavigate(); // Hook para navegação

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('token'); // Certifique-se de que o token está armazenado no localStorage
      const response = await axios.get('http://localhost:8000/api/reservations', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setReservations(response.data);
    } catch (error) {
      console.error('Erro ao obter reservas:', error);
    }
  };

  const handleEdit = (reservationId) => {
    // Navega para o formulário de edição, passando o ID da reserva
    navigate(`/reservations/edit/${reservationId}`);
  };

  const handleDelete = async (reservationId) => {
    if (window.confirm('Tem certeza que deseja excluir esta reserva?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8000/api/reservations/${reservationId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Remove a reserva excluída do estado
        setReservations(reservations.filter((res) => res._id !== reservationId));
      } catch (error) {
        console.error('Erro ao excluir reserva:', error);
        alert('Erro ao excluir reserva. Por favor, tente novamente.');
      }
    }
  };

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Lista de Reservas</h1>
      {reservations.length === 0 ? (
        <Alert variant="info">Nenhuma reserva encontrada.</Alert>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Mesa</th>
              <th>Ambiente</th>
              <th>Data da Reserva</th>
              <th>Número de Pessoas</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => (
              <tr key={reservation._id}>
                <td>{reservation.cliente?.nome}</td>
                <td>{reservation.mesa?.numeroMesa}</td>
                <td>{reservation.mesa?.ambiente?.nome}</td>
                <td>{new Date(reservation.dataReserva).toLocaleString()}</td>
                <td>{reservation.numeroPessoas}</td>
                <td>{reservation.status}</td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEdit(reservation._id)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(reservation._id)}
                  >
                    Excluir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default ReservationList;
