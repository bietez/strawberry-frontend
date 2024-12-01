// components/ReservationForm.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';

function ReservationForm() {
  const [clientes, setClientes] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [clienteId, setClienteId] = useState('');
  const [mesaId, setMesaId] = useState('');
  const [dataReserva, setDataReserva] = useState('');
  const [numeroPessoas, setNumeroPessoas] = useState(1);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');
  const { id } = useParams(); // Obtém o ID da reserva da URL
  const [status, setStatus] = useState('Ativa'); // Inicializa como 'Ativa'

  const navigate = useNavigate();

  useEffect(() => {
    fetchClientes();
    fetchMesas();
    if (id) {
      // Se um ID está presente, estamos editando uma reserva existente
      fetchReservationDetails();
    }
  }, [id]);

  const fetchClientes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/customers', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setClientes(response.data);
    } catch (error) {
      console.error('Erro ao obter clientes:', error);
    }
  };

  const fetchMesas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/tables', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMesas(response.data);
    } catch (error) {
      console.error('Erro ao obter mesas:', error);
    }
  };

  const fetchReservationDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8000/api/reservations/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const reservation = response.data;
      setClienteId(reservation.cliente?._id || '');
      setMesaId(reservation.mesa?._id || '');
      setDataReserva(reservation.dataReserva.slice(0, 16)); // Formato 'YYYY-MM-DDTHH:mm'
      setNumeroPessoas(reservation.numeroPessoas);
      setStatus(reservation.status === true ? 'Ativa' : 'Cancelada'); // Ajuste aqui
    } catch (error) {
      console.error('Erro ao obter detalhes da reserva:', error);
      setMensagemErro('Erro ao carregar reserva. Por favor, tente novamente.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagemSucesso('');
    setMensagemErro('');
    try {
      const token = localStorage.getItem('token');
      const reservaData = {
        clienteId,
        mesaId,
        dataReserva,
        numeroPessoas,
        status: status === 'Ativa', // Converte para booleano
      };
      if (id) {
        // Atualiza a reserva existente
        await axios.put(`http://localhost:8000/api/reservations/${id}`, reservaData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMensagemSucesso('Reserva atualizada com sucesso!');
      } else {
        // Cria uma nova reserva
        await axios.post('http://localhost:8000/api/reservations', reservaData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMensagemSucesso('Reserva criada com sucesso!');
        // Limpar o formulário
        setClienteId('');
        setMesaId('');
        setDataReserva('');
        setNumeroPessoas(1);
        setStatus('Ativa'); // Reseta para 'Ativa'
      }
      // Opcionalmente, redireciona de volta para a lista de reservas
      navigate('/reservations');
    } catch (error) {
      console.error('Erro ao salvar reserva:', error);
      setMensagemErro('Erro ao salvar reserva. Por favor, tente novamente.');
    }
  };

  return (
    <Container className="mt-4">
      <h1 className="mb-4">{id ? 'Editar Reserva' : 'Criar Nova Reserva'}</h1>
      {mensagemSucesso && <Alert variant="success">{mensagemSucesso}</Alert>}
      {mensagemErro && <Alert variant="danger">{mensagemErro}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="clienteId" className="mb-3">
          <Form.Label>Cliente</Form.Label>
          <Form.Control
            as="select"
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            required
          >
            <option value="">Selecione um cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente._id} value={cliente._id}>
                {cliente.nome}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        <Form.Group controlId="mesaId" className="mb-3">
          <Form.Label>Mesa</Form.Label>
          <Form.Control
            as="select"
            value={mesaId}
            onChange={(e) => setMesaId(e.target.value)}
            required
          >
            <option value="">Selecione uma mesa</option>
            {mesas.map((mesa) => (
              <option key={mesa._id} value={mesa._id}>
                Mesa {mesa.numeroMesa} - Ambiente {mesa.ambiente?.nome}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        <Row>
          <Col md={4}>
            <Form.Group controlId="dataReserva" className="mb-3">
              <Form.Label>Data da Reserva</Form.Label>
              <Form.Control
                type="datetime-local"
                value={dataReserva}
                onChange={(e) => setDataReserva(e.target.value)}
                required
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group controlId="numeroPessoas" className="mb-3">
              <Form.Label>Número de Pessoas</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={numeroPessoas}
                onChange={(e) => setNumeroPessoas(e.target.value)}
                required
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group controlId="status" className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Control
                as="select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
              >
                <option value="Ativa">Ativa</option>
                <option value="Cancelada">Cancelada</option>
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>

        <Button variant="primary" type="submit">
          {id ? 'Atualizar Reserva' : 'Criar Reserva'}
        </Button>
      </Form>
    </Container>
  );
}

export default ReservationForm;
