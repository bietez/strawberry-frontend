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
