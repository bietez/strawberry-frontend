// src/components/OrderForm.jsx

import React, { useEffect, useState, useMemo, useContext } from 'react';
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Spinner,
  Alert,
  Card,
  ButtonGroup,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../services/api';
import styles from './OrderForm.module.css'; // Importação do CSS Module
import { DarkModeContext } from './Layout'; // Importação do contexto

/**
 * PROPS importantes:
 * - mesaId (string)  -> ID da mesa
 * - assento (string) -> Número do assento (ex: '3' ou '10')
 * - occupantName (string) -> Nome da pessoa sentada nesse assento
 * - onClose (func) -> Callback para fechar o modal
 */
function OrderForm({ mesaId, assento, occupantName, onClose }) {
  const { darkMode } = useContext(DarkModeContext); // Consumo do contexto

  const [customers, setCustomers] = useState([]);
  const [tables, setTables] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMesa, setSelectedMesa] = useState(null);

  // Form principal
  const [formData, setFormData] = useState({
    tipoPedido: 'local',           // Padrão e agora a única opção
    mesaId: mesaId || '',
    assento: assento || '',
    clienteId: '',
    enderecoEntrega: '',
    preparar: true,
    itens: [],
    searchTerm: '',
    observacao: '',
  });

  // Conjunto de categorias selecionadas para filtro de produtos
  const [selectedCategories, setSelectedCategories] = useState(new Set());

  // Estado para o nome do cliente
  const [nomeCliente, setNomeCliente] = useState(occupantName || '');

  // ======================================================
  //   1. Hooks para carregar dados iniciais (customers, tables, products)
  // ======================================================
  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (tables.length > 0 && formData.mesaId) {
      const mesa = tables.find((m) => m._id === formData.mesaId);
      setSelectedMesa(mesa || null);
    }
  }, [tables, formData.mesaId]);

  const fetchInitialData = async () => {
    try {
      const [customersRes, tablesRes, productsRes] = await Promise.all([
        api.get('/customers'),
        api.get('/tables'),
        api.get('/products'),
      ]);

      // Filtra apenas produtos disponíveis
      const availableProducts = productsRes.data.filter((prod) => prod.disponivel);

      if (
        Array.isArray(customersRes.data) &&
        Array.isArray(tablesRes.data) &&
        Array.isArray(availableProducts)
      ) {
        setCustomers(customersRes.data);
        setTables(tablesRes.data);
        setProducts(availableProducts);

        // Cria array "inicial" de itens (um "slot" p/ cada produto, quantidade=0)
        const initialItens = availableProducts.map((prod) => ({
          product: prod._id,
          quantidade: 0,
          tipo: 'prato principal',
        }));

        setFormData((prev) => ({ ...prev, itens: initialItens }));
        setLoading(false);
      } else {
        throw new Error('Formato de dados inesperado na API.');
      }
    } catch (error) {
      console.error('Erro ao obter dados iniciais:', error);
      setError(error.response?.data?.message || 'Erro desconhecido ao retornar dados.');
      setLoading(false);
    }
  };

  // ======================================================
  //   2. useMemo p/ Filtro de Produtos e Categorias
  // ======================================================
  const uniqueCategories = useMemo(() => {
    const categoriesSet = new Set();
    products.forEach((prod) => {
      if (prod.categoria && prod.categoria.categoria) {
        categoriesSet.add(prod.categoria.categoria);
      } else {
        categoriesSet.add('Outros');
      }
    });
    return Array.from(categoriesSet);
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = products;
    const term = formData.searchTerm.toLowerCase();

    // Filtro por texto
    if (term) {
      filtered = filtered.filter((prod) =>
        prod.nome.toLowerCase().includes(term)
      );
    }

    // Filtro por categorias
    if (selectedCategories.size > 0) {
      filtered = filtered.filter((prod) =>
        selectedCategories.has(prod.categoria?.categoria || 'Outros')
      );
    }

    return filtered;
  }, [products, formData.searchTerm, selectedCategories]);

  const productsByCategory = useMemo(() => {
    const grouped = {};
    filteredProducts.forEach((prod) => {
      const catName = prod.categoria?.categoria || 'Outros';
      if (!grouped[catName]) {
        grouped[catName] = [];
      }
      grouped[catName].push(prod);
    });
    return grouped;
  }, [filteredProducts]);

  // ======================================================
  //   3. Handlers do Form (handleFormChange etc.)
  // ======================================================
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'mesaId') {
      // Se trocar a mesa, pega do array 'tables'
      const mesa = tables.find((m) => m._id === value);
      setSelectedMesa(mesa || null);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        assento: assento || '',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handlePrepararChange = (e) => {
    setFormData((prev) => ({ ...prev, preparar: e.target.checked }));
  };

  /**
   * REMOVIDO handleTipoPedidoChange (pois agora só existe 'local')
   * E todas referências a "entrega" e "clienteId/enderecoEntrega"
   * também são descartadas ou ignoradas.
   */

  // ======================================================
  //   4. Manejo de Itens (quantidade, tipo)
  // ======================================================
  const handleItemTipoChange = (index, newTipo) => {
    const newItens = [...formData.itens];
    newItens[index].tipo = newTipo;
    setFormData((prev) => ({ ...prev, itens: newItens }));
  };

  const handleItemQuantidadeChange = (index, delta) => {
    const newItens = [...formData.itens];
    const product = products.find((p) => p._id === newItens[index].product);
    if (!product) return;

    const maxQty = product.quantidadeEstoque;
    const newQty = newItens[index].quantidade + delta;
    if (newQty >= 0 && newQty <= maxQty) {
      newItens[index].quantidade = newQty;
      setFormData((prev) => ({ ...prev, itens: newItens }));
    }
  };

  // ======================================================
  //   5. Buscar / Filtrar
  // ======================================================
  const handleSearchChange = (e) => {
    setFormData((prev) => ({ ...prev, searchTerm: e.target.value }));
  };

  const toggleCategory = (category) => {
    setSelectedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // ======================================================
  //   6. Cálculo de Total
  // ======================================================
  const calculateTotal = () => {
    let total = 0;
    formData.itens.forEach((item) => {
      if (item.quantidade > 0) {
        const p = products.find((pr) => pr._id === item.product);
        if (p) {
          total += p.preco * item.quantidade;
        }
      }
    });
    return total;
  };

  // ======================================================
  //   7. SUBMIT: Cria o pedido
  // ======================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Filtra itens com qte > 0
    const itensFiltrados = formData.itens
      .filter((item) => item.quantidade > 0)
      .map((item) => ({
        product: item.product,
        quantidade: item.quantidade,
        tipo: item.tipo,
      }));

    if (itensFiltrados.length === 0) {
      toast.error('Selecione ao menos um produto com quantidade > 0.');
      return;
    }

    // Agora só existe 'local', então simplifica validação
    if (!formData.mesaId) {
      toast.error('Selecione uma mesa.');
      return;
    }

    // Montar payload
    const payload = {
      tipoPedido: 'local',
      mesaId: formData.mesaId,
      assento: formData.assento || undefined,
      preparar: formData.preparar,
      itens: itensFiltrados,
      nomeCliente: nomeCliente.trim() || undefined, // Opcional
      observacao: formData.observacao,
    };

    try {
      await api.post('/orders', payload);
      toast.success('Pedido criado com sucesso!');
      if (onClose) onClose();
      // Opcional: Resetar o formulário após o envio
      resetForm();
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      const mensagemErro = error.response?.data?.message || 'Erro desconhecido.';
      toast.error(mensagemErro);
    }
  };

  // Função para resetar o formulário após o envio
  const resetForm = () => {
    setFormData({
      tipoPedido: 'local',
      mesaId: mesaId || '',
      assento: assento || '',
      clienteId: '',
      enderecoEntrega: '',
      preparar: true,
      itens: products.map((prod) => ({
        product: prod._id,
        quantidade: 0,
        tipo: 'prato principal',
      })),
      searchTerm: '',
      observacao: '',
    });
    setSelectedCategories(new Set());
    setNomeCliente(occupantName || '');
    setSelectedMesa(
      tables.find((m) => m._id === (mesaId || '')) || null
    );
  };

  // ======================================================
  //   8. Remover lógica de "entrega" (já não é usada)
  // ======================================================

  // ======================================================
  //   9. Verificações de loading / error
  // ======================================================
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

  // ======================================================
  //   10. Render principal
  // ======================================================
  const total = calculateTotal();
  const getItemIndexByProductId = (productId) =>
    formData.itens.findIndex((it) => it.product === productId);

  return (
    <Container fluid className={`${styles.orderForm} ${darkMode ? styles.darkMode : ''} my-5`}>
      <Row>
        {/* Coluna esquerda: Lista de produtos / busca */}
        <Col xs={12} md={8} lg={8}>
          <h2 className="mb-4">Novo Pedido</h2>

          {/* Campo de busca */}
          <Form.Group className="mb-4" controlId="searchField">
            <Form.Control
              type="text"
              placeholder="Digite o nome do produto..."
              value={formData.searchTerm}
              onChange={handleSearchChange}
              size="sm"
              className={styles.formControl}
            />
          </Form.Group>

          {/* Botões de Categoria */}
          <Form.Group className="mb-4" controlId="categoryFilter">
            <ButtonGroup className="d-flex flex-wrap">
              {uniqueCategories.map((category) => (
                <Button
                  key={category}
                  variant={
                    selectedCategories.has(category)
                      ? 'primary'
                      : 'outline-primary'
                  }
                  size="sm"
                  className="me-2 mb-2"
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                </Button>
              ))}
              <Button
                variant={
                  selectedCategories.size === 0
                    ? 'primary'
                    : 'outline-primary'
                }
                size="sm"
                className="me-2 mb-2"
                onClick={() => setSelectedCategories(new Set())}
              >
                Todas
              </Button>
            </ButtonGroup>
          </Form.Group>

          {/* Lista de produtos agrupados por categoria */}
          {Object.keys(productsByCategory).length === 0 ? (
            <Alert variant="info">Nenhum produto disponível para pedido.</Alert>
          ) : (
            Object.entries(productsByCategory).map(([catName, prods]) => (
              <div key={catName}>
                <h5 className="mt-4 mb-3">{catName}</h5>
                <Row>
                  {prods.map((prod) => {
                    const itemIndex = getItemIndexByProductId(prod._id);
                    const item = formData.itens[itemIndex];

                    return (
                      <Col
                        key={prod._id}
                        xs={6}
                        sm={4}
                        md={3}
                        className="d-flex align-items-stretch mb-4"
                      >
                        <Card className={`w-100 ${styles.card}`} style={{ fontSize: '0.9rem' }}>
                          <Card.Img
                            variant="top"
                            src={prod.imagem || 'https://placehold.co/150'}
                            alt={prod.nome}
                            style={{
                              height: '80px',
                              objectFit: 'cover',
                            }}
                          />
                          <Card.Body className="d-flex flex-column">
                            <Card.Title style={{ fontSize: '1rem' }}>
                              {prod.nome}
                            </Card.Title>
                            <div style={{ fontSize: '0.85rem' }}>
                              Preço: R$ {prod.preco.toFixed(2)}
                            </div>
                            <Form.Group className="mt-2" style={{ fontSize: '0.8rem' }}>
                              <Form.Select
                                value={item.tipo}
                                onChange={(e) => handleItemTipoChange(itemIndex, e.target.value)}
                                size="sm"
                              >
                                <option value="entrada">Entrada</option>
                                <option value="prato principal">Prato Principal</option>
                                <option value="sobremesa">Sobremesa</option>
                              </Form.Select>
                            </Form.Group>
                            <div className="d-flex align-items-center justify-content-between mt-auto">
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleItemQuantidadeChange(itemIndex, -1)}
                                disabled={item.quantidade <= 0}
                                className={styles.buttonSmall}
                              >
                                –
                              </Button>
                              <span
                                style={{
                                  fontSize: '0.9rem',
                                  margin: '0 5px',
                                }}
                              >
                                {item.quantidade}
                              </span>
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleItemQuantidadeChange(itemIndex, 1)}
                                disabled={item.quantidade >= prod.quantidadeEstoque}
                                className={styles.buttonSmall}
                              >
                                +
                              </Button>
                            </div>
                            {prod.quantidadeEstoque > 0 && (
                              <small className="text-muted mt-1">
                                Disponível: {prod.quantidadeEstoque}
                              </small>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              </div>
            ))
          )}
        </Col>

        {/* Coluna Direita: Resumo do pedido */}
        <Col xs={12} md={4} lg={4} className="d-none d-md-block">
          <div style={{ position: 'sticky', top: '20px' }}>
            <Card>
              <Card.Header>Resumo do Pedido</Card.Header>
              <Card.Body
                style={{
                  maxHeight: '70vh',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  padding: '0.5rem',
                }}
              >
                {formData.itens
                  .filter((item) => item.quantidade > 0)
                  .map((item) => {
                    const produto = products.find((p) => p._id === item.product);
                    const mainIndex = getItemIndexByProductId(item.product);

                    if (!produto) return null;

                    return (
                      <Row key={item.product} className="align-items-center mb-2">
                        <Col xs={3} sm={2}>
                          <img
                            src={produto.imagem || 'https://placehold.co/50'}
                            alt={produto.nome}
                            style={{
                              width: '30px',
                              height: '30px',
                              objectFit: 'cover',
                            }}
                          />
                        </Col>
                        <Col xs={5} sm={6}>
                          <strong style={{ fontSize: '0.85rem' }}>
                            {produto.nome}
                          </strong>{' '}
                          - {item.tipo}
                        </Col>
                        <Col xs={2} sm={2} className="text-center">
                          x {item.quantidade}
                        </Col>
                        <Col xs={2} sm={2} className="d-flex flex-column align-items-center">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleItemQuantidadeChange(mainIndex, -1)}
                            disabled={item.quantidade <= 0}
                            className={styles.buttonSmall}
                          >
                            –
                          </Button>
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleItemQuantidadeChange(mainIndex, 1)}
                            disabled={item.quantidade >= produto.quantidadeEstoque}
                            className={styles.buttonSmall}
                          >
                            +
                          </Button>
                        </Col>
                      </Row>
                    );
                  })}

                {formData.itens.filter((item) => item.quantidade > 0).length === 0 && (
                  <Alert variant="info" style={{ fontSize: '0.8rem' }}>
                    Nenhum item selecionado.
                  </Alert>
                )}

                <hr style={{ margin: '0.5rem 0' }} />

                {/* Campo de Observação */}
                <Form.Group controlId="observacao" className="mb-3">
                  <Form.Label>Observação</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Adicione uma observação..."
                    name="observacao"
                    value={formData.observacao}
                    onChange={handleFormChange}
                  />
                </Form.Group>

                <h5 className={styles.totalText}>
                  Total: R$ {total.toFixed(2)}
                </h5>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>

      {/* Rodapé fixo (botões e campos finais) */}
      <div className={styles.footer}>
        <Form onSubmit={handleSubmit} className={styles.footerForm}>
          <Container fluid>
            <Row className="align-items-center">
              {/* Tipo de Pedido: REMOVIDO o select com 'entrega', agora fixo 'local' */}
              <Col xs={12} sm={3} md={1} className="mb-2 mb-md-0">
                <Form.Control
                  type="text"
                  value="Local"
                  readOnly
                  disabled
                  className={`${styles.formControl} ${styles.uniformWidth}`}
                  style={{ textAlign: 'center' }}
                />
              </Col>

              {/* Preparar Checkbox */}
              <Col xs={12} sm={3} md={2} className="d-flex align-items-center mb-2 mb-md-0">
                <Form.Check
                  type="checkbox"
                  id="preparar-checkbox"
                  name="preparar"
                  label="Preparar"
                  checked={formData.preparar}
                  onChange={handlePrepararChange}
                  className="checkbox"
                />
              </Col>

              {/* Número da Mesa */}
              <Col xs={6} sm={3} md={2} className="mb-2 mb-md-0">
                <Form.Group controlId="mesaId">
                  <Form.Select
                    name="mesaId"
                    value={formData.mesaId}
                    onChange={handleFormChange}
                    size="sm"
                    className={`${styles.formSelect} ${styles.uniformWidth}`}
                  >
                    <option value="">Mesa</option>
                    {tables.map((mesa) => (
                      <option key={mesa._id} value={mesa._id}>
                        {mesa.numeroMesa}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Número do Assento */}
              <Col xs={6} sm={3} md={2} className="mb-2 mb-md-0">
                <Form.Group controlId="assento">
                  <Form.Select
                    name="assento"
                    value={formData.assento}
                    onChange={handleFormChange}
                    size="sm"
                    disabled={!formData.mesaId}
                    className={`${styles.formSelect} ${styles.uniformWidth}`}
                  >
                    <option value="">Assento</option>
                    {selectedMesa?.assentos?.length > 0 ? (
                      selectedMesa.assentos.map((assentoObj, index) => (
                        <option
                          key={assentoObj._id || index}
                          value={assentoObj.numeroAssento || index + 1}
                        >
                          {assentoObj.numeroAssento || index + 1}
                        </option>
                      ))
                    ) : (
                      // Fallback: gera opções de 1 a 10
                      [...Array(10)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))
                    )}
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Nome do Cliente */}
              <Col xs={12} sm={12} md={2} className="mb-2 mb-md-0">
                <Form.Group controlId="nomeCliente">
                  <Form.Control
                    type="text"
                    value={nomeCliente}
                    onChange={(e) => setNomeCliente(e.target.value)}
                    placeholder="Cliente"
                    disabled={!!occupantName || true} // Caso queira habilitar, remova este true
                    size="sm"
                    className={`${styles.formControl} ${styles.uniformWidth}`}
                  />
                </Form.Group>
              </Col>

              {/* Total */}
              <Col xs={6} sm={6} md={2} className="d-flex align-items-center justify-content-center mb-2 mb-md-0">
                <h5 className={styles.totalText}>
                  Total: R$ {total.toFixed(2)}
                </h5>
              </Col>

              {/* Botões Enviar e Fechar */}
              <Col xs={6} sm={6} md={1} className="d-flex flex-column align-items-end">
                <Button
                  variant="primary"
                  type="submit"
                  size="sm"
                  className={`${styles.buttonPrimary} mb-1`}
                >
                  Enviar
                </Button>
                {onClose && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onClose}
                    className={styles.buttonSecondary}
                  >
                    Fechar
                  </Button>
                )}
              </Col>
            </Row>
          </Container>
        </Form>
      </div>
    </Container>
  );
}

export default OrderForm;
