// src/pages/Orders/OrderList.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { Table, Button, Badge, Container } from 'react-bootstrap';

function OrderList() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/orders')
      .then((response) => setOrders(response.data))
      .catch((error) => console.error('Erro ao obter pedidos:', error));
  }, []);

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Pendente':
        return 'warning';
      case 'Em Preparo':
        return 'info';
      case 'Pronto':
        return 'success';
      case 'Entregue':
        return 'primary';
      case 'Cancelado':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Pedidos</h2>
      <div className="d-flex justify-content-between mb-3">
        <Button variant="primary" onClick={() => navigate('/orders/new')}>
          Novo Pedido
        </Button>
        <Button variant="outline-secondary" onClick={() => window.location.reload()}>
          Atualizar
        </Button>
      </div>
      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>ID do Pedido</th>
            <th>Mesa</th>
            <th>Assentos</th>
            <th>Itens</th>
            <th>Status</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{order._id}</td>
              <td>{order.mesa.numeroMesa}</td>
              <td>{order.assentos.map((a) => a.numeroAssento).join(', ')}</td>
              <td>
                {order.itens.map((item) => (
                  <div key={item._id}>
                    {item.nome} x{item.quantidade}
                  </div>
                ))}
              </td>
              <td>
                <Badge bg={getStatusVariant(order.status)}>{order.status}</Badge>
              </td>
              <td>{new Date(order.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default OrderList;
