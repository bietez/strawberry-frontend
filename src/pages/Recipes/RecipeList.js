// src/pages/Team/RecipeList.js
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
  Pagination,
  Row,
  Col,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';

function RecipeList() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [recipesPerPage] = useState(10);

  // Estados para Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const response = await api.get('/recipes');
      setRecipes(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao obter receitas:', error);
      setError('Erro ao obter receitas.');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta receita?')) {
      try {
        await api.delete(`/recipes/${id}`);
        setRecipes(recipes.filter((recipe) => recipe._id !== id));
        toast.success('Receita excluída com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir receita:', error);
        toast.error('Erro ao excluir receita.');
      }
    }
  };

  // Funções para Paginação
  const indexOfLastRecipe = currentPage * recipesPerPage;
  const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
  const currentRecipes = recipes.slice(indexOfFirstRecipe, indexOfLastRecipe);
  const totalPages = Math.ceil(recipes.length / recipesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Funções para Modal
  const handleShowModal = (recipe) => {
    setSelectedRecipe(recipe);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRecipe(null);
  };

  // Renderizar Paginação
  const renderPagination = () => {
    let items = [];
    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => paginate(number)}
        >
          {number}
        </Pagination.Item>
      );
    }
    return (
      <Pagination className="justify-content-center">
        <Pagination.First
          onClick={() => paginate(1)}
          disabled={currentPage === 1}
        />
        <Pagination.Prev
          onClick={() => currentPage > 1 && paginate(currentPage - 1)}
          disabled={currentPage === 1}
        />
        {items}
        <Pagination.Next
          onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
        />
        <Pagination.Last
          onClick={() => paginate(totalPages)}
          disabled={currentPage === totalPages}
        />
      </Pagination>
    );
  };

  return (
    <Container className="my-5">
      <Row className="mb-4">
        <Col>
          <h2>Receitas</h2>
        </Col>
        <Col className="text-end">
          <Link to="/recipes/new" className="btn btn-success">
            Nova Receita
          </Link>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </Spinner>
          <div>Carregando receitas...</div>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>Nome</th>
                <th className="text-end">Ações</th> {/* Ações alinhadas à direita */}
              </tr>
            </thead>
            <tbody>
              {currentRecipes.length > 0 ? (
                currentRecipes.map((recipe) => (
                  <tr key={recipe._id}>
                    <td>{recipe.nome}</td>
                    <td className="text-end">
                      <Button
                        variant="primary"
                        size="sm"
                        className="me-2"
                        onClick={() => navigate(`/recipes/${recipe._id}`)}
                        aria-label={`Editar ${recipe.nome}`}
                      >
                        <FontAwesomeIcon icon={faPenToSquare} />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        className="me-2"
                        onClick={() => handleDelete(recipe._id)}
                        aria-label={`Excluir ${recipe.nome}`}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                      <Button
                        variant="info"
                        size="sm"
                        onClick={() => handleShowModal(recipe)}
                        aria-label={`Ver detalhes de ${recipe.nome}`}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="text-center">
                    Nenhuma receita encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* Renderizar Paginação */}
          {renderPagination()}

          {/* Modal para Detalhes da Receita */}
          <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
            <Modal.Header closeButton>
              <Modal.Title>Detalhes da Receita</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedRecipe ? (
                <>
                  <h4>{selectedRecipe.nome}</h4>
                  <p>
                    <strong>Categoria:</strong> {selectedRecipe.categoria.nome}
                  </p>
                  <p>
                    <strong>Preço de Venda:</strong> R$ {selectedRecipe.precoVenda.toFixed(2)}
                  </p>
                  {selectedRecipe.descricao && (
                    <p>
                      <strong>Descrição:</strong> {selectedRecipe.descricao}
                    </p>
                  )}
                  {selectedRecipe.ingredientes && selectedRecipe.ingredientes.length > 0 && (
                    <>
                      <h5>Ingredientes:</h5>
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th>Ingrediente</th>
                            <th>Quantidade</th>
                            <th>Unidade</th> {/* Nova coluna Unidade */}
                          </tr>
                        </thead>
                        <tbody>
                          {selectedRecipe.ingredientes.map((item) => (
                            <tr key={item._id}>
                              <td>{item.ingrediente.nome}</td>
                              <td>{item.quantidade}</td>
                              <td>{item.unidade}</td> {/* Exibindo Unidade */}
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </>
                  )}
                  {selectedRecipe.imagem && (
                    <div className="text-center mt-3">
                      <img
                        src={selectedRecipe.imagem}
                        alt={selectedRecipe.nome}
                        className="img-fluid"
                        style={{ maxHeight: '300px' }}
                      />
                    </div>
                  )}
                </>
              ) : (
                <p>Carregando...</p>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Fechar
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </Container>
  );
}

export default RecipeList;
