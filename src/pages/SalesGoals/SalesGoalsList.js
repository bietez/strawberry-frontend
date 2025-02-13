// src/pages/SalesGoals/SalesGoalsList.js

import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Table,
  Button,
  Spinner,
  Alert,
  Modal,
  Form,
  Row,
  Col,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faTrash,
  faInfoCircle,
  faFilePdf,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import api from '../../services/api';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function SalesGoalsList() {
  // ------------------- ESTADOS PRINCIPAIS -------------------
  const [salesGoals, setSalesGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const [totalPages, setTotalPages] = useState(1);

  // Filtros do formulário
  const [filterStatus, setFilterStatus] = useState('');
  const [filterEmployeeId, setFilterEmployeeId] = useState('');
  const [filterDataInicial, setFilterDataInicial] = useState('');
  const [filterDataFinal, setFilterDataFinal] = useState('');

  // Dados auxiliares para “Funcionários” no combo de filtro e criação/edição
  const [employeesList, setEmployeesList] = useState([]);

  // -------------- MODAL: DETALHES --------------
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [detailsData, setDetailsData] = useState({ totalSold: 0, sales: [] });

  // -------------- MODAL: EXCLUSÃO --------------
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);

  // -------------- MODAL: EDIÇÃO --------------
  const [showEditModal, setShowEditModal] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState(null);
  const [editForm, setEditForm] = useState({
    employeeId: '',
    goalName: '',
    goalAmount: '',
    productId: '',
    startDate: '',
    endDate: '',
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  // Dados auxiliares para edição (combos)
  const [productsList, setProductsList] = useState([]);
  const [loadingEditData, setLoadingEditData] = useState(true);
  const [editDataError, setEditDataError] = useState(null);

  // -------------- MODAL: CRIAÇÃO --------------
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    employeeId: '',
    productId: '',
    goalName: '',
    goalAmount: '',
    startDate: '',
    endDate: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);

  // -------------- ESTADO PARA EXPORTAÇÃO PDF --------------
  const [exportingPDF, setExportingPDF] = useState(false); // Controle para spinner no botão
  const [isExporting, setIsExporting] = useState(false); // Controle para ocultar coluna "Ações"

  // ------------------- REFERÊNCIA PARA EXPORTAÇÃO PDF -------------------
  const printRef = useRef(); // Definindo printRef

  // ------------------- USE EFFECTS -------------------

  // useEffect para carregar dados auxiliares (funcionários e produtos) apenas uma vez
  useEffect(() => {
    fetchEditData(); // Carrega dados auxiliares (funcionários, produtos)
  }, []); // Executa apenas no mount

  // useEffect para carregar metas de vendas quando currentPage ou filtros mudarem
  useEffect(() => {
    fetchSalesGoals(); // Carrega metas
  }, [currentPage, filterStatus, filterEmployeeId, filterDataInicial, filterDataFinal]); // Quando mudar de página ou filtros, recarrega

  // useEffect para gerar o PDF quando isExporting for true
  useEffect(() => {
    const generatePDF = async () => {
      if (!isExporting) return;

      try {
        // Captura o conteúdo do elemento referenciado
        const canvas = await html2canvas(printRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');

        // Cria uma instância do jsPDF em modo paisagem
        const pdf = new jsPDF('l', 'mm', 'a4'); // 'l' para landscape

        // Define as margens
        const marginLeft = 10; // Margem esquerda em mm
        const marginTop = 10; // Margem superior em mm
        const marginRight = 10; // Margem direita em mm
        const marginBottom = 10; // Margem inferior em mm

        // Obtém as dimensões da página
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // Calcula a largura e altura disponíveis para a imagem
        const pdfWidth = pageWidth - marginLeft - marginRight;
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        // Adiciona a imagem no PDF com as margens
        pdf.addImage(imgData, 'PNG', marginLeft, marginTop, pdfWidth, pdfHeight);

        // Salva o PDF
        pdf.save(`Relatorio_Metas_${new Date().toISOString().slice(0,10)}.pdf`);
        console.log('PDF gerado com sucesso'); // Log de sucesso
        toast.success('PDF gerado com sucesso!');
      } catch (error) {
        console.error('Erro ao exportar PDF:', error);
        toast.error('Falha ao exportar PDF.');
      } finally {
        setIsExporting(false); // Finaliza o estado de exportação
        setExportingPDF(false); // Finaliza o spinner no botão
      }
    };

    if (isExporting) {
      generatePDF();
    }
  }, [isExporting]);

  // ------------------- FUNÇÕES DE BUSCA E AUXILIARES -------------------
  // Removida a função fetchEmployeesForFilter pois não está sendo usada

  // Carrega metas no endpoint "advanced"
  const fetchSalesGoals = async () => {
    setLoading(true);
    setError(null);
    try {
      // Parâmetros
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (filterStatus) params.status = filterStatus;
      if (filterEmployeeId) params.employeeId = filterEmployeeId;
      if (filterDataInicial) params.dataInicial = filterDataInicial;
      if (filterDataFinal) params.dataFinal = filterDataFinal;

      console.log('Fetching salesGoals with params:', params); // Adicionado para debug

      const response = await api.get('/sales-goals/advanced', { params });

      console.log('Response da API:', response.data); // Adicionado para debug

      // Pode vir "salesGoals" e paginação, ou array puro
      if (response.data && Array.isArray(response.data.salesGoals)) {
        setSalesGoals(response.data.salesGoals);
        setTotalPages(response.data.totalPages || 1);
        console.log('Sales Goals Atualizados:', response.data.salesGoals); // Adicionado
      } else if (Array.isArray(response.data)) {
        // Caso venha array puro
        setSalesGoals(response.data);
        setTotalPages(1);
        console.log('Sales Goals Atualizados (Array Puro):', response.data); // Adicionado
      } else {
        setSalesGoals([]);
        setTotalPages(1);
        console.log('Sales Goals: Nenhuma entrada encontrada.');
      }
    } catch (err) {
      console.error('Erro ao obter metas de vendas:', err);
      setError('Erro ao obter metas de vendas.');
      setSalesGoals([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Carrega dados auxiliares para combos (products, employees etc.)
  const fetchEditData = async () => {
    setLoadingEditData(true);
    setEditDataError(null);
    try {
      const [empRes, prodRes] = await Promise.all([
        api.get('/users/team-members'),
        api.get('/products'),
      ]);
      // Filtrar apenas 'waiter' e 'agent'
      const filteredEmployees = (empRes.data || []).filter((emp) =>
        ['waiter', 'agent'].includes(emp.role)
      );
      console.log('Funcionários Filtrados:', filteredEmployees); // Log para depuração
      setEmployeesList(filteredEmployees);
      setProductsList(prodRes.data || []);
    } catch (err) {
      console.error('Erro ao carregar dados de edição:', err);
      setEditDataError('Erro ao carregar dados de edição.');
    } finally {
      setLoadingEditData(false);
    }
  };

  // -------------- EXCLUSÃO --------------
  const handleDeleteClick = (goal) => {
    setGoalToDelete(goal);
    setShowDeleteModal(true);
  };
  const confirmDelete = async () => {
    if (!goalToDelete) return;
    try {
      await api.delete(`/sales-goals/${goalToDelete._id}`);
      toast.success('Meta de vendas excluída com sucesso!');
      // Recarregar metas
      fetchSalesGoals();
    } catch (err) {
      console.error('Erro ao excluir meta de vendas:', err);
      if (err.response && err.response.status === 403) {
        toast.error(
          err.response.data.message || 'Apenas admin pode excluir metas.'
        );
      } else {
        toast.error('Erro ao excluir meta de vendas.');
      }
    } finally {
      setShowDeleteModal(false);
      setGoalToDelete(null);
    }
  };

  // -------------- DETALHES --------------
  const handleShowDetails = async (goal) => {
    setSelectedGoal(goal);
    setShowDetailsModal(true);
    setDetailsLoading(true);
    setDetailsError(null);

    try {
      const response = await api.get(`/sales-goals/${goal._id}/details`);
      console.log('Detalhes da meta:', response.data); // Adicionado para debug
      setDetailsData(response.data); // { totalSold, sales }
    } catch (err) {
      console.error('Erro ao obter detalhes da meta:', err);
      setDetailsError('Erro ao obter detalhes da meta.');
    } finally {
      setDetailsLoading(false);
    }
  };
  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedGoal(null);
    setDetailsData({ totalSold: 0, sales: [] });
    setDetailsError(null);
  };

  // -------------- EDIÇÃO --------------
  const handleEditClick = (goal) => {
    setGoalToEdit(goal);
    setEditForm({
      employeeId: goal.employee?._id || '',
      goalName: goal.goalName || '',
      goalAmount: goal.goalAmount || '',
      productId: goal.product?._id || '',
      startDate: goal.startDate ? goal.startDate.slice(0, 10) : '',
      endDate: goal.endDate ? goal.endDate.slice(0, 10) : '',
    });
    setShowEditModal(true);
    setEditError(null);
  };
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setGoalToEdit(null);
    setEditForm({
      employeeId: '',
      goalName: '',
      goalAmount: '',
      productId: '',
      startDate: '',
      endDate: '',
    });
    setEditError(null);
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    try {
      const payload = {
        employeeId: editForm.employeeId,
        goalName: editForm.goalName,
        goalAmount: parseFloat(editForm.goalAmount),
        productId: editForm.productId,
        startDate: editForm.startDate
          ? new Date(editForm.startDate).toISOString()
          : null,
        endDate: editForm.endDate ? new Date(editForm.endDate).toISOString() : null,
      };
      const resp = await api.put(`/sales-goals/${goalToEdit._id}`, payload);
      // Atualiza local
      setSalesGoals(
        salesGoals.map((g) =>
          g._id === goalToEdit._id ? resp.data.salesGoal : g
        )
      );
      toast.success('Meta de vendas atualizada com sucesso!');
      handleCloseEditModal();
      // Recarregar metas
      fetchSalesGoals();
    } catch (err) {
      console.error('Erro ao atualizar meta de vendas:', err);
      const message = err.response?.data?.message || 'Erro ao atualizar meta de vendas.';
      setEditError(message);
    } finally {
      setEditLoading(false);
    }
  };

  // -------------- CRIAÇÃO --------------
  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
    setCreateForm({
      employeeId: '',
      productId: '',
      goalName: '',
      goalAmount: '',
      startDate: '',
      endDate: '',
    });
    setCreateError(null);
  };
  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setCreateForm({
      employeeId: '',
      productId: '',
      goalName: '',
      goalAmount: '',
      startDate: '',
      endDate: '',
    });
    setCreateError(null);
  };
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);
    try {
      const payload = {
        employeeId: createForm.employeeId,
        productId: createForm.productId,
        goalName: createForm.goalName,
        goalAmount: parseFloat(createForm.goalAmount),
        startDate: createForm.startDate
          ? new Date(createForm.startDate).toISOString()
          : null,
        endDate: createForm.endDate
          ? new Date(createForm.endDate).toISOString()
          : null,
      };
      await api.post('/sales-goals', payload);
      toast.success('Meta de vendas criada com sucesso!');
      handleCloseCreateModal();
      // Recarrega metas
      fetchSalesGoals();
    } catch (err) {
      console.error('Erro ao criar meta de vendas:', err);
      const message = err.response?.data?.message || 'Falha ao criar meta.';
      setCreateError(message);
    } finally {
      setCreateLoading(false);
    }
  };

  // -------------- PAGINAÇÃO --------------
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // -------------- FILTROS --------------
  const applyFilters = () => {
    // Reseta para página 1
    setCurrentPage(1);
    // Não chama fetchSalesGoals diretamente para evitar chamadas duplicadas
  };

  // -------------- EXPORTAR PDF --------------
  const handleExportPDF = () => {
    setIsExporting(true); // Inicia a exportação, ocultando a coluna "Ações"
    setExportingPDF(true); // Controla o spinner no botão
  };

  // -------------- FORMATADOR DE MOEDA --------------
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // ------------------- RENDER -------------------
  return (
    <Container className="mt-4">
      <h2 className="mb-4">Metas de Vendas</h2>

      {/* FILTRO Avançado */}
      <Form className="mb-4">
        <Row className="align-items-end">
          <Col xs={12} md={2}>
            <Form.Label>Status da Meta</Form.Label>
            <Form.Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="alcancada">Alcançada</option>
              <option value="finalizada">Finalizada</option>
            </Form.Select>
          </Col>

          <Col xs={12} md={3}>
            <Form.Label>Funcionário</Form.Label>
            <Form.Select
              value={filterEmployeeId}
              onChange={(e) => setFilterEmployeeId(e.target.value)}
            >
              <option value="">Todos</option>
              {employeesList.length > 0 ? (
                employeesList.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.nome}
                  </option>
                ))
              ) : (
                <option disabled>Nenhum funcionário disponível</option>
              )}
            </Form.Select>
          </Col>

          <Col xs={12} md={2}>
            <Form.Label>Data Inicial</Form.Label>
            <Form.Control
              type="date"
              value={filterDataInicial}
              onChange={(e) => setFilterDataInicial(e.target.value)}
            />
          </Col>

          <Col xs={12} md={2}>
            <Form.Label>Data Final</Form.Label>
            <Form.Control
              type="date"
              value={filterDataFinal}
              onChange={(e) => setFilterDataFinal(e.target.value)}
            />
          </Col>

          <Col xs={12} md={3}>
            <Button
              variant="primary"
              onClick={applyFilters}
              className="w-100 mt-2"
              type="button" // Assegura que não é um botão de submit
            >
              Filtrar
            </Button>
          </Col>
        </Row>
      </Form>

      {/* Botões de PDF e Criar */}
      <div className="mb-3 d-flex justify-content-start">
        <Button
          variant="outline-danger"
          onClick={handleExportPDF}
          disabled={exportingPDF} // Desabilita o botão durante a exportação
          type="button" // Assegura que é apenas um botão
        >
          {exportingPDF ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />{' '}
              Exportando...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faFilePdf} /> Exportar PDF
            </>
          )}
        </Button>
        <Button
          variant="primary"
          className="ms-3"
          onClick={handleOpenCreateModal}
          type="button"
        >
          Nova Meta de Vendas
        </Button>
      </div>

      {/* LISTAGEM PRINCIPAL */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </Spinner>
          <div>Carregando metas de vendas...</div>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : salesGoals.length === 0 ? (
        <Alert variant="info">Nenhuma meta de vendas encontrada.</Alert>
      ) : (
        <>
          {/* Envolva o conteúdo a ser exportado com a ref e a classe 'print-content' */}
          <div ref={printRef} className={`print-content ${isExporting ? 'exporting' : ''}`}>
            <Table striped bordered hover responsive>
              <thead className="table-dark">
                <tr>
                  <th>Funcionário</th>
                  <th>Produto</th>
                  <th>Nome da Meta</th>
                  <th>Valor da Meta</th>
                  <th>Valor Atual</th>
                  <th>Progresso (%)</th>
                  <th>Status</th>
                  <th>Início</th>
                  <th>Término</th>
                  <th className="acoes-column">Ações</th> {/* Classe adicionada */}
                </tr>
              </thead>
              <tbody>
                {salesGoals.map((goal) => (
                  <tr key={goal._id}>
                    <td>{goal.employee?.nome || 'N/A'}</td>
                    <td>{goal.product?.nome || 'N/A'}</td>
                    <td>{goal.goalName}</td>
                    <td>{formatCurrency(goal.goalAmount)}</td>
                    <td>{formatCurrency(goal.currentSales || 0)}</td>
                    <td>{(goal.progress || 0).toFixed(2)}%</td>
                    <td>
                      {goal.status === 'em_andamento' && (
                        <span className="badge bg-info text-dark">Em Andamento</span>
                      )}
                      {goal.status === 'alcancada' && (
                        <span className="badge bg-success">Alcançada</span>
                      )}
                      {goal.status === 'finalizada' && (
                        <span className="badge bg-secondary">Finalizada</span>
                      )}
                      {!goal.status && <span className="badge bg-light text-dark">N/A</span>}
                    </td>
                    <td>
                      {goal.startDate
                        ? new Date(goal.startDate).toLocaleDateString('pt-BR')
                        : 'N/A'}
                    </td>
                    <td>
                      {goal.endDate
                        ? new Date(goal.endDate).toLocaleDateString('pt-BR')
                        : 'N/A'}
                    </td>
                    <td className="acoes-column"> {/* Classe adicionada */}
                      <Button
                        variant="info"
                        size="sm"
                        className="me-2"
                        onClick={() => handleShowDetails(goal)}
                      >
                        <FontAwesomeIcon icon={faInfoCircle} /> Detalhes
                      </Button>
                      <Button
                        variant="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEditClick(goal)}
                      >
                        <FontAwesomeIcon icon={faEdit} /> Editar
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteClick(goal)}
                      >
                        <FontAwesomeIcon icon={faTrash} /> Excluir
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Adicionado para verificar quantas metas estão sendo exibidas */}
            <p>{`Total de metas exibidas: ${salesGoals.length}`}</p>

            {/* Paginação */}
            <div className="d-flex justify-content-between align-items-center mt-3">
              <Button
                variant="secondary"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span>
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="secondary"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
            </div>
          </div>

          {/* Botão Exportar PDF fora da div referenciada */}
          <div className="mb-5 d-flex justify-content-start">
            {/* O botão de exportação já está acima; caso queira duplicar, adicione aqui */}
          </div>
        </>
      )}

      {/* -------------- MODAL: DETALHES -------------- */}
      <Modal
        show={showDetailsModal}
        onHide={handleCloseDetailsModal}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Detalhes da Meta de Vendas</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailsLoading ? (
            <div className="text-center my-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Carregando...</span>
              </Spinner>
              <div>Carregando detalhes...</div>
            </div>
          ) : detailsError ? (
            <Alert variant="danger">{detailsError}</Alert>
          ) : selectedGoal ? (
            <>
              <p>
                <strong>Meta:</strong> {selectedGoal.goalName}
              </p>
              <p>
                <strong>Produto:</strong> {selectedGoal.product?.nome || 'N/A'}
              </p>
              <p>
                <strong>Valor da Meta:</strong>{' '}
                {formatCurrency(selectedGoal.goalAmount)}
              </p>
              {/* Utilizando os dados da API principal */}
              <p>
                <strong>Valor Atual:</strong> {formatCurrency(selectedGoal.currentSales || 0)}
              </p>
              <p>
                <strong>Progresso:</strong> {(selectedGoal.progress || 0).toFixed(2)}%
              </p>

              <h5>Últimas 10 Vendas</h5>
              {detailsData.sales.length === 0 ? (
                <Alert variant="info">Nenhuma venda registrada para esta meta.</Alert>
              ) : (
                <ul className="list-group">
                  {detailsData.sales.map((sale, index) => (
                    <li key={index} className="list-group-item">
                      <div>
                        <strong>Data da Venda:</strong>{' '}
                        {new Date(sale.date).toLocaleString('pt-BR')}
                      </div>
                      <div>
                        <strong>Valor da Venda:</strong>{' '}
                        {formatCurrency(sale.amount || 0)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p>Detalhes não disponíveis.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetailsModal}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* -------------- MODAL: EXCLUSÃO -------------- */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {goalToDelete && (
            <p>
              Tem certeza que deseja excluir a meta de vendas "
              <strong>{goalToDelete.goalName}</strong>"?
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Excluir
          </Button>
        </Modal.Footer>
      </Modal>

      {/* -------------- MODAL: EDIÇÃO -------------- */}
      <Modal
        show={showEditModal}
        onHide={handleCloseEditModal}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Editar Meta de Vendas</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editError && <Alert variant="danger">{editError}</Alert>}
          {loadingEditData ? (
            <div className="text-center my-3">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Carregando...</span>
              </Spinner>
              <div className="mt-2">Carregando dados...</div>
            </div>
          ) : editDataError ? (
            <Alert variant="danger">{editDataError}</Alert>
          ) : (
            <Form onSubmit={handleEditSubmit}>
              <Form.Group className="mb-3" controlId="employeeId">
                <Form.Label>Funcionário</Form.Label>
                <Form.Select
                  name="employeeId"
                  value={editForm.employeeId}
                  onChange={(e) =>
                    setEditForm({ ...editForm, employeeId: e.target.value })
                  }
                  required
                >
                  <option value="">Selecione um funcionário</option>
                  {employeesList.map((employee) => (
                    <option key={employee._id} value={employee._id}>
                      {employee.nome}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3" controlId="productId">
                <Form.Label>Produto</Form.Label>
                <Form.Select
                  name="productId"
                  value={editForm.productId}
                  onChange={(e) =>
                    setEditForm({ ...editForm, productId: e.target.value })
                  }
                  required
                >
                  <option value="">Selecione um produto</option>
                  {productsList.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.nome}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3" controlId="goalName">
                <Form.Label>Nome da Meta</Form.Label>
                <Form.Control
                  type="text"
                  value={editForm.goalName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, goalName: e.target.value })
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="goalAmount">
                <Form.Label>Valor da Meta</Form.Label>
                <Form.Control
                  type="number"
                  name="goalAmount"
                  value={editForm.goalAmount}
                  onChange={(e) =>
                    setEditForm({ ...editForm, goalAmount: e.target.value })
                  }
                  required
                  min="0"
                  step="0.01"
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="startDate">
                    <Form.Label>Data de Início</Form.Label>
                    <Form.Control
                      type="date"
                      value={editForm.startDate}
                      onChange={(e) =>
                        setEditForm({ ...editForm, startDate: e.target.value })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="endDate">
                    <Form.Label>Data de Término</Form.Label>
                    <Form.Control
                      type="date"
                      value={editForm.endDate}
                      onChange={(e) =>
                        setEditForm({ ...editForm, endDate: e.target.value })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-end">
                <Button
                  variant="secondary"
                  onClick={handleCloseEditModal}
                  className="me-2"
                >
                  Cancelar
                </Button>
                <Button variant="primary" type="submit" disabled={editLoading}>
                  {editLoading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>

      {/* -------------- MODAL: CRIAÇÃO -------------- */}
      <Modal
        show={showCreateModal}
        onHide={handleCloseCreateModal}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Criar Nova Meta de Vendas</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {createError && <Alert variant="danger">{createError}</Alert>}
          {loadingEditData ? (
            <div className="text-center my-3">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Carregando...</span>
              </Spinner>
              <div className="mt-2">Carregando dados...</div>
            </div>
          ) : editDataError ? (
            <Alert variant="danger">{editDataError}</Alert>
          ) : (
            <Form onSubmit={handleCreateSubmit}>
              <Form.Group className="mb-3" controlId="employeeIdCreate">
                <Form.Label>Funcionário</Form.Label>
                <Form.Select
                  value={createForm.employeeId}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, employeeId: e.target.value })
                  }
                  required
                >
                  <option value="">Selecione um funcionário</option>
                  {employeesList.length > 0 ? (
                    employeesList.map((employee) => (
                      <option key={employee._id} value={employee._id}>
                        {employee.nome}
                      </option>
                    ))
                  ) : (
                    <option disabled>Nenhum funcionário disponível</option>
                  )}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3" controlId="productIdCreate">
                <Form.Label>Produto</Form.Label>
                <Form.Select
                  value={createForm.productId}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, productId: e.target.value })
                  }
                  required
                >
                  <option value="">Selecione um produto</option>
                  {productsList.map((prod) => (
                    <option key={prod._id} value={prod._id}>
                      {prod.nome}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3" controlId="goalNameCreate">
                <Form.Label>Nome da Meta</Form.Label>
                <Form.Control
                  type="text"
                  value={createForm.goalName}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, goalName: e.target.value })
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="goalAmountCreate">
                <Form.Label>Valor da Meta</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  value={createForm.goalAmount}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, goalAmount: e.target.value })
                  }
                  required
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="startDateCreate">
                    <Form.Label>Data de Início</Form.Label>
                    <Form.Control
                      type="date"
                      value={createForm.startDate}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, startDate: e.target.value })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="endDateCreate">
                    <Form.Label>Data de Término</Form.Label>
                    <Form.Control
                      type="date"
                      value={createForm.endDate}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, endDate: e.target.value })
                      }
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-end">
                <Button
                  variant="secondary"
                  onClick={handleCloseCreateModal}
                  className="me-2"
                >
                  Cancelar
                </Button>
                <Button variant="primary" type="submit" disabled={createLoading}>
                  {createLoading ? 'Criando...' : 'Criar Meta'}
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default SalesGoalsList;
