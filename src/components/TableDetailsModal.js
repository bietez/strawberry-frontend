// src/components/TableDetailsModal.jsx

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert, Row, Col } from 'react-bootstrap';
import api from '../services/api';
import { toast } from 'react-toastify';

// Componentes de pedidos
import OrderList from './OrderList';
import OrderForm from './OrderForm';

const TableDetailsModal = ({
  show,
  handleClose,
  tableId, // Deve ser uma string
  onReservationDetails,
  handleOpenReservationModal,
  handleMakeOrderFromFreeTable,
  handleCancelReservation,
  handleMakeOrderFromReservedTable,
  movementLocked,
  setSelectedSeat,
  setShowOrderModal,
  refreshTables,
  occupantName, // Opcional: nome do ocupante
}) => {
  const [table, setTable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [pedidos, setPedidos] = useState([]);
  const [loadingPedidos, setLoadingPedidos] = useState(false);
  const [errorPedidos, setErrorPedidos] = useState(null);

  const [seatSeparation, setSeatSeparation] = useState(false);
  const [assentos, setAssentos] = useState([]);

  // Removemos o botão, mas ainda precisamos de feedback se estamos salvando:
  const [savingSeatSeparation, setSavingSeatSeparation] = useState(false);
  const [savingAssentos, setSavingAssentos] = useState(false);

  // Estados para reservas
  const [currentReservationId, setCurrentReservationId] = useState(null);
  const [currentReservationDetails, setCurrentReservationDetails] = useState(null);

  // Estado para atualizar a capacidade
  const [newCapacity, setNewCapacity] = useState(null);

  // Estados internos para o sub-modal de pedido
  const [showOrderModalInternal, setShowOrderModalInternal] = useState(false);
  const [selectedSeatInternal, setSelectedSeatInternal] = useState(null);

  useEffect(() => {
    if (show && tableId) {
      fetchTableDetails();
    }
    return () => {
      setTable(null);
      setPedidos([]);
      setLoadingPedidos(false);
      setErrorPedidos(null);
      setCurrentReservationId(null);
      setCurrentReservationDetails(null);
      setSeatSeparation(false);
      setAssentos([]);
      setNewCapacity(null);
      setShowOrderModalInternal(false);
      setSelectedSeatInternal(null);
    };
    // eslint-disable-next-line
  }, [show, tableId]);

  // ================================
  // 1) Buscar detalhes da mesa
  // ================================
  const fetchTableDetails = async () => {
    setLoading(true);
    setError(null);
    setLoadingPedidos(true);
    setErrorPedidos(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      // Busca detalhes da mesa
      const response = await api.get(`/tables/${tableId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTable(response.data);
      setSeatSeparation(response.data.seatSeparation);
      setAssentos(response.data.assentos);
      setNewCapacity(response.data.capacidade);

      // Busca pedidos ativos
      const ordersRes = await api.get(`/orders?mesaId=${tableId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const activeOrders = Array.isArray(ordersRes.data.orders)
        ? ordersRes.data.orders.filter((o) => o.status.toLowerCase() !== 'finalizado')
        : [];
      setPedidos(activeOrders);

      // Se for reservada, busca reserva ativa
      if (response.data.status?.toLowerCase() === 'reservada') {
        const reservationsRes = await api.get('/reservations', {
          params: { mesaId: tableId },
          headers: { Authorization: `Bearer ${token}` },
        });
        const allRes = reservationsRes.data.reservations || [];
        const activeRes = allRes.find(
          (r) => r.mesa && r.mesa._id === tableId && r.status.toLowerCase() === 'ativa'
        );
        if (activeRes) {
          setCurrentReservationId(activeRes._id);
          setCurrentReservationDetails({
            dataReserva: activeRes.dataReserva,
            numeroPessoas: activeRes.numeroPessoas,
            nomeCliente: activeRes.nomeCliente,
            telefoneCliente: activeRes.telefoneCliente
          });
          // Callback
          if (onReservationDetails) {
            onReservationDetails(activeRes._id, {
              dataReserva: activeRes.dataReserva,
              numeroPessoas: activeRes.numeroPessoas,
              nomeCliente: activeRes.nomeCliente,
              telefoneCliente: activeRes.telefoneCliente,
            });
          }
        }
      }
    } catch (err) {
      console.error('Erro ao buscar detalhes da mesa:', err);
      setError(err.response?.data?.message || 'Erro ao buscar detalhes da mesa.');
      toast.error(err.response?.data?.message || 'Erro ao buscar detalhes da mesa.');
    } finally {
      setLoading(false);
      setLoadingPedidos(false);
    }
  };

  // ================================
  // 2) Separar por assentos
  // ================================
  const handleToggleSeatSeparation = async () => {
    setSavingSeatSeparation(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token não encontrado');

      const response = await api.put(
        `/tables/${tableId}/seat-separation`,
        { seatSeparation: !seatSeparation },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSeatSeparation(response.data.table.seatSeparation);
      setAssentos(response.data.table.assentos);

      toast.success('Separação por assentos atualizada com sucesso!');
    } catch (err) {
      console.error('Erro ao atualizar seatSeparation:', err);
      setErrorPedidos(err.response?.data?.message || 'Erro ao atualizar separação por assentos.');
      toast.error(err.response?.data?.message || 'Erro ao atualizar separação por assentos.');
    } finally {
      setSavingSeatSeparation(false);
    }
  };

  // ================================
  // 3) Editar nomes de assentos
  // ================================
  const handleAssentoChange = (index, field, value) => {
    const updated = [...assentos];
    updated[index][field] = value;
    setAssentos(updated);
  };

  /**
   * Ao sair do campo (onBlur), salva a lista atual de assentos no backend.
   */
  const handleAssentoBlur = async () => {
    // Chamado sempre que o usuário perder o foco de **qualquer** campo de assento
    setSavingAssentos(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token não encontrado');

      const response = await api.put(
        `/tables/${tableId}/assentos`,
        { assentos },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAssentos(response.data.table.assentos); // Atualizar caso o backend retorne algo diferente
      toast.success('Assento(s) atualizado(s) com sucesso!');
    } catch (err) {
      console.error('Erro ao atualizar assentos:', err);
      setErrorPedidos(err.response?.data?.message || 'Erro ao atualizar assentos.');
      toast.error(err.response?.data?.message || 'Erro ao atualizar assentos.');
    } finally {
      setSavingAssentos(false);
    }
  };

  // ================================
  // 4) Atualizar capacidade
  // ================================
  const handleUpdateCapacity = async () => {
    if (!table || newCapacity < 1) {
      toast.error('Capacidade inválida.');
      return;
    }

    if (
      currentReservationDetails &&
      newCapacity < currentReservationDetails.numeroPessoas
    ) {
      toast.error('A nova capacidade é menor que o número de pessoas na reserva.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token não encontrado');

      const payload = { capacidade: parseInt(newCapacity, 10) };
      const response = await api.put(`/tables/${tableId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTable(response.data.table);
      toast.success('Capacidade da mesa atualizada com sucesso!');

      if (refreshTables) {
        refreshTables();
      }
    } catch (err) {
      console.error('Erro ao atualizar capacidade da mesa:', err);
      const message =
        err.response?.data?.message || 'Erro ao atualizar capacidade da mesa.';
      setError(message);
      toast.error(message);
    }
  };

  // ================================
  // 5) Nome do cliente por assento
  // ================================
  const getNomeClienteForSeat = (seatNumber) => {
    const seat = assentos.find((a) => a.numeroAssento === seatNumber);
    return seat ? seat.nomeCliente : '';
  };

  // ================================
  // 6) Ocupar mesa sem abrir pedido
  // ================================
  const occupyTableWithoutAutoOrder = async (isReserved = false) => {
    try {
      if (isReserved) {
        await handleMakeOrderFromReservedTable();
      } else {
        await handleMakeOrderFromFreeTable(table);
      }
      await fetchTableDetails(); // Recarregar para exibir "ocupada"
    } catch (err) {
      console.error('Erro ao ocupar mesa:', err);
      // Normalmente a função do pai exibe toast de erro
    }
  };

  // ================================
  // Render
  // ================================
  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Detalhes da Mesa {table?.numeroMesa}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {loading ? (
          <div className="text-center my-5">
            <Spinner animation="border" variant="primary" />
            <div>Carregando detalhes da mesa...</div>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : table ? (
          <>
            {/* Atualização de capacidade */}
            <Form.Group className="mb-3">
              <Form.Label>Capacidade Atual</Form.Label>
              <div className="d-flex">
                <Form.Control
                  type="number"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(e.target.value)}
                  min="1"
                  style={{ maxWidth: '100px', marginRight: '10px' }}
                />
                <Button variant="primary" onClick={handleUpdateCapacity}>
                  Atualizar Capacidade
                </Button>
              </div>
            </Form.Group>

            {/* Se mesa ocupada => mostrar checkbox "Separar por Assentos" */}
            {table.status?.toLowerCase() === 'ocupada' && (
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Separar por Assentos"
                  checked={seatSeparation}
                  onChange={handleToggleSeatSeparation}
                  disabled={savingSeatSeparation}
                />
                {savingSeatSeparation && <Spinner animation="border" size="sm" />}
              </Form.Group>
            )}

            {/* Campos de assentos, sem botão Salvar => salvamos no onBlur */}
            {seatSeparation && assentos?.length > 0 && (
              <>
                <h5>Assentos:</h5>
                {assentos.map((assento, index) => (
                  <Form.Group as={Row} className="mb-3" key={assento.numeroAssento}>
                    <Form.Label column sm="2">
                      Assento {assento.numeroAssento}:
                    </Form.Label>
                    <Col sm="8">
                      <Form.Control
                        type="text"
                        placeholder="Nome do Cliente"
                        value={assento.nomeCliente || ''}
                        onChange={(e) => handleAssentoChange(index, 'nomeCliente', e.target.value)}
                        onBlur={handleAssentoBlur}
                      />
                    </Col>
                    <Col sm="2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setSelectedSeatInternal(assento.numeroAssento);
                          setShowOrderModalInternal(true);
                        }}
                      >
                        Fazer Pedido
                      </Button>
                    </Col>
                  </Form.Group>
                ))}
                {savingAssentos && (
                  <div className="d-flex align-items-center">
                    <Spinner animation="border" size="sm" />
                    <span style={{ marginLeft: '5px' }}>Salvando assentos...</span>
                  </div>
                )}
              </>
            )}

            {/* Reserva ativa, se houver */}
            {table.status.toLowerCase() === 'reservada' && currentReservationId && currentReservationDetails && (
              <Alert variant="info" className="mt-3">
                <p><strong>Reserva Ativa:</strong></p>
                <p>
                  <strong>Data/Hora:</strong>{' '}
                  {new Date(currentReservationDetails.dataReserva).toLocaleString()}
                </p>
                <p>
                  <strong>Número de Pessoas:</strong>{' '}
                  {currentReservationDetails.numeroPessoas}
                </p>
                <p>
                  <strong>Nome do Cliente:</strong>{' '}
                  {currentReservationDetails.nomeCliente}
                </p>
                <p>
                  <strong>Telefone:</strong>{' '}
                  {currentReservationDetails.telefoneCliente}
                </p>
              </Alert>
            )}
            {table.status.toLowerCase() === 'reservada' && !currentReservationId && (
              <Alert variant="warning" className="mt-3">
                Nenhuma reserva ativa encontrada para esta mesa.
              </Alert>
            )}

            {/* Lista de pedidos da mesa */}
            {loadingPedidos ? (
              <div className="text-center my-5">
                <Spinner animation="border" variant="primary" />
                <div>Carregando pedidos...</div>
              </div>
            ) : errorPedidos ? (
              <Alert variant="danger">{errorPedidos}</Alert>
            ) : pedidos.length === 0 ? (
              <Alert variant="info">Nenhum pedido encontrado para esta mesa.</Alert>
            ) : (
              <>
                <OrderList pedidos={pedidos} />
                <hr />
                <h5>
                  Total Geral: R${' '}
                  {pedidos.reduce((acc, p) => acc + (p.total || 0), 0).toFixed(2)}
                </h5>
              </>
            )}
          </>
        ) : (
          <Alert variant="warning">Nenhuma mesa selecionada.</Alert>
        )}
      </Modal.Body>

      <Modal.Footer>
        {/* Ações conforme status */}
        {table && table.status === 'livre' && (
          <>
            <Button
              variant="warning"
              className="me-2"
              onClick={() => handleOpenReservationModal()}
            >
              Reservar Mesa
            </Button>
            <Button
              variant="success"
              onClick={async () => {
                await occupyTableWithoutAutoOrder(false);
              }}
            >
              Ocupar Mesa
            </Button>
          </>
        )}

        {table && table.status === 'reservada' && (
          <>
            {currentReservationId && (
              <>
                <Button
                  variant="secondary"
                  className="me-2"
                  onClick={handleCancelReservation}
                >
                  Remover Reserva
                </Button>
                <Button
                  variant="info"
                  className="me-2"
                  onClick={() => handleOpenReservationModal()}
                  disabled={movementLocked}
                >
                  Editar Reserva
                </Button>
              </>
            )}
            <Button
              variant="success"
              onClick={async () => {
                await occupyTableWithoutAutoOrder(true);
              }}
            >
              Fazer Pedido (Ocupar Mesa)
            </Button>
          </>
        )}

        {table && table.status === 'ocupada' && !seatSeparation && (
          <Button
            variant="success"
            onClick={() => {
              setSelectedSeatInternal(null);
              setShowOrderModalInternal(true);
            }}
          >
            Fazer Pedido
          </Button>
        )}

        <Button variant="secondary" onClick={handleClose}>
          Fechar
        </Button>
      </Modal.Footer>

      {/* Sub-modal de Fazer Pedido */}
      <Modal
        show={showOrderModalInternal}
        onHide={() => setShowOrderModalInternal(false)}
        size="xl"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Fazer Pedido (Mesa {table?.numeroMesa}
            {selectedSeatInternal ? ` - Assento ${selectedSeatInternal}` : ''}
            )
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {table && (
            <OrderForm
              mesaId={tableId}
              assento={selectedSeatInternal}
              occupantName={
                selectedSeatInternal
                  ? getNomeClienteForSeat(selectedSeatInternal)
                  : currentReservationDetails?.nomeCliente || occupantName || ''
              }
              onClose={() => {
                setShowOrderModalInternal(false);
                if (tableId) {
                  fetchTableDetails();
                }
              }}
            />
          )}
        </Modal.Body>
      </Modal>
    </Modal>
  );
};

export default TableDetailsModal;
