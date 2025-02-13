// src/pages/Queue/QueueList.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api'; // Instância personalizada do Axios
import { 
    Table, 
    Button, 
    Badge, 
    Pagination, 
    Modal, 
    Spinner, 
    Container, 
    Row, 
    Col,
    Alert,
    Form,
    InputGroup
} from 'react-bootstrap';
import InputMask from 'react-input-mask';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faSearch, faPlus } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

function QueueList() {
    const [entries, setEntries] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [name, setName] = useState('');
    const [numberOfPeople, setNumberOfPeople] = useState(1);
    const [telefone, setTelefone] = useState('');
    const [status, setStatus] = useState('Aguardando');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date()); // Estado para o tempo atual
    const limit = 10;

    // Hook para atualizar o tempo atual a cada segundo
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Hook para buscar as entradas quando page ou search mudar
    useEffect(() => {
        fetchEntries(page, search);
    }, [page, search]);

    // Função para buscar as entradas
    const fetchEntries = async (currentPage, searchTerm) => {
        setLoading(true);
        try {
            const res = await api.get('/queue', { // Utilize a instância personalizada
                params: { page: currentPage, limit, search: searchTerm }
            });
            // Ordenar as entradas por createdAt (mais antigas primeiro)
            const sortedEntries = res.data.entries.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            setEntries(sortedEntries || []);
            setTotal(res.data.total || 0);
            setTotalPages(res.data.totalPages || 1);
        } catch (err) {
            console.error('Erro ao buscar entradas:', err);
            setError('Erro ao buscar entradas.');
            toast.error('Erro ao buscar entradas.');
        } finally {
            setLoading(false);
        }
    };

    // Função para abrir o modal de adicionar
    const handleAdd = () => {
        setIsEditMode(false);
        setSelectedEntry(null);
        setName('');
        setNumberOfPeople(1);
        setTelefone('');
        setStatus('Aguardando');
        setError('');
        setSuccess('');
        setShowModal(true);
    };

    // Função para abrir o modal de editar
    const handleEdit = (entry) => {
        setIsEditMode(true);
        setSelectedEntry(entry);
        setName(entry.name);
        setNumberOfPeople(entry.numberOfPeople);
        setTelefone(entry.telefone); // Preservar o formato original
        setStatus(entry.status); // 'Aguardando' ou 'Finalizado'
        setError('');
        setSuccess('');
        setShowModal(true);
    };

    // Função para fechar o modal
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedEntry(null);
    };

    // Função para submeter o formulário (adicionar ou editar)
    const handleSubmit = async (e) => {
        e.preventDefault();
        const telefoneNumeros = telefone.replace(/\D/g, '');
        if (name.trim() === '' || numberOfPeople < 1 || telefone.trim() === '') {
            setError('Por favor, preencha todos os campos corretamente.');
            setSuccess('');
            return;
        }

        try {
            if (isEditMode && selectedEntry) {
                const payload = {
                    name, 
                    numberOfPeople, 
                    telefone: telefoneNumeros,
                    status // Apenas 'Aguardando' ou 'Finalizado'
                };

                const res = await api.put(`/queue/${selectedEntry._id}`, payload); // Atualizar via API

                toast.success('Entrada atualizada com sucesso!');

                // Atualizar localmente a lista de entradas
                setEntries(prev => prev.map(entry => 
                    entry._id === selectedEntry._id ? res.data : entry
                ));

                handleCloseModal();
            } else {
                const res = await api.post('/queue', { // Adicionar nova reserva
                    name, 
                    numberOfPeople, 
                    telefone: telefoneNumeros 
                });
                toast.success('Entrada adicionada com sucesso!');

                // Atualizar localmente a lista de reservas
                setEntries(prev => [res.data, ...prev]);
                setTotal(prev => prev + 1);
                setTotalPages(Math.ceil((total + 1) / limit));

                handleCloseModal();
            }
            setName('');
            setNumberOfPeople(1);
            setTelefone('');
            setStatus('Aguardando');
            setError('');
            setSuccess('');
        } catch (err) {
            console.error('Erro ao realizar a operação:', err);
            setError('Erro ao realizar a operação.');
            setSuccess('');
            toast.error('Erro ao realizar a operação.');
        }
    };

    // Função para finalizar uma reserva
    const handleFinalize = async (id) => {
        if (!window.confirm('Tem certeza que deseja finalizar esta reserva?')) return;
        try {
            const res = await api.patch(`/queue/${id}/status`, { status: 'Finalizado' }); // Ajuste a URL conforme sua configuração
            toast.success('Reserva finalizada com sucesso!');

            // Remover a entrada da lista local
            setEntries(prev => prev.filter(entry => entry._id !== id));
            setTotal(prev => prev - 1);
            setTotalPages(Math.ceil((total - 1) / limit));
        } catch (err) {
            console.error('Erro ao finalizar reserva:', err);
            setError('Erro ao finalizar reserva.');
            toast.error('Erro ao finalizar reserva.');
        }
    };

    // Função para deletar uma reserva
    const deleteEntry = async (id) => {
        if (!window.confirm('Tem certeza que deseja remover esta entrada?')) return;
        try {
            await api.delete(`/queue/${id}`); // Deletar reserva
            toast.success('Entrada removida com sucesso!');

            // Remover localmente
            setEntries(prev => prev.filter(entry => entry._id !== id));
            setTotal(prev => prev - 1);
            setTotalPages(Math.ceil((total - 1) / limit));
        } catch (err) {
            console.error('Erro ao remover entrada:', err);
            setError('Erro ao remover entrada.');
            toast.error('Erro ao remover entrada.');
        }
    };

    // Função para mudar a página
    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;
        setPage(newPage);
    };

    // Função para renderizar a paginação
    const renderPagination = () => {
        let items = [];
        for (let number = 1; number <= totalPages; number++) {
            items.push(
                <Pagination.Item 
                    key={number} 
                    active={number === page} 
                    onClick={() => handlePageChange(number)}
                >
                    {number}
                </Pagination.Item>,
            );
        }

        return (
            <Pagination className="justify-content-center">
                <Pagination.First onClick={() => handlePageChange(1)} disabled={page === 1} />
                <Pagination.Prev onClick={() => handlePageChange(page - 1)} disabled={page === 1} />
                {items}
                <Pagination.Next onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} />
                <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={page === totalPages} />
            </Pagination>
        );
    };

    // Função para formatar o tempo de espera
    const formatTime = (dateString) => {
        const now = currentTime; // Utiliza o estado atual
        const entryTime = new Date(dateString);
        const diffInSeconds = Math.floor((now - entryTime) / 1000);

        const hours = Math.floor(diffInSeconds / 3600);
        const minutes = Math.floor((diffInSeconds % 3600) / 60);
        const seconds = diffInSeconds % 60;

        return `${hours}h ${minutes}m ${seconds}s`;
    };

    // Função para buscar reservas
    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchEntries(1, search);
    };

    // Função para formatar o telefone
    const formatPhone = (phoneNumber) => {
        const cleaned = phoneNumber.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
        if (match) {
            return `(${match[1]}) ${match[2]}-${match[3]}`;
        }
        return phoneNumber;
    };

    return (
        <Container className="mt-5">
            <Row className="mb-4">
                <Col className="d-flex justify-content-between align-items-center">
                    <h2>Lista de Filas</h2>
                    <Button variant="primary" onClick={handleAdd}>
                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                        Adicionar
                    </Button>
                </Col>
            </Row>
            
            <Form onSubmit={handleSearch} className="mb-4">
                <InputGroup>
                    <Form.Control
                        type="text"
                        placeholder="Buscar por Nome ou Telefone"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button type="submit" variant="outline-secondary">
                        <FontAwesomeIcon icon={faSearch} />
                    </Button>
                </InputGroup>
            </Form>

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Nome</th>
                        <th>Número de Pessoas</th>
                        <th>Telefone</th>
                        <th>Tempo Aguardando</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan="7" className="text-center">
                                <Spinner animation="border" role="status" />
                            </td>
                        </tr>
                    ) : entries.length > 0 ? (
                        entries.map((entry, index) => (
                            <tr 
                                key={entry._id} 
                                style={entry.assignedTable ? { backgroundColor: '#d4edda' } : {}}
                            >
                                <td>{(page - 1) * limit + index + 1}</td>
                                <td>{entry.name}</td>
                                <td>{entry.numberOfPeople}</td>
                                <td>{formatPhone(entry.telefone)}</td>
                                <td>{formatTime(entry.createdAt)}</td>
                                <td>
                                    {entry.status === 'Aguardando' ? (
                                        <Badge bg="warning" text="dark">{entry.status}</Badge>
                                    ) : entry.status === 'Finalizado' ? (
                                        <Badge bg="success">{entry.status}</Badge>
                                    ) : (
                                        <Badge bg="secondary">{entry.status}</Badge>
                                    )}
                                    {entry.assignedTable && (
                                        <div>
                                            <small>
                                                Mesa {entry.assignedTable.numeroMesa} - Ambiente {entry.assignedTable.ambiente.nome}
                                            </small>
                                        </div>
                                    )}
                                </td>
                                <td>
                                    {entry.status === 'Aguardando' && (
                                        <>
                                            <Button 
                                                variant="success" 
                                                size="sm" 
                                                onClick={() => handleFinalize(entry._id)}
                                                className="me-2"
                                            >
                                                Finalizar
                                            </Button>
                                            <Button 
                                                variant="info" 
                                                size="sm" 
                                                onClick={() => handleEdit(entry)}
                                                className="me-2"
                                            >
                                                <FontAwesomeIcon icon={faEdit} /> Editar
                                            </Button>
                                        </>
                                    )}
                                    <Button 
                                        variant="danger" 
                                        size="sm" 
                                        onClick={() => deleteEntry(entry._id)}
                                    >
                                        Remover
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="text-center">
                                Nenhuma entrada encontrada.
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
            {renderPagination()}

            {/* Modal para Adicionar/Editar */}
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditMode ? 'Editar Reserva' : 'Adicionar à Fila'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        {error && <Alert variant="danger">{error}</Alert>}
                        {success && <Alert variant="success">{success}</Alert>}
                        <Row className="mb-3">
                            <Col>
                                <Form.Group controlId="formName">
                                    <Form.Label>Nome</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        placeholder="Digite o nome" 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)} 
                                        required 
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group controlId="formNumberOfPeople">
                                    <Form.Label>Número de Pessoas</Form.Label>
                                    <Form.Control 
                                        type="number" 
                                        min="1"
                                        placeholder="Quantidade" 
                                        value={numberOfPeople} 
                                        onChange={(e) => setNumberOfPeople(e.target.value)} 
                                        required 
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="mb-4">
                            <Col>
                                <Form.Group controlId="formTelefone">
                                    <Form.Label>Telefone</Form.Label>
                                    <InputMask 
                                        mask="99999999999" // Permitir telefone sem formatação
                                        value={telefone} 
                                        onChange={(e) => setTelefone(e.target.value)}
                                        required
                                    >
                                        {(inputProps) => <Form.Control type="text" placeholder="62985957061" {...inputProps} />}
                                    </InputMask>
                                </Form.Group>
                            </Col>
                        </Row>
                        {isEditMode && (
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group controlId="formStatus">
                                        <Form.Label>Status</Form.Label>
                                        <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                                            <option value="Aguardando">Aguardando</option>
                                            <option value="Finalizado">Finalizado</option>
                                            {/* Opções adicionais se necessário */}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                        )}
                        <Row>
                            <Col className="text-center">
                                <Button variant="primary" type="submit" className="w-50">
                                    {isEditMode ? 'Atualizar' : 'Adicionar'}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );

}

export default QueueList;
