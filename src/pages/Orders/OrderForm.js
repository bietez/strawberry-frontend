// src/pages/Orders/OrderForm.jsx
import React, { useEffect, useState, useMemo } from 'react';
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
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import styles from './OrderForm.module.css';

function OrderForm() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [tables, setTables] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para armazenar as informações do garçom (usuário logado)
  const [garcom, setGarcom] = useState(null);

  const [selectedMesa, setSelectedMesa] = useState(null);

  const [formData, setFormData] = useState({
    tipoPedido: 'local',
    mesaId: '',
    assento: '',
    clienteId: '',
    nomeCliente: '',         // <--- CAMPO NOVO
    enderecoEntrega: '',
    preparar: true,
    itens: [],
    searchTerm: '',
    observacao: '',
  });

  const [selectedCategories, setSelectedCategories] = useState(new Set());

  // Busca as informações iniciais (clientes, mesas, produtos)
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Busca os dados do usuário logado (garçom) a partir do endpoint /users/me
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await api.get('/users/me');
        setGarcom(response.data);
      } catch (error) {
        console.error("Erro ao obter informações do usuário:", error);
      }
    };
    fetchUserInfo();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [customersRes, tablesRes, productsRes] = await Promise.all([
        api.get('/customers'),
        api.get('/tables'),
        api.get('/products'),
      ]);

      const availableProducts = productsRes.data.filter((prod) => prod.disponivel);

      if (
        Array.isArray(customersRes.data) &&
        Array.isArray(tablesRes.data) &&
        Array.isArray(availableProducts)
      ) {
        setCustomers(customersRes.data);
        setTables(tablesRes.data);
        setProducts(availableProducts);

        const initialItens = availableProducts.map((prod) => ({
          product: prod._id,
          quantidade: 0,
          tipo: 'prato principal',
        }));

        setFormData((prev) => ({ ...prev, itens: initialItens }));
      } else {
        throw new Error('Formato de dados inesperado da API.');
      }
    } catch (error) {
      console.error('Erro ao obter dados iniciais:', error);
      setError(error.response?.data?.message || 'Erro desconhecido ao retornar dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'mesaId') {
      const mesa = tables.find((m) => m._id === value);
      setSelectedMesa(mesa || null);
      setFormData({
        ...formData,
        [name]: value,
        assento: '',
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
  };

  const handlePrepararChange = (e) => {
    setFormData({ ...formData, preparar: e.target.checked });
  };

  const handleTipoPedidoChange = (e) => {
    const tipoPedido = e.target.value;
    setFormData({
      ...formData,
      tipoPedido,
      mesaId: '',
      assento: '',
      clienteId: '',
      nomeCliente: '',
      enderecoEntrega: '',
      preparar: true,
      itens: formData.itens.map((item) => ({
        ...item,
        quantidade: 0,
        tipo: 'prato principal',
      })),
      observacao: '',
    });
    setSelectedMesa(null);
    setSelectedCategories(new Set());
  };

  const handleItemTipoChange = (index, newTipo) => {
    const newItens = [...formData.itens];
    newItens[index].tipo = newTipo;
    setFormData({ ...formData, itens: newItens });
  };

  const handleItemQuantidadeChange = (index, delta) => {
    const newItens = [...formData.itens];
    const product = products.find((p) => p._id === newItens[index].product);
    if (!product) return;
    const maxQty = product.quantidadeEstoque;
    const newQty = newItens[index].quantidade + delta;
    if (newQty >= 0 && newQty <= maxQty) {
      newItens[index].quantidade = newQty;
      setFormData({ ...formData, itens: newItens });
    }
  };

  const handleSearchChange = (e) => {
    setFormData({ ...formData, searchTerm: e.target.value });
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

  const calculateTotal = () => {
    let total = 0;
    formData.itens.forEach((item) => {
      if (item.quantidade > 0) {
        const prod = products.find((p) => p._id === item.product);
        if (prod) {
          total += prod.preco * item.quantidade;
        }
      }
    });
    return total;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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

    // Monta o payload para enviar ao backend, adicionando o nome do garçom
    const payload = {
      tipoPedido: formData.tipoPedido,
      mesaId: formData.tipoPedido === 'local' ? formData.mesaId : undefined,
      assento: formData.tipoPedido === 'local' ? formData.assento : undefined,

      clienteId: formData.tipoPedido === 'entrega' ? formData.clienteId : undefined,
      nomeCliente: formData.tipoPedido === 'entrega' ? formData.nomeCliente : '',
      enderecoEntrega:
        formData.tipoPedido === 'entrega' ? formData.enderecoEntrega : undefined,

      preparar: formData.preparar,
      itens: itensFiltrados,
      observacao: formData.observacao,
      garcom: garcom ? garcom.nome : undefined, // <--- Nome do garçom incluído
    };

    try {
      await api.post('/orders', payload);
      toast.success('Pedido criado com sucesso!');
      navigate('/orders');
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      const mensagemErro = error.response?.data?.message || 'Erro desconhecido.';
      toast.error(mensagemErro);
    }
  };

  // Efeito que preenche nomeCliente e enderecoEntrega quando se escolhe um cliente
  useEffect(() => {
    if (formData.tipoPedido === 'entrega' && formData.clienteId) {
      const selectedCustomer = customers.find(
        (c) => c._id === formData.clienteId
      );
      if (selectedCustomer) {
        const endereco = [
          selectedCustomer.rua,
          selectedCustomer.numero,
          selectedCustomer.complemento,
          selectedCustomer.bairro,
          selectedCustomer.cidade,
          selectedCustomer.estado,
          `CEP: ${selectedCustomer.cep}`,
        ]
          .filter(Boolean)
          .join(', ');

        setFormData((prev) => ({
          ...prev,
          nomeCliente: selectedCustomer.nome,  // Pega o nome do cliente
          enderecoEntrega: endereco,
        }));
      }
    } else if (formData.tipoPedido !== 'entrega') {
      setFormData((prev) => ({
        ...prev,
        nomeCliente: '',
        enderecoEntrega: '',
      }));
    }
  }, [formData.clienteId, formData.tipoPedido, customers]);

  const filteredProducts = useMemo(() => {
    let filtered = products;
    const term = formData.searchTerm.toLowerCase();
    if (term) {
      filtered = filtered.filter((prod) =>
        prod.nome.toLowerCase().includes(term)
      );
    }
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

  const getItemIndexByProductId = (productId) =>
    formData.itens.findIndex((it) => it.product === productId);

  const total = calculateTotal();

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

  return (
    <Container fluid className="my-5">
      <Row>
        {/* Coluna Esquerda: Lista de Produtos */}
        <Col xs={12} md={8} lg={8}>
          <h2 className="mb-4">Novo Pedido</h2>

          {/* Campo de Pesquisa */}
          <Form.Group className="mb-4" controlId="searchField">
            <Form.Label>Pesquisar Produto</Form.Label>
            <Form.Control
              type="text"
              placeholder="Digite o nome do produto..."
              value={formData.searchTerm}
              onChange={handleSearchChange}
              size="sm"
            />
          </Form.Group>

          {/* Botões de Categoria */}
          <Form.Group className="mb-4" controlId="categoryFilter">
            <Form.Label>Filtrar por Categoria</Form.Label>
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
              {/* Botão para Resetar Filtros */}
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
                        lg={2}
                        className="d-flex align-items-stretch mb-4"
                      >
                        <Card className="w-100" style={{ fontSize: '0.8rem' }}>
                          <Card.Img
                            variant="top"
                            src={
                              prod.imagem ||
                              'https://placehold.co/150?text=Produto+Indisponível'
                            }
                            alt={prod.nome}
                            style={{
                              height: '80px',
                              objectFit: 'cover',
                            }}
                          />
                          <Card.Body className="d-flex flex-column p-2">
                            <Card.Title style={{ fontSize: '0.9rem' }}>
                              {prod.nome}
                            </Card.Title>
                            <div style={{ fontSize: '0.75rem' }}>
                              Preço: R$ {prod.preco.toFixed(2)}
                            </div>
                            <Form.Group className="mt-2" style={{ fontSize: '0.7rem' }}>
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
                                style={{ padding: '0.25rem 0.5rem' }}
                              >
                                –
                              </Button>
                              <span style={{ fontSize: '0.8rem', margin: '0 5px' }}>
                                {item.quantidade}
                              </span>
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleItemQuantidadeChange(itemIndex, 1)}
                                disabled={item.quantidade >= prod.quantidadeEstoque}
                                style={{ padding: '0.25rem 0.5rem' }}
                              >
                                +
                              </Button>
                            </div>
                            {prod.quantidadeEstoque > 0 && (
                              <small
                                className="text-muted mt-1"
                                style={{ fontSize: '0.7rem' }}
                              >
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

        {/* Coluna Direita: Resumo do Pedido Fixado */}
        <Col xs={12} md={4} lg={4} className="d-none d-md-block">
          <div style={{ position: 'sticky', top: '20px' }}>
            <Card>
              <Card.Header>
                Resumo do Pedido<br />
                {/* Exibe o nome do garçom, se disponível */}
                {garcom ? `Garçom: ${garcom.nome}` : 'Carregando dados do garçom...'}
              </Card.Header>
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
                    return (
                      <Row key={item.product} className="align-items-center mb-2">
                        <Col xs={3} sm={2}>
                          <img
                            src={
                              produto.imagem ||
                              'https://placehold.co/50?text=Sem+Imagem'
                            }
                            alt={produto.nome}
                            style={{
                              width: '30px',
                              height: '30px',
                              objectFit: 'cover',
                            }}
                          />
                        </Col>
                        <Col xs={5} sm={6}>
                          <strong style={{ fontSize: '0.85rem' }}>{produto.nome}</strong> -{' '}
                          {item.tipo}
                        </Col>
                        <Col xs={2} sm={2} className="text-center">
                          x {item.quantidade}
                        </Col>
                        <Col
                          xs={2}
                          sm={2}
                          className="d-flex flex-column align-items-center"
                        >
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleItemQuantidadeChange(mainIndex, -1)}
                            disabled={item.quantidade <= 0}
                            style={{ padding: '0.2rem 0.4rem', marginBottom: '2px' }}
                          >
                            –
                          </Button>
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleItemQuantidadeChange(mainIndex, 1)}
                            disabled={item.quantidade >= produto.quantidadeEstoque}
                            style={{ padding: '0.2rem 0.4rem' }}
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
                <h5 style={{ fontSize: '1rem' }}>
                  Total: R$ {total.toFixed(2)}
                </h5>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>

      {/* Rodapé Fixado */}
      <div className={styles.orderFormFooter}>
        <Form onSubmit={handleSubmit}>
          <Container fluid>
            <Row className="align-items-center">
              <Col xs={6} sm={3} md={2}>
                <Form.Select
                  name="tipoPedido"
                  value={formData.tipoPedido}
                  onChange={handleTipoPedidoChange}
                  size="sm"
                >
                  <option value="local">Local</option>
                  <option value="entrega">Entrega</option>
                </Form.Select>
              </Col>

              <Col
                xs={6}
                sm={3}
                md={2}
                className="d-flex align-items-center justify-content-center p-2"
              >
                <Form.Check
                  type="switch"
                  id="preparar-switch"
                  label={<span style={{ fontSize: '0.9rem' }}>Preparar</span>}
                  name="preparar"
                  checked={formData.preparar}
                  onChange={handlePrepararChange}
                  className="mb-0"
                />
              </Col>

              {formData.tipoPedido === 'local' && (
                <>
                  <Col xs={6} sm={3} md={2}>
                    <Form.Select
                      name="mesaId"
                      value={formData.mesaId}
                      onChange={handleFormChange}
                      size="sm"
                    >
                      <option value="">Mesa</option>
                      {tables.map((mesa) => (
                        <option key={mesa._id} value={mesa._id}>
                          {mesa.numeroMesa}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col xs={6} sm={3} md={2}>
                    <Form.Select
                      name="assento"
                      value={formData.assento}
                      onChange={handleFormChange}
                      size="sm"
                      disabled={!formData.mesaId}
                    >
                      <option value="">Sem escolha</option>
                      {selectedMesa &&
                      selectedMesa.assentos &&
                      selectedMesa.assentos.length > 0 ? (
                        selectedMesa.assentos.map((assentoObj, index) => (
                          <option
                            key={assentoObj._id || index}
                            value={assentoObj.numero}
                          >
                            {assentoObj.numero}
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
                  </Col>
                </>
              )}

              {formData.tipoPedido === 'entrega' && (
                <>
                  <Col xs={6} sm={3} md={2}>
                    <Form.Select
                      name="clienteId"
                      value={formData.clienteId}
                      onChange={handleFormChange}
                      size="sm"
                    >
                      <option value="">Cliente</option>
                      {customers.map((cliente) => (
                        <option key={cliente._id} value={cliente._id}>
                          {cliente.nome}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col xs={6} sm={3} md={2}>
                    <Form.Control
                      type="text"
                      name="enderecoEntrega"
                      value={formData.enderecoEntrega}
                      onChange={handleFormChange}
                      placeholder="Endereço"
                      size="sm"
                      disabled
                    />
                  </Col>
                </>
              )}

              <Col
                xs={12}
                sm={6}
                md={2}
                className="d-flex flex-column align-items-end mt-2 mt-md-0"
              >
                <small style={{ fontSize: '0.9rem' }}>
                  Total: R$ {total.toFixed(2)}
                </small>
              </Col>
              <Col
                xs={12}
                sm={6}
                md={2}
                className="d-flex flex-column align-items-end mt-2 mt-md-0"
              >
                <Button variant="primary" type="submit" size="sm" className="mb-1">
                  Enviar
                </Button>
              </Col>
            </Row>
          </Container>
        </Form>
      </div>
    </Container>
  );
}

export default OrderForm;
