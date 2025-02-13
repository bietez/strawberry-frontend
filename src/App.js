// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';

// Páginas de Autenticação
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Páginas Principais / Módulos
import Dashboard from './pages/Dashboard/Dashboard';
import ProductList from './pages/Products/ProductList';
import ProductForm from './pages/Products/ProductForm';
import CategoryList from './pages/Categories/CategoryList';
import CategoryForm from './pages/Categories/CategoryForm';
import DrinksManagement from './pages/Drinks/DrinksManagement';
import OrderForm from './pages/Orders/OrderForm';
import OrderList from './pages/Orders/OrderList';
import OrderManagement from './pages/Orders/OrderManagement';
import StockList from './pages/Stock/StockList';
import Reports from './pages/Reports/Reports';
import Unauthorized from './pages/Unauthorized';
import SuppliersPage from './pages/Suppliers/SuppliersPage';
import FinalizedDeliveryForm from './pages/FinalizedTables/FinalizedDeliveryForm';

// Páginas de Clientes
import CustomerList from './pages/Customers/CustomerList';
import CustomerForm from './pages/Customers/CustomerForm';

// Páginas de Funcionários
import QrBadge from './pages/Employees/QrBadge';

// Páginas de Ingredientes
import IngredientList from './pages/Ingredients/IngredientList';
import IngredientForm from './pages/Ingredients/IngredientForm';

// Páginas de Receitas
import RecipeList from './pages/Recipes/RecipeList';
import RecipeForm from './pages/Recipes/RecipeForm';

// Páginas de Pagamento
import PaymentForm from './pages/Payments/PaymentForm';

// Páginas de Ambientes
import AmbienteList from './pages/Ambientes/AmbienteList';
import AmbienteForm from './pages/Ambientes/AmbienteForm';

// Páginas de Mesas
import TableList from './pages/Tables/TableList';
import TableForm from './pages/Tables/TableForm';

// Páginas de Reservas
import ReservationList from './pages/Reservations/ReservationList';
import ReservationForm from './pages/Reservations/ReservationForm';

// Páginas de Mesas Finalizadas
import FinalizedTableList from './pages/FinalizedTables/FinalizedTableList';
import FinalizedTableForm from './pages/FinalizedTables/FinalizedTableForm';

// Metas de Vendas
import SalesGoalsList from './pages/SalesGoals/SalesGoalsList';
import SalesGoalsBI from './pages/SalesGoals/SalesGoalsBI';

// Equipe
import TeamMembersList from './pages/Team/TeamMemberList';

// Configurações
import ConfigPage from './pages/Settings/ConfigPage';

// Nova página de Lançamentos (Caixa)
import Lancamentos from './pages/Lancamentos/Lancamentos';

// Páginas de Fila
import QueueForm from './pages/Queue/QueueForm';
import QueueList from './pages/Queue/QueueList';

// Nota Fiscal (Nfe)
import Nfe from './pages/NotasFiscais/NotasFiscaisPage';
import NfeEmiter from './pages/NotasFiscais/NfeEmiter';

// Layout
import Layout from './components/Layout';

// Teste Endpoints
import Endpoints from './pages/TesteEndPoint/Endpoints';

// Verificar validade do token:
import TokenWatcher from './components/TokenWatcher';

// **NOVA IMPORTAÇÃO**: Página robusta de abas do iFood
import IfoodTabs from './components/ifood/IfoodTabs';

// Importação do ToastContainer
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Bootstrap e FontAwesome
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './icons/fontAwesome';

