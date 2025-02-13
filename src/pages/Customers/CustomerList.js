// src/pages/Customers/CustomerList.js

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
  InputGroup,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Importar FontAwesomeIcon
import { faTrash, faPenToSquare, faSearch, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para paginação, pesquisa e ordenação
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // Limit fixo de 10 por página
  const [totalPages, setTotalPages] = useState(1);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('nome');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' ou 'desc'

  const [showModal, setShowModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm, sortField, sortOrder]);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/customers/advanced', {
        params: {
          page,
          limit,
          search: searchTerm,
          sort: sortField,
          order: sortOrder,
        },
      });

      if (response.data && Array.isArray(response.data.customers)) {
        setCustomers(response.data.customers);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setCustomers([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Erro ao obter clientes:', error);
      setError('Erro ao obter clientes.');
      setCustomers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (customer) => {
    setCustomerToDelete(customer);
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;

    try {
      await api.delete(`/customers/${customerToDelete._id}`);
      setCustomers(customers.filter((c) => c._id !== customerToDelete._id));
      setShowModal(false);
      setCustomerToDelete(null);
      toast.success('Cliente excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      toast.error('Erro ao excluir cliente');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCustomerToDelete(null);
    setCustomerDetails(null);
  };

  // Função para lidar com a pesquisa
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Resetar para página 1 ao pesquisar
    fetchCustomers();
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

  // Função auxiliar para formatar o número do WhatsApp
  const formatWhatsappNumber = (number) => {
    return number ? number.replace(/\D/g, '') : '';
  };

  // Função para abrir detalhes do cliente
  const handleViewDetails = (customer) => {
    setCustomerDetails(customer);
    setShowModal(true);
  };

  return (
    <Container className="my-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Clientes</h2>
        <Link to="/customers/new" className="btn btn-success">
          Novo Cliente
        </Link>
      </div>

      {/* Barra de Pesquisa */}
      <Form onSubmit={handleSearch} className="mb-3">
        <InputGroup>
          <Form.Control
            type="text"
            placeholder="Buscar por nome, email, CPF/CNPJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="primary" type="submit">
            <FontAwesomeIcon icon={faSearch} />
          </Button>
        </InputGroup>
      </Form>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </Spinner>
          <div>Carregando clientes...</div>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead className="table-dark">
                <tr>
                  <th>Nome</th>
                  <th>Whatsapp</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {customers.length > 0 ? (
                  customers.map((customer) => (
                    <tr key={customer._id}>
                      <td>{customer.nome}</td>
                      <td>
                        {customer.whatsapp ? (
                          <a
                            href={`https://wa.me/55${formatWhatsappNumber(customer.whatsapp)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Enviar mensagem para ${customer.nome} no WhatsApp`}
                          >
                            <FontAwesomeIcon icon={faWhatsapp} /> {customer.whatsapp}
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        <Button
                          variant="info"
                          size="sm"
                          className="me-2"
                          onClick={() => handleViewDetails(customer)}
                          aria-label={`Ver detalhes de ${customer.nome}`}
                        >
                          <FontAwesomeIcon icon={faMagnifyingGlass} />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteClick(customer)}
                          aria-label={`Excluir ${customer.nome}`}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center">
                      Nenhum cliente encontrado.
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

      {/* Modal de Detalhes e Confirmação de Exclusão */}
      <Modal show={showModal} onHide={handleCloseModal} centered size={customerDetails ? "lg" : "sm"}>
        <Modal.Header closeButton>
          <Modal.Title>
            {customerDetails ? `Detalhes de ${customerDetails.nome}` : 'Confirmar Exclusão'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {customerDetails ? (
            <>
              <p><strong>CPF/CNPJ:</strong> {customerDetails.cpfCnpj || '-'}</p>
              <p><strong>Email:</strong> {customerDetails.email || '-'}</p>
              <p><strong>Fixo:</strong> {customerDetails.telefone || '-'}</p>
              <p><strong>Whatsapp:</strong> {customerDetails.whatsapp || '-'}</p>
              <p><strong>CEP:</strong> {customerDetails.cep || '-'}</p>
              <p><strong>Rua:</strong> {customerDetails.rua || '-'}</p>
              <p><strong>Número:</strong> {customerDetails.numero || '-'}</p>
              <p><strong>Complemento:</strong> {customerDetails.complemento || '-'}</p>
              <p><strong>Bairro:</strong> {customerDetails.bairro || '-'}</p>
              <p><strong>Cidade:</strong> {customerDetails.cidade || '-'}</p>
              <p><strong>Estado:</strong> {customerDetails.estado || '-'}</p>
              <p><strong>Data de Cadastro:</strong> {new Date(customerDetails.createdAt).toLocaleString()}</p>
            </>
          ) : (
            customerToDelete && (
              <p>
                Tem certeza que deseja excluir o cliente <strong>{customerToDelete.nome}</strong>?
              </p>
            )
          )}
        </Modal.Body>
        <Modal.Footer>
          {customerDetails ? (
            <Button variant="secondary" onClick={handleCloseModal}>
              Fechar
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete}>
                Excluir
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default CustomerList;
