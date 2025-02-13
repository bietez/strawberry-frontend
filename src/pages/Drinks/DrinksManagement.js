// src/pages/Orders/DrinkManagement.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Modal, Badge, Form } from 'react-bootstrap'; // Importar Badge e Form
import { toast } from 'react-toastify'; // Importar o toast
import io from 'socket.io-client'; // Importar o socket.io-client
import { Helmet } from 'react-helmet-async'; // Importar Helmet

function DrinkManagement() {
  const [orders, setOrders] = useState([]);
  const [lastTenDeliveredOrders, setLastTenDeliveredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const statusStages = ['Pendente', 'Preparando', 'Pronto', 'Entregue'];

  // Mapeamento de 'tipo' para variantes de badge
  const tipoBadgeMap = {
    'entrada': 'info',
    'prato principal': 'success',
    'sobremesa': 'warning',
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchProducts(); // Primeiro obtém os produtos
      await fetchOrders(); // Depois obtém os pedidos filtrados
    };
    fetchData();

    // Configurar o socket.io
    const socket = io('http://localhost:8000'); // Ajuste a URL conforme o seu servidor

    // Listener para novos pedidos
    socket.on('novo_pedido', (newOrder) => {
      // Verificar se o pedido contém alguma bebida
      if (orderContainsDrink(newOrder)) {
        toast.warning(`Novo pedido #${newOrder.orderNumber} recebido.`, {
          position: "top-right",
          autoClose: 5000,
        });
        // Adicionar o novo pedido ao final da lista
        setOrders((prevOrders) => [...prevOrders, newOrder]);

        // Atualizar a lista de pedidos entregues se o novo pedido já estiver entregue
        if (newOrder.status === 'Entregue') {
          setLastTenDeliveredOrders((prevDelivered) => [newOrder, ...prevDelivered].slice(0, 10));
        }
      }
    });

    // Listener para atualizações de pedidos
    socket.on('atualizacao_pedido', (updatedOrder) => {
      if (orderContainsDrink(updatedOrder)) {
        toast.info(`Pedido #${updatedOrder.orderNumber} atualizado para "${updatedOrder.status}".`, {
          position: "top-right",
          autoClose: 5000,
        });
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === updatedOrder._id ? updatedOrder : order
          )
        );

        // Atualizar a lista de pedidos entregues
        if (updatedOrder.status === 'Entregue') {
          setLastTenDeliveredOrders((prevDelivered) => {
            const updatedDelivered = prevDelivered.filter((o) => o._id !== updatedOrder._id);
            updatedDelivered.unshift(updatedOrder);
            return updatedDelivered.slice(0, 10);
          });
        } else {
          // Se o pedido não está mais entregue, removê-lo da lista de entregues
          setLastTenDeliveredOrders((prevDelivered) =>
            prevDelivered.filter((o) => o._id !== updatedOrder._id)
          );
        }
      } else {
        // Se o pedido não contém bebida, remover da lista se existir
        setOrders((prevOrders) => prevOrders.filter((order) => order._id !== updatedOrder._id));
        setLastTenDeliveredOrders((prevDelivered) =>
          prevDelivered.filter((o) => o._id !== updatedOrder._id)
        );
      }
    });

    // Listener para exclusão de pedidos
    socket.on('exclusao_pedido', (deletedOrderId) => {
      setOrders((prevOrders) => prevOrders.filter((order) => order._id !== deletedOrderId));
      setLastTenDeliveredOrders((prevDelivered) =>
        prevDelivered.filter((order) => order._id !== deletedOrderId)
      );
      toast.warning(`Pedido #${deletedOrderId} foi excluído.`, {
        position: "top-right",
        autoClose: 5000,
      });
    });

    // Cleanup na desmontagem do componente
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
      console.log('Resposta da API /orders:', response.data); // Log para depuração

      if (response.data && Array.isArray(response.data.orders)) {
        // Filtrar pedidos que contêm bebidas
        const drinkOrders = response.data.orders.filter(order => orderContainsDrink(order));

        if (drinkOrders.length === 0) {
          toast.info('Nenhum pedido de bebida encontrado.', {
            position: "top-right",
            autoClose: 5000,
          });
        }
        setOrders(drinkOrders);

        // Filtrar pedidos entregues com bebidas
        const deliveredOrders = drinkOrders
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
        }`,
        {
          position: "top-right",
          autoClose: 5000,
        }
      );
      setOrders([]); // Reseta orders para um array vazio em caso de erro
      setLastTenDeliveredOrders([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/products', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Resposta da API /products:', response.data); // Log para depuração

      if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        throw new Error('Formato de dados inesperado da API de produtos.');
      }
    } catch (error) {
      console.error('Erro ao obter produtos:', error);
      toast.error(
        `Erro ao obter produtos: ${
          error.response?.data?.message || 'Erro desconhecido.'
        }`,
        {
          position: "top-right",
          autoClose: 5000,
        }
      );
      setProducts([]);
    }
  };

  const getProductNameById = (product) => {
    if (product && typeof product === 'object' && product.nome) { // Verifica se 'product' não é null
      return product.nome;
    }

    if (!Array.isArray(products)) return 'Produto desconhecido';
    const foundProduct = products.find((prod) => String(prod._id) === String(product));
    return foundProduct ? foundProduct.nome : 'Produto desconhecido';
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

        // Se o novo status for "Preparando", atualizar "preparar" para true
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
        }`,
        {
          position: "top-right",
          autoClose: 5000,
        }
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

  const orderContainsDrink = (order) => {
    if (!order.itens || !Array.isArray(order.itens)) return false;
    return order.itens.some(item => {
      const product = products.find(prod => String(prod._id) === String(item.product));
      return product && product.categoria && product.categoria.toLowerCase().includes('ebida');
    });
  };

  return (
    <Container fluid className="mt-4">
      <Helmet>
        <title>Gerenciamento de Bebidas - MeuApp</title> {/* Definir o título da página */}
      </Helmet>
      <h1 className="mb-4">Gerenciamento de Bebidas</h1>
      {orders.length === 0 ? (
        <p>Nenhum pedido de bebida encontrado.</p>
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
                              disabled={order.status === 'Entregue'}
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

      {/* Modal para detalhes do pedido */}
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

export default DrinkManagement;
