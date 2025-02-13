// src/pages/Team/TeamMembersList.js

import React, { useEffect, useState, useMemo } from 'react';
import api from '../../services/api';
import {
  Table,
  Container,
  Alert,
  Spinner,
  Button,
  Modal,
  Pagination,
  Form,
  Row,
  Col,
  Card,
  InputGroup,
  Image,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

// 1. Função para obter prioridade de cada role
function getRolePriority(role) {
  if (role === 'admin') return 100; // Admin tem prioridade máxima
  switch (role) {
    case 'manager':
      return 3;
    case 'chef':
    case 'kitchenAssistant':
    case 'barman':
      return 2;
    case 'agent':
    case 'freelancer':
    case 'receptionist':
    case 'deliveryMan':
    case 'cleaning':
      return 1;
    case 'feeder':
      return 0;
    default:
      return -1;
  }
}

// 2. Mapear roles para exibição
function mapRole(role) {
  const roleMap = {
    admin: 'Administrador',
    manager: 'Gerente',
    agent: 'Garçom/Garçonete',
    feeder: 'Feeder',
    chef: 'Chefe',
    kitchenAssistant: 'Assistente de Cozinha',
    barman: 'Barman',
    waiter: 'Freelancer',
    receptionist: 'Recepcionista',
    deliveryMan: 'Entregador/Entregadora',
    cleaning: 'Limpeza',
  };
  return roleMap[role] || role;
}

// 3. Calcular dias contratados (baseado na data de criação ou na data de contratação)
function calculateDaysContracted(createdAt) {
  const hiringDate = new Date(createdAt);
  const currentDate = new Date();
  const diffTime = currentDate - hiringDate;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// 4. Componente para renderizar permissões em colunas com botões "Selecionar Tudo" e "Desselecionar Tudo"
const PermissionsCheckboxes = ({ permissionsList, permissionLabels, values, setFieldValue }) => {
  const columns = 3;
  const chunkSize = Math.ceil(permissionsList.length / columns);
  const permissionChunks = Array.from({ length: columns }, (_, index) =>
    permissionsList.slice(index * chunkSize, (index + 1) * chunkSize)
  );

  const selectAll = () => {
    setFieldValue('permissions', permissionsList);
  };

  const deselectAll = () => {
    setFieldValue('permissions', []);
  };

  return (
    <>
      <div className="mb-2">
        <Button variant="outline-primary" size="sm" onClick={selectAll} className="me-2">
          Selecionar Tudo
        </Button>
        <Button variant="outline-secondary" size="sm" onClick={deselectAll}>
          Desselecionar Tudo
        </Button>
      </div>
      <Row>
        {permissionChunks.map((chunk, colIndex) => (
          <Col key={colIndex}>
            {chunk.map((permission) => (
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
                    setFieldValue(
                      'permissions',
                      values.permissions.filter((perm) => perm !== permission)
                    );
                  }
                }}
              />
            ))}
          </Col>
        ))}
      </Row>
    </>
  );
};

