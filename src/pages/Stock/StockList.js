// src/pages/Stock/StockList.js
import React, { useEffect, useState, useMemo } from 'react';
import api from '../../services/api';
import {
  Table,
  Container,
  Alert,
  Spinner,
  Button,
  Form,
  Row,
  Col,
  Toast,
  ToastContainer,
  Modal,
  Pagination,
} from 'react-bootstrap';
import { toast } from 'react-toastify';

function StockList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [toastState, setToastState] = useState({
    show: false,
    message: '',
    variant: '',
  });

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const [updates, setUpdates] = useState({});
  const [additions, setAdditions] = useState({}); // Novo estado para adições/subtrações

  // Estados para Paginação, Ordenação e Busca
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' ou 'desc'
  const [sortField, setSortField] = useState('nome'); // 'nome' ou 'quantidadeEstoque'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      if (Array.isArray(response.data)) {
        setProducts(response.data);
        setLoading(false);
      } else {
        throw new Error('Formato de dados inesperado da API.');
      }
    } catch (error) {
      console.error('Erro ao obter produtos:', error);
      const message = error.response?.data?.message || 'Erro ao obter produtos.';
      const details = error.response?.data?.error || '';
      setError(`${message} ${details}`);
      setLoading(false);
    }
  };

  // Função para lidar com a mudança no campo de atualização
  const handleChange = (e, productId) => {
    const value = e.target.value;
    setUpdates((prevUpdates) => ({
      ...prevUpdates,
      [productId]: value,
    }));
  };

  // Função para lidar com a atualização do estoque
  const handleUpdateStock = async (productId) => {
    const newQuantity = Number(updates[productId]);
    if (isNaN(newQuantity) || newQuantity < 0) {
      setToastState({
        show: true,
        message: 'Quantidade inválida. Por favor, insira um número positivo.',
        variant: 'warning',
      });
      return;
    }

    try {
      await api.put(`/stock/${productId}`, { quantidadeEstoque: newQuantity });
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === productId
            ? { ...product, quantidadeEstoque: newQuantity }
            : product
        )
      );
      setUpdates((prevUpdates) => ({
        ...prevUpdates,
        [productId]: '',
      }));
      setToastState({
        show: true,
        message: 'Estoque atualizado com sucesso!',
        variant: 'success',
      });
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      const message = error.response?.data?.message || 'Erro ao atualizar estoque.';
      setModalMessage(message);
      setShowModal(true);
    }
  };

  // Função para lidar com a mudança no campo de adição
  const handleAddChange = (e, productId) => {
    const value = e.target.value;
    setAdditions((prevAdditions) => ({
      ...prevAdditions,
      [productId]: value,
    }));
  };

  // Função para lidar com a adição/subtração do estoque
  const handleAddStock = async (productId) => {
    const addition = Number(additions[productId]);
    if (isNaN(addition)) {
      setToastState({
        show: true,
        message: 'Quantidade inválida. Por favor, insira um número.',
        variant: 'warning',
      });
      return;
    }

    const product = products.find((p) => p._id === productId);
    if (!product) {
      setToastState({
        show: true,
        message: 'Produto não encontrado.',
        variant: 'danger',
      });
      return;
    }

    const newQuantity = product.quantidadeEstoque + addition;

    if (newQuantity < 0) {
      setToastState({
        show: true,
        message: 'Quantidade resultante não pode ser negativa.',
        variant: 'warning',
      });
      return;
    }

    try {
      await api.put(`/stock/${productId}`, { quantidadeEstoque: newQuantity });
      setProducts((prevProducts) =>
        prevProducts.map((p) =>
          p._id === productId ? { ...p, quantidadeEstoque: newQuantity } : p
        )
      );
      setAdditions((prevAdditions) => ({
        ...prevAdditions,
        [productId]: '',
      }));
      setToastState({
        show: true,
        message: 'Estoque atualizado com sucesso!',
        variant: 'success',
      });
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      const message = error.response?.data?.message || 'Erro ao atualizar estoque.';
      setModalMessage(message);
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalMessage('');
  };

  // Função para lidar com a ordenação
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // Função para lidar com a busca
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Aplicar a filtragem com base no termo de busca
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter((product) =>
      product.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  // Aplicar a ordenação aos dados filtrados
  const sortedProducts = useMemo(() => {
    let sortable = [...filteredProducts];
    sortable.sort((a, b) => {
      let aField, bField;

      if (sortField === 'nome') {
        aField = a.nome.toLowerCase();
        bField = b.nome.toLowerCase();
      } else if (sortField === 'quantidadeEstoque') {
        aField = a.quantidadeEstoque;
        bField = b.quantidadeEstoque;
      }

      if (aField < bField) return sortOrder === 'asc' ? -1 : 1;
      if (aField > bField) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sortable;
  }, [filteredProducts, sortOrder, sortField]);

  // Aplicar a paginação aos dados ordenados
  const paginatedProducts = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
  }, [sortedProducts, currentPage, itemsPerPage]);

  // Calcular o número total de páginas com base nos produtos filtrados
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Funções para navegar entre páginas
  const handlePrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Carregando produtos...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <Alert.Heading>Erro</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Gerenciamento de Estoque</h2>

      {/* Campo de Busca */}
      <Row className="mb-3">
        <Col xs={12} md={6}>
          <Form.Control
            type="text"
            placeholder="Buscar por nome do produto..."
            value={searchTerm}
            onChange={handleSearchChange}
            aria-label="Buscar por nome do produto"
          />
        </Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th onClick={() => handleSort('nome')} style={{ cursor: 'pointer' }}>
              Nome do Produto {sortField === 'nome' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('quantidadeEstoque')} style={{ cursor: 'pointer' }}>
              Estoque Atual {sortField === 'quantidadeEstoque' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th>Atualizar Estoque</th>
          </tr>
        </thead>
        <tbody>
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((product) => (
              <tr key={product._id}>
                <td>{product.nome}</td>
                <td>{product.quantidadeEstoque}</td>
                <td>
                  {/* Seção para Atualizar Estoque */}
                  <Row className="align-items-center mb-2">
                    <Col xs={7}>
                      <Form.Control
                        type="number"
                        min="0"
                        placeholder="Nova quantidade"
                        value={updates[product._id] || ''}
                        onChange={(e) => handleChange(e, product._id)}
                        size="sm"
                        aria-label={`Nova quantidade para ${product.nome}`}
                      />
                    </Col>
                    <Col xs={5}>
                      <Button
                        variant="primary"
                        onClick={() => handleUpdateStock(product._id)}
                        disabled={updates[product._id] === ''}
                        size="sm"
                        aria-label={`Atualizar estoque do produto ${product.nome}`}
                      >
                        Atualizar
                      </Button>
                    </Col>
                  </Row>
                  
                  {/* Seção para Adicionar/Subtrair Estoque */}
                  <Row className="align-items-center">
                    <Col xs={7}>
                      <Form.Control
                        type="number"
                        placeholder="Adicionar/Subtrair"
                        value={additions[product._id] || ''}
                        onChange={(e) => handleAddChange(e, product._id)}
                        size="sm"
                        aria-label={`Adicionar ou subtrair quantidade para ${product.nome}`}
                      />
                    </Col>
                    <Col xs={5}>
                      <Button
                        variant="success"
                        onClick={() => handleAddStock(product._id)}
                        disabled={additions[product._id] === ''}
                        size="sm"
                        aria-label={`Adicionar/subtrair estoque do produto ${product.nome}`}
                      >
                        Adicionar
                      </Button>
                    </Col>
                  </Row>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center">
                Nenhum produto encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Componentes de Paginação */}
      {totalPages > 1 && (
        <Pagination className="justify-content-center">
          <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
          <Pagination.Prev onClick={handlePrevPage} disabled={currentPage === 1} />
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
            <Pagination.Item
              key={number}
              active={number === currentPage}
              onClick={() => setCurrentPage(number)}
            >
              {number}
            </Pagination.Item>
          ))}
          <Pagination.Next onClick={handleNextPage} disabled={currentPage === totalPages} />
          <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
        </Pagination>
      )}

      {/* Toast para Feedback */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          onClose={() => setToastState({ ...toastState, show: false })}
          show={toastState.show}
          delay={3000}
          autohide
          bg={toastState.variant}
        >
          <Toast.Header>
            <strong className="me-auto">
              {toastState.variant === 'success' ? 'Sucesso' : 'Aviso'}
            </strong>
            <small>Agora</small>
          </Toast.Header>
          <Toast.Body className="text-white">{toastState.message}</Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Modal de Erro */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Erro</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default StockList;
