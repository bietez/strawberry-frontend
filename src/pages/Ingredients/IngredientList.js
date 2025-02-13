// src/pages/Ingredients/IngredientList.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Modal,
} from 'react-bootstrap';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import IngredientForm from './IngredientForm';

function IngredientList() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentIngredient, setCurrentIngredient] = useState(null);

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await api.get('/ingredients');
        setIngredients(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao obter ingredientes:', error);
        setError('Erro ao obter ingredientes.');
        setLoading(false);
        toast.error('Erro ao obter ingredientes: ' + (error.response?.data?.message || error.message));
      }
    };

    fetchIngredients();
  }, []);

  const handleDeleteClick = (ingredient) => {
    setIngredientToDelete(ingredient);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!ingredientToDelete) return;
    try {
      await api.delete(`/ingredients/${ingredientToDelete._id}`);
      setIngredients((prev) => prev.filter((ing) => ing._id !== ingredientToDelete._id));
      toast.success('Ingrediente excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir ingrediente:', error);
      toast.error('Erro ao excluir ingrediente: ' + (error.response?.data?.message || error.message));
    } finally {
      setShowDeleteModal(false);
      setIngredientToDelete(null);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setIngredientToDelete(null);
  };

  const handleOpenCreateModal = () => {
    setFormError(null);
    setCurrentIngredient(null);
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setFormError(null);
  };

  const handleOpenEditModal = (ingredient) => {
    setCurrentIngredient(ingredient);
    setFormError(null);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setCurrentIngredient(null);
    setFormError(null);
  };

  const handleCreateIngredient = async (newIngredient) => {
    setFormLoading(true);
    setFormError(null);
    try {
      const response = await api.post('/ingredients', newIngredient);
      setIngredients((prev) => [...prev, response.data]);
      toast.success('Ingrediente criado com sucesso!');
      handleCloseCreateModal();
    } catch (error) {
      console.error('Erro ao criar ingrediente:', error);
      setFormError(error.response?.data?.message || 'Erro ao criar ingrediente.');
      toast.error('Erro ao criar ingrediente: ' + (error.response?.data?.message || error.message));
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateIngredient = async (updatedIngredient) => {
    if (!currentIngredient) return;
    setFormLoading(true);
    setFormError(null);
    try {
      const response = await api.put(`/ingredients/${currentIngredient._id}`, updatedIngredient);
      setIngredients((prev) =>
        prev.map((ing) => (ing._id === currentIngredient._id ? response.data : ing))
      );
      toast.success('Ingrediente atualizado com sucesso!');
      handleCloseEditModal();
    } catch (error) {
      console.error('Erro ao atualizar ingrediente:', error);
      setFormError(error.response?.data?.message || 'Erro ao atualizar ingrediente.');
      toast.error('Erro ao atualizar ingrediente: ' + (error.response?.data?.message || error.message));
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <Container className="my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Ingredientes</h2>
        <Button variant="success" onClick={handleOpenCreateModal}>
          Novo Ingrediente
        </Button>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Carregando...</span>
          </Spinner>
          <div className="mt-2">Carregando ingredientes...</div>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : ingredients.length === 0 ? (
        <Alert variant="info">Nenhum ingrediente encontrado.</Alert>
      ) : (
        <Row>
          {ingredients.map((ingredient) => (
            <Col
              key={ingredient._id}
              xs={12}
              sm={6}
              md={4}
              lg={3}
              xl={2}
              className="d-flex align-items-stretch mb-4"
            >
              <Card className="w-100">
                <Card.Img
                  variant="top"
                  src={
                    ingredient.imagem ||
                    'https://placehold.co/150?text=Ingrediente+Indisponível'
                  }
                  alt={ingredient.nome}
                  style={{ height: '150px', objectFit: 'cover' }}
                />
                <Card.Body className="d-flex flex-column">
                  <Card.Title>{ingredient.nome}</Card.Title>
                  <Card.Text>
                    <strong>Unidade:</strong> {ingredient.unidadeMedida}<br />
                    <strong>Estoque:</strong> {ingredient.quantidadeEstoque}<br />
                    <strong>Preço de Custo:</strong>{' '}
                    {ingredient.precoCusto
                      ? new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(ingredient.precoCusto)
                      : '-'}
                  </Card.Text>
                  <div className="mt-auto d-flex justify-content-end">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleOpenEditModal(ingredient)}
                      aria-label={`Editar ${ingredient.nome}`}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteClick(ingredient)}
                      aria-label={`Excluir ${ingredient.nome}`}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {ingredientToDelete && (
            <p>
              Tem certeza que deseja excluir o ingrediente{' '}
              <strong>{ingredientToDelete.nome}</strong>?
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

      {/* Modal para Criar Novo Ingrediente */}
      <Modal show={showCreateModal} onHide={handleCloseCreateModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Novo Ingrediente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <IngredientForm
            onSubmit={handleCreateIngredient}
            onClose={handleCloseCreateModal}
            loading={formLoading}
            error={formError}
          />
        </Modal.Body>
      </Modal>

      {/* Modal para Editar Ingrediente */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Ingrediente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <IngredientForm
            initialData={currentIngredient}
            onSubmit={handleUpdateIngredient}
            onClose={handleCloseEditModal}
            loading={formLoading}
            error={formError}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default IngredientList;
