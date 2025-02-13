// src/pages/Suppliers/SupplierForm.js
import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import api from '../../services/api';
import { toast } from 'react-toastify';

const SupplierForm = ({ supplier, onSubmit }) => {
  const isEdit = Boolean(supplier);

  const [formData, setFormData] = useState({
    category: '',
    name: '',
    email: '',
    phone: '',
    cnpj: '',
    address: '',
    website: '',
    products: [''],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = [
    'Alimentos',
    'Bebidas',
    'Limpeza',
    'Higiene Pessoal',
    'Utensílios',
    'Tecnologia',
    'Outro',
  ];

  useEffect(() => {
    if (isEdit && supplier) {
      setFormData({
        category: supplier.category,
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone,
        cnpj: supplier.cnpj,
        address: supplier.address,
        website: supplier.website || '',
        products: supplier.products.length > 0 ? supplier.products : [''],
      });
    }
  }, [isEdit, supplier]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProductChange = (index, value) => {
    const newProducts = [...formData.products];
    newProducts[index] = value;
    setFormData({ ...formData, products: newProducts });
  };

  const addProductField = () => {
    setFormData({ ...formData, products: [...formData.products, ''] });
  };

  const removeProductField = (index) => {
    const newProducts = [...formData.products];
    newProducts.splice(index, 1);
    setFormData({ ...formData, products: newProducts });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validação simples
    if (formData.products.some(p => p.trim() === '')) {
      setError('Todos os campos de produtos devem ser preenchidos.');
      setLoading(false);
      return;
    }

    try {
      if (isEdit) {
        await api.put(`/suppliers/${supplier._id}`, formData);
        toast.success('Fornecedor atualizado com sucesso.');
      } else {
        await api.post('/suppliers', formData);
        toast.success('Fornecedor criado com sucesso.');
      }
      onSubmit();
    } catch (err) {
      console.error('Erro ao salvar fornecedor:', err);
      setError(err.response?.data?.message || 'Erro ao salvar fornecedor.');
      toast.error(err.response?.data?.message || 'Erro ao salvar fornecedor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div className="d-flex justify-content-center my-3">
          <Spinner animation="border" />
        </div>
      )}
      {!loading && (
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="category" className="mb-3">
            <Form.Label>Categoria</Form.Label>
            <Form.Select 
              name="category" 
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Selecione uma categoria</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group controlId="name" className="mb-3">
            <Form.Label>Nome do Fornecedor</Form.Label>
            <Form.Control 
              type="text" 
              name="name"
              placeholder="Digite o nome do fornecedor"
              value={formData.name}
              onChange={handleChange}
              required 
            />
          </Form.Group>

          <Form.Group controlId="email" className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control 
              type="email" 
              name="email"
              placeholder="Digite o email do fornecedor"
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </Form.Group>

          <Form.Group controlId="phone" className="mb-3">
            <Form.Label>Telefone</Form.Label>
            <Form.Control 
              type="text" 
              name="phone"
              placeholder="Digite o telefone do fornecedor"
              value={formData.phone}
              onChange={handleChange}
              required 
            />
          </Form.Group>

          <Form.Group controlId="cnpj" className="mb-3">
            <Form.Label>CNPJ</Form.Label>
            <Form.Control 
              type="text" 
              name="cnpj"
              placeholder="Digite o CNPJ do fornecedor"
              value={formData.cnpj}
              onChange={handleChange}
              required 
            />
          </Form.Group>

          <Form.Group controlId="address" className="mb-3">
            <Form.Label>Endereço</Form.Label>
            <Form.Control 
              type="text" 
              name="address"
              placeholder="Digite o endereço do fornecedor"
              value={formData.address}
              onChange={handleChange}
              required 
            />
          </Form.Group>

          <Form.Group controlId="website" className="mb-3">
            <Form.Label>Website</Form.Label>
            <Form.Control 
              type="url" 
              name="website"
              placeholder="Digite o website do fornecedor"
              value={formData.website}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Label>Produtos Fornecidos</Form.Label>
          {formData.products.map((product, index) => (
            <Form.Group key={index} className="mb-2">
              <div className="d-flex">
                <Form.Control 
                  type="text" 
                  placeholder={`Produto ${index + 1}`}
                  value={product}
                  onChange={(e) => handleProductChange(index, e.target.value)}
                  required 
                />
                {formData.products.length > 1 && (
                  <Button 
                    variant="danger" 
                    onClick={() => removeProductField(index)}
                    className="ms-2"
                  >
                    Remover
                  </Button>
                )}
              </div>
            </Form.Group>
          ))}
          <Button variant="secondary" onClick={addProductField} className="mb-3">
            Adicionar Produto
          </Button>

          {error && <Alert variant="danger">{error}</Alert>}

          <Button variant="primary" type="submit">
            {isEdit ? 'Atualizar Fornecedor' : 'Adicionar Fornecedor'}
          </Button>
        </Form>
      )}
    </>
  );
};

export default SupplierForm;
