// src/pages/Orders/OrderList.js

import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Spinner,
  Table,
  Button,
  Container,
  Alert,
  Modal,
  Badge,
  Form,
  Row,
  Col,
  Pagination,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import io from 'socket.io-client';
import api from '../../services/api';

function OrderList() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [tables, setTables] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [formData, setFormData] = useState({
    mesa: '', // Renomeado de 'mesaId' para 'mesa'
    assento: '',
    tipoPedido: 'local',
    clienteId: '',
    enderecoEntrega: '',
    preparar: false,
    observacao: '', // Novo campo Observação
    itens: [],
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [searchMesaNumber, setSearchMesaNumber] = useState('');

  const socketRef = useRef();

  const statusBadgeMap = {
    Pendente: 'warning',
    Preparando: 'info',
    Pronto: 'primary',
    Entregue: 'success',
    Finalizado: 'secondary',
  };

  // Inicialização do Socket.IO para atualizações em tempo real
  useEffect(() => {
    socketRef.current = io('http://localhost:8000');

    socketRef.current.on('novo_pedido', (newOrder) => {
      toast.warning(`Novo pedido #${newOrder.orderNumber} recebido.`, {
        position: 'top-right',
        autoClose: 5000,
      });
      setOrders((prevOrders) => [newOrder, ...prevOrders]);
      setTotalOrders((prevTotal) => prevTotal + 1);
    });

    socketRef.current.on('atualizacao_pedido', (updatedOrder) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
    });

    socketRef.current.on('exclusao_pedido', (deletedOrderId) => {
      toast.warning(`Pedido #${deletedOrderId} foi excluído.`, {
        position: 'top-right',
        autoClose: 5000,
      });
      setOrders((prevOrders) =>
        prevOrders.filter((order) => order._id !== deletedOrderId)
      );
      setTotalOrders((prevTotal) => prevTotal - 1);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // Busca dos pedidos e dados auxiliares sempre que a página ou filtro mudar
  useEffect(() => {
    fetchData();
    fetchAuxiliaryData();
  }, [currentPage, searchMesaNumber]);

  const fetchData = async () => {
    try {
      // Constrói a query string com paginação e, se preenchido, com filtro de mesa
      let queryString = `?page=${currentPage}&limit=${itemsPerPage}`;
      if (searchMesaNumber) {
        // Se o filtro for pelo número da mesa, o backend pode esperar um ID ou adaptar o filtro.
        // Aqui, é adicionado na query string. Adapte conforme sua implementação.
        queryString += `&mesaId=${searchMesaNumber}`;
      }

      const response = await api.get(`/orders${queryString}`);

      if (response.data && Array.isArray(response.data.orders)) {
        setOrders(response.data.orders);
        setTotalOrders(response.data.totalOrders);
        setTotalPages(response.data.totalPages);
      } else {
        throw new Error('Formato de dados inesperado da API.');
      }

      setLoading(false);
    } catch (error) {
      console.error('Erro ao obter pedidos:', error);
      setError(
        error.response?.data?.message || 'Erro desconhecido ao obter pedidos.'
      );
      setLoading(false);
    }
  };

  const fetchAuxiliaryData = async () => {
    try {
      const [productsRes, tablesRes, customersRes] = await Promise.all([
        api.get('/products'),
        api.get('/tables'),
        api.get('/customers'),
      ]);

      if (
        Array.isArray(productsRes.data) &&
        Array.isArray(tablesRes.data) &&
        Array.isArray(customersRes.data)
      ) {
        setProducts(productsRes.data);
        setTables(tablesRes.data);
        setCustomers(customersRes.data);
      } else {
        throw new Error(
          'Formato de dados inesperado na busca de produtos, mesas ou clientes.'
        );
      }
    } catch (error) {
      console.error('Erro ao obter dados auxiliares:', error);
    }
  };

  const handleEditClick = (order) => {
    setOrderToEdit(order);
    setFormData({
      mesa: order.mesa ? order.mesa._id : '',
      assento: order.assento || '',
      tipoPedido: order.tipoPedido,
      clienteId: order.cliente ? order.cliente._id : '',
      enderecoEntrega: order.enderecoEntrega || '',
      preparar: order.preparar,
      observacao: order.observacao || '', // Preenche Observação, se existir
      itens: order.itens.map((item) => ({
        product: item.product._id,
        quantidade: item.quantidade,
        tipo: item.tipo,
      })),
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (order) => {
    setOrderToDelete(order);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/orders/${orderToDelete._id}`);

      toast.success(`Pedido #${orderToDelete.orderNumber} excluído com sucesso.`, {
        position: 'top-right',
        autoClose: 5000,
      });

      setOrders((prevOrders) =>
        prevOrders.filter((order) => order._id !== orderToDelete._id)
      );
      setTotalOrders((prevTotal) => prevTotal - 1);
    } catch (error) {
      console.error('Erro ao excluir pedido:', error);
      toast.error(
        `Erro ao excluir pedido: ${
          error.response?.data?.message || 'Erro desconhecido.'
        }`,
        {
          position: 'top-right',
          autoClose: 5000,
        }
      );
    } finally {
      setShowDeleteModal(false);
      setOrderToDelete(null);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        garcomId: orderToEdit.garcom?._id || orderToEdit.garcomId,
        mesa: formData.tipoPedido === 'local' ? formData.mesa : undefined,
        assento: formData.tipoPedido === 'local' ? formData.assento : undefined,
        tipoPedido: formData.tipoPedido,
        clienteId: formData.tipoPedido === 'entrega' ? formData.clienteId : undefined,
        enderecoEntrega: formData.tipoPedido === 'entrega' ? formData.enderecoEntrega : undefined,
        preparar: formData.preparar,
        observacao: formData.observacao, // Envia o campo Observação
        itens: formData.itens.map((item) => ({
          product: item.product,
          quantidade: item.quantidade,
          tipo: item.tipo,
        })),
      };

      const response = await api.put(`/orders/${orderToEdit._id}`, payload);

      const updatedOrder = response.data.order;

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );

      toast.success('Pedido atualizado com sucesso!', {
        position: 'top-right',
        autoClose: 5000,
      });

      handleCloseEditModal();
    } catch (error) {
      console.error('Erro ao atualizar pedido:', error);
      toast.error(
        `Erro ao atualizar pedido: ${
          error.response?.data?.message || 'Erro desconhecido.'
        }`,
        {
          position: 'top-right',
          autoClose: 5000,
        }
      );
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setOrderToEdit(null);
    setFormData({
      mesa: '',
      assento: '',
      tipoPedido: 'local',
      clienteId: '',
      enderecoEntrega: '',
      preparar: false,
      observacao: '', // Reseta o campo Observação
      itens: [],
    });
  };

  const handleFormChange = (e, index, field) => {
    const { name, value, type, checked } = e.target;
    if (field === 'preparar') {
      setFormData({ ...formData, preparar: checked });
    } else if (field === 'itens') {
      const newItens = [...formData.itens];
      newItens[index][name] = type === 'checkbox' ? checked : value;
      setFormData({ ...formData, itens: newItens });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      itens: [
        ...formData.itens,
        { product: '', quantidade: 1, tipo: 'prato principal' },
      ],
    });
  };

  const handleRemoveItem = (index) => {
    const newItens = [...formData.itens];
    newItens.splice(index, 1);
    setFormData({ ...formData, itens: newItens });
  };

  // Funções de paginação
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
        <div>Carregando pedidos...</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Pedidos</h2>
        <Link to="/orders/new" className="btn btn-success">
          Novo Pedido
        </Link>
      </div>

      <Form.Group as={Row} className="mb-3" controlId="searchMesaNumber">
        <Form.Label column sm="2">
          Buscar Mesa:
        </Form.Label>
        <Col sm="4">
          <Form.Control
            type="text"
            placeholder="Digite o número da mesa..."
            value={searchMesaNumber}
            onChange={(e) => setSearchMesaNumber(e.target.value)}
          />
        </Col>
        <Col sm="2">
          <Button variant="primary" onClick={() => setCurrentPage(1)}>
            Buscar
          </Button>
        </Col>
      </Form.Group>

      <div className="table-responsive">
        <Table striped bordered hover>
          <thead className="table-dark">
            <tr>
              <th>Garçom</th>
              <th>Número</th>
              <th>Mesa</th>
              <th>Assento</th>
              <th>Tipo de Pedido</th>
              <th>Preparar</th>
              <th>Status</th>
              <th>Total</th>
              <th>Itens</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order._id}>
                  <td>{order.garcom?.nome || 'N/A'}</td>
                  <td>{order.orderNumber}</td>
                  <td>{order.mesa?.numeroMesa || 'N/A'}</td>
                  <td>{order.assento || 'N/A'}</td>
                  <td>
                    {order.tipoPedido.charAt(0).toUpperCase() +
                      order.tipoPedido.slice(1)}
                  </td>
                  <td>
                    <Badge bg={order.preparar ? 'success' : 'secondary'}>
                      {order.preparar ? 'Preparar' : 'Aguardando'}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={statusBadgeMap[order.status] || 'secondary'}>
                      {order.status}
                    </Badge>
                  </td>
                  <td>R$ {order.total.toFixed(2)}</td>
                  <td>
                    {order.itens.map((item, idx) => (
                      <div key={idx} className="mb-2">
                        {item.product?.nome ? (
                          <span>
                            {item.product.nome} x {item.quantidade} ({item.tipo})
                          </span>
                        ) : (
                          <span>
                            Produto não encontrado x {item.quantidade} ({item.tipo})
                          </span>
                        )}
                      </div>
                    ))}
                  </td>
                  <td>
                    {/* Exibe os botões de Editar e Excluir somente se o pedido não estiver Finalizado */}
                    {order.status !== 'Finalizado' && (
                      <>
                        <Button
                          variant="info"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEditClick(order)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteClick(order)}
                        >
                          Excluir
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center">
                  Nenhum pedido encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination className="justify-content-center">
          <Pagination.First onClick={() => paginate(1)} disabled={currentPage === 1} />
          <Pagination.Prev onClick={prevPage} disabled={currentPage === 1} />
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
            <Pagination.Item
              key={number}
              active={number === currentPage}
              onClick={() => paginate(number)}
            >
              {number}
            </Pagination.Item>
          ))}
          <Pagination.Next onClick={nextPage} disabled={currentPage === totalPages} />
          <Pagination.Last onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} />
        </Pagination>
      )}

      {/* Modal para Edição do Pedido */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Editar Pedido #{orderToEdit?.orderNumber || 'N/A'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {orderToEdit && (
            <Form onSubmit={handleEditSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="tipoPedido">
                    <Form.Label>Tipo de Pedido</Form.Label>
                    <Form.Select
                      name="tipoPedido"
                      value={formData.tipoPedido}
                      onChange={(e) => {
                        const selectedType = e.target.value;
                        setFormData({
                          ...formData,
                          tipoPedido: selectedType,
                          mesa: '',
                          assento: '',
                          clienteId: '',
                          enderecoEntrega: '',
                          observacao: '', // Limpa observação
                          itens: [],
                          preparar: false,
                        });
                      }}
                      required
                    >
                      <option value="local">Local</option>
                      <option value="entrega">Entrega</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="preparar">
                    <Form.Check
                      type="checkbox"
                      label="Preparar Agora"
                      name="preparar"
                      checked={formData.preparar}
                      onChange={(e) => handleFormChange(e, null, 'preparar')}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {formData.tipoPedido === 'local' && (
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="mesa">
                      <Form.Label>Mesa</Form.Label>
                      <Form.Select
                        name="mesa"
                        value={formData.mesa}
                        onChange={(e) => handleFormChange(e, null, 'mesa')}
                        required
                      >
                        <option value="">Selecione uma mesa</option>
                        {tables.map((mesa) => (
                          <option key={mesa._id} value={mesa._id}>
                            Mesa {mesa.numeroMesa}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="assento">
                      <Form.Label>Assento</Form.Label>
                      <Form.Control
                        type="text"
                        name="assento"
                        value={formData.assento}
                        onChange={(e) => handleFormChange(e, null, 'assento')}
                        placeholder="Assento"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              )}

              {formData.tipoPedido === 'entrega' && (
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="clienteId">
                      <Form.Label>Cliente</Form.Label>
                      <Form.Select
                        name="clienteId"
                        value={formData.clienteId}
                        onChange={(e) => handleFormChange(e, null, 'clienteId')}
                        required
                      >
                        <option value="">Selecione um cliente</option>
                        {customers.map((cliente) => (
                          <option key={cliente._id} value={cliente._id}>
                            {cliente.nome}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="enderecoEntrega">
                      <Form.Label>Endereço de Entrega</Form.Label>
                      <Form.Control
                        type="text"
                        name="enderecoEntrega"
                        value={formData.enderecoEntrega}
                        onChange={(e) => handleFormChange(e, null, 'enderecoEntrega')}
                        placeholder="Endereço de entrega"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
              )}

              {/* Campo Observação */}
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3" controlId="observacao">
                    <Form.Label>Observação</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="observacao"
                      value={formData.observacao}
                      onChange={(e) => handleFormChange(e, null, 'observacao')}
                      placeholder="Insira uma observação para o pedido..."
                      rows={3}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <h5>Itens do Pedido</h5>
              {formData.itens.map((item, index) => {
                const product = products.find((p) => p._id === item.product);
                return (
                  <Row key={index} className="mb-3">
                    <Col md={4}>
                      <Form.Group controlId={`itens.${index}.product`}>
                        <Form.Label>Produto</Form.Label>
                        <Form.Select
                          name="product"
                          value={item.product}
                          onChange={(e) => handleFormChange(e, index, 'itens')}
                          required
                        >
                          <option value="">Selecione um produto</option>
                          {products.map((produto) => (
                            <option key={produto._id} value={produto._id}>
                              {produto.nome} - R$ {produto.preco.toFixed(2)}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group controlId={`itens.${index}.quantidade`}>
                        <Form.Label>Quantidade</Form.Label>
                        <Form.Control
                          type="number"
                          name="quantidade"
                          value={item.quantidade}
                          min="1"
                          onChange={(e) => handleFormChange(e, index, 'itens')}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group controlId={`itens.${index}.tipo`}>
                        <Form.Label>Tipo</Form.Label>
                        <Form.Select
                          name="tipo"
                          value={item.tipo}
                          onChange={(e) => handleFormChange(e, index, 'itens')}
                          required
                        >
                          <option value="entrada">Entrada</option>
                          <option value="prato principal">Prato Principal</option>
                          <option value="sobremesa">Sobremesa</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={2} className="d-flex align-items-end">
                      <Button variant="danger" onClick={() => handleRemoveItem(index)}>
                        Remover
                      </Button>
                    </Col>
                  </Row>
                );
              })}

              <Button variant="secondary" onClick={handleAddItem}>
                Adicionar Item
              </Button>

              <Button variant="primary" type="submit" className="mt-3">
                Atualizar Pedido
              </Button>
            </Form>
          )}
        </Modal.Body>
      </Modal>

      {/* Modal para Confirmação de Exclusão */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmação de Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza que deseja excluir o pedido #{orderToDelete?.orderNumber}?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Excluir
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Paginação */}
      {totalPages > 1 && (
        <Pagination className="justify-content-center">
          <Pagination.First onClick={() => paginate(1)} disabled={currentPage === 1} />
          <Pagination.Prev onClick={prevPage} disabled={currentPage === 1} />
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
            <Pagination.Item
              key={number}
              active={number === currentPage}
              onClick={() => paginate(number)}
            >
              {number}
            </Pagination.Item>
          ))}
          <Pagination.Next onClick={nextPage} disabled={currentPage === totalPages} />
          <Pagination.Last onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} />
        </Pagination>
      )}
    </Container>
  );
}

export default OrderList;
