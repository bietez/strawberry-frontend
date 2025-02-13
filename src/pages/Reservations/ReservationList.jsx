import React, { useEffect, useState } from 'react';
import {
  Container,
  Table,
  Button,
  Spinner,
  Alert,
  Modal,
  Form as BootstrapForm,
} from 'react-bootstrap';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import api from '../../services/api';

// Exemplo de componente ReservationList
function ReservationList() {
  const [reservations, setReservations] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mesas p/ criação de reserva
  const [tables, setTables] = useState([]);

  // Modais
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState(null);
  const [reservationToShow, setReservationToShow] = useState(null);

  // Se quiser editar ou cancelar, pode criar:
  const [showEditModal, setShowEditModal] = useState(false);
  const [reservationToEdit, setReservationToEdit] = useState(null);

  // Para ajudar no recalcular data, etc.
  const [editDataReserva, setEditDataReserva] = useState('');

  // ----------------------------------------------------------------------------
  // 1) Buscar reservas (GET /api/reservations)
  // ----------------------------------------------------------------------------
  const fetchReservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await api.get('/reservations', {
        params: { page: currentPage, limit: itemsPerPage },
      });
      if (resp.data && Array.isArray(resp.data.reservations)) {
        setReservations(resp.data.reservations);
        setTotalPages(resp.data.totalPages || 1);
      } else {
        setReservations([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Erro ao obter reservas:', err);
      setError('Erro ao obter reservas.');
      toast.error('Erro ao obter reservas.');
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------------------------
  // 2) Carrega as mesas p/ criar reserva (GET /api/tables)
  // ----------------------------------------------------------------------------
  const fetchTables = async () => {
    try {
      const resp = await api.get('/tables');
      // Se vier array
      if (Array.isArray(resp.data)) {
        setTables(resp.data);
      } else {
        // Se vier { tables: [...] } etc.
        const arr = resp.data.tables || [];
        setTables(arr);
      }
    } catch (err) {
      console.error('Erro ao obter mesas:', err);
      toast.error('Erro ao obter mesas.');
    }
  };

  // ----------------------------------------------------------------------------
  // 3) useEffect: ao montar e ao mudar currentPage => recarrega
  // ----------------------------------------------------------------------------
  useEffect(() => {
    fetchReservations();
  }, [currentPage]);

  // Ao montar, também busca mesas
  useEffect(() => {
    fetchTables();
  }, []);

  // ----------------------------------------------------------------------------
  // 4) Funções de paginação
  // ----------------------------------------------------------------------------
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // ----------------------------------------------------------------------------
  // 5) Verificar se reserva está atrasada (dataReserva < agora?)
  // ----------------------------------------------------------------------------
  const isOverdue = (dataReserva) => {
    const now = new Date();
    const reservaDate = new Date(dataReserva);
    return reservaDate < now;
  };

  // ----------------------------------------------------------------------------
  // 6) Criar reserva (POST /api/reservations)
  // ----------------------------------------------------------------------------
  const handleCreateSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const payload = {
        mesaId: values.mesa, // model pede mesaId
        dataReserva: new Date(values.dataReserva).toISOString(),
        numeroPessoas: parseInt(values.numeroPessoas, 10),
        nomeCliente: values.nomeCliente,
        telefoneCliente: values.telefoneCliente,
      };
      const resp = await api.post('/reservations', payload);
      toast.success('Reserva criada com sucesso!');
      resetForm();
      setShowCreateModal(false);
      fetchReservations();
    } catch (err) {
      console.error('Erro ao criar reserva:', err);
      toast.error('Erro ao criar reserva.');
    } finally {
      setSubmitting(false);
    }
  };

  // ----------------------------------------------------------------------------
  // 7) Exibir detalhes
  // ----------------------------------------------------------------------------
  const handleShowDetails = (reservation) => {
    setReservationToShow(reservation);
    setShowDetailsModal(true);
  };
  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setReservationToShow(null);
  };

  // ----------------------------------------------------------------------------
  // 8) Excluir reserva (DELETE /api/reservations/:id)
  // ----------------------------------------------------------------------------
  const handleDeleteClick = (reservation) => {
    setReservationToDelete(reservation);
    setShowDeleteModal(true);
  };
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setReservationToDelete(null);
  };
  const handleConfirmDelete = async () => {
    if (!reservationToDelete) return;
    try {
      await api.delete(`/reservations/${reservationToDelete._id}`);
      toast.success('Reserva excluída com sucesso!');
      fetchReservations();
    } catch (err) {
      console.error('Erro ao excluir reserva:', err);
      toast.error('Erro ao excluir reserva.');
    } finally {
      setShowDeleteModal(false);
      setReservationToDelete(null);
    }
  };

  // ----------------------------------------------------------------------------
  // 9) Editar reserva (PUT /api/reservations/:id) - se existir
  //    (Caso queira editar TUDO; seu code atual tem /cancel e /delete)
  // ----------------------------------------------------------------------------
  const handleOpenEditModal = (reservation) => {
    setReservationToEdit(reservation);
    if (reservation.dataReserva) {
      const isoLocal = new Date(reservation.dataReserva).toISOString().slice(0, 16);
      setEditDataReserva(isoLocal);
    } else {
      setEditDataReserva('');
    }
    setShowEditModal(true);
  };
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setReservationToEdit(null);
    setEditDataReserva('');
  };
  const handleEditSubmit = async (values, { setSubmitting }) => {
    if (!reservationToEdit) return;
    try {
      // Montar payload
      const payload = {
        mesaId: values.mesa,
        dataReserva: new Date(values.dataReserva).toISOString(),
        numeroPessoas: parseInt(values.numeroPessoas, 10),
        nomeCliente: values.nomeCliente,
        telefoneCliente: values.telefoneCliente,
        status: values.status,
      };
      await api.put(`/reservations/${reservationToEdit._id}`, payload);
      toast.success('Reserva atualizada com sucesso!');
      fetchReservations();
      handleCloseEditModal();
    } catch (err) {
      console.error('Erro ao atualizar reserva:', err);
      toast.error('Erro ao atualizar reserva.');
    } finally {
      setSubmitting(false);
    }
  };

  // ----------------------------------------------------------------------------
  // 10) (Opcional) Cancelar reserva com /:id/cancel
  // ----------------------------------------------------------------------------
  const handleCancelReservation = async (reservation) => {
    if (!window.confirm('Deseja realmente cancelar esta reserva?')) return;
    try {
      await api.put(`/reservations/${reservation._id}/cancel`);
      toast.success('Reserva cancelada.');
      fetchReservations();
    } catch (err) {
      console.error('Erro ao cancelar reserva:', err);
      toast.error('Erro ao cancelar reserva.');
    }
  };

  // ----------------------------------------------------------------------------
  // Render principal
  // ----------------------------------------------------------------------------
  return (
    <Container className="mt-4">
      <h1>Reservas</h1>
      <Button variant="primary" className="mb-3" onClick={() => setShowCreateModal(true)}>
        Criar Reserva
      </Button>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" />
          <p>Carregando reservas...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : reservations.length === 0 ? (
        <Alert variant="info">Nenhuma reserva encontrada.</Alert>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Telefone</th>
                <th>Mesa</th>
                <th>Ambiente</th>
                <th>Data/Hora</th>
                <th>Pessoas</th>
                <th>Status</th>
                <th>Atrasada?</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((res) => (
                <tr key={res._id}>
                  <td>{res.nomeCliente}</td>
                  <td>{res.telefoneCliente}</td>
                  <td>{res.mesa?.numeroMesa || 'N/A'}</td>
                  <td>{res.mesa?.ambiente?.nome || 'N/A'}</td>
                  <td>
                    {res.dataReserva
                      ? new Date(res.dataReserva).toLocaleString()
                      : 'N/A'}
                  </td>
                  <td>{res.numeroPessoas}</td>
                  <td>{res.status}</td>
                  <td style={{ textAlign: 'center' }}>
                    {isOverdue(res.dataReserva) ? (
                      <span style={{ color: 'red', fontWeight: 'bold' }}>Sim</span>
                    ) : (
                      <span style={{ color: 'green', fontWeight: 'bold' }}>Não</span>
                    )}
                  </td>
                  <td>
                    <Button
                      variant="info"
                      size="sm"
                      className="me-2"
                      onClick={() => handleShowDetails(res)}
                    >
                      Detalhes
                    </Button>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => handleOpenEditModal(res)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      className="me-2"
                      onClick={() => handleDeleteClick(res)}
                    >
                      Excluir
                    </Button>
                    {res.status !== 'cancelada' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCancelReservation(res)}
                      >
                        Cancelar
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <Button variant="secondary" onClick={handlePrevPage} disabled={currentPage === 1}>
                Anterior
              </Button>
              <span>
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="secondary"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}

      {/* Modal: Criar Reserva */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Criar Reserva</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={{
              nomeCliente: '',
              telefoneCliente: '',
              mesa: '',
              dataReserva: '',
              numeroPessoas: 1,
            }}
            validationSchema={Yup.object().shape({
              nomeCliente: Yup.string().required('Nome do cliente é obrigatório.'),
              telefoneCliente: Yup.string().required('Telefone do cliente é obrigatório.'),
              mesa: Yup.string().required('É obrigatório selecionar uma mesa.'),
              dataReserva: Yup.date()
                .min(new Date(), 'Data/hora deve ser futura')
                .required('Data/hora da reserva é obrigatória'),
              numeroPessoas: Yup.number()
                .min(1, 'No mínimo 1 pessoa')
                .required('Número de pessoas é obrigatório'),
            })}
            onSubmit={handleCreateSubmit}
          >
            {({ isSubmitting, handleChange }) => (
              <FormikForm>
                <BootstrapForm.Group className="mb-3" controlId="nomeCliente">
                  <BootstrapForm.Label>Nome do Cliente</BootstrapForm.Label>
                  <Field type="text" name="nomeCliente" className="form-control" />
                  <ErrorMessage name="nomeCliente" component="div" className="text-danger" />
                </BootstrapForm.Group>

                <BootstrapForm.Group className="mb-3" controlId="telefoneCliente">
                  <BootstrapForm.Label>Telefone</BootstrapForm.Label>
                  <Field type="text" name="telefoneCliente" className="form-control" />
                  <ErrorMessage name="telefoneCliente" component="div" className="text-danger" />
                </BootstrapForm.Group>

                <BootstrapForm.Group className="mb-3" controlId="mesa">
                  <BootstrapForm.Label>Mesa</BootstrapForm.Label>
                  <Field as="select" name="mesa" className="form-select">
                    <option value="">Selecione uma mesa</option>
                    {tables.map((table) => (
                      <option key={table._id} value={table._id}>
                        {`Mesa ${table.numeroMesa} - Ambiente ${table.ambiente?.nome || 'N/A'}`}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="mesa" component="div" className="text-danger" />
                </BootstrapForm.Group>

                <BootstrapForm.Group className="mb-3" controlId="dataReserva">
                  <BootstrapForm.Label>Data / Hora da Reserva</BootstrapForm.Label>
                  <Field
                    type="datetime-local"
                    name="dataReserva"
                    className="form-control"
                    onChange={handleChange}
                  />
                  <ErrorMessage name="dataReserva" component="div" className="text-danger" />
                </BootstrapForm.Group>

                <BootstrapForm.Group className="mb-3" controlId="numeroPessoas">
                  <BootstrapForm.Label>Número de Pessoas</BootstrapForm.Label>
                  <Field
                    type="number"
                    name="numeroPessoas"
                    className="form-control"
                    min="1"
                  />
                  <ErrorMessage name="numeroPessoas" component="div" className="text-danger" />
                </BootstrapForm.Group>

                <div className="d-flex justify-content-end">
                  <Button
                    variant="secondary"
                    onClick={() => setShowCreateModal(false)}
                    className="me-2"
                  >
                    Cancelar
                  </Button>
                  <Button variant="primary" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Enviando...' : 'Criar'}
                  </Button>
                </div>
              </FormikForm>
            )}
          </Formik>
        </Modal.Body>
      </Modal>

      {/* Modal: Detalhes da Reserva */}
      <Modal show={showDetailsModal} onHide={handleCloseDetailsModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Detalhes da Reserva</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {reservationToShow ? (
            <>
              <p>
                <strong>Cliente:</strong> {reservationToShow.nomeCliente}
              </p>
              <p>
                <strong>Telefone:</strong> {reservationToShow.telefoneCliente}
              </p>
              <p>
                <strong>Mesa:</strong> {reservationToShow.mesa?.numeroMesa || 'N/A'}
              </p>
              <p>
                <strong>Ambiente:</strong>{' '}
                {reservationToShow.mesa?.ambiente?.nome || 'N/A'}
              </p>
              <p>
                <strong>Data/Hora:</strong>{' '}
                {reservationToShow.dataReserva
                  ? new Date(reservationToShow.dataReserva).toLocaleString()
                  : 'N/A'}
              </p>
              <p>
                <strong>Número de Pessoas:</strong> {reservationToShow.numeroPessoas}
              </p>
              <p>
                <strong>Status:</strong> {reservationToShow.status}
              </p>
              <p>
                <strong>Criado em:</strong>{' '}
                {new Date(reservationToShow.createdAt).toLocaleString()}
              </p>
            </>
          ) : (
            <Spinner animation="border" />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetailsModal}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal: Exclusão */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Excluir Reserva</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {reservationToDelete && (
            <p>
              Deseja realmente excluir a reserva de{' '}
              <strong>{reservationToDelete.nomeCliente}</strong> na mesa{' '}
              <strong>{reservationToDelete.mesa?.numeroMesa}</strong>?
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

      {/* Modal: Editar Reserva (Opcional) */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Reserva</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {reservationToEdit ? (
            <Formik
              enableReinitialize
              initialValues={{
                nomeCliente: reservationToEdit.nomeCliente || '',
                telefoneCliente: reservationToEdit.telefoneCliente || '',
                mesa: reservationToEdit.mesa?._id || '',
                dataReserva: editDataReserva || '',
                numeroPessoas: reservationToEdit.numeroPessoas || 1,
                status: reservationToEdit.status || 'ativa',
              }}
              validationSchema={Yup.object({
                nomeCliente: Yup.string().required('Nome é obrigatório'),
                telefoneCliente: Yup.string().required('Telefone é obrigatório'),
                mesa: Yup.string().required('Selecione a mesa'),
                dataReserva: Yup.date()
                  .min(new Date(), 'Data futura')
                  .required('Data/hora é obrigatória'),
                numeroPessoas: Yup.number()
                  .min(1, 'Min 1 pessoa')
                  .required('Campo obrigatório'),
                status: Yup.string().oneOf(
                  ['ativa', 'concluida', 'cancelada'],
                  'Status inválido'
                ),
              })}
              onSubmit={handleEditSubmit}
            >
              {({ isSubmitting, setFieldValue }) => (
                <FormikForm>
                  <BootstrapForm.Group className="mb-3" controlId="nomeClienteEdit">
                    <BootstrapForm.Label>Nome do Cliente</BootstrapForm.Label>
                    <Field type="text" name="nomeCliente" className="form-control" />
                    <ErrorMessage name="nomeCliente" component="div" className="text-danger" />
                  </BootstrapForm.Group>

                  <BootstrapForm.Group className="mb-3" controlId="telefoneClienteEdit">
                    <BootstrapForm.Label>Telefone</BootstrapForm.Label>
                    <Field type="text" name="telefoneCliente" className="form-control" />
                    <ErrorMessage
                      name="telefoneCliente"
                      component="div"
                      className="text-danger"
                    />
                  </BootstrapForm.Group>

                  <BootstrapForm.Group className="mb-3" controlId="mesaEdit">
                    <BootstrapForm.Label>Mesa</BootstrapForm.Label>
                    <Field as="select" name="mesa" className="form-select">
                      <option value="">Selecione uma mesa</option>
                      {tables.map((t) => (
                        <option key={t._id} value={t._id}>
                          {`Mesa ${t.numeroMesa} - Ambiente ${t.ambiente?.nome || 'N/A'}`}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="mesa" component="div" className="text-danger" />
                  </BootstrapForm.Group>

                  <BootstrapForm.Group className="mb-3" controlId="dataReservaEdit">
                    <BootstrapForm.Label>Data/Hora</BootstrapForm.Label>
                    <Field
                      type="datetime-local"
                      name="dataReserva"
                      className="form-control"
                      onChange={(e) => {
                        setFieldValue('dataReserva', e.target.value);
                        setEditDataReserva(e.target.value);
                      }}
                    />
                    <ErrorMessage name="dataReserva" component="div" className="text-danger" />
                  </BootstrapForm.Group>

                  <BootstrapForm.Group className="mb-3" controlId="numeroPessoasEdit">
                    <BootstrapForm.Label>Número de Pessoas</BootstrapForm.Label>
                    <Field
                      type="number"
                      name="numeroPessoas"
                      className="form-control"
                      min="1"
                    />
                    <ErrorMessage name="numeroPessoas" component="div" className="text-danger" />
                  </BootstrapForm.Group>

                  <BootstrapForm.Group className="mb-3" controlId="statusEdit">
                    <BootstrapForm.Label>Status da Reserva</BootstrapForm.Label>
                    <Field as="select" name="status" className="form-select">
                      <option value="ativa">Ativa</option>
                      <option value="concluida">Concluída</option>
                      <option value="cancelada">Cancelada</option>
                    </Field>
                    <ErrorMessage name="status" component="div" className="text-danger" />
                  </BootstrapForm.Group>

                  <div className="d-flex justify-content-end">
                    <Button
                      variant="secondary"
                      onClick={handleCloseEditModal}
                      className="me-2"
                    >
                      Cancelar
                    </Button>
                    <Button variant="primary" type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Salvando...' : 'Salvar'}
                    </Button>
                  </div>
                </FormikForm>
              )}
            </Formik>
          ) : (
            <Spinner animation="border" />
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default ReservationList;
