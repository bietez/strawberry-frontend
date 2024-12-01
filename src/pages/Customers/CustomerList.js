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
} from 'react-bootstrap';
import { toast } from 'react-toastify'; // Importando toast

function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true); // Estado para controle de carregamento
  const [error, setError] = useState(null); // Estado para controle de erros
  const [showModal, setShowModal] = useState(false); // Estado para controle do Modal
  const [customerToDelete, setCustomerToDelete] = useState(null); // Cliente selecionado para exclusão
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await api.get('/customers');
        setCustomers(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao obter clientes:', error);
        setError('Erro ao obter clientes.');
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

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
      toast.success('Cliente excluído com sucesso!'); // Toast de sucesso
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      toast.error('Erro ao excluir cliente'); // Toast de erro
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCustomerToDelete(null);
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
        <div>Carregando clientes...</div>
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
        <h2>Clientes</h2>
        <Link to="/customers/new" className="btn btn-success">
          Novo Cliente
        </Link>
      </div>
      <div className="table-responsive">
        <Table striped bordered hover>
          <thead className="table-dark">
            <tr>
              <th>CPF/CNPJ</th>
              <th>Nome</th>
              <th>Contato</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Whatsapp</th>
              <th>CEP</th>
              <th>Rua</th>
              <th>Número</th>
              <th>Complemento</th>
              <th>Bairro</th>
              <th>Cidade</th>
              <th>Estado</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {customers.length > 0 ? (
              customers.map((customer) => (
                <tr key={customer._id}>
                  <td>{customer.cpfCnpj}</td>
                  <td>{customer.nome}</td>
                  <td>{customer.contato || '-'}</td>
                  <td>{customer.email || '-'}</td>
                  <td>{customer.telefone || '-'}</td>
                  <td>{customer.whatsapp || '-'}</td>
                  <td>{customer.cep || '-'}</td>
                  <td>{customer.rua || '-'}</td>
                  <td>{customer.numero || '-'}</td>
                  <td>{customer.complemento || '-'}</td>
                  <td>{customer.bairro || '-'}</td>
                  <td>{customer.cidade || '-'}</td>
                  <td>{customer.estado || '-'}</td>
                  <td>
                    <Button
                      variant="primary"
                      size="sm"
                      className="me-2"
                      onClick={() => navigate(`/customers/${customer._id}`)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteClick(customer)}
                    >
                      Excluir
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="14" className="text-center">
                  Nenhum cliente encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {customerToDelete && (
            <p>
              Tem certeza que deseja excluir o cliente <strong>{customerToDelete.nome}</strong>?
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
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

export default CustomerList;
