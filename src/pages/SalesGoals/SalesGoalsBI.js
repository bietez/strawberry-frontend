// src/pages/SalesGoals/SalesGoalsBI.js

import React, { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import {
  Container,
  Row,
  Col,
  ListGroup,
  Spinner,
  Alert,
  Button,
  Form,
  Card,
  Table,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaFilePdf } from 'react-icons/fa';

// Chart.js e componentes
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
import { Bar, Pie } from 'react-chartjs-2';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

function SalesGoalsBI() {
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [errorEmployees, setErrorEmployees] = useState(null);

  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Metas que vêm do endpoint /sales-goals/advanced (já com currentSales e progress)
  const [employeeGoals, setEmployeeGoals] = useState([]);
  const [loadingGoals, setLoadingGoals] = useState(false);
  const [errorGoals, setErrorGoals] = useState(null);

  // Filtros
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDataInicial, setFilterDataInicial] = useState('');
  const [filterDataFinal, setFilterDataFinal] = useState('');

  // KPIs
  const [kpiTotal, setKpiTotal] = useState(0);
  const [kpiEmAndamento, setKpiEmAndamento] = useState(0);
  const [kpiAlcancada, setKpiAlcancada] = useState(0);
  const [kpiFinalizada, setKpiFinalizada] = useState(0);

  const [loadingBI, setLoadingBI] = useState(false);

  // Paleta de cores
  const COLORS = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#858796'];

  // Ref para o conteúdo a ser exportado
  const printRef = useRef();

  // Carregar lista de funcionários
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    setErrorEmployees(null);
    try {
      // Exemplo: se /users/team-members retorna todos os funcionários (papel agent)
      const resp = await api.get('/users/team-members');
      setEmployees(resp.data || []);
    } catch (err) {
      console.error('Erro ao buscar funcionários:', err);
      setErrorEmployees('Não foi possível carregar a lista de funcionários.');
    } finally {
      setLoadingEmployees(false);
    }
  };

  // Ao clicar em um funcionário
  const handleSelectEmployee = (emp) => {
    setSelectedEmployee(emp);
    setEmployeeGoals([]);
    // Buscar metas do emp, usando /sales-goals/advanced
    loadEmployeeGoals(emp, filterStatus, filterDataInicial, filterDataFinal);
  };

  /**
   * Carrega metas pelo endpoint /sales-goals/advanced,
   * passando employeeId, status, dataInicial, dataFinal etc.
   */
  const loadEmployeeGoals = async (emp, status, dtIni, dtFim) => {
    if (!emp) return;
    setLoadingGoals(true);
    setErrorGoals(null);
    setLoadingBI(true);

    try {
      // Montar params
      // Exemplo: page=1, limit=50 (ou outro valor arbitrário)
      const params = {
        page: 1,
        limit: 50,
        employeeId: emp._id,
      };
      if (status) params.status = status;
      if (dtIni) params.dataInicial = dtIni;
      if (dtFim) params.dataFinal = dtFim;

      // Chama /sales-goals/advanced
      const resp = await api.get('/sales-goals/advanced', { params });
      if (resp.data && Array.isArray(resp.data.salesGoals)) {
        const goals = resp.data.salesGoals;
        setEmployeeGoals(goals);
        calcKpis(goals);
      } else {
        setEmployeeGoals([]);
        calcKpis([]);
      }
    } catch (err) {
      console.error('Erro ao buscar metas do funcionário:', err);
      setErrorGoals('Não foi possível carregar metas do funcionário.');
      setEmployeeGoals([]);
      calcKpis([]);
    } finally {
      setLoadingGoals(false);
      setLoadingBI(false);
    }
  };

  // Cálculo de KPI
  const calcKpis = (goals) => {
    setKpiTotal(goals.length);
    setKpiEmAndamento(goals.filter((g) => g.status === 'em_andamento').length);
    setKpiAlcancada(goals.filter((g) => g.status === 'alcancada').length);
    setKpiFinalizada(goals.filter((g) => g.status === 'finalizada').length);
  };

  // Aplicar Filtros
  const handleApplyFilters = () => {
    if (!selectedEmployee) {
      toast.info('Selecione um funcionário primeiro.');
      return;
    }
    loadEmployeeGoals(selectedEmployee, filterStatus, filterDataInicial, filterDataFinal);
  };

  // Exportar PDF apenas do conteúdo principal com margens
  const handleExportPDF = async () => {
    console.log('Exportar PDF clicado'); // Log para verificar chamada
    if (!selectedEmployee) {
      toast.info('Selecione um funcionário para gerar PDF.');
      return;
    }
    if (!printRef.current) {
      toast.error('Erro ao encontrar o conteúdo para exportar.');
      return;
    }

    try {
      // Captura o conteúdo do elemento referenciado
      const canvas = await html2canvas(printRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');

      // Cria uma instância do jsPDF
      const pdf = new jsPDF('p', 'mm', 'a4');

      // Define as margens
      const marginLeft = 10; // Margem esquerda em mm
      const marginTop = 10; // Margem superior em mm
      const marginRight = 10; // Margem direita em mm
      const marginBottom = 10; // Margem inferior em mm

      // Obtém as dimensões da página
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Calcula a largura e altura disponíveis para a imagem
      const pdfWidth = pageWidth - marginLeft - marginRight;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Adiciona a imagem no PDF com as margens
      pdf.addImage(imgData, 'PNG', marginLeft, marginTop, pdfWidth, pdfHeight);

      // Salva o PDF
      pdf.save(`Relatorio_Metas_${selectedEmployee.nome}.pdf`);
      console.log('PDF gerado com sucesso'); // Log de sucesso
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      toast.error('Falha ao gerar PDF.');
    }
  };

  // Gráfico "Status das Metas"
  const chartDataByStatus = () => {
    if (employeeGoals.length === 0) {
      return {
        labels: ['Sem dados'],
        datasets: [
          {
            label: 'Metas',
            data: [1],
            backgroundColor: ['#ccc'],
          },
        ],
      };
    }
    const countEmAndamento = employeeGoals.filter(g => g.status === 'em_andamento').length;
    const countAlcancada = employeeGoals.filter(g => g.status === 'alcancada').length;
    const countFinalizada = employeeGoals.filter(g => g.status === 'finalizada').length;

    return {
      labels: ['Em Andamento', 'Alcançada', 'Finalizada'],
      datasets: [
        {
          label: 'Quantidade',
          data: [countEmAndamento, countAlcancada, countFinalizada],
          backgroundColor: [COLORS[0], COLORS[1], COLORS[4]],
        },
      ],
    };
  };

  // Gráfico "Comparativo Valor da Meta x Total Vendido"
  const chartDataGoalsVsSales = () => {
    if (employeeGoals.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }
    const labels = employeeGoals.map(g => g.goalName);
    // Pega goalAmount e currentSales do back-end (já vindo de /advanced)
    const dataGoal = employeeGoals.map(g => Number(g.goalAmount) || 0);
    const dataSales = employeeGoals.map(g => Number(g.currentSales) || 0);

    return {
      labels,
      datasets: [
        {
          label: 'Valor da Meta',
          data: dataGoal,
          backgroundColor: COLORS[0],
        },
        {
          label: 'Total Vendido',
          data: dataSales,
          backgroundColor: COLORS[1],
        },
      ],
    };
  };

  return (
    <Container className="mt-4">
      <h2>BI - Metas de Vendas</h2>
      <Row className="mt-3">
        <Col md={3} className="mb-4">
          <h5>Funcionários</h5>
          {loadingEmployees ? (
            <Spinner animation="border" />
          ) : errorEmployees ? (
            <Alert variant="danger">{errorEmployees}</Alert>
          ) : employees.length === 0 ? (
            <Alert variant="info">Nenhum funcionário encontrado.</Alert>
          ) : (
            <ListGroup>
              {employees.map((emp) => (
                <ListGroup.Item
                  key={emp._id}
                  action
                  active={selectedEmployee && selectedEmployee._id === emp._id}
                  onClick={() => handleSelectEmployee(emp)}
                >
                  {emp.nome}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>

        <Col md={9}>
          {!selectedEmployee ? (
            <Alert variant="info">
              Selecione um funcionário na lista para visualizar as metas.
            </Alert>
          ) : (
            <>
              {/* Envolva o conteúdo principal com a ref e a classe de padding */}
              <div ref={printRef} className="print-content">
                <h4>
                  Metas de <strong>{selectedEmployee.nome}</strong>
                </h4>

                {/* FILTROS */}
                <Form className="mb-3">
                  <Row className="align-items-end">
                    <Col xs={6} md={3}>
                      <Form.Label>Status</Form.Label>
                      <Form.Select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <option value="">Todos</option>
                        <option value="em_andamento">Em Andamento</option>
                        <option value="alcancada">Alcançada</option>
                        <option value="finalizada">Finalizada</option>
                      </Form.Select>
                    </Col>
                    <Col xs={6} md={3}>
                      <Form.Label>Data Inicial</Form.Label>
                      <Form.Control
                        type="date"
                        value={filterDataInicial}
                        onChange={(e) => setFilterDataInicial(e.target.value)}
                      />
                    </Col>
                    <Col xs={6} md={3}>
                      <Form.Label>Data Final</Form.Label>
                      <Form.Control
                        type="date"
                        value={filterDataFinal}
                        onChange={(e) => setFilterDataFinal(e.target.value)}
                      />
                    </Col>
                    <Col xs={6} md={3}>
                      <Button variant="primary" className="w-100 mt-2" onClick={handleApplyFilters} type="button">
                        Aplicar Filtros
                      </Button>
                    </Col>
                  </Row>
                </Form>

                {/* KPIs */}
                <Row className="mb-3">
                  <Col sm={3}>
                    <Card className="text-center">
                      <Card.Body>
                        <Card.Title>Total de Metas</Card.Title>
                        <Card.Text className="display-6">{kpiTotal}</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col sm={3}>
                    <Card className="text-center">
                      <Card.Body>
                        <Card.Title>Em Andamento</Card.Title>
                        <Card.Text className="display-6">{kpiEmAndamento}</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col sm={3}>
                    <Card className="text-center">
                      <Card.Body>
                        <Card.Title>Alcançada</Card.Title>
                        <Card.Text className="display-6">{kpiAlcancada}</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col sm={3}>
                    <Card className="text-center">
                      <Card.Body>
                        <Card.Title>Finalizada</Card.Title>
                        <Card.Text className="display-6">{kpiFinalizada}</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* GRÁFICOS */}
                <Row>
                  <Col md={6} className="mb-4">
                    <Card className="h-100">
                      <Card.Body>
                        <Card.Title>Status das Metas</Card.Title>
                        {loadingGoals ? (
                          <Spinner animation="border" />
                        ) : (
                          <div style={{ height: 300 }}>
                            <Pie data={chartDataByStatus()} />
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6} className="mb-4">
                    <Card className="h-100">
                      <Card.Body>
                        <Card.Title>Comparativo de Valor x Vendas</Card.Title>
                        {loadingGoals ? (
                          <Spinner animation="border" />
                        ) : (
                          <div style={{ height: 300 }}>
                            <Bar
                              data={chartDataGoalsVsSales()}
                              options={{ maintainAspectRatio: false }}
                            />
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Tabela Detalhada */}
                <Card className="mb-3">
                  <Card.Body>
                    <Card.Title>Lista de Metas (Detalhado)</Card.Title>
                    {loadingGoals ? (
                      <Spinner animation="border" />
                    ) : errorGoals ? (
                      <Alert variant="danger">{errorGoals}</Alert>
                    ) : employeeGoals.length === 0 ? (
                      <Alert variant="info">Nenhuma meta encontrada.</Alert>
                    ) : (
                      <Table striped bordered hover responsive>
                        <thead>
                          <tr>
                            <th>Meta</th>
                            <th>Status</th>
                            <th>Valor Meta</th>
                            <th>Vendas</th>
                            <th>Progresso</th>
                            <th>Início</th>
                            <th>Fim</th>
                          </tr>
                        </thead>
                        <tbody>
                          {employeeGoals.map((g) => {
                            // Se o backend /advanced já retorna currentSales e progress
                            // use g.currentSales. Caso contrário, calcule localmente.
                            const sales = Number(g.currentSales) || 0;
                            // O backend pode já fornecer 'progress' ou não;
                            // Se não, calcule: progress = sales / goalAmount * 100
                            const progress = g.progress
                              ? Number(g.progress)
                              : g.goalAmount > 0
                                ? (sales / Number(g.goalAmount)) * 100
                                : 0;

                            return (
                              <tr key={g._id}>
                                <td>{g.goalName}</td>
                                <td>
                                  {g.status === 'em_andamento' && (
                                    <span className="badge bg-info text-dark">Em Andamento</span>
                                  )}
                                  {g.status === 'alcancada' && (
                                    <span className="badge bg-success">Alcançada</span>
                                  )}
                                  {g.status === 'finalizada' && (
                                    <span className="badge bg-secondary">Finalizada</span>
                                  )}
                                </td>
                                <td>R$ {Number(g.goalAmount).toLocaleString('pt-BR')}</td>
                                <td>R$ {sales.toLocaleString('pt-BR')}</td>
                                <td>{progress.toFixed(2)}%</td>
                                <td>
                                  {g.startDate
                                    ? new Date(g.startDate).toLocaleDateString('pt-BR')
                                    : '-'}
                                </td>
                                <td>
                                  {g.endDate
                                    ? new Date(g.endDate).toLocaleDateString('pt-BR')
                                    : '-'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    )}
                  </Card.Body>
                </Card>
              </div>

              {/* Botão Exportar PDF fora da div referenciada */}
              <div className="d-flex justify-content-end mt-3">
                <Button variant="danger" onClick={handleExportPDF} type="button">
                  <FaFilePdf /> Exportar Relatório PDF
                </Button>
              </div>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default SalesGoalsBI;
