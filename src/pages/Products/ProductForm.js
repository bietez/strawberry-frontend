// src/pages/Products/ProductForm.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import InputMask from 'react-input-mask';

function ProductForm() {
  const [product, setProduct] = useState({
    nome: '',
    categoria: '',
    preco: '',
    descricao: '',
    disponivel: true,
    quantidadeEstoque: 0,
  });
  const [categories, setCategories] = useState([]); // Lista de categorias
  const [loading, setLoading] = useState(false); // Controle de carregamento
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Função para buscar categorias
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories'); // Supondo que exista este endpoint
        setCategories(response.data);
      } catch (error) {
        console.error('Erro ao obter categorias:', error);
        toast.error('Erro ao obter categorias.');
      }
    };

    fetchCategories();

    if (id) {
      setLoading(true);
      api.get(`/products/${id}`)
        .then((response) => {
          const data = response.data;
          setProduct({
            nome: data.nome || '',
            categoria: data.categoria?._id || '',
            preco: data.preco || '',
            descricao: data.descricao || '',
            disponivel: data.disponivel || false,
            quantidadeEstoque: data.quantidadeEstoque || 0,
          });
        })
        .catch((error) => {
          console.error('Erro ao obter produto:', error);
          toast.error('Erro ao obter produto.');
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct({
      ...product,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await api.put(`/products/${id}`, product);
        toast.success('Produto atualizado com sucesso!');
      } else {
        await api.post('/products', product);
        toast.success('Produto criado com sucesso!');
      }
      navigate('/products');
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao salvar produto';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
        <div>Carregando produto...</div>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h2>{id ? 'Editar Produto' : 'Novo Produto'}</h2>
      <Form onSubmit={handleSubmit}>
        <Row>
          {/* Nome */}
          <Col md={6}>
            <Form.Group controlId="nome" className="mb-3">
              <Form.Label>Nome*</Form.Label>
              <Form.Control
                type="text"
                name="nome"
                value={product.nome}
                onChange={handleChange}
                placeholder="Nome do produto"
                required
              />
            </Form.Group>
          </Col>

          {/* Categoria */}
          <Col md={6}>
            <Form.Group controlId="categoria" className="mb-3">
              <Form.Label>Categoria*</Form.Label>
              <Form.Select
                name="categoria"
                value={product.categoria}
                onChange={handleChange}
                required
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.categoria}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          {/* Preço */}
          <Col md={6}>
            <Form.Group controlId="preco" className="mb-3">
              <Form.Label>Preço*</Form.Label>
              <InputMask
                mask="99999.99"
                value={product.preco}
                onChange={handleChange}
                maskChar=""
              >
                {(inputProps) => (
                  <Form.Control
                    type="text"
                    name="preco"
                    placeholder="0.00"
                    required
                    {...inputProps}
                  />
                )}
              </InputMask>
              <Form.Text className="text-muted">Exemplo: 99.99</Form.Text>
            </Form.Group>
          </Col>

          {/* Quantidade em Estoque */}
          <Col md={6}>
            <Form.Group controlId="quantidadeEstoque" className="mb-3">
              <Form.Label>Quantidade em Estoque*</Form.Label>
              <Form.Control
                type="number"
                name="quantidadeEstoque"
                value={product.quantidadeEstoque}
                onChange={handleChange}
                placeholder="0"
                min="0"
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          {/* Disponível */}
          <Col md={6}>
            <Form.Group controlId="disponivel" className="mb-3">
              <Form.Check
                type="checkbox"
                name="disponivel"
                label="Disponível"
                checked={product.disponivel}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>

          {/* Descrição */}
          <Col md={6}>
            <Form.Group controlId="descricao" className="mb-3">
              <Form.Label>Descrição</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="descricao"
                value={product.descricao}
                onChange={handleChange}
                placeholder="Descrição do produto"
              />
            </Form.Group>
          </Col>
        </Row>

        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />{' '}
              {id ? 'Atualizando...' : 'Criando...'}
            </>
          ) : (
            id ? 'Atualizar' : 'Criar'
          )}
        </Button>
        {' '}
        <Button variant="secondary" onClick={() => navigate('/products')}>
          Cancelar
        </Button>
      </Form>
    </Container>
  );
}

export default ProductForm;
