// src/pages/Dashboard/Dashboard.js
import React, { useEffect, useState, useMemo } from 'react';
import api from '../../services/api';
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Table,
  Form,
  Button,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Helmet } from 'react-helmet-async';
import {
  FaDollarSign,
  FaShoppingCart,
  FaUsers,
  FaBoxes,
  FaCalendarAlt,
  FaChartLine,
  FaChartPie,
  FaChartBar,
  FaTasks,
} from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Correção: Importação correta do jwt-decode
import { jwtDecode } from 'jwt-decode';

// Inicializa plugins do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);

/** Função para capitalizar a primeira letra de cada palavra */
const capitalizeWords = (str) => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

/** Retorna o primeiro dia do mês atual em 'YYYY-MM-DD' */
const getFirstDayOfCurrentMonth = () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  return firstDay.toISOString().split('T')[0];
};

/** Retorna o último dia do mês atual em 'YYYY-MM-DD' */
const getLastDayOfCurrentMonth = () => {
  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return lastDay.toISOString().split('T')[0];
};

const Dashboard = () => {
  // -------------------- ESTADOS GERAIS --------------------
  const [statistics, setStatistics] = useState({});
  const [salesGoals, setSalesGoals] = useState([]); // Metas de vendas

  // KPIs
  const [totalVendas, setTotalVendas] = useState(0);
  const [totalPedidosMonth, setTotalPedidosMonth] = useState(0);
  const [vendasUltimos7Dias, setVendasUltimos7Dias] = useState([]);
  const [vendasPorFuncionario, setVendasPorFuncionario] = useState([]);
  const [vendasPorCategoria, setVendasPorCategoria] = useState([]);
  const [produtosMaisVendidos, setProdutosMaisVendidos] = useState([]);
  const [metodosPagamento, setMetodosPagamento] = useState([]);
  const [produtosComEstoqueBaixo, setProdutosComEstoqueBaixo] = useState([]);
  const [paymentAmounts, setPaymentAmounts] = useState([]); // Novos: valores pagos por método

  // Pedidos pendentes (Pendente, Preparando, Pronto)
  const [pedidosPendentes, setPedidosPendentes] = useState(0);
  const [pedidosPendentesList, setPedidosPendentesList] = useState([]);

  // Loading e erro
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros (dataInicial e dataFinal)
  const [dataInicial, setDataInicial] = useState(getFirstDayOfCurrentMonth());
  const [dataFinal, setDataFinal] = useState(getLastDayOfCurrentMonth());

  // Token & user
  const token = localStorage.getItem('token');
  const user = useMemo(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        return decoded;
      } catch (err) {
        console.error('Token inválido:', err);
        toast.error('Token inválido. Por favor, faça login novamente.');
        return null;
      }
    }
    return null;
  }, [token]);

  // -------------------- EFFECT DE MONTAGEM --------------------
  useEffect(() => {
    if (user) {
      fetchStatistics();

      if (['agent', 'admin', 'manager'].includes(user.role)) {
        fetchSalesGoals();
        fetchTotalVendas();
        fetchVendasUltimos7Dias();
        fetchVendasPorFuncionario();
        fetchVendasPorCategoria();
        fetchProdutosMaisVendidos();
        fetchMetodosPagamento();
        fetchPaymentAmounts(); // Chamada para obter valores pagos por método
        fetchProdutosComEstoqueBaixo();
        fetchPedidosPendentes();
      }
    } else {
      setLoading(false);
      setError('Usuário não autenticado.');
      toast.error('Usuário não autenticado. Por favor, faça login.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, dataInicial, dataFinal]);

  // -------------------- FUNÇÕES DE BUSCA (API) --------------------
  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dataInicial) params.dataInicial = dataInicial;
      if (dataFinal) params.dataFinal = dataFinal;

      const resp = await api.get('/reports/statistics', { params });
      setStatistics(resp.data || {});
      setLoading(false);
    } catch (err) {
      console.error('Erro ao obter estatísticas:', err);
      setError('Falha ao carregar estatísticas.');
      toast.error('Falha ao carregar estatísticas.');
      setLoading(false);
    }
  };

  const fetchSalesGoals = async () => {
    try {
      const response = await api.get('/sales-goals/advanced', {
        params: {
          dataInicial: dataInicial || undefined,
          dataFinal: dataFinal || undefined,
        },
      });

      let goals = [];
      if (response.data && Array.isArray(response.data.salesGoals)) {
        goals = response.data.salesGoals;
      } else if (Array.isArray(response.data)) {
        goals = response.data;
      }

      const now = new Date();
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const metasFiltradas = goals.filter((g) => {
        if (!g.endDate) {
          return true;
        }
        const end = new Date(g.endDate);
        return end >= sevenDaysAgo;
      });

      setSalesGoals(metasFiltradas);
    } catch (err) {
      console.error('Erro ao obter metas de vendas:', err);
      setError('Falha ao carregar metas de vendas.');
      toast.error('Falha ao carregar metas de vendas.');
    }
  };

  // Calcula total de vendas e total de pedidos filtrados pelo mês
  const fetchTotalVendas = async () => {
    try {
      const response = await api.get('/finalized-tables', {
        params: {
          dataInicial: dataInicial || undefined,
          dataFinal: dataFinal || undefined,
        },
      });
      const finalizedTables = response.data.finalized || [];
      const somaValorPago = finalizedTables.reduce((acc, mesa) => {
        const valor = parseFloat(mesa.valorTotal) || 0;
        return acc + valor;
      }, 0);
      setTotalVendas(somaValorPago);
      setTotalPedidosMonth(finalizedTables.length);
    } catch (err) {
      console.error('Erro ao buscar total de vendas:', err);
      toast.error('Falha ao carregar total de vendas.');
    }
  };

  const fetchVendasUltimos7Dias = async () => {
    try {
      const response = await api.get('/finalized-tables', {
        params: {
          dataInicial: dataInicial || undefined,
          dataFinal: dataFinal || undefined,
        },
      });
      const finalizedTables = response.data.finalized || [];

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const vendasPorDia = {};

      finalizedTables.forEach((mesa) => {
        if (mesa.dataFinalizacao) {
          const dataVenda = new Date(mesa.dataFinalizacao).toLocaleDateString('pt-BR');
          vendasPorDia[dataVenda] = (vendasPorDia[dataVenda] || 0) + (mesa.valorTotal || 0);
        }
      });

      const vendasUltimos7 = [];
      for (let i = 7; i >= 0; i--) {
        const data = new Date(hoje);
        data.setDate(hoje.getDate() - i);
        const diaFormatado = data.toLocaleDateString('pt-BR');
        vendasUltimos7.push({
          dia: diaFormatado,
          totalVendas: vendasPorDia[diaFormatado] || 0,
        });
      }

      vendasUltimos7.sort((a, b) => {
        const dateA = new Date(a.dia.split('/').reverse().join('-'));
        const dateB = new Date(b.dia.split('/').reverse().join('-'));
        return dateA - dateB;
      });

      setVendasUltimos7Dias(vendasUltimos7);
    } catch (err) {
      console.error('Erro ao buscar vendas dos últimos 7 dias:', err);
      toast.error('Falha ao carregar vendas dos últimos 7 dias.');
    }
  };

  const fetchVendasPorFuncionario = async () => {
    try {
      const response = await api.get('/finalized-tables', {
        params: {
          dataInicial: dataInicial || undefined,
          dataFinal: dataFinal || undefined,
        },
      });
      const finalizedTables = response.data.finalized || [];
      const vendasPorFunc = {};

      finalizedTables.forEach((mesa) => {
        const garcomNome = mesa.garcomId && mesa.garcomId.nome ? mesa.garcomId.nome : 'Desconhecido';
        const valor = mesa.valorTotal || 0;
        vendasPorFunc[garcomNome] = (vendasPorFunc[garcomNome] || 0) + valor;
      });

      const vendasPorFuncArray = Object.keys(vendasPorFunc).map((garcom) => ({
        garcom,
        totalVendas: vendasPorFunc[garcom],
      }));

      vendasPorFuncArray.sort((a, b) => b.totalVendas - a.totalVendas);
      setVendasPorFuncionario(vendasPorFuncArray);
    } catch (err) {
      console.error('Erro ao buscar vendas por funcionário:', err);
      toast.error('Falha ao carregar vendas por funcionário.');
    }
  };

  const fetchVendasPorCategoria = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/sales-by-category', {
        params: {
          dataInicial: dataInicial || undefined,
          dataFinal: dataFinal || undefined,
        },
      });
      const salesByCategory = response.data.salesByCategory || [];
      const vendasPorCategoriaArray = salesByCategory.map((cat) => ({
        categoria: capitalizeWords(cat._id),
        total: cat.totalVendido,
      }));

      vendasPorCategoriaArray.sort((a, b) => b.total - a.total);
      setVendasPorCategoria(vendasPorCategoriaArray);
    } catch (err) {
      console.error('Erro ao buscar vendas por categoria:', err);
      setError('Falha ao carregar vendas por categoria.');
      toast.error('Falha ao carregar vendas por categoria.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProdutosMaisVendidos = async () => {
    try {
      const response = await api.get('/finalized-tables', {
        params: {
          dataInicial: dataInicial || undefined,
          dataFinal: dataFinal || undefined,
        },
      });
      const finalizedTables = response.data.finalized || [];
      const produtosVendidos = {};

      finalizedTables.forEach((fin) => {
        if (fin.pedidos) {
          fin.pedidos.forEach((pedido) => {
            if (pedido.itens) {
              pedido.itens.forEach((item) => {
                const pid = item.product._id;
                const nome = item.product.nome;
                const qtd = item.quantidade || 0;
                if (produtosVendidos[pid]) {
                  produtosVendidos[pid].quantidade += qtd;
                } else {
                  produtosVendidos[pid] = { nome, quantidade: qtd };
                }
              });
            }
          });
        }
      });

      const arr = Object.keys(produtosVendidos).map((id) => ({
        _id: id,
        nome: produtosVendidos[id].nome,
        total: produtosVendidos[id].quantidade,
      }));

      arr.sort((a, b) => b.total - a.total);
      const top10 = arr.slice(0, 10);
      setProdutosMaisVendidos(top10);
    } catch (err) {
      console.error('Erro ao buscar produtos mais vendidos:', err);
      toast.error('Falha ao carregar produtos mais vendidos.');
    }
  };

  const fetchMetodosPagamento = async () => {
    try {
      const response = await api.get('/finalized-tables', {
        params: {
          dataInicial: dataInicial || undefined,
          dataFinal: dataFinal || undefined,
        },
      });
      const finalizedTables = response.data.finalized || [];
      const pagamentoCounts = {};

      finalizedTables.forEach((mesa) => {
        const formas = Array.isArray(mesa.formaPagamento) ? mesa.formaPagamento : [];
        if (formas.length === 0) formas.push('Desconhecido');

        formas.forEach((metodo) => {
          const key = metodo.trim().toLowerCase() || 'desconhecido';
          pagamentoCounts[key] = (pagamentoCounts[key] || 0) + 1;
        });
      });

      const payArr = Object.keys(pagamentoCounts).map((m) => ({
        metodo: capitalizeWords(m),
        quantidade: pagamentoCounts[m],
      }));
      setMetodosPagamento(payArr);
    } catch (err) {
      console.error('Erro ao buscar métodos de pagamento:', err);
      toast.error('Falha ao carregar métodos de pagamento.');
    }
  };

  // Nova função para buscar os valores pagos por cada método de pagamento
  const fetchPaymentAmounts = async () => {
    try {
      const response = await api.get('/finalized-tables', {
        params: {
          dataInicial: dataInicial || undefined,
          dataFinal: dataFinal || undefined,
        },
      });
      const finalizedTables = response.data.finalized || [];
      const pagamentoValores = {};

      finalizedTables.forEach((mesa) => {
        const formas = Array.isArray(mesa.formaPagamento) ? mesa.formaPagamento : [];
        if (formas.length === 0) formas.push('Desconhecido');
        formas.forEach((metodo) => {
          const key = metodo.trim().toLowerCase() || 'desconhecido';
          const valor = parseFloat(mesa.valorTotal) || 0;
          pagamentoValores[key] = (pagamentoValores[key] || 0) + valor;
        });
      });

      const payValoresArr = Object.keys(pagamentoValores).map((m) => ({
        metodo: capitalizeWords(m),
        valor: pagamentoValores[m],
      }));
      setPaymentAmounts(payValoresArr);
    } catch (err) {
      console.error('Erro ao buscar valores pagos por método:', err);
      toast.error('Falha ao carregar valores pagos por método.');
    }
  };

  const fetchProdutosComEstoqueBaixo = async () => {
    try {
      const response = await api.get('/products', {});
      const todos = response.data || [];
      const limiar = 10;
      const baixo = todos.filter((p) => p.quantidadeEstoque <= limiar);
      setProdutosComEstoqueBaixo(baixo);
    } catch (err) {
      console.error('Erro ao buscar produtos com estoque baixo:', err);
      toast.error('Falha ao carregar produtos com estoque baixo.');
    }
  };

  const fetchPedidosPendentes = async () => {
    try {
      const statuses = ['Pendente', 'Preparando', 'Pronto'];
      let todosPedidos = [];

      for (const st of statuses) {
        const resp = await api.get('/orders', {
          params: { status: st, limit: 1000 },
        });
        const subset = Array.isArray(resp.data.orders) ? resp.data.orders : [];
        todosPedidos = [...todosPedidos, ...subset];
      }
      setPedidosPendentes(todosPedidos.length);
      setPedidosPendentesList(todosPedidos);
    } catch (err) {
      console.error(err);
      toast.error('Falha ao carregar pedidos pendentes.');
    }
  };

  // Aplica os filtros globalmente
  const applyFilters = () => {
    fetchStatistics();
    if (user && ['agent', 'admin', 'manager'].includes(user.role)) {
      fetchSalesGoals();
      fetchTotalVendas();
      fetchVendasUltimos7Dias();
      fetchVendasPorFuncionario();
      fetchVendasPorCategoria();
      fetchProdutosMaisVendidos();
      fetchMetodosPagamento();
      fetchPaymentAmounts(); // Atualiza os valores pagos por método
      fetchProdutosComEstoqueBaixo();
      fetchPedidosPendentes();
    }
  };

  // -------------------- LOADING / ERRO --------------------
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status" variant="primary" size="lg">
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
      </div>
    );
  }

  if (error && (!statistics || Object.keys(statistics).length === 0)) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  // -------------------- EXTRAÇÃO DE VALORES --------------------
  // Removido totalPedidos de statistics, pois usamos totalPedidosMonth calculado via /finalized-tables
  const { totalClientes = 0, totalProdutos = 0, totalReservas = 0 } = statistics;

  // -------------------- PREPARO DOS GRÁFICOS --------------------
  const vendas7diasData = {
    labels: vendasUltimos7Dias.map((d) => d.dia),
    datasets: [
      {
        label: 'Vendas (R$)',
        data: vendasUltimos7Dias.map((d) => d.totalVendas),
        borderColor: '#4e73df',
        backgroundColor: 'rgba(78,115,223,0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const vendasPorFuncionarioData = {
    labels: vendasPorFuncionario.map((f) => f.garcom),
    datasets: [
      {
        label: 'Vendas (R$)',
        data: vendasPorFuncionario.map((f) => f.totalVendas),
        backgroundColor: vendasPorFuncionario.map((_, i) => getColor(i)),
      },
    ],
  };

  const metodosPagamentoData = {
    labels: metodosPagamento.map((m) => m.metodo),
    datasets: [
      {
        label: 'Quantidade',
        data: metodosPagamento.map((m) => m.quantidade),
        backgroundColor: metodosPagamento.map((_, i) => getColor(i)),
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>Dashboard - Strawberry</title>
      </Helmet>

      <Container fluid className="mt-4">
        <h2 className="mb-4">Dashboard</h2>

        {/* Filtros Globais */}
        <Form className="mb-4">
          <Row className="align-items-end">
            <Col xs={12} md={4} className="mb-3 mb-md-0">
              <Form.Label>Data Inicial</Form.Label>
              <Form.Control
                type="date"
                value={dataInicial}
                onChange={(e) => setDataInicial(e.target.value)}
              />
            </Col>
            <Col xs={12} md={4} className="mb-3 mb-md-0">
              <Form.Label>Data Final</Form.Label>
              <Form.Control
                type="date"
                value={dataFinal}
                onChange={(e) => setDataFinal(e.target.value)}
              />
            </Col>
            <Col xs={12} md={4}>
              <Button variant="primary" onClick={applyFilters} className="w-100">
                Aplicar Filtros
              </Button>
            </Col>
          </Row>
        </Form>

        {/* KPIs Principais */}
        <Row xs={1} sm={2} md={4} className="g-4">
          <Col>
            <Card className="text-center shadow-sm border-0 h-100">
              <Card.Body>
                <FaDollarSign size={30} color="#4e73df" />
                <Card.Title className="mt-3">Total de Vendas</Card.Title>
                <Card.Text className="display-6">
                  R$ {totalVendas.toLocaleString('pt-BR')}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card className="text-center shadow-sm border-0 h-100">
              <Card.Body>
                <FaShoppingCart size={30} color="#1cc88a" />
                <Card.Title className="mt-3">Total de Pedidos</Card.Title>
                <Card.Text className="display-6">
                  {totalPedidosMonth.toLocaleString('pt-BR')}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card className="text-center shadow-sm border-0 h-100">
              <Card.Body>
                <FaUsers size={30} color="#36b9cc" />
                <Card.Title className="mt-3">Total de Clientes</Card.Title>
                <Card.Text className="display-6">
                  {totalClientes.toLocaleString('pt-BR')}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card className="text-center shadow-sm border-0 h-100">
              <Card.Body>
                <FaBoxes size={30} color="#f6c23e" />
                <Card.Title className="mt-3">Total de Produtos</Card.Title>
                <Card.Text className="display-6">
                  {totalProdutos.toLocaleString('pt-BR')}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* KPIs Adicionais */}
        <Row xs={1} sm={2} className="g-4 mt-4">
          <Col>
            <Card className="text-center shadow-sm border-0 h-100">
              <Card.Body>
                <FaCalendarAlt size={30} color="#e74a3b" />
                <Card.Title className="mt-3">Total de Reservas</Card.Title>
                <Card.Text className="display-6">
                  {statistics.totalReservas?.toLocaleString('pt-BR') || '0'}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card className="text-center shadow-sm border-0 bg-warning text-dark h-100">
              <Card.Body>
                <FaTasks size={30} />
                <Card.Title className="mt-3">Pedidos em Andamento</Card.Title>
                <Card.Text className="display-6">
                  {pedidosPendentes.toLocaleString('pt-BR')}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* GRÁFICOS: Vendas Últimos 7 Dias e Vendas por Funcionário */}
        <Row className="mt-5 g-4">
          {/* Vendas nos Últimos 7 Dias */}
          <Col xs={12} lg={6}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Body>
                <Card.Title>
                  <FaChartLine /> Vendas nos Últimos 7 Dias
                </Card.Title>
                {vendasUltimos7Dias.length > 0 ? (
                  <>
                    <div style={{ height: '300px' }}>
                      <Line
                        data={vendas7diasData}
                        options={{ maintainAspectRatio: false }}
                      />
                    </div>
                    <hr />
                    <h5 className="mt-4">Detalhes das Vendas dos Últimos 7 Dias</h5>
                    <Table className="table table-striped table-bordered table-hover" responsive>
                      <thead className="table-dark">
                        <tr>
                          <th>Data</th>
                          <th>Total de Vendas (R$)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vendasUltimos7Dias.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.dia}</td>
                            <td>R$ {item.totalVendas.toLocaleString('pt-BR')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </>
                ) : (
                  <p className="text-center">Nenhum dado disponível.</p>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Vendas por Funcionário */}
          <Col xs={12} lg={6}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Body>
                <Card.Title>
                  <FaChartBar /> Vendas por Funcionário
                </Card.Title>
                {vendasPorFuncionario.length > 0 ? (
                  <>
                    <div style={{ height: '300px' }}>
                      <Bar
                        data={vendasPorFuncionarioData}
                        options={{ maintainAspectRatio: false }}
                      />
                    </div>
                    <hr />
                    <h5 className="mt-4">Detalhes das Vendas por Funcionário</h5>
                    <Table className="table table-striped table-bordered table-hover" responsive>
                      <thead className="table-dark">
                        <tr>
                          <th>Funcionário</th>
                          <th>Total de Vendas (R$)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vendasPorFuncionario.map((f, idx) => (
                          <tr key={idx}>
                            <td>{f.garcom}</td>
                            <td>R$ {f.totalVendas.toLocaleString('pt-BR')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </>
                ) : (
                  <p className="text-center">Nenhum dado disponível.</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Vendas por Categoria e Produtos com Estoque Baixo */}
        <Row className="mt-4 g-4">
          {/* Vendas por Categoria */}
          <Col xs={12} lg={6}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Body>
                <Card.Title>
                  <FaChartBar /> Vendas por Categoria
                </Card.Title>
                {vendasPorCategoria.length > 0 ? (
                  <Table className="table table-striped table-bordered table-hover" responsive>
                    <thead className="table-dark">
                      <tr>
                        <th>Categoria</th>
                        <th>Total Vendido (R$)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendasPorCategoria.map((categoria, index) => (
                        <tr key={index}>
                          <td>{categoria.categoria}</td>
                          <td>R$ {categoria.total.toLocaleString('pt-BR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <p className="text-center">Nenhum dado disponível.</p>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Produtos com Estoque Baixo */}
          <Col xs={12} lg={6}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Body>
                <Card.Title>
                  <FaBoxes /> Produtos com Estoque Baixo
                </Card.Title>
                {produtosComEstoqueBaixo.length > 0 ? (
                  <Table className="table table-striped table-bordered table-hover" responsive>
                    <thead className="table-dark">
                      <tr>
                        <th>Produto</th>
                        <th>Categoria</th>
                        <th>Estoque</th>
                      </tr>
                    </thead>
                    <tbody>
                      {produtosComEstoqueBaixo.map((p) => (
                        <tr key={p._id}>
                          <td>{p.nome}</td>
                          <td>{capitalizeWords(p.categoria?.categoria || 'N/A')}</td>
                          <td>{p.quantidadeEstoque}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <p className="text-center">Nenhum produto com estoque baixo.</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Métodos de Pagamento e Valores Pagos */}
        <Row className="mt-4 g-4">
          {/* Métodos de Pagamento */}
          <Col xs={12} lg={6}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Body>
                <Card.Title>
                  <FaChartPie /> Métodos de Pagamento
                </Card.Title>
                {metodosPagamento.length > 0 ? (
                  <div style={{ height: '300px' }}>
                    <Doughnut
                      data={{
                        labels: metodosPagamento.map((m) => m.metodo),
                        datasets: [
                          {
                            label: 'Quantidade',
                            data: metodosPagamento.map((m) => m.quantidade),
                            backgroundColor: metodosPagamento.map((_, i) => getColor(i)),
                          },
                        ],
                      }}
                      options={{ maintainAspectRatio: false }}
                    />
                  </div>
                ) : (
                  <p className="text-center">Nenhum dado disponível.</p>
                )}

                {/* Tabela com valores pagos por cada método */}
                {paymentAmounts.length > 0 && (
                  <>
                    <br />
                    <Table className="table table-striped table-bordered table-hover" responsive>
                      <thead className="table-dark">
                        
                      </thead>
                      <tbody>
                        {paymentAmounts.map((item, index) => (
                          <tr key={index}>
                            <td>{item.metodo}</td>
                            <td>
                              R${' '}
                              {item.valor.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Produtos Mais Vendidos */}
          <Col xs={12} lg={6}>
            <Card className="shadow-sm border-0 h-100">
              <Card.Body>
                <Card.Title>
                  <FaShoppingCart /> Produtos Mais Vendidos
                </Card.Title>
                {produtosMaisVendidos.length > 0 ? (
                  <Table className="table table-striped table-bordered table-hover" responsive>
                    <thead className="table-dark">
                      <tr>
                        <th>Produto</th>
                        <th>Quantidade Vendida</th>
                      </tr>
                    </thead>
                    <tbody>
                      {produtosMaisVendidos.map((prod) => (
                        <tr key={prod._id}>
                          <td>{prod.nome}</td>
                          <td>{prod.total.toLocaleString('pt-BR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <p className="text-center">Nenhum dado disponível.</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* METAS DE VENDAS */}
        {user &&
          ['agent', 'admin', 'manager'].includes(user.role) &&
          salesGoals.length > 0 && (
            <Row className="my-5">
              <Col xs={12}>
                <Card className="shadow-sm border-0">
                  <Card.Body>
                    <Card.Title>
                      <FaTasks /> Suas Metas de Vendas
                    </Card.Title>
                    <Table className="table table-striped table-bordered table-hover" responsive>
                      <thead className="table-dark">
                        <tr>
                          <th>Meta</th>
                          <th>Valor (R$)</th>
                          <th>Início</th>
                          <th>Fim</th>
                          <th>Progresso (%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesGoals.map((g) => (
                          <tr key={g._id}>
                            <td>{g.goalName}</td>
                            <td>R$ {Number(g.goalAmount).toLocaleString('pt-BR')}</td>
                            <td>
                              {g.startDate
                                ? new Date(g.startDate).toLocaleDateString('pt-BR')
                                : '-'}
                            </td>
                            <td>
                              {g.endDate
                                ? new Date(g.endDate).toLocaleDateString('pt-BR')
                                : 'Sem prazo'}
                            </td>
                            <td>{Number(g.progress).toFixed(2)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
      </Container>
    </>
  );
};

// Paleta de cores para gráficos
const COLORS = [
  '#4e73df',
  '#1cc88a',
  '#36b9cc',
  '#f6c23e',
  '#e74a3b',
  '#858796',
  '#5a5c69',
  '#2e59d9',
  '#17a673',
  '#2c9faf',
  '#f8c291',
  '#6ab04c',
  '#eb4d4b',
  '#e056fd',
  '#22a6b3',
];

// Função que retorna uma cor baseada no índice
function getColor(index) {
  return COLORS[index % COLORS.length];
}

export default Dashboard;
