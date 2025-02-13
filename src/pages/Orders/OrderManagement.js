// src/pages/Orders/OrderManagement.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Modal, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import io from 'socket.io-client';
import { Helmet } from 'react-helmet-async';

function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [lastTenDeliveredOrders, setLastTenDeliveredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const statusStages = ['Pendente', 'Preparando', 'Pronto', 'Entregue'];

  const tipoBadgeMap = {
    'entrada': 'info',
    'prato principal': 'success',
    'sobremesa': 'warning',
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchOrders();
    };
    fetchData();

    const socket = io('http://localhost:8000');

    socket.on('novo_pedido', (newOrder) => {
      toast.warning(`Novo pedido #${newOrder.orderNumber} recebido.`);
      setOrders((prevOrders) => [...prevOrders, newOrder]);

      if (newOrder.status === 'Entregue') {
        setLastTenDeliveredOrders((prevDelivered) => [newOrder, ...prevDelivered].slice(0, 10));
      }
    });

    socket.on('atualizacao_pedido', (updatedOrder) => {
      toast.info(`Pedido #${updatedOrder.orderNumber} atualizado para "${updatedOrder.status}".`);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );

      if (updatedOrder.status === 'Entregue') {
        setLastTenDeliveredOrders((prevDelivered) => {
          const updatedDelivered = prevDelivered.filter((o) => o._id !== updatedOrder._id);
          updatedDelivered.unshift(updatedOrder);
          return updatedDelivered.slice(0, 10);
        });
      } else {
        setLastTenDeliveredOrders((prevDelivered) =>
          prevDelivered.filter((o) => o._id !== updatedOrder._id)
        );
      }
    });

    socket.on('exclusao_pedido', (deletedOrderId) => {
      toast.warning(`Pedido #${deletedOrderId} foi excluído.`);
      setOrders((prevOrders) => prevOrders.filter((order) => order._id !== deletedOrderId));
      setLastTenDeliveredOrders((prevDelivered) =>
        prevDelivered.filter((order) => order._id !== deletedOrderId)
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && Array.isArray(response.data.orders)) {
        if (response.data.orders.length === 0) {
          toast.info('Nenhum pedido encontrado.');
        }
        setOrders(response.data.orders);

        const deliveredOrders = response.data.orders
          .filter((order) => order.status === 'Entregue')
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 10);

        setLastTenDeliveredOrders(deliveredOrders);
      } else {
        throw new Error('Formato de dados inesperado da API.');
      }
    } catch (error) {
      console.error('Erro ao obter pedidos:', error);
      toast.error(
        `Erro ao obter pedidos: ${
          error.response?.data?.message || 'Erro desconhecido.'
        }`
      );
      setOrders([]);
      setLastTenDeliveredOrders([]);
    }
  };

  const getProductNameById = (product) => {
    if (product && typeof product === 'object' && product.nome) {
      return product.nome;
    }
    return 'Produto desconhecido';
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

        if (newStatus === 'Preparando') {
          order.preparar = true;
        }

        setOrders((prevOrders) =>
          prevOrders.map((o) =>
            o._id === order._id ? { ...o, status: newStatus, preparar: order.preparar } : o
          )
        );

        fetchOrders();
      }
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      toast.error(
        `Erro ao avançar pedido #${order.orderNumber}: ${
          error.response?.data?.message || 'Erro desconhecido.'
        }`
      );
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

  const groupItemsByType = (itens) => {
    return itens.reduce((acc, item) => {
      if (!acc[item.tipo]) {
        acc[item.tipo] = [];
      }
      acc[item.tipo].push(item);
      return acc;
    }, {});
  };

  return (
    <Container fluid className="mt-4">
      <Helmet>
        <title>Gerenciamento de Pedidos - MeuApp</title>
      </Helmet>
      <h1 className="mb-4">Gerenciamento de Pedidos</h1>
      {orders.length === 0 ? (
        <p>Nenhum pedido encontrado.</p>
      ) : (
        <Row>
          {statusStages.map((stage, index) => (
            <Col key={stage} md={3}>
              <h4>{stage}</h4>
              {index < 3 && (
                <>
                  {orders
                    .filter((order) => order.status === stage)
                    .map((order) => {
                      const groupedItems = groupItemsByType(order.itens);
                      return (
                        <Card key={order.orderNumber} className="mb-2">
                          <Card.Body>
                            <Card.Title>Pedido #{order.orderNumber}</Card.Title>
                            <Card.Subtitle className="mb-2">
                              <Badge bg={order.preparar ? 'danger' : 'secondary'}>
                                {order.preparar ? 'Preparar' : 'Aguardando'}
                              </Badge>
                            </Card.Subtitle>
                            <Card.Text>
                              Mesa: {order.mesa?.numeroMesa || 'N/A'}
                              <br />
                              <strong>Itens:</strong>
                              <ul className="list-unstyled">
                                {Object.entries(groupedItems).map(([tipo, itens]) => (
                                  <li key={tipo} className="mb-3">
                                    <Badge bg={tipoBadgeMap[tipo] || 'secondary'} className="me-2">
                                      {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                                    </Badge>
                                    <ul>
                                      {itens.map((item, idx) => (
                                        <li key={idx}>
                                          {item.quantidade} X {getProductNameById(item.product)}
                                        </li>
                                      ))}
                                    </ul>
                                  </li>
                                ))}
                              </ul>
                              {/* Exibição da Observação no Card */}
                              {order.observacao && (
                                <>
                                  <br />
                                  <strong>Observação:</strong> {order.observacao}
                                </>
                              )}
                              <br />
                              <strong>Total:</strong> R$ {order.total.toFixed(2)}
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
                              disabled={order.preparar === false || order.status === 'Entregue'}
                            >
                              Avançar para {statusStages[index + 1]}
                            </Button>
                          </Card.Body>
                        </Card>
                      );
                    })}
                </>
              )}
              {index === 3 && (
                <>
                  {lastTenDeliveredOrders.map((order) => {
                    const groupedItems = groupItemsByType(order.itens);
                    return (
                      <Card key={order.orderNumber} className="mb-2">
                        <Card.Body>
                          <Card.Title>Pedido #{order.orderNumber}</Card.Title>
                          <Card.Subtitle className="mb-2">
                            <Badge bg={order.preparar ? 'danger' : 'secondary'}>
                              {order.preparar ? 'Preparar' : 'Aguardando'}
                            </Badge>
                          </Card.Subtitle>
                          <Card.Text>
                            Status: {order.status}
                            <br />
                            Mesa: {order.mesa?.numeroMesa || 'N/A'}
                            <br />
                            <strong>Itens:</strong>
                            <ul className="list-unstyled">
                              {Object.entries(groupedItems).map(([tipo, itens]) => (
                                <li key={tipo} className="mb-3">
                                  <Badge bg={tipoBadgeMap[tipo] || 'secondary'} className="me-2">
                                    {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                                  </Badge>
                                  <ul>
                                    {itens.map((item, idx) => (
                                      <li key={idx}>
                                        {item.quantidade} X {getProductNameById(item.product)}
                                      </li>
                                    ))}
                                  </ul>
                                </li>
                              ))}
                            </ul>
                            {/* Exibição da Observação no Card */}
                            {order.observacao && (
                              <>
                                <br />
                                <strong>Observação:</strong> {order.observacao}
                              </>
                            )}
                            <br />
                            <strong>Total:</strong> R$ {order.total.toFixed(2)}
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
                    );
                  })}
                </>
              )}
            </Col>
          ))}
        </Row>
      )}

      {/* Modal de Detalhes do Pedido */}
      <Modal show={showModal} onHide={closeOrderDetails}>
        <Modal.Header closeButton>
          <Modal.Title>Detalhes do Pedido #{selectedOrder?.orderNumber || 'N/A'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder ? (
            <>
              <p>
                <strong>ID:</strong> {selectedOrder._id}
              </p>
              <p>
                <strong>Mesa:</strong> {selectedOrder.mesa?.numeroMesa || 'N/A'}
              </p>
              <p>
                <strong>Assento:</strong> {selectedOrder.assento || 'N/A'}
              </p>
              <p>
                <strong>Garçom:</strong> {selectedOrder.garcom?.nome || 'N/A'}
              </p>
              <p>
                <strong>Cozinheiro:</strong> {selectedOrder.cozinheiro?.nome || 'N/A'}
              </p>
              <p>
                <strong>Tipo de Pedido:</strong> {selectedOrder.tipoPedido}
              </p>
              {selectedOrder.tipoPedido === 'entrega' && (
                <p>
                  <strong>Endereço de Entrega:</strong> {selectedOrder.enderecoEntrega || 'N/A'}
                </p>
              )}
              <p>
                <strong>Status:</strong> {selectedOrder.status}
              </p>
              <p>
                <strong>Total:</strong> R$ {selectedOrder.total.toFixed(2)}
              </p>
              <p>
                <strong>Preparar:</strong>{' '}
                <Badge bg={selectedOrder.preparar ? 'danger' : 'secondary'}>
                  {selectedOrder.preparar ? 'Preparar' : 'Aguardando'}
                </Badge>
              </p>
              {/* Exibição da Observação no Modal */}
              {selectedOrder.observacao && (
                <p>
                  <strong>Observação:</strong> {selectedOrder.observacao}
                </p>
              )}
              <p>
                <strong>Itens:</strong>
              </p>
              <ul className="list-unstyled">
                {selectedOrder.itens && selectedOrder.itens.length > 0 ? (
                  Object.entries(groupItemsByType(selectedOrder.itens)).map(([tipo, itens]) => (
                    <li key={tipo} className="mb-3">
                      <h5>
                        <Badge bg={tipoBadgeMap[tipo] || 'secondary'} className="me-2">
                          {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                        </Badge>
                      </h5>
                      <ul>
                        {itens.map((item, index) => (
                          <li key={index}>
                            {item.quantidade} X {getProductNameById(item.product)}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))
                ) : (
                  <li>Nenhum item no pedido.</li>
                )}
              </ul>
            </>
          ) : (
            <p>Carregando detalhes do pedido...</p>
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
