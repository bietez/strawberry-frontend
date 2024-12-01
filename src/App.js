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
