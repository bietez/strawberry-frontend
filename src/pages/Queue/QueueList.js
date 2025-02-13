// src/pages/QueueList.jsx
import React, { useEffect, useState, useRef } from 'react';
import api from '../../services/api'; // Ajuste o path conforme a sua estrutura
import { Modal, Button, Table, Form, Pagination, Card, Row, Col, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast } from 'react-toastify'; // Importar apenas toast

function QueueList() {
  // Estado geral da lista de reservas
  const [queueEntries, setQueueEntries] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  // Formulário de cadastro (para o modal de criação)
  const [name, setName] = useState('');
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [contact, setContact] = useState('');
  const [telefone, setTelefone] = useState('');

  // Estado para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5); // 5 itens por página
  const [totalPages, setTotalPages] = useState(1);

  // Modal de Criação
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Modal de Edição
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editNumberOfPeople, setEditNumberOfPeople] = useState(1);
  const [editContact, setEditContact] = useState('');
  const [editTelefone, setEditTelefone] = useState('');

  // Mensagem de mesas disponíveis (se alguma reserva puder ser atendida)
  const [tableAvailableMessage, setTableAvailableMessage] = useState('');

  // Estado para armazenar mesas disponíveis
  const [availableTables, setAvailableTables] = useState([]);

  // Ref para armazenar mesas que já emitiram toast
  const notifiedTablesRef = useRef(new Set());

  // Ref para armazenar reservas que já emitiram toast
  const notifiedReservationsRef = useRef(new Set());

  // Estado para armazenar o tempo atual, para atualização em tempo real
  const [currentTime, setCurrentTime] = useState(new Date());

  /**
   * Efeito para buscar entradas da fila ao montar o componente
   * e sempre que currentPage/limit mudar.
   */
  useEffect(() => {
    fetchQueueEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, limit]);

  /**
   * Efeito para atualização do tempo atual a cada segundo
   * para recalcular o tempo de espera em tempo real.
   */
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Atualiza a cada 1 segundo

    return () => clearInterval(timer);
  }, []);

  /**
   * Efeito para verificação periódica de mesas disponíveis a cada 10s.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      checkAvailableTables();
    }, 5000); // 10 segundos

    return () => clearInterval(interval);
  }, [queueEntries]);

  /**
   * Efeito para monitorar mudanças nas queueEntries e disparar toasts para reservas com mesa atribuída.
   */
  useEffect(() => {
    console.log('Queue Entries:', queueEntries); // Log para depuração
    queueEntries.forEach((entry) => {
      if (entry.assignedTable && entry._id && !notifiedReservationsRef.current.has(entry._id)) {
        const ambiente = entry.assignedTable.ambiente ? entry.assignedTable.ambiente.nome : '(Ambiente Indefinido)';
        const mesaNumero = entry.assignedTable.numeroMesa;
        const nomeCliente = entry.name;
        const telefoneCliente = entry.telefone;

        // Verificar se todas as propriedades necessárias estão definidas
        if (mesaNumero && ambiente && nomeCliente && telefoneCliente) {
          // Disparar um toast permanente
          toast.info(
            `Reserva de ${nomeCliente} (${telefoneCliente}) foi atribuída à Mesa ${mesaNumero} - ${ambiente}.`,
            {
              position: "top-right",
              autoClose: false, // Torna o toast permanente
              closeOnClick: true,
              draggable: true,
              pauseOnHover: true,
            }
          );

          // Marcar a reserva como notificada
          notifiedReservationsRef.current.add(entry._id);
        } else {
          console.warn(`Reserva com ID ${entry._id} está faltando informações.`);
        }
      }
    });
  }, [queueEntries]);

  /**
   * Busca as entradas da fila com paginação (seu backend deve suportar).
   * Se o backend retorna um objeto com { data, total, totalPages, currentPage }, use-o.
   * Se retorna apenas um array, trate como sem paginação.
   */
  const fetchQueueEntries = async () => {
    try {
      const page = currentPage || 1;

      // GET /queue?limit=5&page=1
      const res = await api.get(`/queue?limit=${limit}&page=${page}`);

      if (res.data && res.data.data) {
        // Resposta paginada
        const { data, total, totalPages, currentPage: pageServer } = res.data;
        // Filtra "Finalizado"
        const activeEntries = data.filter((entry) => entry.status.toLowerCase() !== 'finalizado');
        setQueueEntries(activeEntries);
        setTotalCount(activeEntries.length);
        setTotalPages(totalPages);
        setCurrentPage(pageServer || 1);
      } else if (Array.isArray(res.data)) {
        // Resposta sem paginação
        const activeEntries = res.data.filter((entry) => entry.status.toLowerCase() !== 'finalizado');
        setQueueEntries(activeEntries);
        setTotalCount(activeEntries.length);
        setTotalPages(1);
        setCurrentPage(1);
      } else {
        // Formato de resposta inesperado
        console.error('Formato de resposta inesperado:', res.data);
        setQueueEntries([]);
        setTotalCount(0);
        setTotalPages(1);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Erro ao buscar fila:', error);
      toast.error('Erro ao buscar fila.', { autoClose: 5000 });
    }
  };

  /**
   * Verifica se há mesa livre para cada reserva "Aguardando"
   * (e sem assignedTable), consultando /tables/available
   */
  const checkAvailableTables = async () => {
    try {
      // Consulta todas as mesas *livres* (ou possivelmente todas, dependendo do seu endpoint)
      const res = await api.get('/tables/available');
      let tables = res.data.tables || [];

      // Garante que ignoramos mesas ocupadas/reservadas
      // (caso seu endpoint não filtrar)
      tables = tables.filter(
        (t) => t.status && t.status.toLowerCase() === 'livre'
      );

      setAvailableTables(tables);

      const waitingEntries = queueEntries.filter(
        (entry) => entry.status.toLowerCase() === 'aguardando' && !entry.assignedTable
      );

      if (waitingEntries.length === 0) {
        setTableAvailableMessage('');
        return;
      }

      let message = '';
      for (let entry of waitingEntries) {
        // Filtra mesas com capacidade >= numberOfPeople
        const suitableTables = tables.filter(
          (table) => table.capacidade >= entry.numberOfPeople
        );
        if (suitableTables.length > 0) {
          // Ex.: escolhe a primeira
          const chosenTable = suitableTables[0];
          // Ambiente pode estar undefined, então tratamos:
          const ambiente = chosenTable.ambiente ? chosenTable.ambiente.nome : '(Ambiente Indefinido)';
          message += `Cliente ${entry.name} (${entry.telefone}) pode usar a Mesa ${chosenTable.numeroMesa} - ${ambiente}!\n`;
          
          // Verifica se essa mesa já notificou anteriormente
          const mesaId = chosenTable._id;
          if (!notifiedTablesRef.current.has(mesaId)) {
            // Emite o toast
            toast.info(`Mesa ${chosenTable.numeroMesa} - ${ambiente} está disponível para ${entry.name}.`, { autoClose: 7000 });
            // Marca a mesa como notificada
            notifiedTablesRef.current.add(mesaId);
          }
        }
      }

      setTableAvailableMessage(message);
    } catch (error) {
      console.error('Erro ao verificar mesas disponíveis:', error);
      toast.error('Erro ao verificar mesas disponíveis.', { autoClose: 5000 });
    }
  };

  /**
   * Abre o modal de criação de nova reserva
   */
  const handleOpenCreateModal = () => {
    setName('');
    setNumberOfPeople(1);
    setContact('');
    setTelefone('');
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  /**
   * Cria uma nova reserva (POST /queue)
   */
  const handleCreateEntry = async (e) => {
    e.preventDefault();
    if (!telefone) {
      toast.error('Telefone é obrigatório.', { autoClose: 5000 });
      return;
    }

    try {
      const body = { name, numberOfPeople, contact, telefone };
      const res = await api.post('/queue', body);

      toast.success(res.data.message || 'Reserva criada com sucesso.', { autoClose: 5000 });
      setShowCreateModal(false);
      setCurrentPage(1);
      fetchQueueEntries();
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      toast.error('Erro ao criar reserva.', { autoClose: 5000 });
    }
  };

  /**
   * Abre o modal de edição de reserva
   */
  const handleOpenEditModal = (entry) => {
    setEditId(entry._id);
    setEditName(entry.name);
    setEditNumberOfPeople(entry.numberOfPeople);
    setEditContact(entry.contact || '');
    setEditTelefone(entry.telefone);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditId(null);
  };

  /**
   * Salva edição (PUT /queue/:id)
   */
  const handleSaveEdit = async () => {
    try {
      const body = {
        name: editName,
        numberOfPeople: editNumberOfPeople,
        contact: editContact,
        telefone: editTelefone,
      };
      const res = await api.put(`/queue/${editId}`, body);

      toast.success(res.data.message || 'Reserva atualizada com sucesso.', { autoClose: 5000 });
      setShowEditModal(false);
      fetchQueueEntries();
    } catch (error) {
      console.error('Erro ao editar reserva:', error);
      // Verifica se o erro está relacionado à capacidade da mesa
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error, { autoClose: 5000 });
      } else {
        toast.error('Erro ao editar reserva.', { autoClose: 5000 });
      }
    }
  };

  /**
   * Finaliza a reserva (PUT /queue/:id/finish)
   */
  const handleFinish = async (id) => {
    try {
      const res = await api.put(`/queue/${id}/finish`);
      toast.success(res.data.message || 'Reserva finalizada com sucesso.', { autoClose: 5000 });
      fetchQueueEntries();
    } catch (error) {
      console.error('Erro ao finalizar reserva:', error);
      toast.error('Erro ao finalizar reserva.', { autoClose: 5000 });
    }
  };

  /**
   * Exclui a reserva (DELETE /queue/:id)
   */
  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta reserva?')) return;
    try {
      const res = await api.delete(`/queue/${id}`);
      toast.success(res.data.message || 'Reserva excluída com sucesso.', { autoClose: 5000 });
      fetchQueueEntries();
    } catch (error) {
      console.error('Erro ao excluir reserva:', error);
      toast.error('Erro ao excluir reserva.', { autoClose: 5000 });
    }
  };

  /**
   * Cálculo do tempo de espera (desde createdAt até agora)
   * Inclui horas, minutos e segundos, atualiza em tempo real.
   */
  const getWaitingTime = (entry) => {
    if (!entry.createdAt) return '-';
    const createdAt = new Date(entry.createdAt);
    const now = currentTime;
    const diffMs = now - createdAt;

    if (diffMs < 0) return '0h 0m 0s de espera';

    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours}h ${minutes}m ${seconds}s de espera`;
  };

  /**
   * Botão WhatsApp: abre https://wa.me/TELEFONE
   */
  const handleWhatsAppClick = (telefone) => {
    const cleanNumber = telefone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}`, '_blank');
  };

  /**
   * Renderiza as linhas da tabela de fila
   */
  const renderQueueRows = () => {
    if (!queueEntries || queueEntries.length === 0) {
      return (
        <tr>
          <td colSpan="6" className="text-center">
            Nenhuma reserva encontrada.
          </td>
        </tr>
      );
    }

    return queueEntries.map((entry) => {
      // Encontra uma mesa adequada (livre, capacity >= entry.numberOfPeople)
      const suitableTable = availableTables.find(
        (table) =>
          (table.status && table.status.toLowerCase() === 'livre') &&
          table.capacidade >= entry.numberOfPeople
      );

      // Verifica se a reserva tem uma mesa atribuída
      const hasAssignedTable = Boolean(entry.assignedTable);

      // Se assignedTable existe, mostramos assignedTable
      // senão, se suitableTable existe, mostramos suitableTable
      // senão "Aguardando Mesa"
      let mesaInfo = 'Aguardando Mesa';
      if (hasAssignedTable) {
        const ambiente = entry.assignedTable.ambiente ? entry.assignedTable.ambiente.nome : '(Ambiente Indefinido)';
        mesaInfo = `Mesa ${entry.assignedTable.numeroMesa} - ${ambiente}`;
      } else if (suitableTable) {
        const ambiente = suitableTable.ambiente ? suitableTable.ambiente.nome : '(Ambiente Indefinido)';
        mesaInfo = `Mesa ${suitableTable.numeroMesa} - ${ambiente}`;
      }

      return (
        <tr
          key={entry._id}
          // Fundo verde claro apenas se a mesa estiver atribuída usando Bootstrap
          className={hasAssignedTable ? 'table-success' : ''}
        >
          <td>{entry.name}</td>
          <td>{entry.numberOfPeople}</td>
          <td>{entry.telefone}</td>
          <td>{getWaitingTime(entry)}</td>
          <td>{mesaInfo}</td>
          <td>
            <Button
              variant="info"
              size="sm"
              className="me-2 mb-1"
              onClick={() => handleOpenEditModal(entry)}
            >
              <i className="bi bi-pencil-square"></i> Editar
            </Button>
            {hasAssignedTable && (
              <Button
                variant="success"
                size="sm"
                className="me-2 mb-1"
                onClick={() => handleFinish(entry._id)}
              >
                <i className="bi bi-check-circle"></i> Finalizar
              </Button>
            )}
            <Button
              variant="danger"
              size="sm"
              className="me-2 mb-1"
              onClick={() => handleDelete(entry._id)}
            >
              <i className="bi bi-trash"></i> Excluir
            </Button>
            <Button
              variant="outline-success"
              size="sm"
              className="mb-1"
              onClick={() => handleWhatsAppClick(entry.telefone)}
            >
              <i className="bi bi-whatsapp"></i> WhatsApp
            </Button>
          </td>
        </tr>
      );
    });
  };

  /**
   * Renderiza a paginação
   */
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const items = [];
    for (let i = 1; i <= totalPages; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    return <Pagination>{items}</Pagination>;
  };

  return (
    <div className="container my-4">
      {/* Título dentro de um Card */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title className="text-dark">Gestão de Fila / Reservas</Card.Title>
        </Card.Body>
      </Card>

      {/* Alerta de mesa disponível (se houver mensagem) */}
      {tableAvailableMessage && (
        <Alert variant="warning">
          {tableAvailableMessage.split('\n').map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </Alert>
      )}

      {/* Botão para abrir o Modal de Criação */}
      <Row className="mb-3">
        <Col>
          <Button variant="primary" onClick={handleOpenCreateModal}>
            <i className="bi bi-plus-circle"></i> Nova Reserva
          </Button>
        </Col>
      </Row>

      {/* Tabela dentro de um Card para melhor estilização */}
      <Card>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>Nome</th>
                <th>Pessoas</th>
                <th>Telefone</th>
                <th>Tempo de Espera</th>
                <th>Mesa</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>{renderQueueRows()}</tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Paginação */}
      <Row className="mt-3">
        <Col className="d-flex justify-content-center">
          {renderPagination()}
        </Col>
      </Row>

      {/* Modal de Criação */}
      <Modal show={showCreateModal} onHide={handleCloseCreateModal}>
        <Modal.Header closeButton>
          <Modal.Title>Nova Reserva</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateEntry}>
            <Form.Group className="mb-3" controlId="formName">
              <Form.Label>Nome</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nome do Cliente"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formNumberOfPeople">
              <Form.Label>Quantidade de Pessoas</Form.Label>
              <Form.Control
                type="number"
                min={1}
                value={numberOfPeople}
                onChange={(e) => setNumberOfPeople(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formContact">
              <Form.Label>Contato (opcional)</Form.Label>
              <Form.Control
                type="text"
                placeholder="ex: e-mail, recado etc."
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formTelefone">
              <Form.Label>Telefone (WhatsApp)</Form.Label>
              <Form.Control
                type="text"
                placeholder="(DD) 99999-9999"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                required
              />
            </Form.Group>

            <div className="text-end">
              <Button variant="secondary" onClick={handleCloseCreateModal} className="me-2">
                <i className="bi bi-x-circle"></i> Cancelar
              </Button>
              <Button variant="primary" type="submit">
                <i className="bi bi-check-circle"></i> Cadastrar
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal de Edição */}
      <Modal show={showEditModal} onHide={handleCloseEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Reserva</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="editName">
              <Form.Label>Nome</Form.Label>
              <Form.Control
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="editNumberOfPeople">
              <Form.Label>Quantidade de Pessoas</Form.Label>
              <Form.Control
                type="number"
                min={1}
                value={editNumberOfPeople}
                onChange={(e) => setEditNumberOfPeople(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="editContact">
              <Form.Label>Contato</Form.Label>
              <Form.Control
                type="text"
                value={editContact}
                onChange={(e) => setEditContact(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="editTelefone">
              <Form.Label>Telefone (WhatsApp)</Form.Label>
              <Form.Control
                type="text"
                value={editTelefone}
                onChange={(e) => setEditTelefone(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>
            <i className="bi bi-x-circle"></i> Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveEdit}>
            <i className="bi bi-check-circle"></i> Salvar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default QueueList;
