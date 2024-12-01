// src/pages/Products/ProductList.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';
import {
  Spinner,
  Table,
  Button,
  Container,
  Alert,
  Modal,
  Form,
  Row,
  Col,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import InputMask from 'react-input-mask';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // Lista de categorias
  const [loading, setLoading] = useState(true); // Controle de carregamento
  const [error, setError] = useState(null); // Controle de erros
  const [showModal, setShowModal] = useState(false); // Controle do Modal
  const [productToEdit, setProductToEdit] = useState(null); // Produto selecionado para edição
  const navigate = useNavigate();

  // Função para buscar produtos e categorias
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          api.get('/products'),
          api.get('/categories'), // Supondo que exista este endpoint
        ]);
        setProducts(productsResponse.data);
        setCategories(categoriesResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao obter dados:', error);
        setError('Erro ao obter dados.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Função para abrir o Modal de Edição
  const handleEditClick = (product) => {
    setProductToEdit(product);
    setShowModal(true);
  };

  // Função para fechar o Modal
  const handleCloseModal = () => {
    setShowModal(false);
    setProductToEdit(null);
  };

  // Função para atualizar o produto
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedProduct = { ...productToEdit };
      // Convertendo preco para número
      updatedProduct.preco = parseFloat(updatedProduct.preco);
      // Convertendo quantidadeEstoque para número
      updatedProduct.quantidadeEstoque = parseInt(updatedProduct.quantidadeEstoque, 10);

      const response = await api.put(`/products/${productToEdit._id}`, updatedProduct);
      // Atualizar a lista de produtos no estado
      setProducts(
        products.map((prod) =>
          prod._id === productToEdit._id ? response.data.product : prod
        )
      );
      toast.success('Produto atualizado com sucesso!');
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao atualizar produto';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Função para deletar produto com confirmação via Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setLoading(true);
    try {
      await api.delete(`/products/${productToDelete._id}`);
      setProducts(products.filter((p) => p._id !== productToDelete._id));
      toast.success('Produto excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast.error('Erro ao excluir produto');
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
        <div>Carregando produtos...</div>
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
        <h2>Produtos</h2>
        <Link to="/products/new" className="btn btn-success">
          Novo Produto
        </Link>
      </div>
      <div className="table-responsive">
        <Table striped bordered hover>
          <thead className="table-dark">
            <tr>
              <th>Nome</th>
              <th>Preço</th>
              <th>Categoria</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product._id}>
                  <td>{product.nome}</td>
                  <td>R$ {product.preco.toFixed(2)}</td>
                  <td>{product.categoria?.categoria || '-'}</td>
                  <td>
                    <Button
                      variant="primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEditClick(product)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteClick(product)}
                    >
                      Excluir
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
                  Nenhum produto encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Modal de Edição */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Produto</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpdateProduct}>
          <Modal.Body>
            {productToEdit && (
              <>
                <Form.Group controlId="nome" className="mb-3">
                  <Form.Label>Nome*</Form.Label>
                  <Form.Control
                    type="text"
                    name="nome"
                    value={productToEdit.nome}
                    onChange={(e) =>
                      setProductToEdit({ ...productToEdit, nome: e.target.value })
                    }
                    placeholder="Nome do produto"
                    required
                  />
                </Form.Group>

                <Form.Group controlId="categoria" className="mb-3">
                  <Form.Label>Categoria*</Form.Label>
                  <Form.Select
                    name="categoria"
                    value={productToEdit.categoria}
                    onChange={(e) =>
                      setProductToEdit({ ...productToEdit, categoria: e.target.value })
                    }
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.categoria}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group controlId="preco" className="mb-3">
                  <Form.Label>Preço*</Form.Label>
                  <InputMask
                    mask="99999.99"
                    value={productToEdit.preco}
                    onChange={(e) =>
                      setProductToEdit({ ...productToEdit, preco: e.target.value })
                    }
                    maskChar=""
                  >
                    {(inputProps) => (
                      <Form.Control
                        type="text"
                        name="preco"
                        placeholder="0.00"
                        required
                        {...inputProps}
                      />
                    )}
                  </InputMask>
                  <Form.Text className="text-muted">Exemplo: 99.99</Form.Text>
                </Form.Group>

                <Form.Group controlId="quantidadeEstoque" className="mb-3">
                  <Form.Label>Quantidade em Estoque*</Form.Label>
                  <Form.Control
                    type="number"
                    name="quantidadeEstoque"
                    value={productToEdit.quantidadeEstoque}
                    onChange={(e) =>
                      setProductToEdit({ ...productToEdit, quantidadeEstoque: e.target.value })
                    }
                    placeholder="0"
                    min="0"
                    required
                  />
                </Form.Group>

                <Form.Group controlId="disponivel" className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="disponivel"
                    label="Disponível"
                    checked={productToEdit.disponivel}
                    onChange={(e) =>
                      setProductToEdit({ ...productToEdit, disponivel: e.target.checked })
                    }
                  />
                </Form.Group>

                <Form.Group controlId="descricao" className="mb-3">
                  <Form.Label>Descrição</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="descricao"
                    value={productToEdit.descricao}
                    onChange={(e) =>
                      setProductToEdit({ ...productToEdit, descricao: e.target.value })
                    }
                    placeholder="Descrição do produto"
                  />
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />{' '}
                  Atualizando...
                </>
              ) : (
                'Atualizar'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {productToDelete && (
            <p>
              Tem certeza que deseja excluir o produto <strong>{productToDelete.nome}</strong>?
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Excluir
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ProductList;
