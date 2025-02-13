// src/pages/Suppliers/SupplierList.js
import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Spinner, Alert, Modal } from 'react-bootstrap';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPencilAlt, faSearch } from '@fortawesome/free-solid-svg-icons';

const SupplierList = ({ onEdit }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Estado para o modal de detalhes
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const fetchSuppliers = async (pageNumber = 1, searchTerm = '') => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get('/suppliers', {
        params: {
          page: pageNumber,
          limit: 10,
          search: searchTerm,
        },
      });
      setSuppliers(res.data.suppliers);
      setTotalPages(res.data.totalPages);
      setPage(res.data.currentPage);
    } catch (err) {
      console.error('Erro ao buscar fornecedores:', err);
      setError(true);
      toast.error('Erro ao buscar fornecedores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSuppliers(1, search);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar este fornecedor?')) return;
    try {
      await api.delete(`/suppliers/${id}`);
      toast.success('Fornecedor deletado com sucesso.');
      fetchSuppliers(page, search);
    } catch (err) {
      console.error('Erro ao deletar fornecedor:', err);
      toast.error('Erro ao deletar fornecedor.');
    }
  };

  const handlePageChange = (newPage) => {
    fetchSuppliers(newPage, search);
  };

  // Função para abrir o modal de detalhes
  const handleViewDetails = (supplier) => {
    setSelectedSupplier(supplier);
    setShowDetailsModal(true);
  };

  // Função para fechar o modal de detalhes
  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedSupplier(null);
  };

  return (
    <>
      <Form onSubmit={handleSearch} className="d-flex mb-3">
        <Form.Control 
          type="text" 
          placeholder="Buscar por nome, categoria ou produto" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button type="submit" variant="primary" className="ms-2">Buscar</Button>
      </Form>

      {loading ? (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" />
        </div>
      ) : error ? (
        <Alert variant="danger">Erro ao carregar fornecedores.</Alert>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>CNPJ</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.length > 0 ? suppliers.map(supplier => (
                <tr key={supplier._id}>
                  <td>{supplier.name}</td>
                  <td>{supplier.category}</td>
                  <td>{supplier.email}</td>
                  <td>{supplier.phone}</td>
                  <td>{supplier.cnpj}</td>
                  <td>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="me-2"
                      onClick={() => handleViewDetails(supplier)}
                      title="Ver Detalhes"
                    >
                      <FontAwesomeIcon icon={faSearch} />
                    </Button>
                    <Button 
                      variant="warning" 
                      size="sm" 
                      className="me-2"
                      onClick={() => onEdit(supplier)}
                      title="Editar"
                    >
                      <FontAwesomeIcon icon={faPencilAlt} />
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => handleDelete(supplier._id)}
                      title="Excluir"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="text-center">Nenhum fornecedor encontrado.</td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center">
              <Button 
                variant="secondary" 
                disabled={page === 1} 
                onClick={() => handlePageChange(page - 1)}
                className="me-2"
              >
                Anterior
              </Button>
              <span className="align-self-center">Página {page} de {totalPages}</span>
              <Button 
                variant="secondary" 
                disabled={page === totalPages} 
                onClick={() => handlePageChange(page + 1)}
                className="ms-2"
              >
                Próximo
              </Button>
            </div>
          )}
        </>
      )}

      {/* Modal de Detalhes do Fornecedor */}
      <Modal show={showDetailsModal} onHide={handleCloseDetailsModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Detalhes do Fornecedor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSupplier ? (
            <>
              <p><strong>Nome:</strong> {selectedSupplier.name}</p>
              <p><strong>Categoria:</strong> {selectedSupplier.category}</p>
              <p><strong>Email:</strong> {selectedSupplier.email}</p>
              <p><strong>Telefone:</strong> {selectedSupplier.phone}</p>
              <p><strong>CNPJ:</strong> {selectedSupplier.cnpj}</p>
              <p><strong>Endereço:</strong> {selectedSupplier.address}</p>
              {selectedSupplier.website && (
                <p><strong>Website:</strong> {selectedSupplier.website}</p>
              )}
              <p><strong>Produtos:</strong></p>
              <ul>
                {selectedSupplier.products.map((product, index) => (
                  <li key={index}>{product}</li>
                ))}
              </ul>
            </>
          ) : (
            <p>Carregando detalhes...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetailsModal}>Fechar</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SupplierList;
