// src/pages/Suppliers/SuppliersPage.js
import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import SupplierList from './SupplierList';
import SupplierForm from './SupplierForm';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import jwtDecode from 'jwt-decode';

const SuppliersPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [key, setKey] = useState('list');
  const [editSupplier, setEditSupplier] = useState(null);

  // Verifica se a rota é de edição e preenche o formulário
  useEffect(() => {
    const pathParts = location.pathname.split('/');
    if (pathParts[1] === 'suppliers' && pathParts[2] === 'edit' && pathParts[3]) {
      const supplierId = pathParts[3];
      // Busca os dados do fornecedor para edição
      api.get(`/suppliers/${supplierId}`)
        .then(res => {
          setEditSupplier(res.data);
          setKey('form');
        })
        .catch(err => {
          console.error('Erro ao buscar fornecedor para edição:', err);
          toast.error('Erro ao buscar fornecedor para edição.');
          navigate('/suppliers');
        });
    }
  }, [location.pathname, navigate]);

  const handleEdit = (supplier) => {
    setEditSupplier(supplier);
    setKey('form');
    navigate(`/suppliers/edit/${supplier._id}`);
  };

  const handleFormSubmit = () => {
    setEditSupplier(null);
    setKey('list');
    navigate('/suppliers');
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <Tabs
            id="suppliers-tabs"
            activeKey={key}
            onSelect={(k) => {
              setKey(k);
              if (k === 'list') {
                navigate('/suppliers');
              } else {
                navigate('/suppliers/new');
              }
            }}
            className="mb-3"
          >
            <Tab eventKey="list" title="Lista de Fornecedores">
              <SupplierList onEdit={handleEdit} />
            </Tab>
            <Tab eventKey="form" title={editSupplier ? "Editar Fornecedor" : "Adicionar Fornecedor"}>
              <SupplierForm supplier={editSupplier} onSubmit={handleFormSubmit} />
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
};

export default SuppliersPage;
