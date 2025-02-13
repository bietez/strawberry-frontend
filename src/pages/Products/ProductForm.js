  // src/pages/Products/ProductForm.js
  import React, { useEffect, useState } from 'react';
  import api from '../../services/api';
  import { useFormik } from 'formik';
  import * as Yup from 'yup';
  import { Button, Container, Alert, Spinner } from 'react-bootstrap';
  import { useParams, useNavigate } from 'react-router-dom';
  import { toast } from 'react-toastify';

  // Hook personalizado para buscar categorias
  import useFetchCategories from '../../hooks/useFetchCategories';

  const ProductSchema = Yup.object().shape({
    nome: Yup.string().required('Nome é obrigatório'),
    categoria: Yup.string().required('Categoria é obrigatória'),
    preco: Yup.number().min(0, 'Preço deve ser positivo').required('Preço é obrigatório'),
    quantidadeEstoque: Yup.number().min(0, 'Quantidade deve ser positiva').required('Quantidade é obrigatória'),
    imagem: Yup.string()
      .test('is-valid-url', 'Deve ser uma URL válida', (value) => {
        if (!value) return true; // Campo opcional
        try {
          new URL(value);
          return true;
        } catch (_) {
          return false;
        }
      })
      .notRequired()
      .nullable()
      .transform((curr, orig) => (orig === '' ? null : curr)),
  });

  function ProductForm() {
    const { categories, loadingCategories, errorCategories } = useFetchCategories(); // Usar o hook
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    const [isNomeDuplicado, setIsNomeDuplicado] = useState(false);
    const [checkingDuplicacy, setCheckingDuplicacy] = useState(false);

    const formik = useFormik({
      initialValues: {
        nome: '',
        categoria: '',
        preco: '',
        descricao: '',
        disponivel: true,
        quantidadeEstoque: 0,
        imagem: '', // Novo campo para a URL da imagem
      },
      enableReinitialize: true,
      validationSchema: ProductSchema,
      onSubmit: async (values, { setSubmitting }) => {
        try {
          console.log('Valores do formulário antes do submit:', values); // Log para depuração
          if (id) {
            await api.put(`/products/${id}`, values);
            toast.success('Produto atualizado com sucesso!');
          } else {
            await api.post('/products', values);
            toast.success('Produto criado com sucesso!');
          }
          navigate('/products');
        } catch (error) {
          console.error('Erro ao salvar produto:', error);
          if (error.response) {
            console.error('Resposta do backend:', error.response.data);
            toast.error(`Erro ao salvar produto: ${error.response.data.message || 'Erro desconhecido'}`);
          } else {
            toast.error('Erro ao salvar produto: Não foi possível conectar ao servidor.');
          }
        } finally {
          setSubmitting(false);
        }
      },
    });

    useEffect(() => {
      // Carregar detalhes do produto se em edição
      const fetchProductDetails = async () => {
        if (id) {
          try {
            setLoading(true);
            const response = await api.get(`/products/${id}`);
            const product = response.data;
            formik.setValues({
              nome: product.nome || '',
              categoria: product.categoria?._id || '',
              preco: product.preco || '',
              descricao: product.descricao || '',
              disponivel: product.disponivel,
              quantidadeEstoque: product.quantidadeEstoque || 0,
              imagem: product.imagem || '', // Inclui a URL da imagem existente
            });
          } catch (error) {
            console.error('Erro ao obter produto:', error);
            setError('Erro ao obter produto: ' + (error.response?.data?.message || error.message));
          } finally {
            setLoading(false);
          }
        }
      };

      fetchProductDetails();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    useEffect(() => {
      // Verificar duplicidade do nome sempre que o nome mudar
      const checkNomeDuplicado = async (nome) => {
        if (!nome) {
          setIsNomeDuplicado(false);
          return;
        }
        try {
          setCheckingDuplicacy(true);
          const response = await api.get(`/products/check-nome/${encodeURIComponent(nome)}`);
          setIsNomeDuplicado(response.data.exists && (!id || (id && response.data.productId !== id)));
        } catch (error) {
          console.error('Erro ao verificar duplicidade do nome:', error);
        } finally {
          setCheckingDuplicacy(false);
        }
      };

      checkNomeDuplicado(formik.values.nome);
    }, [formik.values.nome, id]);

    // Função para fazer upload da imagem
    const uploadImage = async (file) => {
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

      const formData = new FormData();
      formData.append('imagem', file);

      try {
        setLoading(true);
        const response = await api.post('/upload', formData);
        console.log('Resposta do upload:', response.data); // Log para depuração
        // Atualiza o campo 'imagem' com a URL retornada
        formik.setFieldValue('imagem', response.data.imageUrl);
        console.log('Campo imagem atualizado para:', response.data.imageUrl); // Novo log
        toast.success('Imagem carregada com sucesso!');
      } catch (error) {
        console.error('Erro ao carregar imagem:', error.response || error.message);
        const message = error.response?.data?.message || 'Erro desconhecido ao carregar imagem';
        toast.error(`Erro ao carregar imagem: ${message}`);
      } finally {
        setLoading(false);
      }
    };

    if (loading || loadingCategories) {
      return (
        <Container className="mt-4 text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Carregando...</p>
        </Container>
      );
    }

    return (
      <Container className="mt-4">
        <h2>{id ? 'Editar Produto' : 'Novo Produto'}</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        {errorCategories && <Alert variant="danger">{errorCategories}</Alert>}
        <form onSubmit={formik.handleSubmit}>
          <div className="mb-3">
            <label htmlFor="nome">Nome</label>
            <input
              id="nome"
              name="nome"
              type="text"
              className="form-control"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.nome}
            />
            {isNomeDuplicado && <div className="text-danger">Já existe um produto com este nome.</div>}
            {formik.touched.nome && formik.errors.nome ? (
              <div className="text-danger">{formik.errors.nome}</div>
            ) : null}
          </div>

          <div className="mb-3">
            <label htmlFor="categoria">Categoria</label>
            <select
              id="categoria"
              name="categoria"
              className="form-control"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.categoria}
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.categoria} - {category.descricao}
                </option>
              ))}
            </select>
            {formik.touched.categoria && formik.errors.categoria ? (
              <div className="text-danger">{formik.errors.categoria}</div>
            ) : null}
          </div>

          <div className="mb-3">
            <label htmlFor="preco">Preço</label>
            <input
              id="preco"
              name="preco"
              type="number"
              className="form-control"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.preco}
            />
            {formik.touched.preco && formik.errors.preco ? (
              <div className="text-danger">{formik.errors.preco}</div>
            ) : null}
          </div>

          <div className="mb-3">
            <label htmlFor="quantidadeEstoque">Quantidade em Estoque</label>
            <input
              id="quantidadeEstoque"
              name="quantidadeEstoque"
              type="number"
              className="form-control"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.quantidadeEstoque}
            />
            {formik.touched.quantidadeEstoque && formik.errors.quantidadeEstoque ? (
              <div className="text-danger">{formik.errors.quantidadeEstoque}</div>
            ) : null}
          </div>

          <div className="mb-3 form-check">
            <input
              id="disponivel"
              name="disponivel"
              type="checkbox"
              className="form-check-input"
              onChange={formik.handleChange}
              checked={formik.values.disponivel}
            />
            <label className="form-check-label" htmlFor="disponivel">
              Disponível
            </label>
          </div>

          <div className="mb-3">
            <label htmlFor="descricao">Descrição</label>
            <textarea
              id="descricao"
              name="descricao"
              className="form-control"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.descricao}
            />
            {formik.touched.descricao && formik.errors.descricao ? (
              <div className="text-danger">{formik.errors.descricao}</div>
            ) : null}
          </div>

          {/* Campo de Upload de Imagem */}
          <div className="mb-3">
            <label htmlFor="imagem">Imagem do Produto</label>
            <input
              id="imagem"
              name="imagem"
              type="file"
              accept="image/*"
              className="form-control"
              onChange={(event) => {
                const file = event.currentTarget.files[0];
                if (file) {
                  uploadImage(file);
                }
              }}
            />
            {formik.errors.imagem && formik.touched.imagem ? (
              <div className="text-danger">{formik.errors.imagem}</div>
            ) : null}
            {/* Exibir a imagem selecionada */}
            {formik.values.imagem && (
              <div className="mt-2">
                <img src={formik.values.imagem} alt="Produto" style={{ height: '100px' }} />
              </div>
            )}
          </div>

          <Button variant="primary" type="submit" disabled={formik.isSubmitting || loading || isNomeDuplicado}>
            {formik.isSubmitting || loading ? 'Salvando...' : id ? 'Atualizar Produto' : 'Criar Produto'}
          </Button>
          {isNomeDuplicado && (
            <div className="text-danger mt-2">Por favor, escolha um nome diferente para o produto.</div>
          )}
        </form>
      </Container>
    );
  }

  export default ProductForm;
