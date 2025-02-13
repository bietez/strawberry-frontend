// src/pages/Auth/EditUserModal.js
import React, { useEffect, useState } from 'react';
import { Modal, Button, Alert, Form as BootstrapForm } from 'react-bootstrap';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import api from '../../services/api';

function EditUserModal({ show, handleClose, member, refreshTeamMembers }) {
  const [managers, setManagers] = useState([]);

  useEffect(() => {
    if (show) {
      fetchManagers();
    }
  }, [show]);

  const fetchManagers = async () => {
    try {
      const response = await api.get('/users/team-members');
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
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Editar Membro da Equipe</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {member && (
          <Formik
            initialValues={{
              id: member._id,
              nome: member.nome || '',
              email: member.email || '',
              role: member.role || 'agent',
              permissions: member.permissions || [],
              managerId: member.manager?._id || '',
            }}
            validationSchema={Yup.object({
              nome: Yup.string().required('Obrigatório'),
              email: Yup.string().email('Email inválido').required('Obrigatório'),
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
                setToastState({
                  show: true,
                  message: 'Membro da equipe atualizado com sucesso!',
                  variant: 'success',
                });
                fetchTeamMembers();
                handleClose();
              } catch (error) {
                console.error('Erro ao atualizar membro da equipe:', error);
                const message = error.response?.data?.message || 'Erro ao atualizar membro da equipe.';
                const details = error.response?.data?.error || '';
                setModalMessage(`${message} ${details}`);
                setShowModal(true);
              }
              setSubmitting(false);
            }}
          >
            {({ values, isSubmitting, setFieldValue }) => (
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Nome</Form.Label>
                  <Field name="nome" type="text" className="form-control" />
                  <ErrorMessage name="nome" component="div" className="text-danger" />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Field name="email" type="email" className="form-control" />
                  <ErrorMessage name="email" component="div" className="text-danger" />
                </Form.Group>

                {/* Campo para selecionar o Role */}
                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Field name="role" as="select" className="form-control" onChange={(e) => {
                    const value = e.target.value;
                    setFieldValue('role', value);
                    if (value !== 'agent') {
                      setFieldValue('managerId', '');
                    }
                  }}>
                    <option value="agent">Agent</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                    <option value="feeder">Feeder</option>
                  </Field>
                  <ErrorMessage name="role" component="div" className="text-danger" />
                </Form.Group>

                {/* Campo para selecionar o Gerente se o usuário for um Agente */}
                {values.role === 'agent' && (
                  <Form.Group className="mb-3">
                    <Form.Label>Gerente</Form.Label>
                    <Field name="managerId" as="select" className="form-control" required>
                      <option value="">Selecione um gerente</option>
                      {managers.map((manager) => (
                        <option key={manager._id} value={manager._id}>
                          {manager.nome}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="managerId" component="div" className="text-danger" />
                  </Form.Group>
                )}

                <Form.Group className="mb-3">
                  <Form.Label>Permissões</Form.Label>
                  <div className="ms-3">
                    {permissionsList.map((permission) => (
                      <Form.Check
                        key={permission}
                        type="checkbox"
                        label={permissionLabels[permission] || permission}
                        name="permissions"
                        value={permission}
                        checked={values.permissions.includes(permission)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFieldValue('permissions', [...values.permissions, permission]);
                          } else {
                            setFieldValue('permissions', values.permissions.filter((perm) => perm !== permission));
                          }
                        }}
                      />
                    ))}
                  </div>
                </Form.Group>

                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  Atualizar
                </Button>
              </Form>
            )}
          </Formik>
        )}
      </Modal.Body>
      <Modal.Footer>
        {modalMessage && (
          <Alert variant="danger" className="w-100">
            {modalMessage}
          </Alert>
        )}
        <Button variant="secondary" onClick={handleCloseModal}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default TeamMembersList;
