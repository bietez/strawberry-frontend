// src/pages/Categories/CategoryForm.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Container, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';

function CategoryForm() {
  const [category, setCategory] = useState({
    categoria: '',
    descricao: '',
    habilitado: true,
  });
  const [loading, setLoading] = useState(false);
  const { id } = useParams(); // Obtemos o id da categoria caso estejamos editando
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchCategory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/categories/${id}`);
      setCategory(response.data);
    } catch (error) {
      console.error('Erro ao obter categoria:', error);
      toast.error('Erro ao obter categoria');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCategory({
      ...category,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        // Atualizar categoria existente
        await api.put(`/categories/${id}`, category);
        toast.success('Categoria atualizada com sucesso!');
      } else {
        // Criar nova categoria
        await api.post('/categories', category);
        toast.success('Categoria criada com sucesso!');
      }
      navigate('/categories'); // Redireciona para a lista de categorias
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast.error('Erro ao salvar categoria');
    }
  };

  return (
    <Container className="my-5">
      <h2 className="mb-4">{id ? 'Editar Categoria' : 'Nova Categoria'}</h2>
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Carregando categoria...</p>
        </div>
      ) : (
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="categoria" className="mb-3">
            <Form.Label>Categoria</Form.Label>
            <Form.Control
              type="text"
              name="categoria"
              value={category.categoria}
              onChange={handleChange}
              placeholder="Digite o nome da categoria"
              required
            />
          </Form.Group>

          <Form.Group controlId="descricao" className="mb-3">
            <Form.Label>Descrição</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="descricao"
              value={category.descricao}
              onChange={handleChange}
              placeholder="Digite a descrição da categoria"
              required
            />
          </Form.Group>

          <Form.Group controlId="habilitado" className="mb-3">
            <Form.Check
              type="checkbox"
              label="Habilitado"
              name="habilitado"
              checked={category.habilitado}
              onChange={handleChange}
            />
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button variant="secondary" className="me-2" onClick={() => navigate('/categories')}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {id ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </Form>
      )}
    </Container>
  );
}

export default CategoryForm;