function App() {
  return (
    <Router>
      {/* Componente que observa a expiração do token */}
      <TokenWatcher />
      
      {/* ToastContainer renderizado no nível do App */}
      <ToastContainer
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      <Layout>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rotas Privadas */}
          <Route
            path="/"
            element={
              <PrivateRoute permissions={['viewDashboard']}>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Produtos */}
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

          {/* Categorias */}
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

          {/* Drinks */}
          <Route
            path="/drinks/manage"
            element={
              <PrivateRoute permissions={['manageDrinks']}>
                <DrinksManagement />
              </PrivateRoute>
            }
          />

          {/* Fornecedores */}
          <Route
            path="/suppliers/*"
            element={
              <PrivateRoute permissions={['viewSupplier', 'createSupplier', 'editSupplier', 'deleteSupplier']}>
                <SuppliersPage />
              </PrivateRoute>
            }
          />

          {/* Pedidos */}
          <Route
            path="/orders/new"
            element={
              <PrivateRoute permissions={['createOrder']}>
                <OrderForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <PrivateRoute permissions={['viewOrder']}>
                <OrderList />
              </PrivateRoute>
            }
          />
          <Route
            path="/orders/manage"
            element={
              <PrivateRoute permissions={['manageOrder']}>
                <OrderManagement />
              </PrivateRoute>
            }
          />

          {/* Estoque */}
          <Route
            path="/stock"
            element={
              <PrivateRoute permissions={['manageStock']}>
                <StockList />
              </PrivateRoute>
            }
          />

          {/* Relatórios */}
          <Route
            path="/reports"
            element={
              <PrivateRoute permissions={['viewReports']}>
                <Reports />
              </PrivateRoute>
            }
          />

          {/* Não autorizado */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Clientes */}
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

          {/* Funcionários */}
          <Route
            path="/employees/qr-badge"
            element={
              <PrivateRoute permissions={['viewEmployee']}>
                <QrBadge />
              </PrivateRoute>
            }
          />

          {/* Ingredientes */}
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

          {/* Receitas */}
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

          {/* Pagamentos */}
          <Route
            path="/payments/new"
            element={
              <PrivateRoute permissions={['processPayment']}>
                <PaymentForm />
              </PrivateRoute>
            }
          />

          {/* Ambientes */}
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

          {/* Mesas */}
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

          {/* Reservas */}
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

          {/* Entregas Finalizadas */}
          <Route
            path="/finalized-delivery"
            element={
              <PrivateRoute permissions={['manageOrder']}>
                <FinalizedDeliveryForm />
              </PrivateRoute>
            }
          />

          {/* Mesas Finalizadas */}
          <Route
            path="/finalized-orders"
            element={
              <PrivateRoute permissions={['manageOrder']}>
                <FinalizedTableList />
              </PrivateRoute>
            }
          />
          <Route
            path="/finalized-new"
            element={
              <PrivateRoute permissions={['manageOrder']}>
                <FinalizedTableForm />
              </PrivateRoute>
            }
          />

          {/* Integração iFood (Abas) */}
          <Route
            path="/ifood/*"
            element={
              <PrivateRoute permissions={['manageIfoodAuth']}>
                <IfoodTabs />
              </PrivateRoute>
            }
          />

          {/* Metas de Vendas */}
          <Route
            path="/sales-goals"
            element={
              <PrivateRoute permissions={['manageSalesGoals']}>
                <SalesGoalsList />
              </PrivateRoute>
            }
          />
          <Route
            path="/sales-goals/reports"
            element={
              <PrivateRoute permissions={['manageSalesGoals']}>
                <SalesGoalsBI />
              </PrivateRoute>
            }
          />

          {/* Equipe */}
          <Route
            path="/team-members"
            element={
              <PrivateRoute permissions={['viewTeamMembers']}>
                <TeamMembersList />
              </PrivateRoute>
            }
          />

          {/* Configurações */}
          <Route
            path="/settings/config"
            element={
              <PrivateRoute permissions={['addUser']}>
                <ConfigPage />
              </PrivateRoute>
            }
          />

          {/* Lançamentos (Caixa) */}
          <Route
            path="/lancamentos"
            element={
              <PrivateRoute permissions={['manageCaixa']}>
                <Lancamentos />
              </PrivateRoute>
            }
          />

          {/* Fila */}
          <Route
            path="/queue-form"
            element={
              <PrivateRoute permissions={['viewQueue']}>
                <QueueForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/queue-list"
            element={
              <PrivateRoute permissions={['viewQueue']}>
                <QueueList />
              </PrivateRoute>
            }
          />

          {/* Notas Fiscais (Nfe) */}
          <Route
            path="/nfe"
            element={
              <PrivateRoute permissions={['manageNfe']}>
                <Nfe />
              </PrivateRoute>
            }
          />
          <Route
            path="/nfe-emiter"
            element={
              <PrivateRoute permissions={['manageNfe']}>
                <NfeEmiter />
              </PrivateRoute>
            }
          />

          {/* Teste de Endpoints */}
          <Route
            path="/teste-endpoints"
            element={
              <PrivateRoute permissions={['manageCaixa']}>
                <Endpoints />
              </PrivateRoute>
            }
          />

          {/* Rota * (não encontrada) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
