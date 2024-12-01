// src/pages/Dashboard/Dashboard.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, Row, Col } from 'react-bootstrap';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';
import jwtDecode from 'jwt-decode';

function Dashboard() {
  const [statistics, setStatistics] = useState({
    totalVendas: 0,
    pedidosHoje: 0,
    clientesAtivos: 0,
    produtosEmFalta: 0,
    vendasUltimos7Dias: [],
    pedidosPorCategoria: [],
    metodosPagamento: [],
  });
  const [loading, setLoading] = useState(true);
  const [salesGoals, setSalesGoals] = useState([]);
  const token = localStorage.getItem('token');
  let user = null;

  if (token) {
    try {
      user = jwtDecode(token);
    } catch (error) {
      console.error('Token inválido:', error);
    }
  }

  useEffect(() => {
    fetchStatistics();
    if (user && user.role === 'agent') {
      fetchSalesGoals();
    }
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/reports/statistics');
      setStatistics(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      setLoading(false);
    }
  };

  const fetchSalesGoals = async () => {
    try {
      const response = await api.get(`/sales-goals/employee/${user.id}`);
      setSalesGoals(response.data);
    } catch (error) {
      console.error('Erro ao obter metas de vendas:', error);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mt-4">
      <h2>Dashboard</h2>

      <Row className="mt-4">
        {/* Cards com estatísticas */}
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total de Vendas</Card.Title>
              <Card.Text>R$ {statistics.totalVendas.toFixed(2)}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Pedidos Hoje</Card.Title>
              <Card.Text>{statistics.pedidosHoje}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Clientes Ativos</Card.Title>
              <Card.Text>{statistics.clientesAtivos}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Produtos em Falta</Card.Title>
              <Card.Text>{statistics.produtosEmFalta}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Gráfico de Linhas - Vendas nos Últimos 7 Dias */}
      <div className="mt-5">
        <h4>Vendas nos Últimos 7 Dias</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={statistics.vendasUltimos7Dias}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dia" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="totalVendas" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Barras - Pedidos por Categoria */}
      <div className="mt-5">
        <h4>Pedidos por Categoria</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={statistics.pedidosPorCategoria}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="categoria" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="quantidade" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Pizza - Métodos de Pagamento */}
      <div className="mt-5">
        <h4>Métodos de Pagamento Utilizados</h4>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statistics.metodosPagamento}
              dataKey="quantidade"
              nameKey="metodo"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {statistics.metodosPagamento.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getRandomColor()} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Metas de Vendas para Agentes */}
      {user && user.role === 'agent' && salesGoals.length > 0 && (
        <div className="mt-5">
          <h4>Suas Metas de Vendas</h4>
          <ul>
            {salesGoals.map((goal) => (
              <li key={goal._id}>
                {goal.goalName} - R$ {goal.goalAmount} até{' '}
                {goal.endDate ? new Date(goal.endDate).toLocaleDateString() : 'Sem prazo'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Função utilitária para cores aleatórias nos gráficos de pizza
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export default Dashboard;
