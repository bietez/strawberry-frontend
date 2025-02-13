// src/pages/Recipes/RecipeForm.js

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Spinner,
  Alert,
  InputGroup,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { toast, ToastContainer } from 'react-toastify';

function RecipeForm() {
  const [recipe, setRecipe] = useState({
    nome: '',
    categoria: '',
    precoVenda: 0,
    descricao: '',
    ingredientes: [],
  });
  const [allIngredients, setAllIngredients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ingredientsRes, categoriesRes] = await Promise.all([
          api.get('/ingredients'),
          api.get('/categories'),
        ]);
  
        // Ordena os ingredientes por nome em ordem alfabética
        const sortedIngredients = ingredientsRes.data.sort((a, b) =>
          a.nome.localeCompare(b.nome)
        );
  
        setAllIngredients(sortedIngredients);
        setCategories(categoriesRes.data);

        if (id) {
          const recipeRes = await api.get(`/recipes/${id}`);
          const recipeData = recipeRes.data;
  
          const ingredientes = recipeData.ingredientes.map(item => ({
            ingrediente: item.ingrediente._id || item.ingrediente,
            quantidade: item.quantidade,
            unidade: item.unidade,
          }));
  
          setRecipe({ ...recipeData, ingredientes });
        } else {
          setRecipe((prev) => ({
            ...prev,
            ingredientes: [{ ingrediente: '', quantidade: 0, unidade: '' }],
          }));
        }
  
        setLoading(false);
      } catch (error) {
        console.error('Erro ao obter dados:', error);
        setError('Erro ao obter dados. Por favor, tente novamente mais tarde.');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipe({ ...recipe, [name]: value });
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...recipe.ingredientes];
    newIngredients[index][field] = value;
    setRecipe({ ...recipe, ingredientes: newIngredients });
  };

  const addIngredient = () => {
    setRecipe({
      ...recipe,
      ingredientes: [...recipe.ingredientes, { ingrediente: '', quantidade: 0, unidade: '' }],
    });
  };

  const removeIngredient = (index) => {
    const newIngredients = [...recipe.ingredientes];
    newIngredients.splice(index, 1);
    setRecipe({ ...recipe, ingredientes: newIngredients });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const filteredIngredientes = recipe.ingredientes.filter(
        (ing) => ing.ingrediente && ing.quantidade > 0 && ing.unidade
      );

      if (filteredIngredientes.length === 0) {
        toast.error('Adicione pelo menos um ingrediente válido.');
        return;
      }

      const payload = {
        nome: recipe.nome,
        categoria: recipe.categoria,
        precoVenda: recipe.precoVenda,
        descricao: recipe.descricao,
        ingredientes: filteredIngredientes,
      };

      if (id) {
        await api.put(`/recipes/${id}`, payload);
        toast.success('Receita atualizada com sucesso!');
      } else {
        await api.post('/recipes', payload);
        toast.success('Receita criada com sucesso!');
      }
      navigate('/recipes');
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Erro ao salvar receita.');
      }
    }
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
        <div>Carregando dados...</div>
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

  const unidades = [
    'xícaras',
    'ml',
    'gramas',
    'kg',
    'lata',
    'litro',
    'colheres de sopa',
    'colheres de chá',
    'unidades',
    'fatias',
    'pedaços',
  ];

  return (
    <Container className="my-5">
      <ToastContainer />
      <Row className="mb-4">
        <Col>
          <h2>{id ? 'Editar Receita' : 'Nova Receita'}</h2>
        </Col>
        <Col className="text-end">
          <Button variant="secondary" onClick={() => navigate('/recipes')}>
            Voltar para Receitas
          </Button>
        </Col>
      </Row>
      <Form onSubmit={handleSubmit}>
        <Form.Group as={Row} className="mb-3" controlId="formNome">
          <Form.Label column sm={2}>
            Nome:
          </Form.Label>
          <Col sm={10}>
            <Form.Control
              type="text"
              name="nome"
              value={recipe.nome}
              onChange={handleChange}
              placeholder="Digite o nome da receita"
              required
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3" controlId="formCategoria">
          <Form.Label column sm={2}>
            Categoria:
          </Form.Label>
          <Col sm={10}>
            <Form.Select
              name="categoria"
              value={recipe.categoria}
              onChange={handleChange}
              required
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.categoria}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3" controlId="formPrecoVenda">
          <Form.Label column sm={2}>
            Preço de Venda:
          </Form.Label>
          <Col sm={10}>
            <InputGroup>
              <InputGroup.Text>R$</InputGroup.Text>
              <Form.Control
                type="number"
                name="precoVenda"
                value={recipe.precoVenda}
                onChange={handleChange}
                placeholder="Digite o preço de venda"
                min="0"
                step="0.01"
                required
              />
            </InputGroup>
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3" controlId="formDescricao">
          <Form.Label column sm={2}>
            Descrição:
          </Form.Label>
          <Col sm={10}>
            <Form.Control
              as="textarea"
              name="descricao"
              value={recipe.descricao}
              onChange={handleChange}
              placeholder="Digite uma descrição para a receita (opcional)"
              rows={3}
            />
          </Col>
        </Form.Group>

        <Form.Group className="mb-3">
          <h4>Ingredientes</h4>
          {recipe.ingredientes.map((ing, index) => (
            <Row key={index} className="align-items-center mb-2">
              <Col sm={4}>
                <Form.Select
                  value={ing.ingrediente}
                  onChange={(e) =>
                    handleIngredientChange(index, 'ingrediente', e.target.value)
                  }
                  required
                >
                  <option value="">Selecione um ingrediente</option>
                  {allIngredients.map((ingredient) => (
                    <option key={ingredient._id} value={ingredient._id}>
                      {ingredient.nome}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col sm={3}>
                <Form.Control
                  type="number"
                  placeholder="Quantidade"
                  value={ing.quantidade}
                  onChange={(e) =>
                    handleIngredientChange(index, 'quantidade', e.target.value)
                  }
                  min="0"
                  required
                />
              </Col>
              <Col sm={3}>
                <Form.Select
                  value={ing.unidade}
                  onChange={(e) =>
                    handleIngredientChange(index, 'unidade', e.target.value)
                  }
                  required
                >
                  <option value="">Unidade</option>
                  {unidades.map((unidade, idx) => (
                    <option key={idx} value={unidade}>
                      {unidade}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col sm={2}>
                <Button
                  variant="danger"
                  onClick={() => removeIngredient(index)}
                  aria-label="Remover Ingrediente"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </Col>
            </Row>
          ))}
          <Button
            variant="secondary"
            onClick={addIngredient}
            aria-label="Adicionar Ingrediente"
          >
            <FontAwesomeIcon icon={faPlus} /> Adicionar Ingrediente
          </Button>
        </Form.Group>

        <Row className="mt-4">
          <Col className="text-end">
            <Button variant="primary" type="submit">
              {id ? 'Atualizar Receita' : 'Criar Receita'}
            </Button>
          </Col>
        </Row>
      </Form>
    </Container>
  );
}

export default RecipeForm;
