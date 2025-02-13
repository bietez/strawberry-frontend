// src/pages/TesteEndpoint/MergedEndpoints.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import './Endpoints.css';
import {
  Accordion,
  Button,
  Spinner,
  Alert,
  Container,
  Row,
  Col,
  Form,
  Badge,
  OverlayTrigger,
  Tooltip,
  Card
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt, faExclamationTriangle, faPlay } from '@fortawesome/free-solid-svg-icons';

const MergedEndpoints = () => {
  // Estados para o teste global
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState(null);

  // Estados para os testes individuais
  const [loadingEndpoints, setLoadingEndpoints] = useState({});
  const [endpointParams, setEndpointParams] = useState({});
  const [endpointResponses, setEndpointResponses] = useState({});

  // Endpoints da versão atualizada (UpdatedEndpoints.js)
  const updatedEndpoints = [
    { name: 'Registrar', url: '/api/auth/register', method: 'POST', params: [] },
    { name: 'Login', url: '/api/auth/login', method: 'POST', params: [] },
    { name: 'Esqueci a Senha', url: '/api/auth/forgot-password', method: 'POST', params: [] },
    { name: 'Resetar Senha', url: '/api/auth/reset-password', method: 'POST', params: [] },
    { name: 'Atualizar Usuário', url: '/api/auth/users/:id', method: 'PUT', params: ['id'] },
    { name: 'Criar Ambiente', url: '/api/ambientes/', method: 'POST', params: [] },
    { name: 'Obter Ambientes', url: '/api/ambientes/', method: 'GET', params: [] },
    { name: 'Atualizar Ambiente', url: '/api/ambientes/:id', method: 'PUT', params: ['id'] },
    { name: 'Deletar Ambiente', url: '/api/ambientes/:id', method: 'DELETE', params: ['id'] },
    { name: 'Atualizar Ordem de Ambientes', url: '/api/ambientes/order', method: 'PUT', params: [] },
    { name: 'Histórico do Caixa', url: '/api/caixa/history', method: 'GET', params: [] },
    { name: 'Iniciar Caixa', url: '/api/caixa/iniciar', method: 'POST', params: [] },
    { name: 'Finalizar Caixa', url: '/api/caixa/finalizar', method: 'POST', params: [] },
    { name: 'Status do Caixa', url: '/api/caixa/status', method: 'GET', params: [] },
    { name: 'Criar Categoria', url: '/api/categories/', method: 'POST', params: [] },
    { name: 'Obter Categorias', url: '/api/categories/', method: 'GET', params: [] },
    { name: 'Buscar Categorias Avançadas', url: '/api/categories/advanced', method: 'GET', params: [] },
    { name: 'Atualizar Categoria', url: '/api/categories/:categoryId', method: 'PUT', params: ['categoryId'] },
    { name: 'Deletar Categoria', url: '/api/categories/:categoryId', method: 'DELETE', params: ['categoryId'] },
    { name: 'Criar Cliente', url: '/api/customers/', method: 'POST', params: [] },
    { name: 'Obter Todos os Clientes', url: '/api/customers/', method: 'GET', params: [] },
    { name: 'Busca Avançada de Clientes', url: '/api/customers/advanced', method: 'GET', params: [] },
    { name: 'Atualizar Cliente', url: '/api/customers/:id', method: 'PUT', params: ['id'] },
    { name: 'Deletar Cliente', url: '/api/customers/:id', method: 'DELETE', params: ['id'] },
    { name: 'Criar Produto', url: '/api/products/', method: 'POST', params: [] },
    { name: 'Obter Produtos', url: '/api/products/', method: 'GET', params: [] },
    { name: 'Atualizar Produto', url: '/api/products/:productId', method: 'PUT', params: ['productId'] },
    { name: 'Deletar Produto', url: '/api/products/:productId', method: 'DELETE', params: ['productId'] },
    { name: 'Configuração do Sistema', url: '/api/config/', method: 'GET', params: [] },
    { name: 'Autenticação iFood - Iniciar', url: '/api/ifood/auth/start', method: 'POST', params: [] },
    { name: 'Autenticação iFood - Completar', url: '/api/ifood/auth/complete', method: 'POST', params: [] },
    { name: 'Upload de Imagem', url: '/api/upload/', method: 'POST', params: [] }
  ];

  // Endpoints da versão antiga (Endpoints.js)
  const oldEndpoints = [
    { name: 'Registrar', url: '/auth/register', method: 'POST', params: [] },
    { name: 'Login', url: '/auth/login', method: 'POST', params: [] },
    { name: 'Esqueci a Senha', url: '/auth/forgot-password', method: 'POST', params: [] },
    { name: 'Resetar Senha', url: '/auth/reset-password', method: 'POST', params: [] },
    { name: 'Atualizar Usuário (Auth)', url: '/auth/users/:id', method: 'PUT', params: ['id'] },
    { name: 'Criar Ambiente', url: '/ambientes/', method: 'POST', params: [] },
    { name: 'Obter Ambientes', url: '/ambientes/', method: 'GET', params: [] },
    { name: 'Atualizar Ambiente', url: '/ambientes/:id', method: 'PUT', params: ['id'] },
    { name: 'Deletar Ambiente', url: '/ambientes/:id', method: 'DELETE', params: ['id'] },
    { name: 'Atualizar Ordem de Ambientes', url: '/ambientes/order', method: 'PUT', params: [] },
    { name: 'Iniciar Caixa', url: '/caixa/iniciar', method: 'POST', params: [] },
    { name: 'Finalizar Caixa', url: '/caixa/finalizar', method: 'POST', params: [] },
    { name: 'Obter Status do Caixa', url: '/caixa/status', method: 'GET', params: [] },
    { name: 'Obter Todas as Categorias', url: '/categories/', method: 'GET', params: [] },
    { name: 'Criar Categoria', url: '/categories/', method: 'POST', params: [] },
    { name: 'Buscar Categorias Avançadas', url: '/categories/advanced', method: 'GET', params: [] },
    { name: 'Obter Categoria por ID', url: '/categories/:categoryId', method: 'GET', params: ['categoryId'] },
    { name: 'Atualizar Categoria', url: '/categories/:categoryId', method: 'PUT', params: ['categoryId'] },
    { name: 'Deletar Categoria', url: '/categories/:categoryId', method: 'DELETE', params: ['categoryId'] },
    { name: 'Listar Comandas', url: '/comandas/', method: 'GET', params: [] },
    { name: 'Baixar PDF da Comanda', url: '/comandas/:id/pdf', method: 'GET', params: ['id'] },
    { name: 'Enviar Email da Comanda', url: '/comandas/send-email', method: 'POST', params: [] },
    { name: 'Adicionar Pagamento Parcial', url: '/comandas/:comandaId/payments', method: 'PUT', params: ['comandaId'] },
    { name: 'Gerar PDF de Conferência', url: '/comandas/:tableId/conferencia', method: 'GET', params: ['tableId'] },
    { name: 'Obter Configuração', url: '/config/', method: 'GET', params: [] },
    { name: 'Criar Configuração', url: '/config/', method: 'POST', params: [] },
    { name: 'Atualizar Configuração', url: '/config/', method: 'PUT', params: [] },
    { name: 'Obter Draggable', url: '/config/draggable', method: 'GET', params: [] },
    { name: 'Atualizar Draggable', url: '/config/draggable', method: 'PUT', params: [] },
    { name: 'Busca Avançada de Clientes', url: '/customers/advanced', method: 'GET', params: [] },
    { name: 'Criar Cliente', url: '/customers/', method: 'POST', params: [] },
    { name: 'Obter Todos os Clientes', url: '/customers/', method: 'GET', params: [] },
    { name: 'Obter Cliente por ID', url: '/customers/:id', method: 'GET', params: ['id'] },
    { name: 'Atualizar Cliente', url: '/customers/:id', method: 'PUT', params: ['id'] },
    { name: 'Deletar Cliente', url: '/customers/:id', method: 'DELETE', params: ['id'] },
    { name: 'Criar Funcionário', url: '/employees/', method: 'POST', params: [] },
    { name: 'Obter Funcionários', url: '/employees/', method: 'GET', params: [] },
    { name: 'Obter Funcionário por ID', url: '/employees/:id', method: 'GET', params: ['id'] },
    { name: 'Atualizar Funcionário', url: '/employees/:id', method: 'PUT', params: ['id'] },
    { name: 'Deletar Funcionário', url: '/employees/:id', method: 'DELETE', params: ['id'] },
    { name: 'Login de Funcionário', url: '/employees/login', method: 'POST', params: [] },
    { name: 'Obter Mesas Finalizadas', url: '/finalized-tables/', method: 'GET', params: [] },
    { name: 'Relatório de Vendas por Período', url: '/finalized-tables/relatorios/periodo', method: 'GET', params: [] },
    { name: 'Relatório de Vendas por Garçom', url: '/finalized-tables/relatorios/garcom', method: 'GET', params: [] },
    { name: 'Finalizar Mesa (Em Finalized)', url: '/finalized-tables/:id/finalizar', method: 'POST', params: ['id'] },
    { name: 'Obter Vendas por Categoria', url: '/finalized-tables/sales-by-category', method: 'GET', params: [] },
    { name: 'Iniciar Autenticação iFood', url: '/ifood/auth/start', method: 'POST', params: [] },
    { name: 'Concluir Autenticação iFood', url: '/ifood/auth/complete', method: 'POST', params: [] },
    { name: 'Criar Ingrediente', url: '/ingredients/', method: 'POST', params: [] },
    { name: 'Obter Ingredientes', url: '/ingredients/', method: 'GET', params: [] },
    { name: 'Obter Ingrediente por ID', url: '/ingredients/:id', method: 'GET', params: ['id'] },
    { name: 'Atualizar Ingrediente', url: '/ingredients/:id', method: 'PUT', params: ['id'] },
    { name: 'Deletar Ingrediente', url: '/ingredients/:id', method: 'DELETE', params: ['id'] },
    { name: 'Obter Delivery Orders', url: '/integrations/delivery-orders', method: 'GET', params: [] },
    { name: 'Criar Pedido', url: '/orders/', method: 'POST', params: [] },
    { name: 'Obter Todos os Pedidos', url: '/orders/', method: 'GET', params: [] },
    { name: 'Obter Pedido por ID', url: '/orders/:id', method: 'GET', params: ['id'] },
    { name: 'Atualizar Status do Pedido', url: '/orders/:id/status', method: 'PUT', params: ['id'] },
    { name: 'Atualizar Pedido Completo', url: '/orders/:id', method: 'PUT', params: ['id'] },
    { name: 'Deletar Pedido', url: '/orders/:id', method: 'DELETE', params: ['id'] },
    { name: 'Processar Pagamento', url: '/payments/', method: 'POST', params: [] },
    { name: 'Verificar Duplicidade de Nome', url: '/products/check-nome/:nome', method: 'GET', params: ['nome'] },
    { name: 'Busca Avançada de Produtos', url: '/products/advanced', method: 'GET', params: [] },
    { name: 'Criar Produto', url: '/products/', method: 'POST', params: [] },
    { name: 'Obter Todos os Produtos', url: '/products/', method: 'GET', params: [] },
    { name: 'Obter Produto por ID', url: '/products/:productId', method: 'GET', params: ['productId'] },
    { name: 'Atualizar Produto', url: '/products/:productId', method: 'PUT', params: ['productId'] },
    { name: 'Deletar Produto', url: '/products/:productId', method: 'DELETE', params: ['productId'] },
    { name: 'Gerar QR Permanente', url: '/qr/generate', method: 'POST', params: [] },
    { name: 'Login com QR', url: '/qr/login', method: 'POST', params: [] },
    { name: 'Criar Receita', url: '/recipes/', method: 'POST', params: [] },
    { name: 'Obter Receitas', url: '/recipes/', method: 'GET', params: [] },
    { name: 'Obter Receita por ID', url: '/recipes/:id', method: 'GET', params: ['id'] },
    { name: 'Atualizar Receita', url: '/recipes/:id', method: 'PUT', params: ['id'] },
    { name: 'Deletar Receita', url: '/recipes/:id', method: 'DELETE', params: ['id'] },
    { name: 'Obter Estatísticas', url: '/reports/statistics', method: 'GET', params: [] },
    { name: 'Obter Produtos com Estoque Baixo', url: '/reports/produtosComEstoqueBaixo', method: 'GET', params: [] },
    { name: 'Criar Reserva', url: '/reservations/', method: 'POST', params: [] },
    { name: 'Deletar Reserva', url: '/reservations/:reservationId', method: 'DELETE', params: ['reservationId'] },
    { name: 'Cancelar Reserva', url: '/reservations/:reservationId/cancel', method: 'PUT', params: ['reservationId'] },
    { name: 'Obter Todas as Reservas', url: '/reservations/', method: 'GET', params: [] },
    { name: 'Obter Reserva por ID', url: '/reservations/:reservationId', method: 'GET', params: ['reservationId'] },
    { name: 'Busca Avançada de Metas de Vendas', url: '/sales-goals/advanced', method: 'GET', params: [] },
    { name: 'Criar Meta de Vendas', url: '/sales-goals/', method: 'POST', params: [] },
    { name: 'Obter Todas as Metas de Vendas', url: '/sales-goals/', method: 'GET', params: [] },
    { name: 'Obter Metas de Vendas por Funcionário', url: '/sales-goals/employee/:id', method: 'GET', params: ['id'] },
    { name: 'Atualizar Meta de Vendas', url: '/sales-goals/:id', method: 'PUT', params: ['id'] },
    { name: 'Deletar Meta de Vendas', url: '/sales-goals/:id', method: 'DELETE', params: ['id'] },
    { name: 'Obter Detalhes da Meta de Vendas', url: '/sales-goals/:id/details', method: 'GET', params: ['id'] },
    { name: 'Exportar metas em PDF', url: '/sales-goals/export-pdf', method: 'GET', params: [] },
    { name: 'Obter Estoque', url: '/stock/', method: 'GET', params: [] },
    { name: 'Atualizar Estoque', url: '/stock/:productId', method: 'PUT', params: ['productId'] },
    { name: 'Criar Mesa', url: '/tables/', method: 'POST', params: [] },
    { name: 'Obter tables', url: '/tables/', method: 'GET', params: [] },
    { name: 'Obter Dashboard de tables', url: '/tables/dashboard', method: 'GET', params: [] },
    { name: 'Busca Avançada de tables', url: '/tables/advanced', method: 'GET', params: [] },
    { name: 'Atualizar Mesa', url: '/tables/:tableId', method: 'PUT', params: ['tableId'] },
    { name: 'Deletar Mesa', url: '/tables/:tableId', method: 'DELETE', params: ['tableId'] },
    { name: 'Finalizar Mesa', url: '/tables/:id/finalizar', method: 'POST', params: ['id'] },
    { name: 'Atualizar Status da Mesa', url: '/tables/:tableId/status', method: 'PUT', params: ['tableId'] },
    { name: 'Obter tables Disponíveis', url: '/tables/available', method: 'GET', params: [] },
    { name: 'Obter tables por Ambiente', url: '/tables/by-ambiente/:ambienteId', method: 'GET', params: ['ambienteId'] },
    { name: 'Upload de Imagem', url: '/upload/', method: 'POST', params: [] },
    { name: 'Obter Membros da Equipe', url: '/users/team-members', method: 'GET', params: [] },
    { name: 'Atualizar Usuário (Users)', url: '/users/:id', method: 'PUT', params: ['id'] },
    { name: 'Obter Informações do Próprio Usuário', url: '/users/me', method: 'GET', params: [] }
  ];

  // Junta os endpoints atualizados e antigos sem intervenção manual
  const endpoints = [...updatedEndpoints, ...oldEndpoints];

  // Função para testar todos os endpoints de uma vez (teste global)
  const fetchAllEndpoints = async () => {
    setLoading(true);
    setErrorGlobal(null);

    try {
      const promises = endpoints.map((endpoint) => {
        let request;
        switch (endpoint.method) {
          case 'GET':
            request = api.get(endpoint.url);
            break;
          case 'POST':
            request = api.post(endpoint.url, {});
            break;
          case 'PUT':
            request = api.put(endpoint.url, {});
            break;
          case 'DELETE':
            request = api.delete(endpoint.url);
            break;
          default:
            request = Promise.reject(new Error('Método HTTP desconhecido'));
        }

        return request
          .then((response) => ({
            name: endpoint.name,
            data: response.data,
            status: 'success'
          }))
          .catch((error) => ({
            name: endpoint.name,
            error: error.response?.data?.message || 'Erro na requisição',
            status: 'error'
          }));
      });

      const settledResponses = await Promise.all(promises);
      setResponses(settledResponses);
    } catch (err) {
      setErrorGlobal('Erro ao realizar as requisições.');
    } finally {
      setLoading(false);
    }
  };

  // Função para testar um endpoint individualmente (substituindo parâmetros, se houver)
  const testEndpoint = async (endpoint) => {
    let url = endpoint.url;
    if (endpoint.params.length > 0) {
      endpoint.params.forEach((param) => {
        const value = endpointParams[endpoint.url]?.[param];
        if (value) {
          url = url.replace(`:${param}`, value);
        }
      });
    }

    setLoadingEndpoints((prev) => ({ ...prev, [endpoint.url]: true }));

    try {
      let response;
      switch (endpoint.method) {
        case 'GET':
          response = await api.get(url);
          break;
        case 'POST':
          response = await api.post(url, {});
          break;
        case 'PUT':
          response = await api.put(url, {});
          break;
        case 'DELETE':
          response = await api.delete(url);
          break;
        default:
          throw new Error('Método HTTP desconhecido');
      }

      setEndpointResponses((prev) => ({
        ...prev,
        [endpoint.url]: { status: 'success', data: response.data }
      }));
      alert(`Requisição para "${endpoint.name}" bem-sucedida! Veja a resposta abaixo.`);
    } catch (error) {
      setEndpointResponses((prev) => ({
        ...prev,
        [endpoint.url]: { status: 'error', error: error.response?.data?.message || error.message }
      }));
      alert(`Erro ao testar "${endpoint.name}". Veja a resposta abaixo.`);
    } finally {
      setLoadingEndpoints((prev) => ({ ...prev, [endpoint.url]: false }));
    }
  };

  // Atualiza os valores dos parâmetros para cada endpoint individual
  const handleParamChange = (endpointUrl, paramName, value) => {
    setEndpointParams((prev) => ({
      ...prev,
      [endpointUrl]: {
        ...prev[endpointUrl],
        [paramName]: value
      }
    }));
  };

  // Chama o teste global ao montar o componente
  useEffect(() => {
    fetchAllEndpoints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container className="my-4">
      <h2 className="mb-4 text-center">Teste de Endpoints Unificado</h2>
      <div className="d-flex justify-content-center mb-4">
        <Button variant="primary" onClick={fetchAllEndpoints} disabled={loading}>
          <FontAwesomeIcon icon={faSyncAlt} className="me-2" />
          {loading ? 'Atualizando...' : 'Atualizar Todos os Endpoints'}
        </Button>
      </div>
      {errorGlobal && (
        <Alert variant="danger" className="text-center">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          {errorGlobal}
        </Alert>
      )}
      {!errorGlobal && (
        <Accordion defaultActiveKey="0">
          {endpoints.map((endpoint, index) => (
            <Accordion.Item eventKey={index.toString()} key={index}>
              <Accordion.Header>
                <FontAwesomeIcon icon={faPlay} className="me-2 text-primary" />
                <OverlayTrigger
                  placement="right"
                  overlay={
                    <Tooltip id={`tooltip-${index}`}>
                      <strong>Método:</strong> {endpoint.method} <br />
                      <strong>Caminho:</strong> {endpoint.url}
                    </Tooltip>
                  }
                >
                  {/* AQUI ESTÁ A CORREÇÃO: exibir a rota ao lado do nome do endpoint */}
                  <span>
                    {endpoint.name} <Badge bg="info" className="ms-2">{endpoint.url}</Badge>
                  </span>
                </OverlayTrigger>
                <Badge bg="secondary" className="ms-2">
                  {endpoint.method}
                </Badge>
              </Accordion.Header>
              <Accordion.Body>
                {/* Exibe a resposta do teste global, se houver */}
                {responses[index] && (
                  <Card className="mb-3">
                    <Card.Body>
                      {responses[index].status === 'success' ? (
                        <>
                          <Card.Title>Resposta Global</Card.Title>
                          <pre>{JSON.stringify(responses[index].data, null, 2)}</pre>
                        </>
                      ) : (
                        <Alert variant="danger">{responses[index].error}</Alert>
                      )}
                    </Card.Body>
                  </Card>
                )}
                {/* Se o endpoint requer parâmetros, exibe os inputs */}
                {endpoint.params.length > 0 && (
                  <Form className="mb-3">
                    <Row>
                      {endpoint.params.map((param, idx) => (
                        <Col md={6} key={idx} className="mb-3">
                          <Form.Group controlId={`${endpoint.url}-${param}`}>
                            <Form.Label>{param}</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder={`Digite o ${param}`}
                              value={endpointParams[endpoint.url]?.[param] || ''}
                              onChange={(e) => handleParamChange(endpoint.url, param, e.target.value)}
                            />
                          </Form.Group>
                        </Col>
                      ))}
                    </Row>
                  </Form>
                )}
                <Row className="mb-3">
                  <Col>
                    <Button
                      variant="success"
                      onClick={() => testEndpoint(endpoint)}
                      disabled={loadingEndpoints[endpoint.url]}
                    >
                      {loadingEndpoints[endpoint.url] ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                          Testando...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faPlay} className="me-2" />
                          Testar Endpoint
                        </>
                      )}
                    </Button>
                  </Col>
                </Row>
                {endpointResponses[endpoint.url] && (
                  <Card className="mt-3">
                    <Card.Body>
                      {endpointResponses[endpoint.url].status === 'success' ? (
                        <>
                          <Card.Title>Resposta do Teste Individual</Card.Title>
                          <pre className="response-data">
                            {JSON.stringify(endpointResponses[endpoint.url].data, null, 2)}
                          </pre>
                        </>
                      ) : (
                        <>
                          <Card.Title>Erro</Card.Title>
                          <Card.Text className="text-danger">
                            {endpointResponses[endpoint.url].error}
                          </Card.Text>
                        </>
                      )}
                    </Card.Body>
                  </Card>
                )}
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </Container>
  );
};

export default MergedEndpoints;
