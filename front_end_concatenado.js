// Conteúdo de: .\todo_front_end.js


// Conteúdo de: .\src\App.js
// Conteúdo de: .\src\App.js
// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import ProductList from './pages/Products/ProductList';
import ProductForm from './pages/Products/ProductForm';
import OrderForm from './pages/Orders/OrderForm';
import StockList from './pages/Stock/StockList';
import Reports from './pages/Reports/Reports';
import Unauthorized from './pages/Unauthorized';
import Navbar from './components/Navbar';
import CustomerForm from './pages/Customers/CustomerForm';
import CustomerList from './pages/Customers/CustomerList';
import EmployeeList from './pages/Employees/EmployeeList';
import EmployeeForm from './pages/Employees/EmployeeForm'; 
import IngredientList from './pages/Ingredients/IngredientList';
import IngredientForm from './pages/Ingredients/IngredientForm';
import RecipeList from './pages/Recipes/RecipeList';
import RecipeForm from './pages/Recipes/RecipeForm';
import PaymentForm from './pages/Payments/PaymentForm';
import AmbienteList from './pages/Ambientes/AmbienteList';
import AmbienteForm from './pages/Ambientes/AmbienteForm';
import TableList from './pages/Tables/TableList';
import TableForm from './pages/Tables/TableForm';
import ReservationList from './pages/Reservations/ReservationList';
import ReservationForm from './pages/Reservations/ReservationForm';
import { ToastContainer } from 'react-toastify';
import IfoodAuthPage from './pages/IfoodAuth/IfoodAuthPage'; 
import CategoryList from './pages/Products/CategoryList';
import CategoryForm from './pages/Products/CategoryForm';
import SalesGoalsList from './pages/SalesGoals/SalesGoalsList';
import SalesGoalForm from './pages/SalesGoals/SalesGoalsForm';
import TeamMembersList from './pages/Team/TeamMemberList';
import OrderManagement from './pages/Orders/OrderManagement'; // Importação corrigida
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


