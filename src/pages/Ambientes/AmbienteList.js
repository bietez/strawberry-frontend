// src/pages/Ambientes/AmbienteList.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  Spinner,
  Table,
  Button,
  Container,
  Alert,
  Modal,
  Form
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

function AmbienteList() {
  const [ambientes, setAmbientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal de Criação/Edição
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentAmbiente, setCurrentAmbiente] = useState({
    _id: '',
    nome: '',
    limitePessoas: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  // Modal de Exclusão
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ambienteToDelete, setAmbienteToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // -----------------------------------------------
  // 1) Carrega ambientes ao montar o componente
  // -----------------------------------------------
  useEffect(() => {
    fetchAmbientes();
  }, []);

  const fetchAmbientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/ambientes');
      const sortedAmbientes = response.data.sort((a, b) => a.order - b.order);
      setAmbientes(sortedAmbientes);
    } catch (err) {
      console.error('Erro ao obter ambientes:', err);
      setError(err.response?.data?.message || 'Erro ao obter ambientes.');
      toast.error(
        `Erro ao obter ambientes: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------------
  // 2) Funções CRUD de criação/edição de ambientes
  // -----------------------------------------------
  const handleShowCreateModal = () => {
    setIsEditMode(false);
    setCurrentAmbiente({ _id: '', nome: '', limitePessoas: '' });
    setFormError(null);
    setShowFormModal(true);
  };

  const handleShowEditModal = (amb) => {
    setIsEditMode(true);
    setCurrentAmbiente({
      _id: amb._id.toString(),
      nome: amb.nome,
      limitePessoas: amb.limitePessoas
    });
    setFormError(null);
    setShowFormModal(true);
  };

  const handleCloseFormModal = () => {
    setShowFormModal(false);
    setCurrentAmbiente({ _id: '', nome: '', limitePessoas: '' });
    setFormError(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    // Validações simples
    if (!currentAmbiente.nome || !currentAmbiente.limitePessoas) {
      setFormError('Por favor, preencha todos os campos obrigatórios.');
      setFormLoading(false);
      return;
    }

    try {
      if (isEditMode) {
        const { data } = await api.put(`/ambientes/${currentAmbiente._id}`, {
          nome: currentAmbiente.nome,
          limitePessoas: parseInt(currentAmbiente.limitePessoas, 10)
        });
        setAmbientes((prev) =>
          prev.map((amb) =>
            amb._id === currentAmbiente._id ? data : amb
          )
        );
        toast.success('Ambiente atualizado com sucesso!');
      } else {
        const { data } = await api.post('/ambientes', {
          nome: currentAmbiente.nome,
          limitePessoas: parseInt(currentAmbiente.limitePessoas, 10)
        });
        setAmbientes((prev) => [...prev, data]);
        toast.success('Ambiente criado com sucesso!');
      }
      handleCloseFormModal();
    } catch (err) {
      console.error('Erro ao salvar ambiente:', err);
      const message = err.response?.data?.message || 'Erro ao salvar ambiente.';
      setFormError(message);
      toast.error(`Erro ao salvar ambiente: ${message}`);
    } finally {
      setFormLoading(false);
    }
  };

  // -----------------------------------------------
  // 3) Funções CRUD de exclusão de ambientes
  // -----------------------------------------------
  const handleShowDeleteModal = (amb) => {
    setAmbienteToDelete(amb);
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setAmbienteToDelete(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!ambienteToDelete) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await api.delete(`/ambientes/${ambienteToDelete._id}`);
      setAmbientes((prev) =>
        prev.filter((amb) => amb._id !== ambienteToDelete._id)
      );
      toast.success('Ambiente excluído com sucesso!');
      handleCloseDeleteModal();
    } catch (err) {
      console.error('Erro ao excluir ambiente:', err);
      const message =
        err.response?.data?.message || 'Erro ao excluir ambiente.';
      setDeleteError(message);
      toast.error(`Erro ao excluir ambiente: ${message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  // -----------------------------------------------
  // 4) Funções para mover o ambiente p/ cima ou p/ baixo
  // -----------------------------------------------
  const moveUp = async (ambiente) => {
    // Se já estiver na primeira posição, não faz nada
    if (ambiente.order === 1) return;

    // Ambiente que está imediatamente acima
    const ambienteAbove = ambientes.find(
      (item) => item.order === ambiente.order - 1
    );
    if (!ambienteAbove) return;

    try {
      // Atualiza localmente
      setAmbientes((prev) =>
        prev.map((amb) => {
          if (amb._id === ambiente._id) {
            return { ...amb, order: amb.order - 1 };
          }
          if (amb._id === ambienteAbove._id) {
            return { ...amb, order: amb.order + 1 };
          }
          return amb;
        })
      );

      // Duas requisições PUT: uma para o item que sobe e outra para o que desce
      // 1) Ambiente que está subindo
      await api.put(`/ambientes/${ambiente._id}`, {
        order: ambiente.order - 1
      });
      // 2) Ambiente que estava acima
      await api.put(`/ambientes/${ambienteAbove._id}`, {
        order: ambienteAbove.order + 1
      });

      toast.success('Ambiente movido para cima com sucesso!');
    } catch (err) {
      console.error('Erro ao mover ambiente para cima:', err);
      toast.error('Erro ao mover ambiente para cima.');
      fetchAmbientes(); // Reverte a ordem no frontend
    }
  };

  const moveDown = async (ambiente) => {
    // Se já estiver na última posição, não faz nada
    if (ambiente.order === ambientes.length) return;

    // Ambiente que está imediatamente abaixo
    const ambienteBelow = ambientes.find(
      (item) => item.order === ambiente.order + 1
    );
    if (!ambienteBelow) return;

    try {
      // Atualiza localmente
      setAmbientes((prev) =>
        prev.map((amb) => {
          if (amb._id === ambiente._id) {
            return { ...amb, order: amb.order + 1 };
          }
          if (amb._id === ambienteBelow._id) {
            return { ...amb, order: amb.order - 1 };
          }
          return amb;
        })
      );

      // Duas requisições PUT: uma para o item que desce e outra para o que sobe
      // 1) Ambiente que está descendo
      await api.put(`/ambientes/${ambiente._id}`, {
        order: ambiente.order + 1
      });
      // 2) Ambiente que estava abaixo
      await api.put(`/ambientes/${ambienteBelow._id}`, {
        order: ambienteBelow.order - 1
      });

      toast.success('Ambiente movido para baixo com sucesso!');
    } catch (err) {
      console.error('Erro ao mover ambiente para baixo:', err);
      toast.error('Erro ao mover ambiente para baixo.');
      fetchAmbientes(); // Reverte a ordem no frontend
    }
  };

  // -----------------------------------------------
  // 5) Render do componente
  // -----------------------------------------------
  return (
    <Container className="my-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Ambientes</h2>
        <Button variant="success" onClick={handleShowCreateModal}>
          Novo Ambiente
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" />
          <div className="mt-2">Carregando ambientes...</div>
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th style={{ width: '60px' }}>Ordem</th>
              <th>Nome</th>
              <th>Limite de Pessoas</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {ambientes.length > 0 ? (
              ambientes.map((amb) => (
                <tr key={amb._id}>
                  <td>{amb.order}</td>
                  <td>{amb.nome}</td>
                  <td>{amb.limitePessoas}</td>
                  <td>
                    <Button
                      variant="primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleShowEditModal(amb)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      className="me-2"
                      onClick={() => handleShowDeleteModal(amb)}
                    >
                      Excluir
                    </Button>
                    {/* Botão de Subir */}
                    <Button
                      variant="secondary"
                      size="sm"
                      className="me-1"
                      onClick={() => moveUp(amb)}
                      disabled={amb.order === 1}
                    >
                      <FaArrowUp />
                    </Button>
                    {/* Botão de Descer */}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => moveDown(amb)}
                      disabled={amb.order === ambientes.length}
                    >
                      <FaArrowDown />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
                  Nenhum ambiente encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      {/* Modal de Criação/Edição */}
      <Modal show={showFormModal} onHide={handleCloseFormModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditMode ? 'Editar Ambiente' : 'Novo Ambiente'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleFormSubmit}>
          <Modal.Body>
            {formError && <Alert variant="danger">{formError}</Alert>}
            <Form.Group controlId="nome" className="mb-3">
              <Form.Label>Nome*</Form.Label>
              <Form.Control
                type="text"
                placeholder="Digite o nome do ambiente"
                value={currentAmbiente.nome}
                onChange={(e) =>
                  setCurrentAmbiente({
                    ...currentAmbiente,
                    nome: e.target.value
                  })
                }
                required
              />
            </Form.Group>
            <Form.Group controlId="limitePessoas" className="mb-3">
              <Form.Label>Limite de Pessoas*</Form.Label>
              <Form.Control
                type="number"
                placeholder="Digite o limite de pessoas"
                value={currentAmbiente.limitePessoas}
                onChange={(e) =>
                  setCurrentAmbiente({
                    ...currentAmbiente,
                    limitePessoas: e.target.value
                  })
                }
                min="1"
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseFormModal}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={formLoading}>
              {formLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />{' '}
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal de Exclusão */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleteError && <Alert variant="danger">{deleteError}</Alert>}
          {ambienteToDelete && (
            <p>
              Tem certeza que deseja excluir o ambiente{' '}
              <strong>{ambienteToDelete.nome}</strong>?
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmDelete}
            disabled={deleteLoading}
          >
            {deleteLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />{' '}
                Excluindo...
              </>
            ) : (
              'Excluir'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default AmbienteList;
