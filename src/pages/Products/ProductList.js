// src/pages/Products/ProductList.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import {
  Spinner,
  Table,
  Button,
  Container,
  Alert,
  Modal,
  Form,
  InputGroup,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { NumericFormat } from 'react-number-format';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // Estado para categorias
  const [loading, setLoading] = useState(true); // Controle de carregamento
  const [loadingCategories, setLoadingCategories] = useState(true); // Controle de carregamento de categorias
  const [error, setError] = useState(null); // Controle de erros
  const [errorCategories, setErrorCategories] = useState(null); // Controle de erros de categorias

  // Estados para paginação, pesquisa e ordenação
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // Limit fixo de 10 por página
  const [totalPages, setTotalPages] = useState(1);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('nome'); // Inicializado como 'nome'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' ou 'desc'

  const [showModal, setShowModal] = useState(false); // Controle do Modal de Edição
  const [productToEdit, setProductToEdit] = useState(null); // Produto selecionado para edição

  const [showDeleteModal, setShowDeleteModal] = useState(false); // Controle do Modal de Exclusão
  const [productToDelete, setProductToDelete] = useState(null); // Produto selecionado para exclusão

  // Função para buscar produtos com paginação, pesquisa e ordenação
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm, sortField, sortOrder]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/products/advanced', {
        params: {
          page,
          limit,
          search: searchTerm,
          sort: sortField,
          order: sortOrder,
        },
      });

      if (response.data && Array.isArray(response.data.products)) {
        setProducts(response.data.products);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setProducts([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Erro ao obter produtos:', error);
      setError('Erro ao obter produtos.');
      setProducts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar categorias
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    setErrorCategories(null);
    try {
      const response = await api.get('/categories');
      if (response.data && Array.isArray(response.data)) {
        setCategories(response.data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Erro ao obter categorias:', error);
      setErrorCategories('Erro ao obter categorias.');
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Função para abrir o Modal de Edição
  const handleEditClick = (product) => {
    setProductToEdit({
      ...product,
      categoria: product.categoria ? product.categoria._id : '', // Verifica se categoria existe
    });
    setShowModal(true);
  };

  // Função para fechar o Modal de Edição
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

      // Remover o prefixo "R$ ", pontos (.) de milhares e substituir a vírgula (,) por ponto (.)
      if (typeof updatedProduct.preco === 'string') {
        updatedProduct.preco = parseFloat(
          updatedProduct.preco.replace('R$ ', '').replace(/\./g, '').replace(',', '.')
        );
      }

      // Convertendo quantidadeEstoque para número
      updatedProduct.quantidadeEstoque = parseInt(updatedProduct.quantidadeEstoque, 10);

      // Se a imagem não foi alterada, manter a existente
      if (!updatedProduct.imagem) {
        delete updatedProduct.imagem; // Remove o campo para que o backend não sobrescreva
      }

      const response = await api.put(`/products/${productToEdit._id}`, updatedProduct);
      // Atualizar a lista de produtos no estado
      setProducts(
        products.map((prod) =>
          prod._id === productToEdit._id ? response.data : prod
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

  // Função para abrir o Modal de Exclusão
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  // Função para confirmar a exclusão
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

  // Função para fechar o Modal de Exclusão
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  // Função para lidar com a pesquisa
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Resetar para página 1 ao pesquisar
    fetchProducts();
  };

  // Função para mudar a ordenação
  const handleSort = (field) => {
    if (sortField === field) {
      // Alterna a ordem
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Define novo campo de ordenação
      setSortField(field);
      setSortOrder('asc');
    }
    setPage(1); // Ao alterar a ordenação, volta para a primeira página
  };

  // Função para fazer upload da imagem
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('imagem', file);

    // Obtém o token de autenticação, se estiver armazenado
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    try {
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      console.log('Resposta do upload:', response.data); // Log para depuração
      // Atualiza o campo 'imagem' com a URL retornada
      setProductToEdit((prev) => ({
        ...prev,
        imagem: response.data.imageUrl,
      }));
      toast.success('Imagem carregada com sucesso!');
    } catch (error) {
      console.error('Erro ao carregar imagem:', error.response || error.message);
      const message =
        error.response?.data?.message || error.message || 'Erro desconhecido ao carregar imagem';
      toast.error(`Erro ao carregar imagem: ${message}`);
    }
  };

  // Paginação
  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  return (
    <Container className="my-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Produtos</h2>
        <Link to="/products/new" className="btn btn-success">
          Novo Produto
        </Link>
      </div>

      {/* Barra de Pesquisa */}
      <Form onSubmit={handleSearch} className="mb-3">
        <InputGroup>
          <Form.Control
            type="text"
            placeholder="Buscar por nome, descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="primary" type="submit">
            Pesquisar
          </Button>
        </InputGroup>
      </Form>

      {loading || loadingCategories ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </Spinner>
          <div>Carregando dados...</div>
        </div>
      ) : error || errorCategories ? (
        <>
          {error && <Alert variant="danger">{error}</Alert>}
          {errorCategories && <Alert variant="danger">{errorCategories}</Alert>}
        </>
      ) : (
        <>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead className="table-dark">
                <tr>
                  <th>Imagem</th>
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('nome')}
                  >
                    Nome {sortField === 'nome' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('preco')}
                  >
                    Preço {sortField === 'preco' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('categoria')}
                  >
                    Categoria {sortField === 'categoria' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('quantidadeEstoque')}
                  >
                    Quantidade em Estoque {sortField === 'quantidadeEstoque' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('disponivel')}
                  >
                    Disponível {sortField === 'disponivel' && (sortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((product) => (
                    product && ( // Verifica se product está definido
                      <tr key={product._id}>
                        <td>
                          <img
                            src={product.imagem || 'https://placehold.co/50'}
                            alt={product.nome || 'Produto'}
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                          />
                        </td>
                        <td>{product.nome || '-'}</td>
                        <td>
                          <NumericFormat
                            value={product.preco}
                            displayType={'text'}
                            thousandSeparator="."
                            decimalSeparator=","
                            prefix="R$ "
                            decimalScale={2}
                            fixedDecimalScale={true}
                          />
                        </td>
                        <td>{product.categoria?.categoria || '-'}</td>
                        <td>{product.quantidadeEstoque || '-'}</td>
                        <td>{product.disponivel ? 'Sim' : 'Não'}</td>
                        <td>
                          <Button
                            variant="primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEditClick(product)}
                            aria-label={`Editar ${product.nome}`}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteClick(product)}
                            aria-label={`Excluir ${product.nome}`}
                          >
                            Excluir
                          </Button>
                        </td>
                      </tr>
                    )
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">
                      Nenhum produto encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* Paginação */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <Button
              variant="secondary"
              onClick={handlePrevPage}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <span>
              Página {page} de {totalPages}
            </span>
            <Button
              variant="secondary"
              onClick={handleNextPage}
              disabled={page === totalPages}
            >
              Próxima
            </Button>
          </div>
        </>
      )}

      {/* Modal de Edição */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Produto</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpdateProduct}>
          <Modal.Body>
            {productToEdit ? (
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
                  {loadingCategories ? (
                    <Spinner animation="border" size="sm" />
                  ) : errorCategories ? (
                    <Alert variant="danger">{errorCategories}</Alert>
                  ) : (
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
                  )}
                </Form.Group>

                <Form.Group controlId="preco" className="mb-3">
                  <Form.Label>Preço*</Form.Label>
                  <NumericFormat
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    value={productToEdit.preco}
                    onValueChange={(values) => {
                      const { value } = values;
                      setProductToEdit({ ...productToEdit, preco: value });
                    }}
                    className="form-control"
                    placeholder="0,00"
                    required
                    decimalScale={2}
                    fixedDecimalScale={true}
                  />
                  <Form.Text className="text-muted">Exemplo: 99,99</Form.Text>
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

                {/* Campo de Upload de Imagem */}
                <Form.Group controlId="imagem" className="mb-3">
                  <Form.Label>Imagem do Produto</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.currentTarget.files[0];
                      if (file) {
                        uploadImage(file);
                      }
                    }}
                  />
                  <Form.Text className="text-muted">
                    Selecione uma imagem para o produto.
                  </Form.Text>
                  {/* Exibir a imagem atual ou um placeholder */}
                  {productToEdit.imagem ? (
                    <div className="mt-2">
                      <img
                        src={productToEdit.imagem}
                        alt="Produto Atual"
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                      />
                    </div>
                  ) : (
                    <div className="mt-2">
                      <img
                        src="https://placehold.co/100"
                        alt="Placeholder"
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                      />
                      <div className="text-muted">Nenhuma imagem disponível.</div>
                    </div>
                  )}
                </Form.Group>
              </>
            ) : (
              <div className="text-center">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Carregando...</span>
                </Spinner>
              </div>
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
