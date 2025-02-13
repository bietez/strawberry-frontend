// src/pages/Ingredients/IngredientForm.js
import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../../services/api';

function IngredientForm({ initialData, onClose }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [ingredient, setIngredient] = useState({
    nome: '',
    unidadeMedida: 'kg',
    quantidadeEstoque: 0,
    precoCusto: 0,
    imagem: '',
    imagemFile: null, // Arquivo de imagem
  });

  useEffect(() => {
    if (initialData) {
      setIngredient({
        nome: initialData.nome || '',
        unidadeMedida: initialData.unidadeMedida || 'kg',
        quantidadeEstoque: initialData.quantidadeEstoque || 0,
        precoCusto: initialData.precoCusto || 0,
        imagem: initialData.imagem || '',
        imagemFile: null, // Resetar arquivo de imagem
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setIngredient({ ...ingredient, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        toast.error('Apenas arquivos JPEG, JPG, PNG e GIF são permitidos.');
        return;
      }

      if (file.size > maxSize) {
        toast.error('O tamanho do arquivo excede 5MB.');
        return;
      }

      setIngredient({ ...ingredient, imagemFile: file });

      // Exibir pré-visualização da imagem
      const reader = new FileReader();
      reader.onloadend = () => {
        setIngredient((prev) => ({ ...prev, imagem: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('nome', ingredient.nome);
    formData.append('unidadeMedida', ingredient.unidadeMedida);
    formData.append('quantidadeEstoque', ingredient.quantidadeEstoque);
    formData.append('precoCusto', ingredient.precoCusto);
    if (ingredient.imagemFile) {
      formData.append('imagem', ingredient.imagemFile);
    }

    try {
      if (initialData) {
        // Atualizar ingrediente existente
        await api.put(`/ingredients/${initialData._id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Ingrediente atualizado com sucesso!');
      } else {
        // Criar novo ingrediente
        await api.post('/ingredients', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Ingrediente criado com sucesso!');
      }

      setLoading(false);
      onClose(); // Fechar o formulário/modal após sucesso
    } catch (err) {
      console.error('Erro ao salvar ingrediente:', err);
      setError(err.response?.data?.message || 'Erro ao salvar ingrediente.');
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <h2>{initialData ? 'Editar Ingrediente' : 'Criar Ingrediente'}</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="nome">
          <Form.Label>Nome</Form.Label>
          <Form.Control
            type="text"
            name="nome"
            value={ingredient.nome}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="unidadeMedida">
          <Form.Label>Unidade de Medida</Form.Label>
          <Form.Select
            name="unidadeMedida"
            value={ingredient.unidadeMedida}
            onChange={handleChange}
            required
          >
            <option value="kg">Kg</option>
            <option value="g">Grama</option>
            <option value="unidade">Unidade</option>
            <option value="litro">Litro</option>
            <option value="ml">Mililitro</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3" controlId="quantidadeEstoque">
          <Form.Label>Quantidade em Estoque</Form.Label>
          <Form.Control
            type="number"
            name="quantidadeEstoque"
            value={ingredient.quantidadeEstoque}
            onChange={handleChange}
            required
            min="0"
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="precoCusto">
          <Form.Label>Preço de Custo</Form.Label>
          <Form.Control
            type="number"
            name="precoCusto"
            value={ingredient.precoCusto}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="imagem">
          <Form.Label>Imagem do Ingrediente</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          {ingredient.imagem && (
            <div className="mt-2">
              <img src={ingredient.imagem} alt="Ingrediente" style={{ height: '100px' }} />
            </div>
          )}
        </Form.Group>

        <div className="d-flex justify-content-end">
          <Button variant="secondary" onClick={onClose} className="me-2" disabled={loading}>
            Cancelar
          </Button>
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
                Salvando...
              </>
            ) : initialData ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </Form>
    </Container>
  );
}

export default IngredientForm;
