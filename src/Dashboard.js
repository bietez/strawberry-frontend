// src/pages/Dashboard/Dashboard.js

import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import api from '../../services/api';
import {jwtDecode} from 'jwt-decode';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

/**
 * Dashboard que exibe dados obtidos a partir das rotas já existentes no backend.
 * Ele busca:
 *   1) Estatísticas gerais em /reports/statistics (contendo pedidosPorCategoria, metodosPagamento, etc.)
 *   2) Produtos em falta em /reports/produtosComEstoqueBaixo
 *   3) Clientes (apenas para obter "clientesAtivos") em /customers/advanced
 *   4) Pedidos dos últimos 7 dias em /orders (usando query de data)
 *   5) Total de vendas no período (ex.: início do mês até hoje) em /finalizedTable/relatorios/periodo
 * 
 * Também, se o user.role === 'agent', ele carrega metas de vendas em /sales-goals/employee/:userId
 * 
 * Lembre de ajustar se seu backend retornar dados de forma diferente.
 */

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // KPI Cards
  const [totalVendas, setTotalVendas] = useState(0);
  const [pedidosHoje, setPedidosHoje] = useState(0);
  const [clientesAtivos, setClientesAtivos] = useState(0);
  const [produtosEmFalta, setProdutosEmFalta] = useState(0);

  // Dados de gráficos
  const [vendasUltimos7Dias, setVendasUltimos7Dias] = useState([]);
  const [pedidosPorCategoria, setPedidosPorCategoria] = useState([]);
  const [metodosPagamento, setMetodosPagamento] = useState([]);

  // Metas de Vendas (exclusivo para 'agent')
  const [salesGoals, setSalesGoals] = useState([]);

  // Obter usuário do token
  let user = null;
  const token = localStorage.getItem('token');
  if (token) {
    try {
      user = jwtDecode(token);
    } catch (err) {
      console.error('Token inválido:', err);
    }
  }

  useEffect(() => {
    carregarDadosDashboard();
    if (user && user.role === 'agent') {
      carregarMetasDeVendas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function carregarDadosDashboard() {
    setLoading(true);
    setError(null);

    try {
      // Preparar datas para filtrar pedidos dos últimos 7 dias
      const hoje = new Date();
      const fimDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);
      const inicio7Dias = new Date(hoje);
      inicio7Dias.setDate(inicio7Dias.getDate() - 6); // Inclui hoje

      // Preparar datas para totalVendas (início do mês até hoje)
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

      // Chamar várias APIs simultaneamente
      // Ajuste as rotas conforme seu backend real
      const [
        statisticsRes,        // /reports/statistics
        outOfStockRes,        // /reports/produtosComEstoqueBaixo
        customersRes,         // /customers/advanced
        ordersLast7DaysRes,   // /orders?startDate=...&endDate=...
        vendasPeriodoRes,     // /finalizedTable/relatorios/periodo
      ] = await Promise.all([
        api.get('/reports/statistics'),
        api.get('/reports/produtosComEstoqueBaixo'),
        api.get('/customers/advanced', {
          params: { page: 1, limit: 1 }, // Exemplificando para obter total de clientes
        }),
        api.get('/orders', {
          params: {
            startDate: inicio7Dias.toISOString(),
            endDate: fimDia.toISOString(),
          },
        }),
        api.get('/finalizedTable/relatorios/periodo', {
          params: {
            start: inicioMes.toISOString(),
            end: fimDia.toISOString(),
          },
        }),
      ]);

      // 1) Estatísticas gerais (pedidosPorCategoria, metodosPagamento, etc.)
      const statsData = statisticsRes.data || {};
      setPedidosPorCategoria(statsData.pedidosPorCategoria || []);
      setMetodosPagamento(statsData.metodosPagamento || []);

      // 2) Produtos em falta
      // Ex.: outOfStockRes.data = { produtosEmFalta: 4 } (ver backend)
      setProdutosEmFalta(outOfStockRes?.data?.produtosEmFalta || 0);

      // 3) Clientes ativos
      // Ex.: customersRes.data = { total: 200, ... }
      setClientesAtivos(customersRes?.data?.total || 0);

      // 4) Pedidos dos últimos 7 dias
      const pedidosLast7Days = ordersLast7DaysRes?.data?.orders || [];
      // Processar para vendasUltimos7Dias
      const vendasMap = {};

      pedidosLast7Days.forEach(order => {
        const data = new Date(order.dataCriacao);
        const dia = data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
        if (vendasMap[dia]) {
          vendasMap[dia] += order.total || 0;
        } else {
          vendasMap[dia] = order.total || 0;
        }

        // Verificar se o pedido é de hoje
        const isHoje =
          data.getFullYear() === hoje.getFullYear() &&
          data.getMonth() === hoje.getMonth() &&
          data.getDate() === hoje.getDate();
        if (isHoje) {
          setPedidosHoje(prev => prev + 1);
        }
      });

      // Converter o mapa para array ordenada
      const vendasUltimos7DiasArray = [];
      for (let i = 6; i >= 0; i--) {
        const diaData = new Date(hoje);
        diaData.setDate(hoje.getDate() - i);
        const dia = diaData.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
        vendasUltimos7DiasArray.push({
          dia,
          totalVendas: vendasMap[dia] || 0,
        });
      }
      setVendasUltimos7Dias(vendasUltimos7DiasArray);

      // 5) Total de vendas no período
      // Ex.: vendasPeriodoRes.data = { totalVendas: 1234.56 }
      const total = vendasPeriodoRes?.data?.totalVendas || 0;
      setTotalVendas(total);

      setLoading(false);
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
      setError('Erro ao carregar dados do dashboard.');
      setLoading(false);
    }
  }

  async function carregarMetasDeVendas() {
    if (!user || !user.id) return;
    try {
      // Ajuste para a rota real do backend
      const resp = await api.get(`/sales-goals/employee/${user.id}`);
      setSalesGoals(resp.data || []);
    } catch (err) {
      console.error('Erro ao obter metas de vendas:', err);
    }
  }

  if (loading) {
    return (
      <div className="mt-5 text-center">
        <Spinner animation="border" variant="primary" />
        <div>Carregando dados do Dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  // Função para gerar cor aleatória (para gráficos de pizza)
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  return (
    <div className="container mt-4">
      <h2>Dashboard</h2>

      {/* KPIs Principais */}
      <Row className="mt-4 g-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total de Vendas</Card.Title>
              <Card.Text>
                R${' '}
                {totalVendas.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Pedidos Hoje</Card.Title>
              <Card.Text>{pedidosHoje}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Clientes Ativos</Card.Title>
              <Card.Text>{clientesAtivos}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Produtos em Falta</Card.Title>
              <Card.Text>{produtosEmFalta}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Gráfico de Linhas: Vendas nos Últimos 7 Dias */}
      <div className="mt-5">
        <h4>Vendas nos Últimos 7 Dias</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={vendasUltimos7Dias}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dia" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="totalVendas"
              stroke="#8884d8"
              name="Vendas (R$)"
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Exemplo de Tabela de detalhes dos últimos 7 dias */}
        <div className="mt-4">
          <h5>Detalhes das Vendas (Últimos 7 Dias)</h5>
          <div className="table-responsive">
            <table className="table table-striped table-bordered">
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
                    <td>
                      R${' '}
                      {item.totalVendas?.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }) || '0,00'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Gráfico de Barras: Pedidos por Categoria */}
      <div className="mt-5">
        <h4>Pedidos por Categoria</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={pedidosPorCategoria}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="categoria" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="quantidade" fill="#82ca9d" name="Qtd Pedidos" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Pizza: Métodos de Pagamento */}
      <div className="mt-5">
        <h4>Métodos de Pagamento</h4>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={metodosPagamento}
              dataKey="quantidade"
              nameKey="metodo"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label
            >
              {metodosPagamento.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={getRandomColor()} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Metas de Vendas (apenas se for 'agent') */}
      {user && user.role === 'agent' && salesGoals.length > 0 && (
        <div className="mt-5">
          <h4>Suas Metas de Vendas</h4>
          <ul>
            {salesGoals.map((goal) => (
              <li key={goal._id}>
                {goal.goalName} - R${' '}
                {goal.goalAmount?.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                até{' '}
                {goal.endDate
                  ? new Date(goal.endDate).toLocaleDateString('pt-BR')
                  : 'Sem prazo'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