function TeamMembersList() {
  // 5. Estados principais
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado específico para upload de imagem
  const [uploadingImage, setUploadingImage] = useState(false);

  // Modais de edição e criação
  const [showEditModal, setShowEditModal] = useState(false);
  const [modalMember, setModalMember] = useState(null);
  const [modalMessage, setModalMessage] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalMessage, setCreateModalMessage] = useState('');

  // Estados de visibilidade da senha
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);

  // Role do usuário logado
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const navigate = useNavigate();

  // Paginação e Ordenação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [sortField, setSortField] = useState('nome');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' ou 'desc'

  // Checagem de duplicidade
  const [isNomeDuplicado, setIsNomeDuplicado] = useState(false);
  const [checkingDuplicacy, setCheckingDuplicacy] = useState(false);

  // 6. Lista de permissões
  const permissionsList = [
    "viewDashboard",
    "viewProduct",
    "createProduct",
    "editProduct",
    "deleteProduct",
    "viewCustomer",
    "createCustomer",
    "editCustomer",
    "deleteCustomer",
    "viewEmployee",
    "createEmployee",
    "editEmployee",
    "deleteEmployee",
    "viewIngredient",
    "createIngredient",
    "editIngredient",
    "deleteIngredient",
    "viewRecipe",
    "createRecipe",
    "editRecipe",
    "deleteRecipe",
    "createOrder",
    "manageStock",
    "viewReports",
    "processPayment",
    "viewAmbiente",
    "createAmbiente",
    "editAmbiente",
    "deleteAmbiente",
    "viewTable",
    "createTable",
    "editTable",
    "deleteTable",
    "viewReservation",
    "createReservation",
    "editReservation",
    "deleteReservation",
    "manageIfoodAuth",
    "createCategory",
    "viewCategory",
    "editCategory",
    "deleteCategory",
    "addUser",
    "manageSalesGoals",
    "viewTeamMembers",
    "manageOrder",
    "configSystem",
    "viewOrder",
    "viewOrders",
    "manageCaixa",
    "createQueue",
    "viewQueue",
    "manageNfe",
    "viewSupplier",
    "createSupplier",
    "editSupplier",
    "deleteSupplier",
    "administrator"
  ];

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
    manageOrder: 'Gerenciar Pedidos',
    configSystem: 'Configurar Sistema',
    viewOrder: 'Ver Pedido',
    viewOrders: 'Ver Pedidos',
    manageCaixa: 'Gerenciar Caixa',
    createQueue: 'Criar Fila',
    viewQueue: 'Ver Fila',
    manageNfe: 'Gerenciar Nota Fiscal',
    viewSupplier: 'Ver Fornecedor',
    createSupplier: 'Criar Fornecedor',
    editSupplier: 'Editar Fornecedor',
    deleteSupplier: 'Excluir Fornecedor',
    administrator: 'Administrador'
  };

  /* ----------------------------------
   * 7. Carregando equipe e role do usuário
   * ---------------------------------- */
  useEffect(() => {
    fetchTeamMembers();
    fetchCurrentUserRole();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const response = await api.get('/users/team-members');
      setTeamMembers(response.data);
    } catch (error) {
      console.error('Erro ao obter membros da equipe:', error);
      setError('Erro ao obter membros da equipe.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUserRole = async () => {
    try {
      const response = await api.get('/users/me');
      setCurrentUserRole(response.data.role);
    } catch (error) {
      console.error('Erro ao obter role do usuário logado:', error);
    }
  };

  /* ----------------------------------
   * 8. Ordenação e Paginação
   * ---------------------------------- */
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const sortedTeamMembers = useMemo(() => {
    const sortable = [...teamMembers];
    if (sortField) {
      sortable.sort((a, b) => {
        let aField = sortField.split('.').reduce((obj, key) => obj?.[key], a);
        let bField = sortField.split('.').reduce((obj, key) => obj?.[key], b);

        if (aField === undefined || aField === null) aField = '';
        if (bField === undefined || bField === null) bField = '';

        if (typeof aField === 'string') aField = aField.toLowerCase();
        if (typeof bField === 'string') bField = bField.toLowerCase();

        if (aField < bField) return sortOrder === 'asc' ? -1 : 1;
        if (aField > bField) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [teamMembers, sortField, sortOrder]);

  const paginatedTeamMembers = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return sortedTeamMembers.slice(indexOfFirstItem, indexOfLastItem);
  }, [sortedTeamMembers, currentPage, itemsPerPage]);

  const totalPagesCalculated = useMemo(() => {
    return Math.ceil(sortedTeamMembers.length / itemsPerPage);
  }, [sortedTeamMembers.length, itemsPerPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPagesCalculated) setCurrentPage((prev) => prev + 1);
  };

  /* ----------------------------------
   * 9. Modal de Edição
   * ---------------------------------- */
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setModalMember(null);
    setModalMessage('');
    setShowEditPassword(false);
  };

  const handleEdit = (member) => {
    setModalMember(member);
    setShowEditModal(true);
    setShowEditPassword(false);
  };

  const handleEditSubmit = async (values) => {
    try {
      const payload = { ...values };
      // Converter novaSenha para senha, se preenchida
      if (!payload.novaSenha || payload.novaSenha.trim() === '') {
        delete payload.novaSenha;
      } else {
        payload.senha = payload.novaSenha;
        delete payload.novaSenha;
      }
      console.log('Atualizando usuário com payload:', payload);
      await api.put(`/users/${values.id}`, payload);
      toast.success('Membro da equipe atualizado com sucesso!');
      fetchTeamMembers();
      handleCloseEditModal();
    } catch (error) {
      console.error('Erro ao atualizar membro da equipe:', error);
      const message = error.response?.data?.message || 'Erro ao atualizar membro da equipe.';
      setModalMessage(message);
      toast.error(message);
    }
  };

  /* ----------------------------------
   * 10. Esquema de Validação
   * ---------------------------------- */
  const validationSchema = Yup.object().shape({
    nome: Yup.string().required('Nome é obrigatório'),
    email: Yup.string().email('Email inválido').required('Email é obrigatório'),
    role: Yup.string()
      .oneOf([
        'admin',
        'manager',
        'agent',
        'waiter',
        'feeder',
        'chef',
        'kitchenAssistant',
        'barman',
        'receptionist',
        'deliveryMan',
        'cleaning',
      ])
      .required('Cargo é obrigatório'),
    managerId: Yup.string().when('role', (role, schema) => {
      if (
        [
          'agent',
          'waiter',
          'receptionist',
          'deliveryMan',
          'kitchenAssistant',
          'barman',
          'cleaning',
        ].includes(role)
      ) {
        return schema.required('Gerente é obrigatório para este cargo');
      }
      return schema.notRequired();
    }),
    novaSenha: Yup.string()
      .min(6, 'A senha deve ter pelo menos 6 caracteres')
      .notRequired(),
    telefone: Yup.string()
      .matches(/^(\+\d{1,3}[- ]?)?\d{10,11}$/, 'Telefone inválido')
      .required('Telefone é obrigatório'),
    imagem: Yup.string().notRequired(),
    vacancy: Yup.string().notRequired(),
    contractType: Yup.string()
      .oneOf(['CLT-Definitivo', 'Free Lancer'])
      .required('Tipo de contrato é obrigatório'),
    hiredSince: Yup.date().nullable().notRequired(),
  });

  /* ----------------------------------
   * 11. Agrupando Membros por Gerente
   * ---------------------------------- */
  const groupedTeamMembers = useMemo(() => {
    const groups = {};

    // 1. Crie um grupo para cada manager ou admin
    //    Aqui, já adicionamos o próprio manager na lista de "agents" do seu grupo.
    teamMembers.forEach((member) => {
      if (member.role === 'manager' || member.role === 'admin') {
        groups[member._id] = {
          manager: member,
          agents: [member], // o próprio manager/admin também aparecerá na listagem
        };
      }
    });

    // 2. Agrupar os demais cargos (agent, waiter, etc.) no grupo correto
    teamMembers.forEach((member) => {
      // Se for um manager ou admin, já foi adicionado; então ignore
      if (member.role === 'manager' || member.role === 'admin') return;

      // Se for um cargo que precisa de manager
      if (
        [
          'agent',
          'waiter',
          'receptionist',
          'deliveryMan',
          'kitchenAssistant',
          'barman',
          'cleaning',
        ].includes(member.role)
      ) {
        const managerId = member.manager?._id;
        if (managerId && groups[managerId]) {
          groups[managerId].agents.push(member);
        } else {
          if (!groups['no-manager']) {
            groups['no-manager'] = { manager: null, agents: [] };
          }
          groups['no-manager'].agents.push(member);
        }
      } else {
        // Se for outro cargo que não precisa de gerente
        if (!groups['others']) {
          groups['others'] = { manager: null, agents: [] };
        }
        groups['others'].agents.push(member);
      }
    });

    return groups;
  }, [teamMembers]);

  /* ----------------------------------
   * 12. Upload de Imagem
   * ---------------------------------- */
  const uploadImage = async (file, setFieldValue) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      toast.error('Apenas arquivos JPEG, JPG, PNG e GIF são permitidos.');
      return;
    }
    if (file.size > maxSize) {
      toast.error('O tamanho do arquivo excede 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('imagem', file);

    try {
      setUploadingImage(true);
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data && response.data.imageUrl) {
        setFieldValue('imagem', response.data.imageUrl);
        toast.success('Imagem carregada com sucesso!');
      } else {
        throw new Error('Resposta inválida do servidor.');
      }
    } catch (error) {
      console.error('Erro ao carregar imagem:', error.response || error.message);
      const message = error.response?.data?.message || 'Erro desconhecido ao carregar imagem';
      toast.error(`Erro ao carregar imagem: ${message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  /* ----------------------------------
   * 13. Verificando duplicidade do nome
   * ---------------------------------- */
  useEffect(() => {
    const checkNomeDuplicado = async (nome) => {
      if (!nome) {
        setIsNomeDuplicado(false);
        return;
      }
      try {
        setCheckingDuplicacy(true);
        const response = await api.get(`/users/check-nome/${encodeURIComponent(nome)}`);
        setIsNomeDuplicado(
          response.data.exists &&
          (!modalMember?._id || (modalMember?._id && response.data.userId !== modalMember._id))
        );
      } catch (error) {
        console.error('Erro ao verificar duplicidade do nome:', error);
      } finally {
        setCheckingDuplicacy(false);
      }
    };

    if (modalMember) {
      checkNomeDuplicado(modalMember.nome);
    }
  }, [teamMembers, modalMember]);

  /* ----------------------------------
   * 14. Renderização do Componente
   * ---------------------------------- */
  return (
    <Container className="mt-4">
      <h2 className="mb-4">Membros da Equipe</h2>

      {/* Botão de Criação */}
      <div className="d-flex justify-content-end mb-3">
        <Button variant="success" onClick={() => setShowCreateModal(true)}>
          Adicionar Novo Funcionário
        </Button>
      </div>

      {/* Conteúdo principal */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <div className="mt-2">Carregando membros da equipe...</div>
        </div>
      ) : error ? (
        <Alert variant="danger">
          <Alert.Heading>Erro</Alert.Heading>
          <p>{error}</p>
        </Alert>
      ) : (
        <>
          {Object.keys(groupedTeamMembers).length === 0 ? (
            <Alert variant="info">Nenhum membro da equipe encontrado.</Alert>
          ) : (
            <>
              {Object.entries(groupedTeamMembers).map(([groupKey, group]) => (
                <Card className="mb-4" key={groupKey}>
                  <Card.Header className="bg-primary text-white">
                    {group.manager ? (
                      <div>
                        <strong>
                          {group.manager.role === 'manager' || group.manager.role === 'admin'
                            ? `Gerente/Admin:`
                            : `Grupo:`}
                        </strong>{' '}
                        {group.manager.nome} ({group.manager.email})
                      </div>
                    ) : groupKey === 'no-manager' ? (
                      <div>
                        <strong>Sem Gerente</strong>
                      </div>
                    ) : (
                      <div>
                        <strong>Membros:</strong> {groupKey}
                      </div>
                    )}
                  </Card.Header>
                  <Card.Body>
                    {group.agents.length > 0 ? (
                      <Table striped bordered hover responsive>
                        <thead className="table-dark">
                          <tr>
                            <th>FOTO</th>
                            <th
                              onClick={() => handleSort('nome')}
                              style={{ cursor: 'pointer' }}
                            >
                              COLABORADOR{' '}
                              {sortField === 'nome' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th
                              onClick={() => handleSort('role')}
                              style={{ cursor: 'pointer' }}
                            >
                              CARGO{' '}
                              {sortField === 'role' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th
                              onClick={() => handleSort('telefone')}
                              style={{ cursor: 'pointer' }}
                            >
                              TELEFONE{' '}
                              {sortField === 'telefone' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th
                              onClick={() => handleSort('createdAt')}
                              style={{ cursor: 'pointer' }}
                            >
                              CONTRATADO EM{' '}
                              {sortField === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th>AÇÕES</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.agents.map((member) => (
                            <tr key={member._id}>
                              <td>
                                {member.imagem ? (
                                  <Image
                                    src={member.imagem}
                                    roundedCircle
                                    width={50}
                                    height={50}
                                    alt={`Foto de ${member.nome}`}
                                  />
                                ) : (
                                  <Image
                                    src="https://placehold.co/50?text=Sem+Imagem"
                                    roundedCircle
                                    width={50}
                                    height={50}
                                    alt="Foto Padrão"
                                  />
                                )}
                              </td>
                              <td>{member.nome}</td>
                              <td>{mapRole(member.role)}</td>
                              <td>{member.telefone}</td>
                              <td>
                                {new Date(member.createdAt).toLocaleDateString('pt-BR')}
                                <br />
                                <small className="text-muted">
                                  Dias contratado: {calculateDaysContracted(member.createdAt)}
                                </small>
                              </td>
                              <td>
                                <Button
                                  variant="info"
                                  size="sm"
                                  className="me-2"
                                  onClick={() => handleEdit(member)}
                                  aria-label={`Editar membro ${member.nome}`}
                                >
                                  Editar
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    ) : (
                      <Alert variant="secondary">Nenhum colaborador associado a este grupo.</Alert>
                    )}
                  </Card.Body>
                </Card>
              ))}

              {/* Paginação */}
              {totalPagesCalculated > 1 && (
                <Pagination className="justify-content-center">
                  <Pagination.First
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  />
                  <Pagination.Prev
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                  />
                  {Array.from({ length: totalPagesCalculated }, (_, index) => index + 1).map(
                    (number) => (
                      <Pagination.Item
                        key={number}
                        active={number === currentPage}
                        onClick={() => setCurrentPage(number)}
                      >
                        {number}
                      </Pagination.Item>
                    )
                  )}
                  <Pagination.Next
                    onClick={handleNextPage}
                    disabled={currentPage === totalPagesCalculated}
                  />
                  <Pagination.Last
                    onClick={() => setCurrentPage(totalPagesCalculated)}
                    disabled={currentPage === totalPagesCalculated}
                  />
                </Pagination>
              )}
            </>
          )}
        </>
      )}

      {/* ----------------------------------
       * Modal de Edição
       * ---------------------------------- */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Editar Membro da Equipe</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalMember ? (
            <Formik
              enableReinitialize
              initialValues={{
                id: modalMember._id,
                nome: modalMember.nome || '',
                email: modalMember.email || '',
                role: modalMember.role || 'agent',
                permissions: modalMember.permissions || [],
                managerId: modalMember.manager?._id || '',
                novaSenha: '',
                telefone: modalMember.telefone || '',
                imagem: modalMember.imagem || '',
                vacancy: modalMember.vacancy || '',
                contractType: modalMember.contractType || 'CLT-Definitivo',
                hiredSince: modalMember.hiredSince || '',
              }}
              validationSchema={validationSchema}
              onSubmit={async (values, { setSubmitting, setFieldError }) => {
                if (currentUserRole !== 'admin') {
                  const currentUserPriority = getRolePriority(currentUserRole);
                  const targetUserPriority = getRolePriority(values.role);

                  if (targetUserPriority > currentUserPriority) {
                    setFieldError(
                      'role',
                      'Você não possui permissão para atribuir um cargo superior ao seu.'
                    );
                    setSubmitting(false);
                    return;
                  }
                }
                await handleEditSubmit(values);
                setSubmitting(false);
              }}
            >
              {({ isSubmitting, values, setFieldValue, errors, touched }) => (
                <FormikForm>
                  {/* Campos Falsos para Prevenir Auto-Preenchimento */}
                  <input
                    type="text"
                    name="fakeUsernameEdit"
                    style={{ display: 'none' }}
                    autoComplete="username"
                    tabIndex="-1"
                    aria-hidden="true"
                  />
                  <input
                    type="password"
                    name="fakePasswordEdit"
                    style={{ display: 'none' }}
                    autoComplete="new-password"
                    tabIndex="-1"
                    aria-hidden="true"
                  />

                  {/* Campo Real de Senha */}
                  <Form.Group className="mb-3" controlId="senha">
                    <Form.Label>Nova Senha (Opcional)</Form.Label>
                    <InputGroup>
                      <Field
                        type={showEditPassword ? 'text' : 'password'}
                        name="novaSenha"
                        autoComplete="new-password"
                        placeholder="Só alterar se quiser mudar a senha"
                        className="form-control"
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={() => setShowEditPassword(!showEditPassword)}
                        aria-label={showEditPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        {showEditPassword ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </InputGroup>
                    <ErrorMessage name="novaSenha" component="div" className="text-danger" />
                  </Form.Group>

                  {/* Upload de Imagem */}
                  <Form.Group className="mb-3" controlId="imagem">
                    <Form.Label>Imagem do Membro</Form.Label>
                    <InputGroup>
                      <Field
                        type="file"
                        name="imagemFile"
                        accept="image/*"
                        className="form-control"
                        onChange={(event) => {
                          const file = event.currentTarget.files[0];
                          if (file) {
                            uploadImage(file, setFieldValue);
                          }
                        }}
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={() => setFieldValue('imagem', '')}
                        aria-label="Remover imagem"
                      >
                        Remover
                      </Button>
                    </InputGroup>
                    {errors.imagem && touched.imagem && (
                      <div className="text-danger">{errors.imagem}</div>
                    )}
                    {values.imagem && (
                      <div className="mt-2">
                        <Image
                          src={values.imagem}
                          alt="Imagem do Membro"
                          style={{ height: '100px' }}
                          rounded
                        />
                      </div>
                    )}
                  </Form.Group>

                  {/* Nome */}
                  <Form.Group className="mb-3" controlId="nome">
                    <Form.Label>Nome</Form.Label>
                    <Field type="text" name="nome" className="form-control" />
                    <ErrorMessage name="nome" component="div" className="text-danger" />
                  </Form.Group>

                  {/* Email */}
                  <Form.Group className="mb-3" controlId="email">
                    <Form.Label>Email</Form.Label>
                    <Field type="email" name="email" className="form-control" />
                    <ErrorMessage name="email" component="div" className="text-danger" />
                  </Form.Group>

                  {/* Telefone */}
                  <Form.Group className="mb-3" controlId="telefone">
                    <Form.Label>Telefone</Form.Label>
                    <Field
                      type="text"
                      name="telefone"
                      className="form-control"
                      placeholder="(XX) XXXXX-XXXX"
                    />
                    <ErrorMessage name="telefone" component="div" className="text-danger" />
                  </Form.Group>

                  {/* Campo Vacancy */}
                  <Form.Group className="mb-3" controlId="vacancy">
                    <Form.Label>Ferias em:</Form.Label>
                    <Field type="date" name="vacancy" className="form-control" />
                    <ErrorMessage name="vacancy" component="div" className="text-danger" />
                  </Form.Group>

                  {/* Campo ContractType */}
                  <Form.Group className="mb-3" controlId="contractType">
                    <Form.Label>Tipo de Contrato</Form.Label>
                    <Field as="select" name="contractType" className="form-select">
                      <option value="CLT-Definitivo">CLT-Definitivo</option>
                      <option value="Free Lancer">Free Lancer</option>
                    </Field>
                    <ErrorMessage name="contractType" component="div" className="text-danger" />
                  </Form.Group>

                  {/* Campo HiredSince */}
                  <Form.Group className="mb-3" controlId="hiredSince">
                    <Form.Label>Contratado desde:</Form.Label>
                    <Field type="date" name="hiredSince" className="form-control" />
                    <ErrorMessage name="hiredSince" component="div" className="text-danger" />
                  </Form.Group>

                  {/* Cargo */}
                  <Form.Group className="mb-3" controlId="role">
                    <Form.Label>Cargo</Form.Label>
                    <Field
                      as="select"
                      name="role"
                      className="form-select"
                      onChange={(e) => {
                        const value = e.target.value;
                        setFieldValue('role', value);
                        if (
                          ![
                            'agent',
                            'waiter',
                            'receptionist',
                            'deliveryMan',
                            'kitchenAssistant',
                            'barman',
                            'cleaning',
                          ].includes(value)
                        ) {
                          setFieldValue('managerId', '');
                        }
                      }}
                    >
                      <option value="admin">Administrador</option>
                      <option value="manager">Gerente</option>
                      <option value="chef">Chefe</option>
                      <option value="kitchenAssistant">Assistente de Cozinha</option>
                      <option value="barman">Barman</option>
                      <option value="agent">Colaborador</option>
                      <option value="waiter">Garçom/Garçonete</option>
                      <option value="receptionist">Recepcionista</option>
                      <option value="deliveryMan">Entregador/Entregadora</option>
                      <option value="cleaning">Limpeza</option>
                      <option value="feeder">Feeder</option>
                    </Field>
                    <ErrorMessage name="role" component="div" className="text-danger" />
                  </Form.Group>

                  {/* Gerente (se necessário) */}
                  {[
                    'agent',
                    'waiter',
                    'receptionist',
                    'deliveryMan',
                    'kitchenAssistant',
                    'barman',
                    'cleaning',
                  ].includes(values.role) && (
                    <Form.Group className="mb-3" controlId="managerId">
                      <Form.Label>Gerente</Form.Label>
                      <Field as="select" name="managerId" className="form-select">
                        <option value="">Selecione um gerente</option>
                        {teamMembers
                          .filter((user) => user.role === 'manager' || user.role === 'admin')
                          .map((manager) => (
                            <option key={manager._id} value={manager._id}>
                              {manager.nome}
                            </option>
                          ))}
                      </Field>
                      <ErrorMessage name="managerId" component="div" className="text-danger" />
                    </Form.Group>
                  )}

                  {/* Permissões */}
                  <Form.Group className="mb-3" controlId="permissions">
                    <Form.Label>Permissões</Form.Label>
                    <div className="ms-3">
                      <PermissionsCheckboxes
                        permissionsList={permissionsList}
                        permissionLabels={permissionLabels}
                        values={values}
                        setFieldValue={setFieldValue}
                      />
                    </div>
                    <ErrorMessage name="permissions" component="div" className="text-danger" />
                  </Form.Group>

                  {/* Botão de Submissão */}
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting || uploadingImage || isNomeDuplicado}
                  >
                    {isSubmitting || uploadingImage ? 'Atualizando...' : 'Atualizar'}
                  </Button>
                  {isNomeDuplicado && (
                    <div className="text-danger mt-2">
                      Por favor, escolha um nome diferente para o membro da equipe.
                    </div>
                  )}
                </FormikForm>
              )}
            </Formik>
          ) : (
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Carregando...</span>
            </Spinner>
          )}
        </Modal.Body>
        <Modal.Footer>
          {modalMessage && (
            <Alert variant="danger" className="w-100">
              {modalMessage}
            </Alert>
          )}
          <Button variant="secondary" onClick={handleCloseEditModal}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ----------------------------------
       * Modal de Criação
       * ---------------------------------- */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Criar Novo Membro da Equipe</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showCreateModal && (
            <Formik
              initialValues={{
                nome: '',
                email: '',
                role: 'agent',
                permissions: [],
                managerId: '',
                novaSenha: '',
                telefone: '',
                imagem: '',
                vacancy: '',
                contractType: 'CLT-Definitivo',
                hiredSince: '',
              }}
              validationSchema={validationSchema}
              onSubmit={async (values, { setSubmitting, setFieldError, resetForm }) => {
                if (currentUserRole !== 'admin') {
                  const currentUserPriority = getRolePriority(currentUserRole);
                  const targetUserPriority = getRolePriority(values.role);

                  if (targetUserPriority > currentUserPriority) {
                    setFieldError(
                      'role',
                      'Você não possui permissão para atribuir um cargo superior ao seu.'
                    );
                    setSubmitting(false);
                    return;
                  }
                }

                try {
                  const payload = { ...values };
                  if (!payload.novaSenha || payload.novaSenha.trim() === '') {
                    delete payload.novaSenha;
                  } else {
                    payload.senha = payload.novaSenha;
                    delete payload.novaSenha;
                  }

                  if (
                    ![
                      'agent',
                      'waiter',
                      'receptionist',
                      'deliveryMan',
                      'kitchenAssistant',
                      'barman',
                      'cleaning',
                    ].includes(payload.role)
                  ) {
                    delete payload.managerId;
                  }
                  console.log('Criando usuário com payload:', payload);
                  await api.post('/users', payload);
                  toast.success('Membro da equipe criado com sucesso!');
                  fetchTeamMembers();
                  resetForm();
                  setShowCreateModal(false);
                } catch (error) {
                  console.error('Erro ao criar membro da equipe:', error);
                  const message =
                    error.response?.data?.message || 'Erro ao criar membro da equipe.';
                  setCreateModalMessage(message);
                  toast.error(message);
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ isSubmitting, values, setFieldValue, errors, touched }) => (
                <FormikForm>
                  {/* Campos Falsos para Prevenir Auto-Preenchimento */}
                  <input
                    type="text"
                    name="fakeUsernameCreate"
                    style={{ display: 'none' }}
                    autoComplete="username"
                    tabIndex="-1"
                    aria-hidden="true"
                  />
                  <input
                    type="password"
                    name="fakePasswordCreate"
                    style={{ display: 'none' }}
                    autoComplete="new-password"
                    tabIndex="-1"
                    aria-hidden="true"
                  />

                  {/* Campo Real de Senha */}
                  <Form.Group className="mb-3" controlId="senha">
                    <Form.Label>Senha</Form.Label>
                    <InputGroup>
                      <Field
                        type={showCreatePassword ? 'text' : 'password'}
                        name="novaSenha"
                        autoComplete="new-password"
                        placeholder="Digite a senha"
                        className="form-control"
                        required
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={() => setShowCreatePassword(!showCreatePassword)}
                        aria-label={showCreatePassword ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        {showCreatePassword ? <FaEyeSlash /> : <FaEye />}
                      </Button>
                    </InputGroup>
                    <ErrorMessage name="novaSenha" component="div" className="text-danger" />
                  </Form.Group>

                  {/* Upload de Imagem */}
                  <Form.Group className="mb-3" controlId="imagem">
                    <Form.Label>Imagem do Membro</Form.Label>
                    <InputGroup>
                      <Field
                        type="file"
                        name="imagemFile"
                        accept="image/*"
                        className="form-control"
                        onChange={(event) => {
                          const file = event.currentTarget.files[0];
                          if (file) {
                            uploadImage(file, setFieldValue);
                          }
                        }}
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={() => setFieldValue('imagem', '')}
                        aria-label="Remover imagem"
                      >
                        Remover
                      </Button>
                    </InputGroup>
                    {errors.imagem && touched.imagem && (
                      <div className="text-danger">{errors.imagem}</div>
                    )}
                    {values.imagem && (
                      <div className="mt-2">
                        <Image
                          src={values.imagem}
                          alt="Imagem do Membro"
                          style={{ height: '100px' }}
                          rounded
                        />
                      </div>
                    )}
                  </Form.Group>

                  {/* Nome */}
                  <Form.Group className="mb-3" controlId="nome">
                    <Form.Label>Nome</Form.Label>
                    <Field type="text" name="nome" className="form-control" />
                    <ErrorMessage name="nome" component="div" className="text-danger" />
                  </Form.Group>

                  {/* Email */}
                  <Form.Group className="mb-3" controlId="email">
                    <Form.Label>Email</Form.Label>
                    <Field type="email" name="email" className="form-control" />
                    <ErrorMessage name="email" component="div" className="text-danger" />
                  </Form.Group>

                  {/* Telefone */}
                  <Form.Group className="mb-3" controlId="telefone">
                    <Form.Label>Telefone</Form.Label>
                    <Field
                      type="text"
                      name="telefone"
                      className="form-control"
                      placeholder="(XX) XXXXX-XXXX"
                    />
                    <ErrorMessage name="telefone" component="div" className="text-danger" />
                  </Form.Group>

                  {/* Campo Vacancy */}
                  <Form.Group className="mb-3" controlId="vacancy">
                    <Form.Label>Vaga</Form.Label>
                    <Field type="text" name="vacancy" className="form-control" placeholder="Digite a vaga" />
                    <ErrorMessage name="vacancy" component="div" className="text-danger" />
                  </Form.Group>

                  {/* Campo ContractType */}
                  <Form.Group className="mb-3" controlId="contractType">
                    <Form.Label>Tipo de Contrato</Form.Label>
                    <Field as="select" name="contractType" className="form-select">
                      <option value="CLT-Definitivo">CLT-Definitivo</option>
                      <option value="Free Lancer">Free Lancer</option>
                    </Field>
                    <ErrorMessage name="contractType" component="div" className="text-danger" />
                  </Form.Group>

                  {/* Campo HiredSince */}
                  <Form.Group className="mb-3" controlId="hiredSince">
                    <Form.Label>Contratado desde:</Form.Label>
                    <Field type="date" name="hiredSince" className="form-control" />
                    <ErrorMessage name="hiredSince" component="div" className="text-danger" />
                  </Form.Group>

                  {/* Cargo */}
                  <Form.Group className="mb-3" controlId="role">
                    <Form.Label>Cargo</Form.Label>
                    <Field
                      as="select"
                      name="role"
                      className="form-select"
                      onChange={(e) => {
                        const value = e.target.value;
                        setFieldValue('role', value);
                        if (
                          ![
                            'agent',
                            'waiter',
                            'receptionist',
                            'deliveryMan',
                            'kitchenAssistant',
                            'barman',
                            'cleaning',
                          ].includes(value)
                        ) {
                          setFieldValue('managerId', '');
                        }
                      }}
                    >
                      <option value="admin">Administrador</option>
                      <option value="manager">Gerente</option>
                      <option value="chef">Chefe</option>
                      <option value="kitchenAssistant">Assistente de Cozinha</option>
                      <option value="barman">Barman</option>
                      <option value="agent">Colaborador</option>
                      <option value="waiter">Garçom/Garçonete</option>
                      <option value="receptionist">Recepcionista</option>
                      <option value="deliveryMan">Entregador/Entregadora</option>
                      <option value="cleaning">Limpeza</option>
                      <option value="feeder">Feeder</option>
                    </Field>
                    <ErrorMessage name="role" component="div" className="text-danger" />
                  </Form.Group>

                  {/* Gerente (se necessário) */}
                  {[
                    'agent',
                    'waiter',
                    'receptionist',
                    'deliveryMan',
                    'kitchenAssistant',
                    'barman',
                    'cleaning',
                  ].includes(values.role) && (
                    <Form.Group className="mb-3" controlId="managerId">
                      <Form.Label>Gerente</Form.Label>
                      <Field as="select" name="managerId" className="form-select">
                        <option value="">Selecione um gerente</option>
                        {teamMembers
                          .filter((user) => user.role === 'manager' || user.role === 'admin')
                          .map((manager) => (
                            <option key={manager._id} value={manager._id}>
                              {manager.nome}
                            </option>
                          ))}
                      </Field>
                      <ErrorMessage name="managerId" component="div" className="text-danger" />
                    </Form.Group>
                  )}

                  {/* Permissões */}
                  <Form.Group className="mb-3" controlId="permissions">
                    <Form.Label>Permissões</Form.Label>
                    <div className="ms-3">
                      <PermissionsCheckboxes
                        permissionsList={permissionsList}
                        permissionLabels={permissionLabels}
                        values={values}
                        setFieldValue={setFieldValue}
                      />
                    </div>
                    <ErrorMessage name="permissions" component="div" className="text-danger" />
                  </Form.Group>

                  {/* Botão de Submissão */}
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting || uploadingImage || isNomeDuplicado}
                  >
                    {isSubmitting || uploadingImage ? 'Criando...' : 'Criar'}
                  </Button>
                  {isNomeDuplicado && (
                    <div className="text-danger mt-2">
                      Por favor, escolha um nome diferente para o membro da equipe.
                    </div>
                  )}
                </FormikForm>
              )}
            </Formik>
          )}
        </Modal.Body>
        <Modal.Footer>
          {createModalMessage && (
            <Alert variant="danger" className="w-100">
              {createModalMessage}
            </Alert>
          )}
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default TeamMembersList;
