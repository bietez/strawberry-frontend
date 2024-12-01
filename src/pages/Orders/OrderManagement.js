// src/pages/Orders/OrderManagement.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [lastTenOrders, setLastTenOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const statusStages = ['Pendente', 'Preparando', 'Pronto', 'Entregue'];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(response.data);

      // Obter os últimos 10 pedidos
      const sortedOrders = [...response.data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setLastTenOrders(sortedOrders.slice(0, 10));
    } catch (error) {
      console.error('Erro ao obter pedidos:', error);
    }
  };

  const advanceOrderStatus = async (order) => {
    try {
      const currentIndex = statusStages.indexOf(order.status);
      if (currentIndex < statusStages.length - 1) {
        const newStatus = statusStages[currentIndex + 1];
        const token = localStorage.getItem('token');
        await axios.put(
          `http://localhost:8000/api/orders/${order._id}/status`,
          { status: newStatus },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // Atualiza o status localmente
        setOrders((prevOrders) =>
          prevOrders.map((o) =>
            o._id === order._id ? { ...o, status: newStatus } : o
          )
        );
        fetchOrders();
      }
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
    }
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
    setShowModal(false);
  };

  return (
    <Container fluid className="mt-4">
      <h1 className="mb-4">Gerenciamento de Pedidos</h1>
      <Row>
        {statusStages.map((stage, index) => (
          <Col key={stage} md={3}>
            <h4>{stage}</h4>
            {index < 3 && (
              <>
                {orders
                  .filter((order) => order.status === stage)
                  .map((order) => (
                    <Card key={order._id} className="mb-2">
                      <Card.Body>
                        <Card.Title>Pedido #{order._id.slice(-5)}</Card.Title>
                        <Card.Text>
                          Mesa: {order.mesa?.numeroMesa || 'N/A'}
                          <br />
                          Cliente: {order.cliente?.nome || 'N/A'}
                          <br />
                          Total: R$ {order.total.toFixed(2)}
                        </Card.Text>
                        <Button
                          variant="info"
                          size="sm"
                          className="me-2"
                          onClick={() => openOrderDetails(order)}
                        >
                          Detalhes
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => advanceOrderStatus(order)}
                        >
                          Avançar para {statusStages[index + 1]}
                        </Button>
                      </Card.Body>
                    </Card>
                  ))}
              </>
            )}
            {index === 3 && (
              <>
                {lastTenOrders.map((order) => (
                  <Card key={order._id} className="mb-2">
                    <Card.Body>
                      <Card.Title>Pedido #{order._id.slice(-5)}</Card.Title>
                      <Card.Text>
                        Status: {order.status}
                        <br />
                        Mesa: {order.mesa?.numeroMesa || 'N/A'}
                        <br />
                        Cliente: {order.cliente?.nome || 'N/A'}
                        <br />
                        Total: R$ {order.total.toFixed(2)}
                      </Card.Text>
                      <Button
                        variant="info"
                        size="sm"
                        onClick={() => openOrderDetails(order)}
                      >
                        Detalhes
                      </Button>
                    </Card.Body>
                  </Card>
                ))}
              </>
            )}
          </Col>
        ))}
      </Row>

      {/* Modal para detalhes do pedido */}
      <Modal show={showModal} onHide={closeOrderDetails}>
        <Modal.Header closeButton>
          <Modal.Title>Detalhes do Pedido #{selectedOrder?._id.slice(-5)}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <p>
                <strong>Mesa:</strong> {selectedOrder.mesa?.numeroMesa || 'N/A'}
              </p>
              <p>
                <strong>Cliente:</strong> {selectedOrder.cliente?.nome || 'N/A'}
              </p>
              <p>
                <strong>Status:</strong> {selectedOrder.status}
              </p>
              <p>
                <strong>Itens:</strong>
              </p>
              <ul>
                {selectedOrder.itens.map((item, index) => (
                  <li key={index}>
                    {item.receita?.nome || 'Receita desconhecida'} - Quantidade: {item.quantidade}
                    {item.modificacoes && ` - Modificações: ${item.modificacoes}`}
                  </li>
                ))}
              </ul>
              <p>
                <strong>Total:</strong> R$ {selectedOrder.total.toFixed(2)}
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeOrderDetails}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default OrderManagement;