function App() {
  return (
    <Router>
      <Navbar className="bg-dark text-white min-vh-100" />
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rotas privadas */}
        <Route
          path="/"
          element={
            <PrivateRoute permissions={['viewDashboard']}>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/products"
          element={
            <PrivateRoute permissions={['viewProduct']}>
              <ProductList />
            </PrivateRoute>
          }
        />
        <Route
          path="/products/new"
          element={
            <PrivateRoute permissions={['createProduct']}>
              <ProductForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/orders/new"
          element={
            <PrivateRoute permissions={['createOrder']}>
              <OrderForm />
            </PrivateRoute>
          }
        />
        {/* Rota para Gerenciamento de Pedidos */}
        <Route
          path="/orders/manage"
          element={
            <PrivateRoute permissions={['createOrder']}>
              <OrderManagement />
            </PrivateRoute>
          }
        />
        <Route
          path="/stock"
          element={
            <PrivateRoute permissions={['manageStock']}>
              <StockList />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <PrivateRoute permissions={['viewReports']}>
              <Reports />
            </PrivateRoute>
          }
        />

        <Route
          path="/customers"
          element={
            <PrivateRoute permissions={['viewCustomer']}>
              <CustomerList />
            </PrivateRoute>
          }
        />
        <Route
          path="/customers/new"
          element={
            <PrivateRoute permissions={['createCustomer']}>
              <CustomerForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/customers/:id"
          element={
            <PrivateRoute permissions={['editCustomer']}>
              <CustomerForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/employees"
          element={
            <PrivateRoute permissions={['viewEmployee']}>
              <EmployeeList />
            </PrivateRoute>
          }
        />
        <Route
          path="/employees/new"
          element={
            <PrivateRoute permissions={['createEmployee']}>
              <EmployeeForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/employees/:id"
          element={
            <PrivateRoute permissions={['editEmployee']}>
              <EmployeeForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/ingredients"
          element={
            <PrivateRoute permissions={['viewIngredient']}>
              <IngredientList />
            </PrivateRoute>
          }
        />
        <Route
          path="/ingredients/new"
          element={
            <PrivateRoute permissions={['createIngredient']}>
              <IngredientForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/ingredients/:id"
          element={
            <PrivateRoute permissions={['editIngredient']}>
              <IngredientForm />
            </PrivateRoute>
          }
        />
        {/* Rotas para Metas de Vendas */}
        <Route
          path="/sales-goals"
          element={
            <PrivateRoute permissions={['manageSalesGoals']}>
              <SalesGoalsList />
            </PrivateRoute>
          }
        />
        <Route
          path="/sales-goals/new"
          element={
            <PrivateRoute permissions={['manageSalesGoals']}>
              <SalesGoalForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/sales-goals/:id"
          element={
            <PrivateRoute permissions={['manageSalesGoals']}>
              <SalesGoalForm />
            </PrivateRoute>
          }
        />

        {/* Rota para Membros da Equipe */}
        <Route
          path="/team-members"
          element={
            <PrivateRoute permissions={['viewTeamMembers']}>
              <TeamMembersList />
            </PrivateRoute>
          }
        />
        <Route
          path="/recipes"
          element={
            <PrivateRoute permissions={['viewRecipe']}>
              <RecipeList />
            </PrivateRoute>
          }
        />
        <Route
          path="/recipes/new"
          element={
            <PrivateRoute permissions={['createRecipe']}>
              <RecipeForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/recipes/:id"
          element={
            <PrivateRoute permissions={['editRecipe']}>
              <RecipeForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/payments/new"
          element={
            <PrivateRoute permissions={['processPayment']}>
              <PaymentForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/ambientes"
          element={
            <PrivateRoute permissions={['viewAmbiente']}>
              <AmbienteList />
            </PrivateRoute>
          }
        />
        <Route
          path="/ambientes/new"
          element={
            <PrivateRoute permissions={['createAmbiente']}>
              <AmbienteForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/ambientes/:id"
          element={
            <PrivateRoute permissions={['editAmbiente']}>
              <AmbienteForm />
            </PrivateRoute>
          }
        />

        {/* Rotas para Mesas */}
        <Route
          path="/tables"
          element={
            <PrivateRoute permissions={['viewTable']}>
              <TableList />
            </PrivateRoute>
          }
        />
        <Route
          path="/tables/new"
          element={
            <PrivateRoute permissions={['createTable']}>
              <TableForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/tables/:id"
          element={
            <PrivateRoute permissions={['editTable']}>
              <TableForm />
            </PrivateRoute>
          }
        />

        {/* Rotas para Reservas */}
        <Route
          path="/reservations"
          element={
            <PrivateRoute permissions={['viewReservation']}>
              <ReservationList />
            </PrivateRoute>
          }
        />
        <Route
          path="/reservations/new"
          element={
            <PrivateRoute permissions={['createReservation']}>
              <ReservationForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/reservations/:id"
          element={
            <PrivateRoute permissions={['editReservation']}>
              <ReservationForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/reservations/edit/:id"
          element={
            <PrivateRoute permissions={['editReservation']}>
              <ReservationForm />
            </PrivateRoute>
          }
        />
        {/* Rotas para Integração com o iFood */}
        <Route
          path="/ifood-auth"
          element={
            <PrivateRoute permissions={['manageIfoodAuth']}>
              <IfoodAuthPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <PrivateRoute permissions={['viewCategory']}>
              <CategoryList />
            </PrivateRoute>
          }
        />
        <Route
          path="/categories/new"
          element={
            <PrivateRoute permissions={['createCategory']}>
              <CategoryForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/categories/:id"
          element={
            <PrivateRoute permissions={['editCategory']}>
              <CategoryForm />
            </PrivateRoute>
          }
        />

        {/* Rota para acesso não autorizado */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Rota para páginas não encontradas */}
        <Route path="*" element={<h1>Página não encontrada</h1>} />
      </Routes>
      <ToastContainer /> {/* Adicione esta linha */}

    </Router>
  );
}

export default App;


// Conteúdo de: .\src\App.test.js
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});


// Conteúdo de: .\src\Dashboard.js
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


// Conteúdo de: .\src\index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();


// Conteúdo de: .\src\reportWebVitals.js
const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;


// Conteúdo de: .\src\setupTests.js
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';


// Conteúdo de: .\src\components\IfoodAuthStart.js
// src/components/IfoodAuthStart.js
import React, { useState } from 'react';
import axios from 'axios';

const IfoodAuthStart = () => {
  const [verificationUrl, setVerificationUrl] = useState('');
  const [userCode, setUserCode] = useState('');
  const [authorizationCode, setAuthorizationCode] = useState('');

  const startAuth = async () => {
    try {
      const response = await axios.post('/api/ifood/auth/start');
      setVerificationUrl(response.data.verificationUrlComplete);
      setUserCode(response.data.userCode);
    } catch (error) {
      console.error('Erro ao iniciar a autenticação:', error);
    }
  };

  const completeAuth = async () => {
    try {
      await axios.post('/api/ifood/auth/complete', { authorizationCode });
      alert('Autenticação concluída com sucesso!');
    } catch (error) {
      console.error('Erro ao concluir a autenticação:', error);
    }
  };

  return (
    <div>
      <h2>Integração com o iFood</h2>
      {!verificationUrl && (
        <button onClick={startAuth}>Iniciar Autenticação com o iFood</button>
      )}
      {verificationUrl && (
        <div>
          <p>
            Por favor, acesse o seguinte link para autorizar o aplicativo:{' '}
            <a href={verificationUrl} target="_blank" rel="noopener noreferrer">
              {verificationUrl}
            </a>
          </p>
          <p>
            Use o código de usuário: <strong>{userCode}</strong>
          </p>
          <p>Após autorizar, insira o código de autorização abaixo:</p>
          <input
            type="text"
            placeholder="Código de Autorização"
            value={authorizationCode}
            onChange={(e) => setAuthorizationCode(e.target.value)}
          />
          <button onClick={completeAuth}>Concluir Autenticação</button>
        </div>
      )}
    </div>
  );
};

export default IfoodAuthStart;


// Conteúdo de: .\src\components\Navbar.js
// src/components/Navbar.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Correção da importação
import { toast } from "react-toastify";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  let user = null;

  if (token) {
    try {
      user = jwtDecode(token);
    } catch (error) {
      console.error("Token inválido:", error);
      toast.error("Sessão inválida. Por favor, faça login novamente.");
      navigate("/login");
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logout realizado com sucesso!");
    navigate("/login");
  };

  return (
    <>
      {/* Botão para abrir o menu lateral */}
      <button className="btn btn-primary m-3" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar">
        ☰ Menu
      </button>

      {/* Offcanvas Navbar */}
      <div className="offcanvas offcanvas-start" tabIndex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasNavbarLabel">
            Menu de Navegação
          </h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Fechar"></button>
        </div>
        <div className="offcanvas-body">
          {user ? (
            <ul className="navbar-nav">
              {user.permissions.includes("viewDashboard") && (
                <li className="nav-item">
                  <Link className="nav-link" to="/">
                    Dashboard
                  </Link>
                </li>
              )}

              {(user.permissions.includes("viewProduct") || user.permissions.includes("viewCategory")) && (
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" id="productDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Produtos
                  </a>
                  <ul className="dropdown-menu" aria-labelledby="productDropdown">
                    {user.permissions.includes("viewProduct") && (
                      <li>
                        <Link className="dropdown-item" to="/products">
                          Lista de Produtos
                        </Link>
                      </li>
                    )}
                    {user.permissions.includes("createProduct") && (
                      <li>
                        <Link className="dropdown-item" to="/products/new">
                          Novo Produto
                        </Link>
                      </li>
                    )}
                    {user.permissions.includes("viewCategory") && (
                      <li>
                        <Link className="dropdown-item" to="/categories">
                          Categorias
                        </Link>
                      </li>
                    )}
                  </ul>
                </li>
              )}

              {user.permissions.includes("viewReservation") && (
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" id="reservationDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Reservas
                  </a>
                  <ul className="dropdown-menu" aria-labelledby="reservationDropdown">
                    <li>
                      <Link className="dropdown-item" to="/reservations">
                        Lista de Reservas
                      </Link>
                    </li>
                    {user.permissions.includes("createReservation") && (
                      <li>
                        <Link className="dropdown-item" to="/reservations/new">
                          Nova Reserva
                        </Link>
                      </li>
                    )}
                  </ul>
                </li>
              )}

              {user.permissions.includes("viewCustomer") && (
                <li className="nav-item">
                  <Link className="nav-link" to="/customers">
                    Clientes
                  </Link>
                </li>
              )}

              {user.permissions.includes("viewEmployee") && (
                <li className="nav-item">
                  <Link className="nav-link" to="/employees">
                    Funcionários
                  </Link>
                </li>
              )}

              {user.permissions.includes("viewIngredient") && (
                <li className="nav-item">
                  <Link className="nav-link" to="/ingredients">
                    Ingredientes
                  </Link>
                </li>
              )}

              {user.permissions.includes("viewRecipe") && (
                <li className="nav-item">
                  <Link className="nav-link" to="/recipes">
                    Receitas
                  </Link>
                </li>
              )}

              {user.permissions.includes("createOrder") && (
                <li className="nav-item">
                  <Link className="nav-link" to="/orders/new">
                    Novo Pedido
                  </Link>
                </li>
              )}

              {user.permissions.includes("createOrder") && ( // Novo link para Gerenciador de Pedidos
                <li className="nav-item">
                  <Link className="nav-link" to="/orders/manage">
                    Gerenciar Pedidos
                  </Link>
                </li>
              )}

              {user.permissions.includes("manageStock") && (
                <li className="nav-item">
                  <Link className="nav-link" to="/stock">
                    Estoque
                  </Link>
                </li>
              )}

              {user.permissions.includes("viewReports") && (
                <li className="nav-item">
                  <Link className="nav-link" to="/reports">
                    Relatórios
                  </Link>
                </li>
              )}

              {user.permissions.includes("viewAmbiente") && (
                <li className="nav-item">
                  <Link className="nav-link" to="/ambientes">
                    Ambientes
                  </Link>
                </li>
              )}

              {user.permissions.includes("viewTable") && (
                <li className="nav-item">
                  <Link className="nav-link" to="/tables">
                    Mesas
                  </Link>
                </li>
              )}

              {user.permissions.includes("manageSalesGoals") && (
                <li className="nav-item">
                  <Link className="nav-link" to="/sales-goals">
                    Metas de Vendas
                  </Link>
                </li>
              )}

              {user.permissions.includes("viewTeamMembers") && (
                <li className="nav-item">
                  <Link className="nav-link" to="/team-members">
                    Membros da Equipe
                  </Link>
                </li>
              )}

              {user.permissions.includes("manageIfoodAuth") && (
                <li className="nav-item">
                  <Link className="nav-link" to="/ifood-auth">
                    Integração iFood
                  </Link>
                </li>
              )}

              {user.permissions.includes("addUser") && (
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    Registrar Funcionário
                  </Link>
                </li>
              )}

              {/* Botão de Logout */}
              <li className="nav-item">
                <button className="btn btn-link nav-link" onClick={handleLogout}>
                  Sair
                </button>
              </li>
            </ul>
          ) : (
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link className="nav-link" to="/login">
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/register">
                  Registro
                </Link>
              </li>
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

export default Navbar;


// Conteúdo de: .\src\components\PrivateRoute.js
// src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Importação nomeada

function PrivateRoute({ permissions, children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const user = jwtDecode(token);
    const userPermissions = user.permissions || [];

    const hasPermission = permissions.every((perm) =>
      userPermissions.includes(perm)
    );

    if (!hasPermission) {
      return <Navigate to="/unauthorized" />;
    }

    return children;
  } catch (error) {
    console.error('Token inválido:', error);
    return <Navigate to="/login" />;
  }
}

export default PrivateRoute;


// Conteúdo de: .\src\pages\Unauthorized.js
// src/pages/Unauthorized.js
import React from 'react';

function Unauthorized() {
  return (
    <div>
      <h2>Acesso Proibido</h2>
      <p>Você não tem permissão para acessar esta página.</p>
    </div>
  );
}

export default Unauthorized;


// Conteúdo de: .\src\pages\Ambientes\AmbienteForm.js
// src/pages/Ambientes/AmbienteForm.js

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';

function AmbienteForm() {
  const [ambiente, setAmbiente] = useState({
    nome: '',
    limitePessoas: 0,
  });
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      api
        .get(`/ambientes/${id}`)
        .then((response) => setAmbiente(response.data))
        .catch((error) => console.error('Erro ao obter ambiente:', error));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAmbiente({
      ...ambiente,
      [name]: name === 'limitePessoas' ? Number(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await api.put(`/ambientes/${id}`, ambiente);
        alert('Ambiente atualizado com sucesso!');
      } else {
        await api.post('/ambientes', ambiente);
        alert('Ambiente criado com sucesso!');
      }
      navigate('/ambientes');
    } catch (error) {
      console.error('Erro ao salvar ambiente:', error);
      if (error.response && error.response.data && error.response.data.message) {
        alert('Erro ao salvar ambiente: ' + error.response.data.message);
      } else {
        alert('Erro ao salvar ambiente');
      }
    }
  };

  return (
    <div>
      <h2>{id ? 'Editar Ambiente' : 'Novo Ambiente'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome:</label>
          <input
            type="text"
            name="nome"
            value={ambiente.nome}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Limite de Pessoas:</label>
          <input
            type="number"
            name="limitePessoas"
            value={ambiente.limitePessoas}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">{id ? 'Atualizar' : 'Criar'}</button>
      </form>
    </div>
  );
}

export default AmbienteForm;


// Conteúdo de: .\src\pages\Ambientes\AmbienteList.js
// src/pages/Ambientes/AmbienteList.js

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';

function AmbienteList() {
  const [ambientes, setAmbientes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/ambientes')
      .then((response) => {
        setAmbientes(response.data);
        console.log('Ambientes carregados:', response.data);
      })
      .catch((error) => {
        console.error('Erro ao obter ambientes:', error);
        alert('Erro ao obter ambientes: ' + (error.response?.data?.message || error.message));
      });
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este ambiente?')) {
      try {
        await api.delete(`/ambientes/${id}`);
        setAmbientes(ambientes.filter((ambiente) => ambiente._id !== id));
      } catch (error) {
        console.error('Erro ao excluir ambiente:', error);
        alert('Erro ao excluir ambiente: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  return (
    <div>
      <h2>Ambientes</h2>
      <Link to="/ambientes/new">Novo Ambiente</Link>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Limite de Pessoas</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {ambientes.map((ambiente) => (
            <tr key={ambiente._id}>
              <td>{ambiente.nome}</td>
              <td>{ambiente.limitePessoas}</td>
              <td>
                <button onClick={() => navigate(`/ambientes/${ambiente._id}`)}>
                  Editar
                </button>
                <button onClick={() => handleDelete(ambiente._id)}>
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AmbienteList;


// Conteúdo de: .\src\pages\Auth\Login.js
// src/pages/Auth/Login.js
import React from 'react';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  InputGroup,
} from 'react-bootstrap';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import api from '../../services/api';

function Login() {
  const navigate = useNavigate();

  return (
    <Container fluid className="min-vh-100 bg-dark d-flex align-items-center justify-content-center">
      <Row className="w-100">
        <Col xs={12} sm={8} md={6} lg={4} className="mx-auto">
          <Card className="bg-secondary text-white shadow-lg">
            <Card.Body>
              <h3 className="text-center mb-4">Entrar</h3>
              <Formik
                initialValues={{ email: '', senha: '', rememberMe: false }}
                validationSchema={Yup.object({
                  email: Yup.string()
                    .email('Email inválido')
                    .required('Obrigatório'),
                  senha: Yup.string().required('Obrigatório'),
                })}
                onSubmit={async (values, { setSubmitting }) => {
                  try {
                    const response = await api.post('/auth/login', {
                      email: values.email,
                      senha: values.senha,
                    });
                    const { token, user } = response.data;
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(user));

                    if (values.rememberMe) {
                      localStorage.setItem('rememberMe', 'true');
                    } else {
                      sessionStorage.setItem('token', token);
                      sessionStorage.setItem('user', JSON.stringify(user));
                      sessionStorage.setItem('rememberMe', 'false');
                    }

                    toast.success('Login realizado com sucesso!');
                    navigate('/');
                  } catch (error) {
                    const errorMessage =
                      error.response?.data?.message || error.message;
                    toast.error('Erro ao fazer login: ' + errorMessage);
                  }
                  setSubmitting(false);
                }}
              >
                {({ isSubmitting, handleChange, handleBlur, values }) => (
                  <FormikForm>
                    {/* Campo de E-mail */}
                    <Form.Group controlId="formEmail" className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FaEnvelope />
                        </InputGroup.Text>
                        <Field
                          name="email"
                          type="email"
                          placeholder="Digite seu email"
                          className="form-control bg-dark text-white"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.email}
                        />
                      </InputGroup>
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="text-danger mt-1"
                      />
                    </Form.Group>

                    {/* Campo de Senha */}
                    <Form.Group controlId="formSenha" className="mb-3">
                      <Form.Label>Senha</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FaLock />
                        </InputGroup.Text>
                        <Field
                          name="senha"
                          type="password"
                          placeholder="Digite sua senha"
                          className="form-control bg-dark text-white"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.senha}
                        />
                      </InputGroup>
                      <ErrorMessage
                        name="senha"
                        component="div"
                        className="text-danger mt-1"
                      />
                    </Form.Group>

                    {/* Lembrar-me */}
                    <Form.Group controlId="formRememberMe" className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Lembrar-me"
                        name="rememberMe"
                        onChange={handleChange}
                        checked={values.rememberMe}
                        className="text-white"
                      />
                    </Form.Group>

                    {/* Botão de Submit */}
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-100"
                    >
                      {isSubmitting ? 'Entrando...' : 'Entrar'}
                    </Button>
                  </FormikForm>
                )}
              </Formik>
            </Card.Body>
            <Card.Footer className="bg-secondary text-center">
              <small>
                Não tem uma conta?{' '}
                <a href="/register" className="text-primary">
                  Registre-se
                </a>
              </small>
              <br />
              <small>
                <a href="/forgot-password" className="text-primary">
                  Esqueceu a senha?
                </a>
              </small>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;


// Conteúdo de: .\src\pages\Auth\Logout.js
// src/pages/Auth/Logout.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Remove o token de autenticação
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    toast.success('Você saiu com sucesso.');
    navigate('/login');
  }, [navigate]);

  return null;
}

export default Logout;


// Conteúdo de: .\src\pages\Auth\Register.js
// src/pages/Auth/Register.js
import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import '../../styles/Auth.css'; // Certifique-se de que o estilo está sendo importado

function Register() {
  const navigate = useNavigate();
  const [managers, setManagers] = useState([]);

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      const response = await api.get('/users/team-members');
      // Filtrar apenas gerentes
      setManagers(response.data.filter((user) => user.role === 'manager'));
    } catch (error) {
      console.error('Erro ao obter gerentes:', error);
    }
  };

  // Mapeamento de permissões para rótulos amigáveis
  const permissionLabels = {
    viewDashboard: 'Ver Dashboard',
    viewProduct: 'Ver Produto',
    createProduct: 'Criar Produto',
    editProduct: 'Editar Produto',
    deleteProduct: 'Excluir Produto',
    viewCustomer: 'Ver Cliente',
    createCustomer: 'Criar Cliente',
    editCustomer: 'Editar Cliente',
    deleteCustomer: 'Excluir Cliente',
    viewEmployee: 'Ver Funcionário',
    createEmployee: 'Criar Funcionário',
    editEmployee: 'Editar Funcionário',
    deleteEmployee: 'Excluir Funcionário',
    viewIngredient: 'Ver Ingrediente',
    createIngredient: 'Criar Ingrediente',
    editIngredient: 'Editar Ingrediente',
    deleteIngredient: 'Excluir Ingrediente',
    viewRecipe: 'Ver Receita',
    createRecipe: 'Criar Receita',
    editRecipe: 'Editar Receita',
    deleteRecipe: 'Excluir Receita',
    createOrder: 'Criar Pedido',
    manageStock: 'Gerenciar Estoque',
    viewReports: 'Ver Relatórios',
    processPayment: 'Processar Pagamento',
    viewAmbiente: 'Ver Ambiente',
    createAmbiente: 'Criar Ambiente',
    editAmbiente: 'Editar Ambiente',
    deleteAmbiente: 'Excluir Ambiente',
    viewTable: 'Ver Mesa',
    createTable: 'Criar Mesa',
    editTable: 'Editar Mesa',
    deleteTable: 'Excluir Mesa',
    viewReservation: 'Ver Reserva',
    createReservation: 'Criar Reserva',
    editReservation: 'Editar Reserva',
    deleteReservation: 'Excluir Reserva',
    manageIfoodAuth: 'Gerenciar Autenticação iFood',
    createCategory: 'Criar Categoria',
    viewCategory: 'Ver Categoria',
    editCategory: 'Editar Categoria',
    deleteCategory: 'Excluir Categoria',
    addUser: 'Adicionar Usuário',
    manageSalesGoals: 'Gerenciar Metas de Vendas', // Nova permissão
    viewTeamMembers: 'Visualizar Membros da Equipe', // Nova permissão
  };

  // Lista de permissões (removi duplicatas)
  const permissionsList = [
    'viewDashboard',
    'viewProduct',
    'createProduct',
    'editProduct',
    'deleteProduct',
    'viewCustomer',
    'createCustomer',
    'editCustomer',
    'deleteCustomer',
    'viewEmployee',
    'createEmployee',
    'editEmployee',
    'deleteEmployee',
    'viewIngredient',
    'createIngredient',
    'editIngredient',
    'deleteIngredient',
    'viewRecipe',
    'createRecipe',
    'editRecipe',
    'deleteRecipe',
    'createOrder',
    'manageStock',
    'viewReports',
    'processPayment',
    'viewAmbiente',
    'createAmbiente',
    'editAmbiente',
    'deleteAmbiente',
    'viewTable',
    'createTable',
    'editTable',
    'deleteTable',
    'viewReservation',
    'createReservation',
    'editReservation',
    'deleteReservation',
    'manageIfoodAuth',
    'createCategory',
    'viewCategory',
    'editCategory',
    'deleteCategory',
    'addUser',
    'manageSalesGoals', // Nova permissão
    'viewTeamMembers',  // Nova permissão
  ];

  return (
    <div className="auth-container">
      <h2>Registro</h2>
      <Formik
        initialValues={{
          nome: '',
          email: '',
          senha: '',
          role: 'agent',
          permissions: [],
          managerId: '',
        }}
        validationSchema={Yup.object({
          nome: Yup.string().required('Obrigatório'),
          email: Yup.string().email('Email inválido').required('Obrigatório'),
          senha: Yup.string().required('Obrigatório'),
          // Não é necessário validar permissions aqui
        })}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            await api.post('/auth/register', values);
            alert('Usuário registrado com sucesso!');
            navigate('/login');
          } catch (error) {
            alert('Erro ao registrar usuário: ' + error.response.data.message);
          }
          setSubmitting(false);
        }}
      >
        {({ values, isSubmitting }) => (
          <Form className="auth-form">
            <div className="form-columns">
              <div className="left-column">
                <div className="form-group">
                  <label>Nome</label>
                  <Field name="nome" type="text" className="form-control" />
                  <ErrorMessage name="nome" component="div" className="error" />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <Field name="email" type="email" className="form-control" />
                  <ErrorMessage name="email" component="div" className="error" />
                </div>

                <div className="form-group">
                  <label>Senha</label>
                  <Field name="senha" type="password" className="form-control" />
                  <ErrorMessage name="senha" component="div" className="error" />
                </div>

                <div className="form-group">
                  <label>Role</label>
                  <Field name="role" as="select" className="form-control">
                    <option value="agent">Agent</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </Field>
                </div>

                {/* Campo para selecionar o Gerente se o usuário for um Agente */}
                {values.role === 'agent' && (
                  <div className="form-group">
                    <label>Gerente</label>
                    <Field name="managerId" as="select" className="form-control" required>
                      <option value="">Selecione um gerente</option>
                      {managers.map((manager) => (
                        <option key={manager._id} value={manager._id}>
                          {manager.nome}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="managerId" component="div" className="error" />
                  </div>
                )}
              </div>

              <div className="right-column">
                <div className="form-group">
                  <label>Permissões</label>
                  <div className="permissions-list">
                    {permissionsList.map((permission) => (
                      <div key={permission} className="permission-item">
                        <Field
                          type="checkbox"
                          name="permissions"
                          value={permission}
                          id={permission}
                        />
                        <label htmlFor={permission}>{permissionLabels[permission] || permission}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-submit">
              Registrar
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default Register;


// Conteúdo de: .\src\pages\Customers\CustomerForm.js
// src/pages/Customers/CustomerForm.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';

function CustomerForm() {
  const [customer, setCustomer] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
  });
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      api.get(`/customers/${id}`)
        .then((response) => setCustomer(response.data))
        .catch((error) => console.error('Erro ao obter cliente:', error));
    }
  }, [id]);

  const handleChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await api.put(`/customers/${id}`, customer);
        alert('Cliente atualizado com sucesso!');
      } else {
        await api.post('/customers', customer);
        alert('Cliente criado com sucesso!');
      }
      navigate('/customers');
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      alert('Erro ao salvar cliente');
    }
  };

  return (
    <div>
      <h2>{id ? 'Editar Cliente' : 'Novo Cliente'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome:</label>
          <input type="text" name="nome" value={customer.nome} onChange={handleChange} required />
        </div>
        <div>
          <label>CPF:</label>
          <input type="text" name="cpf" value={customer.cpf} onChange={handleChange} />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" name="email" value={customer.email} onChange={handleChange} />
        </div>
        <div>
          <label>Telefone:</label>
          <input type="text" name="telefone" value={customer.telefone} onChange={handleChange} />
        </div>
        <button type="submit">{id ? 'Atualizar' : 'Criar'}</button>
      </form>
    </div>
  );
}

export default CustomerForm;


// Conteúdo de: .\src\pages\Customers\CustomerList.js
// src/pages/Customers/CustomerList.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';

function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/customers')
      .then((response) => setCustomers(response.data))
      .catch((error) => console.error('Erro ao obter clientes:', error));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await api.delete(`/customers/${id}`);
        setCustomers(customers.filter((customer) => customer._id !== id));
      } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        alert('Erro ao excluir cliente');
      }
    }
  };

  return (
    <div>
      <h2>Clientes</h2>
      <Link to="/customers/new">Novo Cliente</Link>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>CPF</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer._id}>
              <td>{customer.nome}</td>
              <td>{customer.cpf}</td>
              <td>{customer.email}</td>
              <td>{customer.telefone}</td>
              <td>
                <button onClick={() => navigate(`/customers/${customer._id}`)}>Editar</button>
                <button onClick={() => handleDelete(customer._id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CustomerList;


// Conteúdo de: .\src\pages\Dashboard\Dashboard.js
// Conteúdo de: .\src\pages\Dashboard\Dashboard.js
// src/pages/Dashboard/Dashboard.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, Row, Col } from 'react-bootstrap';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';
import {jwtDecode} from 'jwt-decode';

function Dashboard() {
  const [statistics, setStatistics] = useState({
    totalVendas: 0,
    pedidosHoje: 0,
    clientesAtivos: 0,
    produtosEmFalta: 0,
    vendasUltimos7Dias: [],
    pedidosPorCategoria: [],
    metodosPagamento: [],
    vendasPorFuncionario: [], // Novo dado
    vendasPorMes: [], // Novo dado
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
        {/* Cards existentes */}
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

      {/* Novos Cards */}
      <Row className="mt-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Novos Clientes</Card.Title>
              <Card.Text>{statistics.novosClientes}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Pedidos Pendentes</Card.Title>
              <Card.Text>{statistics.pedidosPendentes}</Card.Text>
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

      {/* Gráfico de Barras - Vendas por Funcionário */}
      <div className="mt-5">
        <h4>Vendas por Funcionário</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={statistics.vendasPorFuncionario}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="funcionario" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="totalVendas" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Barras - Vendas por Mês */}
      <div className="mt-5">
        <h4>Vendas por Mês</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={statistics.vendasPorMes}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="totalVendas" fill="#82ca9d" />
          </BarChart>
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


// Conteúdo de: .\src\pages\Employees\EmployeeForm.js
// src/pages/Employees/EmployeeForm.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';

function EmployeeForm() {
  const [employee, setEmployee] = useState({
    nome: '',
    funcao: 'Garçom',
    email: '',
    senha: '',
  });
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      api.get(`/employees/${id}`)
        .then((response) => setEmployee(response.data))
        .catch((error) => console.error('Erro ao obter funcionário:', error));
    }
  }, [id]);

  const handleChange = (e) => {
    setEmployee({ ...employee, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await api.put(`/employees/${id}`, employee);
        alert('Funcionário atualizado com sucesso!');
      } else {
        await api.post('/employees', employee);
        alert('Funcionário criado com sucesso!');
      }
      navigate('/employees');
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error);
      alert('Erro ao salvar funcionário');
    }
  };

  return (
    <div>
      <h2>{id ? 'Editar Funcionário' : 'Novo Funcionário'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome:</label>
          <input type="text" name="nome" value={employee.nome} onChange={handleChange} required />
        </div>
        <div>
          <label>Função:</label>
          <select name="funcao" value={employee.funcao} onChange={handleChange}>
            <option value="Garçom">Garçom</option>
            <option value="Cozinheiro">Cozinheiro</option>
            <option value="Gerente">Gerente</option>
          </select>
        </div>
        <div>
          <label>Email:</label>
          <input type="email" name="email" value={employee.email} onChange={handleChange} required />
        </div>
        <div>
          <label>Senha:</label>
          <input type="password" name="senha" value={employee.senha} onChange={handleChange} required={!id} />
        </div>
        <button type="submit">{id ? 'Atualizar' : 'Criar'}</button>
      </form>
    </div>
  );
}

export default EmployeeForm;


// Conteúdo de: .\src\pages\Employees\EmployeeList.js
// src/pages/Employees/EmployeeList.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';

function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/employees')
      .then((response) => setEmployees(response.data))
      .catch((error) => console.error('Erro ao obter funcionários:', error));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este funcionário?')) {
      try {
        await api.delete(`/employees/${id}`);
        setEmployees(employees.filter((employee) => employee._id !== id));
      } catch (error) {
        console.error('Erro ao excluir funcionário:', error);
        alert('Erro ao excluir funcionário');
      }
    }
  };

  return (
    <div>
      <h2>Funcionários</h2>
      <Link to="/employees/new">Novo Funcionário</Link>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Função</th>
            <th>Email</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee._id}>
              <td>{employee.nome}</td>
              <td>{employee.funcao}</td>
              <td>{employee.email}</td>
              <td>
                <button onClick={() => navigate(`/employees/${employee._id}`)}>Editar</button>
                <button onClick={() => handleDelete(employee._id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeList;


// Conteúdo de: .\src\pages\IfoodAuth\IfoodAuthPage.js
// src/pages/IfoodAuth/IfoodAuthPage.js

import React, { useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

function IfoodAuthPage() {
  const [authData, setAuthData] = useState({
    userCode: '',
    verificationUrlComplete: '',
    authorizationCode: '',
  });
  const [isAuthStarted, setIsAuthStarted] = useState(false);
  const [isAuthCompleted, setIsAuthCompleted] = useState(false);

  const startAuth = async () => {
    try {
      const response = await api.post('/ifood/auth/start');
      setAuthData({
        userCode: response.data.userCode,
        verificationUrlComplete: response.data.verificationUrlComplete,
        authorizationCode: '',
      });
      setIsAuthStarted(true);
      toast.success('Processo de autenticação iniciado. Siga as instruções.');
    } catch (error) {
      console.error('Erro ao iniciar a autenticação com o iFood:', error);
      toast.error('Erro ao iniciar a autenticação com o iFood.');
    }
  };

  const completeAuth = async (e) => {
    e.preventDefault();
    try {
      await api.post('/ifood/auth/complete', {
        authorizationCode: authData.authorizationCode,
      });
      setIsAuthCompleted(true);
      toast.success('Autenticação com o iFood concluída com sucesso!');
    } catch (error) {
      console.error('Erro ao concluir a autenticação com o iFood:', error);
      toast.error('Erro ao concluir a autenticação com o iFood.');
    }
  };

  return (
    <div>
      <h2>Integração com o iFood</h2>
      {!isAuthStarted && !isAuthCompleted && (
        <button onClick={startAuth}>Iniciar Autenticação com o iFood</button>
      )}

      {isAuthStarted && !isAuthCompleted && (
        <div>
          <p>
            Por favor, acesse o seguinte link para autorizar o aplicativo:
            <br />
            <a href={authData.verificationUrlComplete} target="_blank" rel="noopener noreferrer">
              {authData.verificationUrlComplete}
            </a>
          </p>
          <p>
            Use o código de usuário: <strong>{authData.userCode}</strong>
          </p>
          <form onSubmit={completeAuth}>
            <label>Código de Autorização:</label>
            <input
              type="text"
              name="authorizationCode"
              value={authData.authorizationCode}
              onChange={(e) => setAuthData({ ...authData, authorizationCode: e.target.value })}
              required
            />
            <button type="submit">Concluir Autenticação</button>
          </form>
        </div>
      )}

      {isAuthCompleted && (
        <div>
          <p>Autenticação com o iFood foi concluída com sucesso!</p>
        </div>
      )}
    </div>
  );
}

export default IfoodAuthPage;


// Conteúdo de: .\src\pages\IfoodAuthPage\IfoodAuthPage.js
// src/pages/IfoodAuth/IfoodAuthPage.js
import React, { useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

function IfoodAuthPage() {
  const [authData, setAuthData] = useState({
    userCode: '',
    verificationUrlComplete: '',
    authorizationCode: '',
  });
  const [isAuthStarted, setIsAuthStarted] = useState(false);
  const [isAuthCompleted, setIsAuthCompleted] = useState(false);

  const startAuth = async () => {
    try {
      const response = await api.post('/ifood/auth/start');
      setAuthData({
        userCode: response.data.userCode,
        verificationUrlComplete: response.data.verificationUrlComplete,
        authorizationCode: '',
      });
      setIsAuthStarted(true);
      toast.success('Processo de autenticação iniciado. Siga as instruções.');
    } catch (error) {
      console.error('Erro ao iniciar a autenticação com o iFood:', error);
      toast.error('Erro ao iniciar a autenticação com o iFood.');
    }
  };

  const completeAuth = async (e) => {
    e.preventDefault();
    if (!authData.authorizationCode) {
      toast.error('Por favor, insira o código de autorização.');
      return;
    }
    try {
      await api.post('/ifood/auth/complete', {
        authorizationCode: authData.authorizationCode,
      });
      setIsAuthCompleted(true);
      toast.success('Autenticação com o iFood concluída com sucesso!');
    } catch (error) {
      console.error('Erro ao concluir a autenticação com o iFood:', error);
      toast.error('Erro ao concluir a autenticação com o iFood.');
    }
  };

  return (
    <div>
      <h2>Integração com o iFood</h2>
      {!isAuthStarted && !isAuthCompleted && (
        <button onClick={startAuth}>Iniciar Autenticação com o iFood</button>
      )}

      {isAuthStarted && !isAuthCompleted && (
        <div>
          <p>
            Por favor, acesse o seguinte link para autorizar o aplicativo:
            <br />
            <a href={authData.verificationUrlComplete} target="_blank" rel="noopener noreferrer">
              {authData.verificationUrlComplete}
            </a>
          </p>
          <p>
            Use o código de usuário: <strong>{authData.userCode}</strong>
          </p>
          <form onSubmit={completeAuth}>
            <label>Código de Autorização:</label>
            <input
              type="text"
              name="authorizationCode"
              value={authData.authorizationCode}
              onChange={(e) => setAuthData({ ...authData, authorizationCode: e.target.value })}
              required
            />
            <button type="submit">Concluir Autenticação</button>
          </form>
        </div>
      )}

      {isAuthCompleted && (
        <div>
          <p>Autenticação com o iFood foi concluída com sucesso!</p>
        </div>
      )}
    </div>
  );
}

export default IfoodAuthPage;


// Conteúdo de: .\src\pages\Ingredients\IngredientForm.js
// src/pages/Ingredients/IngredientForm.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';

function IngredientForm() {
  const [ingredient, setIngredient] = useState({
    nome: '',
    unidadeMedida: '',
    quantidadeEstoque: 0,
    precoCusto: 0,
  });
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      api.get(`/ingredients/${id}`)
        .then((response) => setIngredient(response.data))
        .catch((error) => console.error('Erro ao obter ingrediente:', error));
    }
  }, [id]);

  const handleChange = (e) => {
    setIngredient({ ...ingredient, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await api.put(`/ingredients/${id}`, ingredient);
        alert('Ingrediente atualizado com sucesso!');
      } else {
        await api.post('/ingredients', ingredient);
        alert('Ingrediente criado com sucesso!');
      }
      navigate('/ingredients');
    } catch (error) {
      console.error('Erro ao salvar ingrediente:', error);
      alert('Erro ao salvar ingrediente');
    }
  };

  return (
    <div>
      <h2>{id ? 'Editar Ingrediente' : 'Novo Ingrediente'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome:</label>
          <input type="text" name="nome" value={ingredient.nome} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="unidadeMedida">Unidade de Medida:</label>
          <select type="text" name="unidadeMedida" value={ingredient.unidadeMedida} onChange={handleChange} required >
            <option value="kg">Kg</option>
            <option value="g">Grama</option>
            <option value="unidade">Unidade</option>
            <option value="litro">Litro</option>
            <option value="ml">Mililitro</option>
          </select>
        </div>
        <div>
          <label>Quantidade em Estoque:</label>
          <input type="number" name="quantidadeEstoque" value={ingredient.quantidadeEstoque} onChange={handleChange} required />
        </div>
        <div>
          <label>Preço de Custo:</label>
          <input type="number" name="precoCusto" value={ingredient.precoCusto} onChange={handleChange} required />
        </div>
        <button type="submit">{id ? 'Atualizar' : 'Criar'}</button>
      </form>
    </div>
  );
}

export default IngredientForm;


// Conteúdo de: .\src\pages\Ingredients\IngredientList.js
// src/pages/Ingredients/IngredientList.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';

function IngredientList() {
  const [ingredients, setIngredients] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/ingredients')
      .then((response) => setIngredients(response.data))
      .catch((error) => console.error('Erro ao obter ingredientes:', error));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este ingrediente?')) {
      try {
        await api.delete(`/ingredients/${id}`);
        setIngredients(ingredients.filter((ingredient) => ingredient._id !== id));
      } catch (error) {
        console.error('Erro ao excluir ingrediente:', error);
        alert('Erro ao excluir ingrediente');
      }
    }
  };

  return (
    <div>
      <h2>Ingredientes</h2>
      <Link to="/ingredients/new">Novo Ingrediente</Link>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Unidade de Medida</th>
            <th>Quantidade em Estoque</th>
            <th>Preço de Custo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((ingredient) => (
            <tr key={ingredient._id}>
              <td>{ingredient.nome}</td>
              <td>{ingredient.unidadeMedida}</td>
              <td>{ingredient.quantidadeEstoque}</td>
              <td>{ingredient.precoCusto}</td>
              <td>
                <button onClick={() => navigate(`/ingredients/${ingredient._id}`)}>Editar</button>
                <button onClick={() => handleDelete(ingredient._id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default IngredientList;


// Conteúdo de: .\src\pages\Orders\OrderForm.js
// src/pages/Orders/OrderForm.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Card,
  Alert,
  Spinner,
} from 'react-bootstrap';

function OrderForm() {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // For loading state
  const [error, setError] = useState(null); // For error handling

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tablesResponse, productsResponse] = await Promise.all([
          api.get('/tables'),
          api.get('/products'),
        ]);
        setTables(tablesResponse.data);
        setProducts(productsResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao obter dados:', error);
        setError('Erro ao obter dados. Por favor, tente novamente.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const initialValues = {
    mesaId: '',
    assentos: [],
    itens: [],
  };

  const validationSchema = Yup.object({
    mesaId: Yup.string().required('Selecione uma mesa'),
    assentos: Yup.array().min(1, 'Selecione pelo menos um assento'),
    itens: Yup.array().min(1, 'Selecione pelo menos um produto'),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await api.post('/orders', values);
      alert('Pedido criado com sucesso!');
      navigate('/orders');
    } catch (error) {
      alert('Erro ao criar pedido: ' + (error.response?.data?.message || error.message));
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header>
          <h2>Novo Pedido</h2>
        </Card.Header>
        <Card.Body>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, setFieldValue, isSubmitting }) => (
              <FormikForm>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={2}>
                    Mesa
                  </Form.Label>
                  <Col sm={10}>
                    <Field
                      as="select"
                      name="mesaId"
                      className="form-control"
                      onChange={(e) => {
                        setFieldValue('mesaId', e.target.value);
                        setFieldValue('assentos', []);
                      }}
                    >
                      <option value="">Selecione uma mesa</option>
                      {tables.map((table) => (
                        <option key={table._id} value={table._id}>
                          Mesa {table.numeroMesa}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name="mesaId"
                      component="div"
                      className="text-danger"
                    />
                  </Col>
                </Form.Group>

                {values.mesaId && (
                  <>
                    <Form.Group as={Row} className="mb-3">
                      <Form.Label as="legend" column sm={2}>
                        Assentos
                      </Form.Label>
                      <Col sm={10}>
                        {(() => {
                          const selectedTable = tables.find(
                            (table) => table._id === values.mesaId
                          );
                          if (selectedTable) {
                            return selectedTable.assentos.map((assento) => (
                              <Form.Check
                                key={assento._id}
                                type="checkbox"
                                label={`Assento ${assento.numeroAssento}`}
                                name="assentos"
                                value={assento._id}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFieldValue('assentos', [
                                      ...values.assentos,
                                      assento._id,
                                    ]);
                                  } else {
                                    setFieldValue(
                                      'assentos',
                                      values.assentos.filter(
                                        (id) => id !== assento._id
                                      )
                                    );
                                  }
                                }}
                                checked={values.assentos.includes(assento._id)}
                              />
                            ));
                          } else {
                            return <div>Mesa não encontrada</div>;
                          }
                        })()}
                        <ErrorMessage
                          name="assentos"
                          component="div"
                          className="text-danger"
                        />
                      </Col>
                    </Form.Group>
                  </>
                )}

                <Form.Group as={Row} className="mb-3">
                  <Form.Label as="legend" column sm={2}>
                    Produtos
                  </Form.Label>
                  <Col sm={10}>
                    {products.map((product) => (
                      <Form.Check
                        key={product._id}
                        type="checkbox"
                        label={`${product.nome} - R$ ${product.preco.toFixed(2)}`}
                        name="itens"
                        value={product._id}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFieldValue('itens', [...values.itens, product._id]);
                          } else {
                            setFieldValue(
                              'itens',
                              values.itens.filter((id) => id !== product._id)
                            );
                          }
                        }}
                        checked={values.itens.includes(product._id)}
                      />
                    ))}
                    <ErrorMessage
                      name="itens"
                      component="div"
                      className="text-danger"
                    />
                  </Col>
                </Form.Group>

                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando...' : 'Enviar Pedido'}
                </Button>
              </FormikForm>
            )}
          </Formik>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default OrderForm;


// Conteúdo de: .\src\pages\Orders\OrderList.js
// src/pages/Orders/OrderList.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { Table, Button, Badge, Container } from 'react-bootstrap';

function OrderList() {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/orders')
      .then((response) => setOrders(response.data))
      .catch((error) => console.error('Erro ao obter pedidos:', error));
  }, []);

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Pendente':
        return 'warning';
      case 'Em Preparo':
        return 'info';
      case 'Pronto':
        return 'success';
      case 'Entregue':
        return 'primary';
      case 'Cancelado':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Pedidos</h2>
      <div className="d-flex justify-content-between mb-3">
        <Button variant="primary" onClick={() => navigate('/orders/new')}>
          Novo Pedido
        </Button>
        <Button variant="outline-secondary" onClick={() => window.location.reload()}>
          Atualizar
        </Button>
      </div>
      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>ID do Pedido</th>
            <th>Mesa</th>
            <th>Assentos</th>
            <th>Itens</th>
            <th>Status</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{order._id}</td>
              <td>{order.mesa.numeroMesa}</td>
              <td>{order.assentos.map((a) => a.numeroAssento).join(', ')}</td>
              <td>
                {order.itens.map((item) => (
                  <div key={item._id}>
                    {item.nome} x{item.quantidade}
                  </div>
                ))}
              </td>
              <td>
                <Badge bg={getStatusVariant(order.status)}>{order.status}</Badge>
              </td>
              <td>{new Date(order.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default OrderList;


// Conteúdo de: .\src\pages\Orders\OrderManagement.js
// src/pages/Orders/OrderManagement.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [lastTenOrders, setLastTenOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const statusStages = ['Pendente', 'Preparando', 'Pronto', 'Entregue'];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(response.data);

      // Obter os últimos 10 pedidos
      const sortedOrders = [...response.data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setLastTenOrders(sortedOrders.slice(0, 10));
    } catch (error) {
      console.error('Erro ao obter pedidos:', error);
    }
  };

  const advanceOrderStatus = async (order) => {
    try {
      const currentIndex = statusStages.indexOf(order.status);
      if (currentIndex < statusStages.length - 1) {
        const newStatus = statusStages[currentIndex + 1];
        const token = localStorage.getItem('token');
        await axios.put(
          `http://localhost:8000/api/orders/${order._id}/status`,
          { status: newStatus },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // Atualiza o status localmente
        setOrders((prevOrders) =>
          prevOrders.map((o) =>
            o._id === order._id ? { ...o, status: newStatus } : o
          )
        );
        fetchOrders();
      }
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
    }
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
    setShowModal(false);
  };

  return (
    <Container fluid className="mt-4">
      <h1 className="mb-4">Gerenciamento de Pedidos</h1>
      <Row>
        {statusStages.map((stage, index) => (
          <Col key={stage} md={3}>
            <h4>{stage}</h4>
            {index < 3 && (
              <>
                {orders
                  .filter((order) => order.status === stage)
                  .map((order) => (
                    <Card key={order._id} className="mb-2">
                      <Card.Body>
                        <Card.Title>Pedido #{order._id.slice(-5)}</Card.Title>
                        <Card.Text>
                          Mesa: {order.mesa?.numeroMesa || 'N/A'}
                          <br />
                          Cliente: {order.cliente?.nome || 'N/A'}
                          <br />
                          Total: R$ {order.total.toFixed(2)}
                        </Card.Text>
                        <Button
                          variant="info"
                          size="sm"
                          className="me-2"
                          onClick={() => openOrderDetails(order)}
                        >
                          Detalhes
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => advanceOrderStatus(order)}
                        >
                          Avançar para {statusStages[index + 1]}
                        </Button>
                      </Card.Body>
                    </Card>
                  ))}
              </>
            )}
            {index === 3 && (
              <>
                {lastTenOrders.map((order) => (
                  <Card key={order._id} className="mb-2">
                    <Card.Body>
                      <Card.Title>Pedido #{order._id.slice(-5)}</Card.Title>
                      <Card.Text>
                        Status: {order.status}
                        <br />
                        Mesa: {order.mesa?.numeroMesa || 'N/A'}
                        <br />
                        Cliente: {order.cliente?.nome || 'N/A'}
                        <br />
                        Total: R$ {order.total.toFixed(2)}
                      </Card.Text>
                      <Button
                        variant="info"
                        size="sm"
                        onClick={() => openOrderDetails(order)}
                      >
                        Detalhes
                      </Button>
                    </Card.Body>
                  </Card>
                ))}
              </>
            )}
          </Col>
        ))}
      </Row>

      {/* Modal para detalhes do pedido */}
      <Modal show={showModal} onHide={closeOrderDetails}>
        <Modal.Header closeButton>
          <Modal.Title>Detalhes do Pedido #{selectedOrder?._id.slice(-5)}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <p>
                <strong>Mesa:</strong> {selectedOrder.mesa?.numeroMesa || 'N/A'}
              </p>
              <p>
                <strong>Cliente:</strong> {selectedOrder.cliente?.nome || 'N/A'}
              </p>
              <p>
                <strong>Status:</strong> {selectedOrder.status}
              </p>
              <p>
                <strong>Itens:</strong>
              </p>
              <ul>
                {selectedOrder.itens.map((item, index) => (
                  <li key={index}>
                    {item.receita?.nome || 'Receita desconhecida'} - Quantidade: {item.quantidade}
                    {item.modificacoes && ` - Modificações: ${item.modificacoes}`}
                  </li>
                ))}
              </ul>
              <p>
                <strong>Total:</strong> R$ {selectedOrder.total.toFixed(2)}
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeOrderDetails}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default OrderManagement;


// Conteúdo de: .\src\pages\Payments\PaymentForm.js
// src/pages/Payments/PaymentForm.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

function PaymentForm() {
  const [orders, setOrders] = useState([]);
  const [payment, setPayment] = useState({
    pedidoId: '',
    metodoPagamento: 'Dinheiro',
    valorPago: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/orders')
      .then((response) => setOrders(response.data.filter(order => order.status !== 'Pago')))
      .catch((error) => console.error('Erro ao obter pedidos:', error));
  }, []);

  const handleChange = (e) => {
    setPayment({ ...payment, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/payments', payment);
      alert('Pagamento processado com sucesso!');
      navigate('/orders');
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      alert('Erro ao processar pagamento');
    }
  };

  return (
    <div>
      <h2>Processar Pagamento</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Pedido:</label>
          <select name="pedidoId" value={payment.pedidoId} onChange={handleChange} required>
            <option value="">Selecione um pedido</option>
            {orders.map(order => (
              <option key={order._id} value={order._id}>
                Pedido {order._id} - Mesa {order.mesa.numeroMesa}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Método de Pagamento:</label>
          <select name="metodoPagamento" value={payment.metodoPagamento} onChange={handleChange}>
            <option value="Dinheiro">Dinheiro</option>
            <option value="Cartão">Cartão</option>
            <option value="PIX">PIX</option>
          </select>
        </div>
        <div>
          <label>Valor Pago:</label>
          <input type="number" name="valorPago" value={payment.valorPago} onChange={handleChange} required />
        </div>
        <button type="submit">Processar Pagamento</button>
      </form>
    </div>
  );
}

export default PaymentForm;


// Conteúdo de: .\src\pages\Products\CategoryForm.js
// src/pages/Categories/CategoryForm.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';

function CategoryForm() {
  const [category, setCategory] = useState({
    categoria: '',
    descricao: '',
    habilitado: true,
  });
  const [loading, setLoading] = useState(false);
  const { id } = useParams(); // Obtemos o id da categoria caso estejamos editando
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/categories/${id}`);
      setCategory(response.data);
    } catch (error) {
      console.error('Erro ao obter categoria:', error);
      alert('Erro ao obter categoria');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCategory({
      ...category,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        // Atualizar categoria existente
        await api.put(`/categories/${id}`, category);
        alert('Categoria atualizada com sucesso!');
      } else {
        // Criar nova categoria
        await api.post('/categories', category);
        alert('Categoria criada com sucesso!');
      }
      navigate('/categories'); // Redireciona para a lista de categorias
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      alert('Erro ao salvar categoria');
    }
  };

  return (
    <div>
      <h2>{id ? 'Editar Categoria' : 'Nova Categoria'}</h2>
      {loading ? (
        <p>Carregando categoria...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Categoria:</label>
            <input
              type="text"
              name="categoria"
              value={category.categoria}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Descrição:</label>
            <textarea
              name="descricao"
              value={category.descricao}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                name="habilitado"
                checked={category.habilitado}
                onChange={handleChange}
              />
              Habilitado
            </label>
          </div>
          <button type="submit">{id ? 'Atualizar' : 'Criar'}</button>
        </form>
      )}
    </div>
  );
}

export default CategoryForm;


// Conteúdo de: .\src\pages\Products\CategoryList.js
// src/pages/Products/CategoryList.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

function CategoryList() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/categories')
      .then((response) => setCategories(response.data))
      .catch((error) => console.error('Erro ao obter categorias:', error));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      try {
        await api.delete(`/categories/${id}`);
        setCategories(categories.filter((category) => category._id !== id));
      } catch (error) {
        console.error('Erro ao excluir categoria:', error);
        alert('Erro ao excluir categoria');
      }
    }
  };

  return (
    <div>
      <h2>Categorias</h2>
      <button onClick={() => navigate('/categories/new')}>Nova Categoria</button>
      <table>
        <thead>
          <tr>
            <th>Categoria</th>
            <th>Descrição</th>
            <th>Habilitado</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category._id}>
              <td>{category.categoria}</td>
              <td>{category.descricao}</td>
              <td>{category.habilitado ? 'Sim' : 'Não'}</td>
              <td>
                <button onClick={() => navigate(`/categories/${category._id}`)}>Editar</button>
                <button onClick={() => handleDelete(category._id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CategoryList;


// Conteúdo de: .\src\pages\Products\ProductForm.js
// src/pages/Products/CategoryList.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

function CategoryList() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/categories')
      .then((response) => setCategories(response.data))
      .catch((error) => console.error('Erro ao obter categorias:', error));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      try {
        await api.delete(`/categories/${id}`);
        setCategories(categories.filter((category) => category._id !== id));
      } catch (error) {
        console.error('Erro ao excluir categoria:', error);
        alert('Erro ao excluir categoria');
      }
    }
  };

  return (
    <div>
      <h2>Categorias</h2>
      <button onClick={() => navigate('/categories/new')}>Nova Categoria</button>
      <table>
        <thead>
          <tr>
            <th>Categoria</th>
            <th>Descrição</th>
            <th>Habilitado</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category._id}>
              <td>{category.categoria}</td>
              <td>{category.descricao}</td>
              <td>{category.habilitado ? 'Sim' : 'Não'}</td>
              <td>
                <button onClick={() => navigate(`/categories/${category._id}`)}>Editar</button>
                <button onClick={() => handleDelete(category._id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CategoryList;


// Conteúdo de: .\src\pages\Products\ProductList.js
// src/pages/Products/ProductList.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';

function ProductList() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/products')
      .then((response) => setProducts(response.data))
      .catch((error) => console.error('Erro ao obter produtos:', error));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await api.delete(`/products/${id}`);
        setProducts(products.filter((product) => product._id !== id));
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
        alert('Erro ao excluir produto');
      }
    }
  };

  return (
    <div>
      <h2>Produtos</h2>
      <Link to="/products/new">Novo Produto</Link>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Preço</th>
            <th>Categoria</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td>{product.nome}</td>
              <td>{product.preco}</td>
              <td>{product.categoria?.categoria}</td>
              <td>
                <button onClick={() => navigate(`/products/${product._id}`)}>Editar</button>
                <button onClick={() => handleDelete(product._id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductList;


// Conteúdo de: .\src\pages\Recipes\RecipeForm.js
// src/pages/Recipes/RecipeForm.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';

function RecipeForm() {
  const [recipe, setRecipe] = useState({
    nome: '',
    categoria: '',
    precoVenda: 0,
    descricao: '',
    ingredientes: [],
  });
  const [allIngredients, setAllIngredients] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/ingredients')
      .then((response) => setAllIngredients(response.data))
      .catch((error) => console.error('Erro ao obter ingredientes:', error));

    if (id) {
      api.get(`/recipes/${id}`)
        .then((response) => setRecipe(response.data))
        .catch((error) => console.error('Erro ao obter receita:', error));
    }
  }, [id]);

  const handleChange = (e) => {
    setRecipe({ ...recipe, [e.target.name]: e.target.value });
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...recipe.ingredientes];
    newIngredients[index][field] = value;
    setRecipe({ ...recipe, ingredientes: newIngredients });
  };

  const addIngredient = () => {
    setRecipe({
      ...recipe,
      ingredientes: [...recipe.ingredientes, { ingrediente: '', quantidade: 0 }],
    });
  };

  const removeIngredient = (index) => {
    const newIngredients = [...recipe.ingredientes];
    newIngredients.splice(index, 1);
    setRecipe({ ...recipe, ingredientes: newIngredients });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await api.put(`/recipes/${id}`, recipe);
        alert('Receita atualizada com sucesso!');
      } else {
        await api.post('/recipes', recipe);
        alert('Receita criada com sucesso!');
      }
      navigate('/recipes');
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
      alert('Erro ao salvar receita');
    }
  };

  return (
    <div>
      <h2>{id ? 'Editar Receita' : 'Nova Receita'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome:</label>
          <input type="text" name="nome" value={recipe.nome} onChange={handleChange} required />
        </div>
        <div>
          <label>Categoria:</label>
          <input type="text" name="categoria" value={recipe.categoria} onChange={handleChange} required />
        </div>
        <div>
          <label>Preço de Venda:</label>
          <input type="number" name="precoVenda" value={recipe.precoVenda} onChange={handleChange} required />
        </div>
        <div>
          <label>Descrição:</label>
          <textarea name="descricao" value={recipe.descricao} onChange={handleChange} />
        </div>
        <div>
          <h3>Ingredientes</h3>
          {recipe.ingredientes.map((ing, index) => (
            <div key={index}>
              <select
                value={ing.ingrediente}
                onChange={(e) => handleIngredientChange(index, 'ingrediente', e.target.value)}
              >
                <option value="">Selecione um ingrediente</option>
                {allIngredients.map((ingredient) => (
                  <option key={ingredient._id} value={ingredient._id}>
                    {ingredient.nome}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Quantidade"
                value={ing.quantidade}
                onChange={(e) => handleIngredientChange(index, 'quantidade', e.target.value)}
              />
              <button type="button" onClick={() => removeIngredient(index)}>Remover</button>
            </div>
          ))}
          <button type="button" onClick={addIngredient}>Adicionar Ingrediente</button>
        </div>
        <button type="submit">{id ? 'Atualizar' : 'Criar'}</button>
      </form>
    </div>
  );
}

export default RecipeForm;


// Conteúdo de: .\src\pages\Recipes\RecipeList.js
// src/pages/Recipes/RecipeList.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';

function RecipeList() {
  const [recipes, setRecipes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/recipes')
      .then((response) => setRecipes(response.data))
      .catch((error) => console.error('Erro ao obter receitas:', error));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta receita?')) {
      try {
        await api.delete(`/recipes/${id}`);
        setRecipes(recipes.filter((recipe) => recipe._id !== id));
      } catch (error) {
        console.error('Erro ao excluir receita:', error);
        alert('Erro ao excluir receita');
      }
    }
  };

  return (
    <div>
      <h2>Receitas</h2>
      <Link to="/recipes/new">Nova Receita</Link>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Preço de Venda</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {recipes.map((recipe) => (
            <tr key={recipe._id}>
              <td>{recipe.nome}</td>
              <td>{recipe.categoria}</td>
              <td>{recipe.precoVenda}</td>
              <td>
                <button onClick={() => navigate(`/recipes/${recipe._id}`)}>Editar</button>
                <button onClick={() => handleDelete(recipe._id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RecipeList;


// Conteúdo de: .\src\pages\Reports\Reports.js
// src/pages/Reports/Reports.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';

function Reports() {
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    api
      .get('/reports/statistics')
      .then((response) => setStatistics(response.data))
      .catch((error) => console.error('Erro ao obter estatísticas:', error));
  }, []);

  if (!statistics) {
    return <div>Carregando estatísticas...</div>;
  }

  return (
    <div>
      <h2>Relatórios e Estatísticas</h2>
      <p>Total de Vendas: {statistics.totalSales}</p>
      <p>Total de Pedidos: {statistics.totalOrders}</p>
      <p>Produto Mais Vendido: {statistics.topProduct?.nome || 'N/A'}</p>
      {/* Exiba outras estatísticas conforme necessário */}
    </div>
  );
}

export default Reports;


// Conteúdo de: .\src\pages\Reservations\ReservationForm.js
// components/ReservationForm.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';

function ReservationForm() {
  const [clientes, setClientes] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [clienteId, setClienteId] = useState('');
  const [mesaId, setMesaId] = useState('');
  const [dataReserva, setDataReserva] = useState('');
  const [numeroPessoas, setNumeroPessoas] = useState(1);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');
  const { id } = useParams(); // Obtém o ID da reserva da URL
  const [status, setStatus] = useState('Ativa'); // Inicializa como 'Ativa'

  const navigate = useNavigate();

  useEffect(() => {
    fetchClientes();
    fetchMesas();
    if (id) {
      // Se um ID está presente, estamos editando uma reserva existente
      fetchReservationDetails();
    }
  }, [id]);

  const fetchClientes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/customers', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setClientes(response.data);
    } catch (error) {
      console.error('Erro ao obter clientes:', error);
    }
  };

  const fetchMesas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/tables', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMesas(response.data);
    } catch (error) {
      console.error('Erro ao obter mesas:', error);
    }
  };

  const fetchReservationDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8000/api/reservations/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const reservation = response.data;
      setClienteId(reservation.cliente?._id || '');
      setMesaId(reservation.mesa?._id || '');
      setDataReserva(reservation.dataReserva.slice(0, 16)); // Formato 'YYYY-MM-DDTHH:mm'
      setNumeroPessoas(reservation.numeroPessoas);
      setStatus(reservation.status === true ? 'Ativa' : 'Cancelada'); // Ajuste aqui
    } catch (error) {
      console.error('Erro ao obter detalhes da reserva:', error);
      setMensagemErro('Erro ao carregar reserva. Por favor, tente novamente.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagemSucesso('');
    setMensagemErro('');
    try {
      const token = localStorage.getItem('token');
      const reservaData = {
        clienteId,
        mesaId,
        dataReserva,
        numeroPessoas,
        status: status === 'Ativa', // Converte para booleano
      };
      if (id) {
        // Atualiza a reserva existente
        await axios.put(`http://localhost:8000/api/reservations/${id}`, reservaData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMensagemSucesso('Reserva atualizada com sucesso!');
      } else {
        // Cria uma nova reserva
        await axios.post('http://localhost:8000/api/reservations', reservaData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMensagemSucesso('Reserva criada com sucesso!');
        // Limpar o formulário
        setClienteId('');
        setMesaId('');
        setDataReserva('');
        setNumeroPessoas(1);
        setStatus('Ativa'); // Reseta para 'Ativa'
      }
      // Opcionalmente, redireciona de volta para a lista de reservas
      navigate('/reservations');
    } catch (error) {
      console.error('Erro ao salvar reserva:', error);
      setMensagemErro('Erro ao salvar reserva. Por favor, tente novamente.');
    }
  };

  return (
    <Container className="mt-4">
      <h1 className="mb-4">{id ? 'Editar Reserva' : 'Criar Nova Reserva'}</h1>
      {mensagemSucesso && <Alert variant="success">{mensagemSucesso}</Alert>}
      {mensagemErro && <Alert variant="danger">{mensagemErro}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="clienteId" className="mb-3">
          <Form.Label>Cliente</Form.Label>
          <Form.Control
            as="select"
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            required
          >
            <option value="">Selecione um cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente._id} value={cliente._id}>
                {cliente.nome}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        <Form.Group controlId="mesaId" className="mb-3">
          <Form.Label>Mesa</Form.Label>
          <Form.Control
            as="select"
            value={mesaId}
            onChange={(e) => setMesaId(e.target.value)}
            required
          >
            <option value="">Selecione uma mesa</option>
            {mesas.map((mesa) => (
              <option key={mesa._id} value={mesa._id}>
                Mesa {mesa.numeroMesa} - Ambiente {mesa.ambiente?.nome}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        <Row>
          <Col md={4}>
            <Form.Group controlId="dataReserva" className="mb-3">
              <Form.Label>Data da Reserva</Form.Label>
              <Form.Control
                type="datetime-local"
                value={dataReserva}
                onChange={(e) => setDataReserva(e.target.value)}
                required
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group controlId="numeroPessoas" className="mb-3">
              <Form.Label>Número de Pessoas</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={numeroPessoas}
                onChange={(e) => setNumeroPessoas(e.target.value)}
                required
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group controlId="status" className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Control
                as="select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
              >
                <option value="Ativa">Ativa</option>
                <option value="Cancelada">Cancelada</option>
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>

        <Button variant="primary" type="submit">
          {id ? 'Atualizar Reserva' : 'Criar Reserva'}
        </Button>
      </Form>
    </Container>
  );
}

export default ReservationForm;


// Conteúdo de: .\src\pages\Reservations\ReservationList.js
// components/ReservationList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Container, Alert, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function ReservationList() {
  const [reservations, setReservations] = useState([]);
  const navigate = useNavigate(); // Hook para navegação

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('token'); // Certifique-se de que o token está armazenado no localStorage
      const response = await axios.get('http://localhost:8000/api/reservations', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setReservations(response.data);
    } catch (error) {
      console.error('Erro ao obter reservas:', error);
    }
  };

  const handleEdit = (reservationId) => {
    // Navega para o formulário de edição, passando o ID da reserva
    navigate(`/reservations/edit/${reservationId}`);
  };

  const handleDelete = async (reservationId) => {
    if (window.confirm('Tem certeza que deseja excluir esta reserva?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8000/api/reservations/${reservationId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Remove a reserva excluída do estado
        setReservations(reservations.filter((res) => res._id !== reservationId));
      } catch (error) {
        console.error('Erro ao excluir reserva:', error);
        alert('Erro ao excluir reserva. Por favor, tente novamente.');
      }
    }
  };

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Lista de Reservas</h1>
      {reservations.length === 0 ? (
        <Alert variant="info">Nenhuma reserva encontrada.</Alert>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Mesa</th>
              <th>Ambiente</th>
              <th>Data da Reserva</th>
              <th>Número de Pessoas</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => (
              <tr key={reservation._id}>
                <td>{reservation.cliente?.nome}</td>
                <td>{reservation.mesa?.numeroMesa}</td>
                <td>{reservation.mesa?.ambiente?.nome}</td>
                <td>{new Date(reservation.dataReserva).toLocaleString()}</td>
                <td>{reservation.numeroPessoas}</td>
                <td>{reservation.status}</td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEdit(reservation._id)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(reservation._id)}
                  >
                    Excluir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default ReservationList;


// Conteúdo de: .\src\pages\SalesGoals\SalesGoalsForm.js
// src/pages/SalesGoals/SalesGoalForm.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';

function SalesGoalForm() {
  const [salesGoal, setSalesGoal] = useState({
    employeeId: '',
    goalName: '',
    goalAmount: '',
    startDate: '',
    endDate: '',
  });
  const [employees, setEmployees] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
    if (id) {
      fetchSalesGoal();
    }
  }, [id]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/users/team-members');
      // Filtrar apenas agentes
      setEmployees(response.data.filter((user) => user.role === 'agent'));
    } catch (error) {
      console.error('Erro ao obter funcionários:', error);
      alert('Erro ao obter funcionários');
    }
  };

  const fetchSalesGoal = async () => {
    try {
      const response = await api.get(`/sales-goals/${id}`);
      const goal = response.data;
      setSalesGoal({
        employeeId: goal.employee._id,
        goalName: goal.goalName,
        goalAmount: goal.goalAmount,
        startDate: goal.startDate.substring(0, 10),
        endDate: goal.endDate ? goal.endDate.substring(0, 10) : '',
      });
    } catch (error) {
      console.error('Erro ao obter meta de vendas:', error);
      alert('Erro ao obter meta de vendas');
    }
  };

  const handleChange = (e) => {
    setSalesGoal({ ...salesGoal, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await api.put(`/sales-goals/${id}`, salesGoal);
        alert('Meta de vendas atualizada com sucesso!');
      } else {
        await api.post('/sales-goals', salesGoal);
        alert('Meta de vendas criada com sucesso!');
      }
      navigate('/sales-goals');
    } catch (error) {
      console.error('Erro ao salvar meta de vendas:', error);
      alert('Erro ao salvar meta de vendas');
    }
  };

  return (
    <div>
      <h2>{id ? 'Editar Meta de Vendas' : 'Nova Meta de Vendas'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Funcionário:</label>
          <select
            name="employeeId"
            value={salesGoal.employeeId}
            onChange={handleChange}
            required
          >
            <option value="">Selecione um funcionário</option>
            {employees.map((employee) => (
              <option key={employee._id} value={employee._id}>
                {employee.nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Nome da Meta:</label>
          <input
            type="text"
            name="goalName"
            value={salesGoal.goalName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Valor da Meta:</label>
          <input
            type="number"
            name="goalAmount"
            value={salesGoal.goalAmount}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Data de Início:</label>
          <input
            type="date"
            name="startDate"
            value={salesGoal.startDate}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Data de Término:</label>
          <input
            type="date"
            name="endDate"
            value={salesGoal.endDate}
            onChange={handleChange}
          />
        </div>
        <button type="submit">{id ? 'Atualizar' : 'Criar'}</button>
      </form>
    </div>
  );
}

export default SalesGoalForm;


// Conteúdo de: .\src\pages\SalesGoals\SalesGoalsList.js
// src/pages/SalesGoals/SalesGoalsList.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';

function SalesGoalsList() {
  const [salesGoals, setSalesGoals] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSalesGoals();
  }, []);

  const fetchSalesGoals = async () => {
    try {
      const response = await api.get('/sales-goals');
      setSalesGoals(response.data);
    } catch (error) {
      console.error('Erro ao obter metas de vendas:', error);
      alert('Erro ao obter metas de vendas');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta meta de vendas?')) {
      try {
        await api.delete(`/sales-goals/${id}`);
        setSalesGoals(salesGoals.filter((goal) => goal._id !== id));
      } catch (error) {
        console.error('Erro ao excluir meta de vendas:', error);
        alert('Erro ao excluir meta de vendas');
      }
    }
  };

  return (
    <div>
      <h2>Metas de Vendas</h2>
      <Link to="/sales-goals/new">Nova Meta de Vendas</Link>
      <table>
        <thead>
          <tr>
            <th>Funcionário</th>
            <th>Nome da Meta</th>
            <th>Valor da Meta</th>
            <th>Início</th>
            <th>Término</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {salesGoals.map((goal) => (
            <tr key={goal._id}>
              <td>{goal.employee ? goal.employee.nome : 'N/A'}</td>
              <td>{goal.goalName}</td>
              <td>{goal.goalAmount}</td>
              <td>{new Date(goal.startDate).toLocaleDateString()}</td>
              <td>{goal.endDate ? new Date(goal.endDate).toLocaleDateString() : 'N/A'}</td>
              <td>
                <button onClick={() => navigate(`/sales-goals/${goal._id}`)}>Editar</button>
                <button onClick={() => handleDelete(goal._id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SalesGoalsList;


// Conteúdo de: .\src\pages\Stock\StockList.js
// src/pages/Stock/StockList.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';

function StockList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api
      .get('/products')
      .then((response) => setProducts(response.data))
      .catch((error) => console.error('Erro ao obter produtos:', error));
  }, []);

  const handleUpdateStock = async (productId, newQuantity) => {
    try {
      await api.put(`/stock/${productId}`, { quantidadeEstoque: newQuantity });
      alert('Estoque atualizado com sucesso!');
      // Atualizar a lista de produtos
      const updatedProducts = products.map((product) =>
        product._id === productId
          ? { ...product, quantidadeEstoque: newQuantity }
          : product
      );
      setProducts(updatedProducts);
    } catch (error) {
      alert('Erro ao atualizar estoque: ' + error.response.data.message);
    }
  };

  return (
    <div>
      <h2>Gerenciamento de Estoque</h2>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Estoque Atual</th>
            <th>Atualizar Estoque</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td>{product.nome}</td>
              <td>{product.quantidadeEstoque}</td>
              <td>
                <input
                  type="number"
                  min="0"
                  defaultValue={product.quantidadeEstoque}
                  onBlur={(e) =>
                    handleUpdateStock(product._id, Number(e.target.value))
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StockList;


// Conteúdo de: .\src\pages\Tables\TableForm.js
// src/pages/Tables/TableForm.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';

function TableForm() {
  const [table, setTable] = useState({
    numeroMesa: '',
    ambienteId: '',
    numeroAssentos: 0,
    status: 'DISPONIVEL',
  });
  const [ambientes, setAmbientes] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAmbientes();
    if (id) {
      fetchTable();
    }
  }, [id]);

  const fetchAmbientes = async () => {
    try {
      const response = await api.get('/ambientes');
      setAmbientes(response.data);
    } catch (error) {
      console.error('Erro ao obter ambientes:', error);
    }
  };

  const fetchTable = async () => {
    try {
      const response = await api.get(`/tables/${id}`);
      setTable(response.data);
    } catch (error) {
      console.error('Erro ao obter mesa:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTable({
      ...table,
      [name]: name === 'numeroAssentos' ? Number(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await api.put(`/tables/${id}`, table);
        alert('Mesa atualizada com sucesso!');
      } else {
        await api.post('/tables', table);
        alert('Mesa criada com sucesso!');
      }
      navigate('/tables');
    } catch (error) {
      console.error('Erro ao salvar mesa:', error);
      if (error.response && error.response.data && error.response.data.message) {
        alert('Erro ao salvar mesa: ' + error.response.data.message);
      } else {
        alert('Erro ao salvar mesa');
      }
    }
  };

  const handleFinalize = async () => {
    try {
      await api.post(`/tables/${id}/finalizar`);
      alert('Mesa finalizada com sucesso!');
      navigate('/tables');
    } catch (error) {
      console.error('Erro ao finalizar mesa:', error);
      alert('Erro ao finalizar mesa: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.put(`/tables/${id}/status`, { status: newStatus });
      alert(`Status da mesa alterado para ${newStatus}`);
      fetchTable();
    } catch (error) {
      console.error('Erro ao atualizar status da mesa:', error);
      alert('Erro ao atualizar status da mesa: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div>
      <h2>{id ? 'Editar Mesa' : 'Nova Mesa'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Número da Mesa:</label>
          <input
            type="text"
            name="numeroMesa"
            value={table.numeroMesa}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Ambiente:</label>
          <select
            name="ambienteId"
            value={table.ambienteId}
            onChange={handleChange}
            required
          >
            <option value="">Selecione um Ambiente</option>
            {ambientes.map((ambiente) => (
              <option key={ambiente._id} value={ambiente._id}>
                {ambiente.nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Número de Assentos:</label>
          <input
            type="number"
            name="numeroAssentos"
            value={table.numeroAssentos}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">{id ? 'Atualizar' : 'Criar'}</button>
      </form>

      {id && (
        <div className="mt-4">
          <h3>Status da Mesa</h3>
          <p>Status Atual: {table.status}</p>
          {table.status === 'OCUPADA' && (
            <button onClick={handleFinalize}>Finalizar Mesa</button>
          )}
          {table.status !== 'DISPONIVEL' && (
            <button onClick={() => handleStatusChange('DISPONIVEL')}>Marcar como Disponível</button>
          )}
          {table.status === 'DISPONIVEL' && (
            <button onClick={() => handleStatusChange('OCUPADA')}>Marcar como Ocupada</button>
          )}
        </div>
      )}
    </div>
  );
}

export default TableForm;


// Conteúdo de: .\src\pages\Tables\TableList.js
// src/pages/Tables/TableList.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';

function TableList() {
  const [tables, setTables] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await api.get('/tables');
      setTables(response.data);
    } catch (error) {
      console.error('Erro ao obter mesas:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta mesa?')) {
      try {
        await api.delete(`/tables/${id}`);
        setTables(tables.filter((table) => table._id !== id));
      } catch (error) {
        console.error('Erro ao excluir mesa:', error);
        alert('Erro ao excluir mesa');
      }
    }
  };

  const handleFinalize = async (id) => {
    if (window.confirm('Tem certeza que deseja finalizar esta mesa?')) {
      try {
        await api.post(`/tables/${id}/finalizar`);
        alert('Mesa finalizada com sucesso!');
        fetchTables();
      } catch (error) {
        console.error('Erro ao finalizar mesa:', error);
        alert('Erro ao finalizar mesa: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/tables/${id}/status`, { status: newStatus });
      alert(`Status da mesa alterado para ${newStatus}`);
      fetchTables();
    } catch (error) {
      console.error('Erro ao atualizar status da mesa:', error);
      alert('Erro ao atualizar status da mesa: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div>
      <h2>Mesas</h2>
      <Link to="/tables/new">Nova Mesa</Link>
      <table>
        <thead>
          <tr>
            <th>Número</th>
            <th>Ambiente</th>
            <th>Assentos</th>
            <th>Posição (X, Y)</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {tables.map((table) => (
            <tr key={table._id}>
              <td>{table.numeroMesa}</td>
              <td>{table.ambiente.nome}</td>
              <td>{table.assentos.length}</td>
              <td>
                ({table.position?.x || '-'}, {table.position?.y || '-'})
              </td>
              <td>{table.status}</td>
              <td>
                <button onClick={() => navigate(`/tables/${table._id}`)}>Editar</button>
                <button onClick={() => handleDelete(table._id)}>Excluir</button>
                {table.status === 'OCUPADA' && (
                  <button onClick={() => handleFinalize(table._id)}>Finalizar</button>
                )}
                {table.status === 'DISPONIVEL' && (
                  <button onClick={() => handleStatusChange(table._id, 'OCUPADA')}>
                    Marcar como Ocupada
                  </button>
                )}
                {table.status !== 'DISPONIVEL' && (
                  <button onClick={() => handleStatusChange(table._id, 'DISPONIVEL')}>
                    Marcar como Disponível
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TableList;


// Conteúdo de: .\src\pages\Team\TeamMemberList.js
// src/pages/Team/TeamMembersList.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';

function TeamMembersList() {
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const response = await api.get('/users/team-members');
      setTeamMembers(response.data);
    } catch (error) {
      console.error('Erro ao obter membros da equipe:', error);
      alert('Erro ao obter membros da equipe');
    }
  };

  return (
    <div>
      <h2>Membros da Equipe</h2>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {teamMembers.map((member) => (
            <tr key={member._id}>
              <td>{member.nome}</td>
              <td>{member.email}</td>
              <td>{member.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TeamMembersList;


// Conteúdo de: .\src\services\api.js
// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;


