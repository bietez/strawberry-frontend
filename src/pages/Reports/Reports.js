// src/pages/Reports/Reports.js
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Table, Spinner, Alert, Card } from 'react-bootstrap';
import api from '../../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { NumericFormat } from 'react-number-format';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function Reports() {
  // Estados para filtros globais
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');
  const [search, setSearch] = useState('');

  // Estados para dados
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [finalizedTables, setFinalizedTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [vendasGarcom, setVendasGarcom] = useState([]);
  const [produtosBaixoEstoque, setProdutosBaixoEstoque] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [vendasPeriodo, setVendasPeriodo] = useState({ totalVendas: 0, totalMesas: 0 });

  // Carregar dados ao montar e sempre que filtros mudarem
  useEffect(() => {
    fetchAllData();
  }, [dataInicial, dataFinal, search]);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Finalized Tables com filtros
      const ftParams = {
        page: 1,
        limit: 10,
        search: search,
        sort: 'dataFinalizacao',
        order: 'desc'
      };
      const ftResponse = await api.get('/finalized-tables', { params: ftParams });
      setFinalizedTables(ftResponse.data.finalized || []);

      // Reservas Avançadas
      const resParams = {
        page: 1,
        limit: 10,
        search: search,
        sort: 'dataReserva',
        order: 'desc'
      };
      const resResponse = await api.get('/reservations/advanced', { params: resParams });
      setReservations(resResponse.data.reservations || []);

      // Vendas por período (usando dataInicial, dataFinal)
      if (dataInicial && dataFinal) {
        const vpResponse = await api.get('/finalized-tables/relatorios/periodo', {
          params: { dataInicial, dataFinal }
        });
        setVendasPeriodo(vpResponse.data);
      } else {
        setVendasPeriodo({ totalVendas: 0, totalMesas: 0 });
      }

      // Vendas por garçom
      const garcomParams = {};
      if (dataInicial) garcomParams.dataInicial = dataInicial;
      if (dataFinal) garcomParams.dataFinal = dataFinal;
      const vgResponse = await api.get('/finalized-tables/relatorios/garcom', { params: garcomParams });
      setVendasGarcom(vgResponse.data.vendas || []);

      // Produtos com estoque baixo
      const pbResponse = await api.get('/reports/produtosComEstoqueBaixo');
      setProdutosBaixoEstoque(pbResponse.data || []);

      // Estatísticas gerais
      const statsResponse = await api.get('/reports/statistics');
      setStatistics(statsResponse.data || {});

    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados de relatórios.');
      toast.error('Erro ao carregar dados de relatórios.');
    } finally {
      setLoading(false);
    }
  };

  // Preparar dados para gráficos
  const vendasGarcomLabels = vendasGarcom.map(v => v._id || 'Sem Garçom');
  const vendasGarcomData = vendasGarcom.map(v => v.totalVendas || 0);

  const garcomChartData = {
    labels: vendasGarcomLabels,
    datasets: [
      {
        label: 'Vendas por Garçom (R$)',
        data: vendasGarcomData,
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
      }
    ]
  };

  const vendasUltimos7Dias = statistics?.vendasUltimos7Dias || [];
  const diasLabels = vendasUltimos7Dias.map(d => d.dia);
  const diasData = vendasUltimos7Dias.map(d => d.totalVendas);
  const vendas7dChartData = {
    labels: diasLabels,
    datasets: [
      {
        label: 'Vendas Últimos 7 Dias (R$)',
        data: diasData,
        backgroundColor: 'rgba(153, 102, 255, 0.7)',
      }
    ]
  };

  // Pie chart para mesas finalizadas por ambiente
  const ambientesData = {};
  finalizedTables.forEach(ft => {
    const nomeAmbiente = ft.ambienteId?.nome || 'Sem Ambiente';
    if (!ambientesData[nomeAmbiente]) ambientesData[nomeAmbiente] = 0;
    ambientesData[nomeAmbiente]++;
  });
  const ambientesLabels = Object.keys(ambientesData);
  const ambientesValues = Object.values(ambientesData);

  const ambientesChartData = {
    labels: ambientesLabels,
    datasets: [
      {
        label: 'Mesas Finalizadas por Ambiente',
        data: ambientesValues,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
        ]
      }
    ]
  };

  return (
    <Container className="my-5">
      <h2>Relatórios e Painéis</h2>

      <Form className="mb-4">
        <Row className="mb-2">
          <Col xs={12} md={4}>
            <Form.Label>Data Inicial</Form.Label>
            <Form.Control
              type="date"
              value={dataInicial}
              onChange={(e) => setDataInicial(e.target.value)}
            />
          </Col>
          <Col xs={12} md={4}>
            <Form.Label>Data Final</Form.Label>
            <Form.Control
              type="date"
              value={dataFinal}
              onChange={(e) => setDataFinal(e.target.value)}
            />
          </Col>
          <Col xs={12} md={4}>
            <Form.Label>Buscar (Texto)</Form.Label>
            <Form.Control
              placeholder="Ex: nome do ambiente, número da mesa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Col>
        </Row>
        <Button variant="primary" onClick={fetchAllData} className="mt-2">
          Aplicar Filtros
        </Button>
      </Form>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
          <p>Carregando dados...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <>
          <Row className="mb-4">
            <Col xs={12} md={6}>
              <Card className="mb-3">
                <Card.Body>
                  <Card.Title>Vendas no Período Selecionado</Card.Title>
                  <p><strong>Total de Vendas:</strong> R$ {vendasPeriodo.totalVendas?.toFixed(2)}</p>
                  <p><strong>Total de Mesas:</strong> {vendasPeriodo.totalMesas}</p>
                </Card.Body>
              </Card>
              <Card className="mb-3">
                <Card.Body>
                  <Card.Title>Estatísticas Gerais</Card.Title>
                  <p><strong>Total de Pedidos Pagos:</strong> {statistics?.totalPedidos || 0}</p>
                  <p><strong>Total de Clientes:</strong> {statistics?.totalClientes || 0}</p>
                  <p><strong>Total de Reservas:</strong> {statistics?.totalReservas || 0}</p>
                  <p><strong>Total de Produtos:</strong> {statistics?.totalProdutos || 0}</p>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card className="mb-3">
                <Card.Body>
                  <Card.Title>Mesas Finalizadas por Ambiente</Card.Title>
                  {ambientesValues.length > 0 ? (
                    <Pie data={ambientesChartData} />
                  ) : (
                    <p>Nenhum dado para exibir.</p>
                  )}
                </Card.Body>
              </Card>

              <Card className="mb-3">
                <Card.Body>
                  <Card.Title>Vendas Últimos 7 Dias</Card.Title>
                  {diasData.length > 0 ? (
                    <Bar data={vendas7dChartData} />
                  ) : (
                    <p>Nenhum dado para exibir.</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col xs={12} md={6}>
              <Card className="mb-3">
                <Card.Body>
                  <Card.Title>Vendas por Garçom</Card.Title>
                  {vendasGarcomData.length > 0 ? (
                    <Bar data={garcomChartData} />
                  ) : (
                    <p>Nenhum dado para exibir.</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card className="mb-3">
                <Card.Body>
                  <Card.Title>Produtos com Estoque Baixo</Card.Title>
                  {produtosBaixoEstoque.length > 0 ? (
                    <Table striped bordered hover responsive size="sm">
                      <thead>
                        <tr>
                          <th>Produto</th>
                          <th>Estoque</th>
                          <th>Preço</th>
                        </tr>
                      </thead>
                      <tbody>
                        {produtosBaixoEstoque.map((p, i) => (
                          <tr key={i}>
                            <td>{p.nome}</td>
                            <td>{p.quantidadeEstoque}</td>
                            <td>
                              <NumericFormat
                                value={p.preco}
                                displayType={'text'}
                                thousandSeparator="."
                                decimalSeparator=","
                                prefix="R$ "
                                decimalScale={2}
                                fixedDecimalScale={true}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <p>Nenhum produto com estoque baixo no momento.</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col xs={12} md={6}>
              <h4>Mesas Finalizadas (Filtradas)</h4>
              {finalizedTables.length > 0 ? (
                <Table striped bordered hover responsive size="sm">
                  <thead>
                    <tr>
                      <th>Mesa</th>
                      <th>Ambiente</th>
                      <th>Valor Total</th>
                      <th>Data Finalização</th>
                    </tr>
                  </thead>
                  <tbody>
                    {finalizedTables.map((ft, i) => (
                      <tr key={i}>
                        <td>{ft.numeroMesa}</td>
                        <td>{ft.ambienteId?.nome || 'N/A'}</td>
                        <td>
                          <NumericFormat
                            value={ft.valorTotal}
                            displayType={'text'}
                            thousandSeparator="."
                            decimalSeparator=","
                            prefix="R$ "
                            decimalScale={2}
                            fixedDecimalScale={true}
                          />
                        </td>
                        <td>{new Date(ft.dataFinalizacao).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info">Nenhuma mesa finalizada encontrada.</Alert>
              )}
            </Col>
            <Col xs={12} md={6}>
              <h4>Reservas (Filtradas)</h4>
              {reservations.length > 0 ? (
                <Table striped bordered hover responsive size="sm">
                  <thead>
                    <tr>
                      <th>Mesa</th>
                      <th>Cliente</th>
                      <th>Data Reserva</th>
                      <th>Nº Pessoas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((r, i) => (
                      <tr key={i}>
                        <td>{r.mesa?.numeroMesa || 'N/A'}</td>
                        <td>{r.cliente?.nome || 'N/A'}</td>
                        <td>{new Date(r.dataReserva).toLocaleString()}</td>
                        <td>{r.numeroPessoas}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info">Nenhuma reserva encontrada.</Alert>
              )}
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
}

export default Reports;
