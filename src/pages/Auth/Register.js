// src/pages/Auth/Register.js
import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import '../../styles/Auth.css'; // Certifique-se de que o estilo está sendo importado
import { Button } from 'react-bootstrap';

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
    manageSalesGoals: 'Gerenciar Metas de Vendas',
    viewTeamMembers: 'Visualizar Membros da Equipe',
  };

  // Lista de permissões
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
    'manageSalesGoals',
    'viewTeamMembers',
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
          senha: Yup.string(),
          role: Yup.string().oneOf(['admin', 'manager', 'agent', 'feeder']).required('Obrigatório'),
          managerId: Yup.string().when('role', {
            is: 'agent',
            then: Yup.string().required('Obrigatório para agentes'),
            otherwise: Yup.string().notRequired(),
          }),
        })}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            const payload = { ...values };
            if (!payload.senha) {
              delete payload.senha;
            }
            await api.put(`/users/${values.id}`, payload);
            alert('Usuário atualizado com sucesso!');
            navigate('/team-members');
          } catch (error) {
            alert('Erro ao atualizar usuário: ' + (error.response?.data?.message || error.message));
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

                {/* Campo para selecionar o Role */}
                <div className="form-group">
                  <label>Role</label>
                  <Field
                    name="role"
                    as="select"
                    className="form-control"
                    onChange={(e) => {
                      const value = e.target.value;
                      // Aqui você pode adicionar lógica adicional se necessário
                    }}
                  >
                    <option value="agent">Agent</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                    <option value="feeder">Feeder</option>
                  </Field>
                  <ErrorMessage name="role" component="div" className="error" />
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

            {/* Campo oculto para ID do usuário */}
            <Field type="hidden" name="id" />

            <Button type="submit" disabled={isSubmitting} className="btn-submit">
              Atualizar
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default Register;
