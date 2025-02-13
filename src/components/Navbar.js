// src/components/Navbar.js

import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTachometerAlt,
  faBoxOpen,
  faCode,
  faTags,
  faClipboardList,
  faUser,
  faCarrot,
  faBook,
  faPlus,
  faTasks,
  faWarehouse,
  faChartLine,
  faMapMarkerAlt,
  faChair,
  faCheckDouble,
  faSignOutAlt,
  faCog,
  faBars,
  faTimes,
  faCalendarCheck,
  faIdBadge,
  faCashRegister,
  faList,
  faPlusCircle,
  faTruck,
  faFileInvoice,
  faUsers,
  faUtensils,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "react-bootstrap";
import "./Navbar.css";

function Navbar({ isCollapsed, toggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const token = localStorage.getItem("token");
  let user = null;

  if (token) {
    try {
      user = jwtDecode(token);
      console.log("Usuário decodificado:", user);
    } catch (error) {
      console.error("Token inválido:", error);
      navigate("/login");
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("rememberMe");
    navigate("/login");
  };

  const isActive = (path) => {
    if (path.endsWith("/*")) {
      const basePath = path.replace("/*", "");
      return location.pathname.startsWith(basePath);
    }
    return location.pathname === path;
  };

  // Arrays de paths para dropdowns
  const productsPaths = ["/products", "/products/new", "/categories"];
  const ordersPaths = ["/orders", "/orders/new", "/orders/manage"];
  const finalizedTablesPaths = ["/finalized-orders", "/finalized-new"];
  const configPaths = [
    "/settings/config",
    "/ifood",       // Agora apontando /ifood em vez de /ifood-auth
    "/employees/qr-badge",
    "/team-members",
  ];
  const salesGoalsPaths = ["/sales-goals", "/sales-goals/reports"];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Botão de Toggle para Telas Pequenas */}
      <Button
        variant="link"
        className="text-white mobile-toggle-btn d-md-none"
        onClick={toggleMobileMenu}
        aria-label="Toggle Menu"
      >
        <FontAwesomeIcon icon={faBars} />
      </Button>

      {/* Overlay para telas pequenas quando o menu está aberto */}
      {isMobileMenuOpen && <div className="overlay" onClick={closeMobileMenu}></div>}

      {/* Navbar */}
      <nav
        className={`sidebar ${isCollapsed ? "collapsed" : ""} ${
          isMobileMenuOpen ? "mobile-open" : ""
        }`}
      >
        <div className="sidebar-header d-flex justify-content-between align-items-center px-3">
          <div className="d-flex flex-column align-items-center">
            {user && user.nome && (
              <span className="badge hero-badge bg-primary mt-2">
                {user.nome}
              </span>
            )}
          </div>
          <Button
            variant="link"
            className="text-white toggle-btn d-none d-md-block"
            onClick={toggleSidebar}
            aria-label="Toggle Sidebar"
          >
            <FontAwesomeIcon icon={isCollapsed ? faBars : faTimes} />
          </Button>
        </div>

        <ul className="navbar-nav">
          {user ? (
            <>
              {/* Dashboard */}
              {user.permissions.includes("viewDashboard") && (
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive("/") ? "active" : ""}`}
                    to="/"
                    onClick={closeMobileMenu}
                  >
                    <FontAwesomeIcon icon={faTachometerAlt} className="me-2" />
                    {!isCollapsed && "Dashboard"}
                  </Link>
                </li>
              )}

              {/* Mesas */}
              {user.permissions.includes("viewTable") && (
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive("/tables") ? "active" : ""}`}
                    to="/tables"
                    onClick={closeMobileMenu}
                  >
                    <FontAwesomeIcon icon={faChair} className="me-2" />
                    {!isCollapsed && "Mesas"}
                  </Link>
                </li>
              )}

              {/* Produtos (Dropdown) */}
              {user.permissions.includes("viewProduct") && (
                <li className="nav-item dropdown">
                  <a
                    className={`nav-link dropdown-toggle ${
                      productsPaths.some((p) => location.pathname.startsWith(p))
                        ? "active"
                        : ""
                    }`}
                    href="#"
                    id="productsDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded={
                      productsPaths.some((p) => location.pathname.startsWith(p))
                        ? "true"
                        : "false"
                    }
                  >
                    <FontAwesomeIcon icon={faBoxOpen} className="me-2" />
                    {!isCollapsed && "Produtos"}
                  </a>
                  <ul
                    className={`dropdown-menu ${
                      productsPaths.some((p) => location.pathname.startsWith(p))
                        ? "show"
                        : ""
                    }`}
                    aria-labelledby="productsDropdown"
                  >
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/products"
                        onClick={closeMobileMenu}
                      >
                        <FontAwesomeIcon icon={faBoxOpen} className="me-2" />
                        Lista de Produtos
                      </Link>
                    </li>
                    {user.permissions.includes("createProduct") && (
                      <li>
                        <Link
                          className="dropdown-item"
                          to="/products/new"
                          onClick={closeMobileMenu}
                        >
                          <FontAwesomeIcon icon={faPlusCircle} className="me-2" />
                          Novo Produto
                        </Link>
                      </li>
                    )}
                    {user.permissions.includes("viewCategory") && (
                      <li>
                        <Link
                          className="dropdown-item"
                          to="/categories"
                          onClick={closeMobileMenu}
                        >
                          <FontAwesomeIcon icon={faTags} className="me-2" />
                          Categorias
                        </Link>
                      </li>
                    )}
                  </ul>
                </li>
              )}

              {/* Pedidos */}
              {user.permissions.includes("createOrder") && (
                <li className="nav-item dropdown">
                  <a
                    className={`nav-link dropdown-toggle ${
                      ordersPaths.some((p) => location.pathname.startsWith(p))
                        ? "active"
                        : ""
                    }`}
                    href="#"
                    id="ordersDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded={
                      ordersPaths.some((p) => location.pathname.startsWith(p))
                        ? "true"
                        : "false"
                    }
                  >
                    <FontAwesomeIcon icon={faClipboardList} className="me-2" />
                    {!isCollapsed && "Pedidos"}
                  </a>
                  <ul
                    className={`dropdown-menu ${
                      ordersPaths.some((p) => location.pathname.startsWith(p))
                        ? "show"
                        : ""
                    }`}
                    aria-labelledby="ordersDropdown"
                  >
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/orders/new"
                        onClick={closeMobileMenu}
                      >
                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                        Novo Pedido
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/orders"
                        onClick={closeMobileMenu}
                      >
                        <FontAwesomeIcon icon={faClipboardList} className="me-2" />
                        Pedidos
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/orders/manage"
                        onClick={closeMobileMenu}
                      >
                        <FontAwesomeIcon icon={faTasks} className="me-2" />
                        Gerenciar Pedidos
                      </Link>
                    </li>
                  </ul>
                </li>
              )}

              {/* Reservas */}
              {user.permissions.includes("viewReservation") && (
                <li className="nav-item">
                  <Link
                    className={`nav-link ${
                      location.pathname.startsWith("/reservations")
                        ? "active"
                        : ""
                    }`}
                    to="/reservations"
                    onClick={closeMobileMenu}
                  >
                    <FontAwesomeIcon icon={faCalendarCheck} className="me-2" />
                    {!isCollapsed && "Reservas"}
                  </Link>
                </li>
              )}

              {/* Fila */}
              {user.permissions.includes("viewQueue") && (
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive("/queue-list") ? "active" : ""}`}
                    to="/queue-list"
                    onClick={closeMobileMenu}
                  >
                    <FontAwesomeIcon icon={faList} className="me-2" />
                    {!isCollapsed && "Fila"}
                  </Link>
                </li>
              )}

              {/* Mesas Finalizadas */}
              {user.permissions.includes("manageOrder") && (
                <li className="nav-item dropdown">
                  <a
                    className={`nav-link dropdown-toggle ${
                      finalizedTablesPaths.some((p) =>
                        location.pathname.startsWith(p)
                      )
                        ? "active"
                        : ""
                    }`}
                    href="#"
                    id="finalizedTablesDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded={
                      finalizedTablesPaths.some((p) =>
                        location.pathname.startsWith(p)
                      )
                        ? "true"
                        : "false"
                    }
                  >
                    <FontAwesomeIcon icon={faCheckDouble} className="me-2" />
                    {!isCollapsed && "Mesas Finalizadas"}
                  </a>
                  <ul
                    className={`dropdown-menu ${
                      finalizedTablesPaths.some((p) =>
                        location.pathname.startsWith(p)
                      )
                        ? "show"
                        : ""
                    }`}
                    aria-labelledby="finalizedTablesDropdown"
                  >
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/finalized-orders"
                        onClick={closeMobileMenu}
                      >
                        <FontAwesomeIcon icon={faClipboardList} className="me-2" />
                        Mesas Finalizadas
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/finalized-new"
                        onClick={closeMobileMenu}
                      >
                        <FontAwesomeIcon icon={faPlus} className="me-2" />
                        Finalizar Mesa
                      </Link>
                    </li>
                  </ul>
                </li>
              )}

              {/* Entregas Finalizadas */}
              {user.permissions.includes("manageOrder") && (
                <li className="nav-item">
                  <Link
                    className={`nav-link ${
                      isActive("/finalized-delivery") ? "active" : ""
                    }`}
                    to="/finalized-delivery"
                    onClick={closeMobileMenu}
                  >
                    <FontAwesomeIcon icon={faTruck} className="me-2" />
                    {!isCollapsed && "Finalizar Entregas"}
                  </Link>
                </li>
              )}

              {/* Metas de Vendas */}
              {user.permissions.includes("manageSalesGoals") && (
                <li className="nav-item dropdown">
                  <a
                    className={`nav-link dropdown-toggle ${
                      salesGoalsPaths.some((p) =>
                        location.pathname.startsWith(p)
                      )
                        ? "active"
                        : ""
                    }`}
                    href="#"
                    id="salesGoalsDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded={
                      salesGoalsPaths.some((p) =>
                        location.pathname.startsWith(p)
                      )
                        ? "true"
                        : "false"
                    }
                  >
                    <FontAwesomeIcon icon={faList} className="me-2" />
                    {!isCollapsed && "Metas de Vendas"}
                  </a>
                  <ul
                    className={`dropdown-menu ${
                      salesGoalsPaths.some((p) =>
                        location.pathname.startsWith(p)
                      )
                        ? "show"
                        : ""
                    }`}
                    aria-labelledby="salesGoalsDropdown"
                  >
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/sales-goals"
                        onClick={closeMobileMenu}
                      >
                        <FontAwesomeIcon icon={faList} className="me-2" />
                        Lista de Metas
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/sales-goals/reports"
                        onClick={closeMobileMenu}
                      >
                        <FontAwesomeIcon icon={faChartLine} className="me-2" />
                        Relatórios de Metas
                      </Link>
                    </li>
                  </ul>
                </li>
              )}

              {/* Clientes */}
              {user.permissions.includes("viewCustomer") && (
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive("/customers") ? "active" : ""}`}
                    to="/customers"
                    onClick={closeMobileMenu}
                  >
                    <FontAwesomeIcon icon={faUser} className="me-2" />
                    {!isCollapsed && "Clientes"}
                  </Link>
                </li>
              )}

              {/* Ingredientes */}
              {user.permissions.includes("viewIngredient") && (
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive("/ingredients") ? "active" : ""}`}
                    to="/ingredients"
                    onClick={closeMobileMenu}
                  >
                    <FontAwesomeIcon icon={faCarrot} className="me-2" />
                    {!isCollapsed && "Ingredientes"}
                  </Link>
                </li>
              )}

              {/* Receitas */}
              {user.permissions.includes("viewRecipe") && (
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive("/recipes") ? "active" : ""}`}
                    to="/recipes"
                    onClick={closeMobileMenu}
                  >
                    <FontAwesomeIcon icon={faBook} className="me-2" />
                    {!isCollapsed && "Receitas"}
                  </Link>
                </li>
              )}

              {/* Estoque */}
              {user.permissions.includes("manageStock") && (
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive("/stock") ? "active" : ""}`}
                    to="/stock"
                    onClick={closeMobileMenu}
                  >
                    <FontAwesomeIcon icon={faWarehouse} className="me-2" />
                    {!isCollapsed && "Estoque"}
                  </Link>
                </li>
              )}

              {/* Fornecedores */}
              {user.permissions.includes("viewSupplier") && (
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive("/suppliers/*") ? "active" : ""}`}
                    to="/suppliers/*"
                    onClick={closeMobileMenu}
                  >
                    <FontAwesomeIcon icon={faTruck} className="me-2" />
                    {!isCollapsed && "Fornecedores"}
                  </Link>
                </li>
              )}

              {/* Lançamentos */}
              {user.permissions.includes("manageCaixa") && (
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive("/lancamentos") ? "active" : ""}`}
                    to="/lancamentos"
                    onClick={closeMobileMenu}
                  >
                    <FontAwesomeIcon icon={faCashRegister} className="me-2" />
                    {!isCollapsed && "Lançamentos"}
                  </Link>
                </li>
              )}

              {/* Gerenciar NFe's */}
              {user.permissions.includes("manageNfe") && (
                <>
                  <li className="nav-item">
                    <Link
                      className={`nav-link ${isActive("/nfe") ? "active" : ""}`}
                      to="/nfe"
                      onClick={closeMobileMenu}
                    >
                      <FontAwesomeIcon icon={faFileInvoice} className="me-2" />
                      {!isCollapsed && "Gerenciar NFe's"}
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link
                      className={`nav-link ${isActive("/nfe-emiter") ? "active" : ""}`}
                      to="/nfe-emiter"
                      onClick={closeMobileMenu}
                    >
                      <FontAwesomeIcon icon={faFileInvoice} className="me-2" />
                      {!isCollapsed && "Gerar NFE"}
                    </Link>
                  </li>
                </>
              )}

              {/* Ambientes */}
              {user.permissions.includes("viewAmbiente") && (
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive("/ambientes") ? "active" : ""}`}
                    to="/ambientes"
                    onClick={closeMobileMenu}
                  >
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                    {!isCollapsed && "Ambientes"}
                  </Link>
                </li>
              )}

              {/* Configurações (Dropdown) */}
              {(user.permissions.includes("addUser") ||
                user.permissions.includes("viewEmployee") ||
                user.permissions.includes("createEmployee") ||
                user.permissions.includes("editEmployee") ||
                user.permissions.includes("manageIfoodAuth") ||
                user.permissions.includes("viewTeamMembers")) && (
                <li className="nav-item dropdown">
                  <a
                    className={`nav-link dropdown-toggle ${
                      configPaths.some((p) => location.pathname.startsWith(p)) ? "active" : ""
                    }`}
                    href="#"
                    id="configDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded={
                      configPaths.some((p) => location.pathname.startsWith(p))
                        ? "true"
                        : "false"
                    }
                  >
                    <FontAwesomeIcon icon={faCog} className="me-2" />
                    {!isCollapsed && "Configurações"}
                  </a>
                  <ul
                    className={`dropdown-menu ${
                      configPaths.some((p) => location.pathname.startsWith(p)) ? "show" : ""
                    }`}
                    aria-labelledby="configDropdown"
                  >
                    {user.permissions.includes("addUser") && (
                      <li>
                        <Link
                          className="dropdown-item"
                          to="/settings/config"
                          onClick={closeMobileMenu}
                        >
                          <FontAwesomeIcon icon={faCog} className="me-2" />
                          Configs. do Estabelecimento
                        </Link>
                      </li>
                    )}
                    {user.permissions.includes("manageIfoodAuth") && (
                      <li>
                        <Link
                          className="dropdown-item"
                          to="/ifood"
                          onClick={closeMobileMenu}
                        >
                          <FontAwesomeIcon icon={faUtensils} className="me-2" />
                          Integração iFood
                        </Link>
                      </li>
                    )}
                    <hr className="dropdown-divider" />
                    <li className="dropdown-header">Funcionários</li>
                    {user.permissions.includes("viewEmployee") && (
                      <li>
                        <Link
                          className="dropdown-item"
                          to="/employees/qr-badge"
                          onClick={closeMobileMenu}
                        >
                          <FontAwesomeIcon icon={faIdBadge} className="me-2" />
                          Gerar Crachá QR Code
                        </Link>
                      </li>
                    )}
                    <hr className="dropdown-divider" />
                    <li className="dropdown-header">Equipe</li>
                    {user.permissions.includes("viewTeamMembers") && (
                      <li>
                        <Link
                          className="dropdown-item"
                          to="/team-members"
                          onClick={closeMobileMenu}
                        >
                          <FontAwesomeIcon icon={faUsers} className="me-2" />
                          Membros da Equipe
                        </Link>
                      </li>
                    )}
                  </ul>
                </li>
              )}

              {/* Teste Endpoints */}
              {user.permissions.includes("administrator") && (
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive("/teste-endpoints") ? "active" : ""}`}
                    to="/teste-endpoints"
                    onClick={closeMobileMenu}
                  >
                    <FontAwesomeIcon icon={faCode} className="me-2" />
                    {!isCollapsed && "Teste Endpoints"}
                  </Link>
                </li>
              )}

              {/* Botão de Logout */}
              <li className="nav-item">
                <button className="btn btn-link nav-link" onClick={handleLogout}>
                  <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                  {!isCollapsed && "Sair"}
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive("/login") ? "active" : ""}`}
                  to="/login"
                  onClick={closeMobileMenu}
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                  {!isCollapsed && "Login"}
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </>
  );
}

export default Navbar;
