// src/pages/Tables/TableList.jsx

import React, { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import {
  Spinner,
  Alert,
  Button,
  Container,
  Modal,
  Form,
  Row,
  Col,
  Badge,
  Tabs,
  Tab,
  InputGroup,
  Table
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash,
  faInfoCircle,
  faLock,
  faLockOpen,
  faSearch
} from '@fortawesome/free-solid-svg-icons';

// React DnD Imports
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Componentes externos
import OrderList from '../../components/OrderList';
import OrderForm from '../../components/OrderForm';
import TableDetailsModal from '../../components/TableDetailsModal';

// Import do CSS Module e utilitário para classes condicionais
import styles from './TableList.module.css';
import classNames from 'classnames';

// =============================================================
// Constante para o tipo de item do React DnD
// =============================================================
const ItemTypes = {
  TABLE: 'table'
};

// =============================================================
// Função para formatar o tempo desde a ocupação da mesa
// =============================================================
const formatDurationSince = (timestamp) => {
  if (!timestamp) return '';
  const now = new Date();
  const past = new Date(timestamp);
  const diffInSeconds = Math.floor((now - past) / 1000);
  const intervals = [
    { label: 'ano', seconds: 31536000 },
    { label: 'mês', seconds: 2592000 },
    { label: 'semana', seconds: 604800 },
    { label: 'dia', seconds: 86400 },
    { label: 'hora', seconds: 3600 },
    { label: 'minuto', seconds: 60 },
    { label: 'segundo', seconds: 1 }
  ];
  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count !== 1 ? 's' : ''} atrás`;
    }
  }
  return 'Agora mesmo';
};

// =============================================================
// Função auxiliar para gerar DRE comparativo (DRE Fiscal)
// =============================================================
const gerarDREComparativo = async (drePeriodos, setDreResultado, setActiveTab) => {
  try {
    const body = {
      periodos: drePeriodos.map((p) => ({
        label: p.label,
        dataInicial: p.dataInicial,
        dataFinal: p.dataFinal,
        categoriasSelecionadas: p.categoriasSelecionadas,
      })),
    };
    const res = await api.post('/dre/comparativo', body);
    // Espera-se que a API retorne um objeto com as chaves "periodo1" e "periodo2"
    setDreResultado(res.data.periodos || {});
    setActiveTab('resultado');
    toast.success('DRE Fiscal gerado com sucesso!');
  } catch (err) {
    toast.error('Erro ao gerar DRE Fiscal');
    console.error(err);
  }
};

// =============================================================
// Função auxiliar para exportar o DRE para PDF
// =============================================================
const exportarPDFDRE = async (dreRef) => {
  if (!dreRef.current) {
    toast.error('Nenhum DRE para exportar.');
    return;
  }
  try {
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).jsPDF;
    const canvas = await html2canvas(dreRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = (canvas.height * pdfW) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);
    pdf.save(`DRE_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('PDF do DRE exportado com sucesso!');
  } catch (error) {
    console.error(error);
    toast.error('Falha ao exportar PDF do DRE.');
  }
};

// =============================================================
// Componente para exibir árvore de categorias com checkboxes
// =============================================================
const CheckableCategoryTree = ({ categories, selectedCategories, handleCheck, level = 0 }) => {
  const getIndentClass = (lvl) => {
    const clampedLevel = Math.min(lvl, 5);
    return styles[`indentLevel${clampedLevel}`] || '';
  };

  return (
    <>
      {categories.map((category) => {
        const catIdStr = String(category._id);
        const isChecked = selectedCategories.includes(catIdStr);
        return (
          <div key={catIdStr} className={`${styles.toggleItem} ${getIndentClass(level)}`}>
            <Form.Check
              type="checkbox"
              id={`check-${catIdStr}`}
              label={category.nome}
              checked={isChecked}
              onChange={() => handleCheck(catIdStr)}
            />
            {category.children && category.children.length > 0 && (
              <CheckableCategoryTree
                categories={category.children}
                selectedCategories={selectedCategories}
                handleCheck={handleCheck}
                level={level + 1}
              />
            )}
          </div>
        );
      })}
    </>
  );
};

// =============================================================
// Função auxiliar para buscar uma categoria pelo ID na árvore
// =============================================================
const findCategoriaById = (id, categories) => {
  const idStr = String(id);
  for (const cat of categories) {
    if (String(cat._id) === idStr) return cat;
    if (cat.children && cat.children.length > 0) {
      const found = findCategoriaById(idStr, cat.children);
      if (found) return found;
    }
  }
  return null;
};

// =============================================================
// Função auxiliar para formatar valores para o padrão BRL
// =============================================================
const formatarValorBR = (valor) => {
  return (valor ?? 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// =============================================================
// Componente DraggableTable: representa cada mesa (drag, resize, rotação)
// =============================================================
const DraggableTable = ({ table, onClick, movementLocked, onResize, onRotate, gridSize, darkMode }) => {
  const isResizingRef = useRef(false);
  const rotationHandleRef = useRef(null);

  // Estados para redimensionamento
  const [isResizing, setIsResizing] = useState(false);
  const [currentWidth, setCurrentWidth] = useState(table.posicao?.[0]?.width || 120);
  const [currentHeight, setCurrentHeight] = useState(table.posicao?.[0]?.height || 120);

  // Estado para rotação
  const [currentRotation, setCurrentRotation] = useState(table.rotation || 0);
  const [isRotating, setIsRotating] = useState(false);

  useEffect(() => {
    setCurrentWidth(table.posicao?.[0]?.width || 120);
    setCurrentHeight(table.posicao?.[0]?.height || 120);
  }, [table]);

  useEffect(() => {
    setCurrentRotation(table.rotation || 0);
  }, [table.rotation]);

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemTypes.TABLE,
      item: {
        id: table._id,
        originalX: table.posicao?.[0]?.pos_x ?? 0,
        originalY: table.posicao?.[0]?.pos_y ?? 0,
        originalWidth: table.posicao?.[0]?.width ?? 120,
        originalHeight: table.posicao?.[0]?.height ?? 120
      },
      canDrag: () => !movementLocked && !isResizing && !isRotating,
      collect: (monitor) => ({
        isDragging: monitor.isDragging()
      })
    }),
    [table, movementLocked, isResizing, isRotating]
  );

  const opacity = isDragging ? 0.5 : 1;

  let bgClass = '';
  const statusLower = (table.status || '').toLowerCase();
  switch (statusLower) {
    case 'livre':
      bgClass = darkMode ? styles.bgFreeDark : styles.bgFreeLight;
      break;
    case 'ocupada':
      bgClass = darkMode ? styles.bgOccupiedDark : styles.bgOccupiedLight;
      break;
    case 'reservada':
      bgClass = darkMode ? styles.bgReservedDark : styles.bgReservedLight;
      break;
    default:
      bgClass = darkMode ? styles.bgDefaultDark : styles.bgDefaultLight;
      break;
  }

  const resizeRef = useRef();
  const handleMouseDown = (e) => {
    if (movementLocked) return;
    e.stopPropagation();
    isResizingRef.current = true;
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const container = resizeRef.current.parentElement;
      const rect = container.getBoundingClientRect();
      let newWidth = e.clientX - rect.left;
      let newHeight = e.clientY - rect.top;
      newWidth = Math.max(60, newWidth);
      newHeight = Math.max(60, newHeight);
      newWidth = Math.round(newWidth / gridSize) * gridSize;
      if (table.formato === 'circular') {
        newHeight = newWidth;
      } else {
        newHeight = Math.round(newHeight / gridSize) * gridSize;
      }
      setCurrentWidth(newWidth);
      setCurrentHeight(newHeight);
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        isResizingRef.current = false;
        onResize(table._id, currentWidth, currentHeight);
      }
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, table._id, currentWidth, currentHeight, onResize, gridSize, table.formato]);

  const handleRotationMouseDown = (e) => {
    e.stopPropagation();
    setIsRotating(true);
  };

  useEffect(() => {
    const handleMouseMoveRotation = (e) => {
      if (!isRotating) return;
      const container = rotationHandleRef.current.parentElement;
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      let angle = Math.atan2(dy, dx) * (180 / Math.PI);
      if (angle < 0) angle += 360;
      angle = Math.round(angle / 15) * 15;
      setCurrentRotation(angle);
    };

    const handleMouseUpRotation = () => {
      if (isRotating) {
        setIsRotating(false);
        if (onRotate) onRotate(table._id, currentRotation);
      }
    };

    if (isRotating) {
      window.addEventListener('mousemove', handleMouseMoveRotation);
      window.addEventListener('mouseup', handleMouseUpRotation);
    } else {
      window.removeEventListener('mousemove', handleMouseMoveRotation);
      window.removeEventListener('mouseup', handleMouseUpRotation);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMoveRotation);
      window.removeEventListener('mouseup', handleMouseUpRotation);
    };
  }, [isRotating, currentRotation, onRotate, table._id]);

  return (
    <div
      ref={drag}
      onClick={() => onClick(table)}
      className={classNames(
        styles.draggableTable,
        bgClass,
        { [styles.draggableTableDragging]: isDragging },
        { [styles.tableCircular]: table.formato === 'circular' }
      )}
      style={{
        left: table.posicao?.[0]?.pos_x ?? 0,
        top: table.posicao?.[0]?.pos_y ?? 0,
        width: currentWidth,
        height: currentHeight,
        opacity,
        cursor: movementLocked
          ? 'pointer'
          : isResizing
          ? (table.formato === 'circular' ? 'e-resize' : 'se-resize')
          : 'move',
        transform: `rotate(${currentRotation}deg)`,
        transformOrigin: 'center center'
      }}
    >
      <div className={styles.tableNumber}>Mesa {table.numeroMesa}</div>
      <div>
        <Badge
          bg={
            statusLower === 'livre'
              ? 'success'
              : statusLower === 'ocupada'
              ? 'danger'
              : statusLower === 'reservada'
              ? 'warning'
              : 'secondary'
          }
          className={styles.tableBadge}
        >
          {statusLower === 'reservada'
            ? 'Reservada'
            : table.status.charAt(0).toUpperCase() + table.status.slice(1).toLowerCase()}
        </Badge>
      </div>
      {table.status === 'ocupada' && table.occupiedSince && (
        <div className={styles.tableTime}>
          {formatDurationSince(table.occupiedSince)}
        </div>
      )}
      <div className={styles.tableCapacity}>Cap: {table.capacidade}</div>
      {!movementLocked && (
        <div
          ref={resizeRef}
          onMouseDown={handleMouseDown}
          className={table.formato === 'circular' ? styles.resizeHandleCircular : styles.resizeHandle}
        />
      )}
      {!movementLocked && (
        <div
          ref={rotationHandleRef}
          onMouseDown={handleRotationMouseDown}
          className={styles.rotateHandle}
        />
      )}
    </div>
  );
};

// =============================================================
// Componente DropContainer para drag & drop
// =============================================================
const DropContainer = ({ movementLocked, onDrop, children, gridSize, darkMode }) => {
  const [, drop] = useDrop(
    () => ({
      accept: ItemTypes.TABLE,
      canDrop: () => !movementLocked,
      drop: (draggedItem, monitor) => {
        const delta = monitor.getDifferenceFromInitialOffset();
        if (!delta) return;
        const { id, originalX, originalY } = draggedItem;
        let newX = originalX + delta.x;
        let newY = originalY + delta.y;
        newX = Math.round(newX / gridSize) * gridSize;
        newY = Math.round(newY / gridSize) * gridSize;
        onDrop(id, newX, newY);
      }
    }),
    [movementLocked, onDrop, gridSize]
  );

  const containerClass = classNames({
    [styles.dropContainer]: !darkMode,
    [styles.dropContainerDark]: darkMode
  });

  return (
    <div
      ref={drop}
      className={containerClass}
      style={{ backgroundSize: `${gridSize}px ${gridSize}px` }}
    >
      {children}
    </div>
  );
};

// =============================================================
// Componente TableListing: exibe mesas em formato tabular (modal)
// =============================================================
function TableListing({ tables, loading, error, handleDelete, handleOpenDetailsModal, handleLiberarMesa, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState('numeroMesa');
  const [order, setOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;
  const filteredTables = tables.filter((t) =>
    !searchTerm || t.numeroMesa.toString().includes(searchTerm.toLowerCase())
  );
  const sortedTables = [...filteredTables].sort((a, b) => {
    let valA = a[sort];
    let valB = b[sort];
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    return order === 'asc'
      ? (valA > valB ? 1 : valA < valB ? -1 : 0)
      : (valA < valB ? 1 : valA > valB ? -1 : 0);
  });
  const totalPages = Math.ceil(sortedTables.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTables = sortedTables.slice(startIndex, startIndex + itemsPerPage);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  const handleSortChange = () => {
    setOrder(order === 'asc' ? 'desc' : 'asc');
  };
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <>
      <div className="d-flex mb-3">
        <InputGroup style={{ maxWidth: '300px' }}>
          <Form.Control
            type="text"
            placeholder="Pesquisar por número da mesa..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
            <FontAwesomeIcon icon={faSearch} />
          </Button>
        </InputGroup>
        <Button variant="outline-secondary" className="ms-3" onClick={handleSortChange}>
          Ordenar por Número {order === 'asc' ? '↑' : '↓'}
        </Button>
      </div>
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <div>Carregando mesas...</div>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : currentTables.length === 0 ? (
        <Alert variant="info">Nenhuma mesa encontrada.</Alert>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <thead className="table-dark">
              <tr>
                <th onClick={handleSortChange} style={{ cursor: 'pointer' }}>
                  Número da Mesa {order === 'asc' ? '↑' : '↓'}
                </th>
                <th>Ambiente</th>
                <th>Status</th>
                <th>Capacidade</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {currentTables.map((table) => {
                const statusLower = table.status?.toLowerCase();
                const canLiberarMesa =
                  (statusLower === 'ocupada' || statusLower === 'suja') ||
                  (statusLower === 'reservada' && !table.hasActiveReservation);
                return (
                  <tr key={table._id}>
                    <td>{table.numeroMesa}</td>
                    <td>{table.ambiente?.nome || 'N/A'}</td>
                    <td>
                      <Badge
                        bg={
                          statusLower === 'livre'
                            ? 'success'
                            : statusLower === 'ocupada'
                            ? 'danger'
                            : statusLower === 'reservada'
                            ? 'warning'
                            : 'secondary'
                        }
                      >
                        {statusLower === 'reservada'
                          ? 'Reservada'
                          : table.status.charAt(0).toUpperCase() + table.status.slice(1).toLowerCase()}
                      </Badge>
                    </td>
                    <td>{table.capacidade}</td>
                    <td>
                      <Button
                        variant="info"
                        size="sm"
                        className="me-2"
                        onClick={() => {
                          handleOpenDetailsModal(table);
                          onClose();
                        }}
                      >
                        <FontAwesomeIcon icon={faInfoCircle} /> Detalhes
                      </Button>
                      {canLiberarMesa && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleLiberarMesa(table)}
                        >
                          Liberar Mesa
                        </Button>
                      )}
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(table._id)}
                      >
                        <FontAwesomeIcon icon={faTrash} /> Excluir
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <Button variant="secondary" onClick={handlePrevPage} disabled={currentPage === 1}>
            Anterior
          </Button>
          <span>
            Página {currentPage} de {totalPages}
          </span>
          <Button variant="secondary" onClick={handleNextPage} disabled={currentPage === totalPages}>
            Próxima
          </Button>
        </div>
      )}
    </>
  );
}

// =============================================================
// Componente principal TableList
// =============================================================
function TableList() {
  const gridSize = 20;

  // Estados de ambientes e mesas
  const [ambientes, setAmbientes] = useState([]);
  const [tablesByAmbiente, setTablesByAmbiente] = useState({});
  const [loadingAmbientes, setLoadingAmbientes] = useState(true);
  const [errorAmbientes, setErrorAmbientes] = useState(null);
  const [movementLocked, setMovementLocked] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeAmbiente, setActiveAmbiente] = useState('');
  const [showListModal, setShowListModal] = useState(false);

  // Estados para reservas
  const [currentReservationId, setCurrentReservationId] = useState(null);
  const [currentReservationDetails, setCurrentReservationDetails] = useState(null);

  // Estado para "tableToFree" e para o modal de confirmação
  const [tableToFree, setTableToFree] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Modal de Criação
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    numeroMesa: '',
    ambienteId: '',
    capacidade: 1,
    formato: 'quadrada'
  });
  const [creating, setCreating] = useState(false);

  // Modal de Edição
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    _id: '',
    numeroMesa: '',
    ambienteId: '',
    capacidade: 1,
    formato: 'quadrada'
  });
  const [updating, setUpdating] = useState(false);

  // Modal de Detalhes
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [pedidos, setPedidos] = useState([]);
  const [loadingPedidos, setLoadingPedidos] = useState(false);
  const [errorPedidos, setErrorPedidos] = useState(null);

  // Modal de Pedido
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null);

  // Modal de Reserva
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [reservationForm, setReservationForm] = useState({
    dataReserva: '',
    numeroPessoas: 1,
    nomeCliente: '',
    telefoneCliente: ''
  });
  const [creatingReservation, setCreatingReservation] = useState(false);

  // Estado para atualizar capacidade (no modal de detalhes)
  const [newCapacity, setNewCapacity] = useState(null);

  // Estados para DRE
  const [showDREModal, setShowDREModal] = useState(false);
  const [activeTab, setActiveTab] = useState('etapa1');
  const [qtdPeriodos, setQtdPeriodos] = useState(2);
  const [drePeriodos, setDrePeriodos] = useState([]);
  const [dreResultado, setDreResultado] = useState({});
  const dreRef = useRef(null);
  const contentRef = useRef(null);

  // Estado para lista de categorias (para DRE)
  const [listaCategoriasEmArvore, setListaCategoriasEmArvore] = useState([]);

  // ------------------------------------------------------------
  // Função para buscar configuração (movimentação, tema)
  // ------------------------------------------------------------
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await api.get('/config/', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const config = response.data;
        setMovementLocked(!config.draggable);
        setDarkMode(config.darkMode);
      } catch (err) {
        console.error('Erro ao buscar configuração:', err);
        toast.error('Erro ao buscar configuração.');
      }
    };
    fetchConfig();
  }, []);

  // ------------------------------------------------------------
  // Função para buscar ambientes e mesas
  // ------------------------------------------------------------
  useEffect(() => {
    fetchAmbientes();
  }, []);

  useEffect(() => {
    if (ambientes.length > 0 && !activeAmbiente) {
      setActiveAmbiente(ambientes[0]._id);
    }
  }, [ambientes, activeAmbiente]);

  const fetchAmbientes = async () => {
    setLoadingAmbientes(true);
    setErrorAmbientes(null);
    try {
      const ambientesRes = await api.get('/ambientes', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const loadedAmbientes = Array.isArray(ambientesRes.data) ? ambientesRes.data : [];
      setAmbientes(loadedAmbientes);
      await fetchTablesByAmbiente(loadedAmbientes);
    } catch (err) {
      console.error('Erro ao carregar ambientes:', err);
      setErrorAmbientes('Erro ao carregar ambientes.');
      toast.error('Erro ao carregar ambientes.');
    } finally {
      setLoadingAmbientes(false);
    }
  };

  const fetchTablesByAmbiente = async (ambientesList) => {
    try {
      const fetches = ambientesList.map((ambiente) =>
        api
          .get(`/tables/by-ambiente/${ambiente._id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
          .then((res) => ({
            ambienteId: ambiente._id,
            tables: res.data.tables
          }))
      );
      const results = await Promise.all(fetches);
      const newTablesByAmbiente = {};
      results.forEach(({ ambienteId, tables }) => {
        newTablesByAmbiente[ambienteId] = tables;
      });
      setTablesByAmbiente(newTablesByAmbiente);
    } catch (err) {
      console.error('Erro ao obter mesas por ambiente:', err);
      setErrorAmbientes('Erro ao obter mesas por ambiente.');
      toast.error('Erro ao obter mesas por ambiente.');
    }
  };

  // ------------------------------------------------------------
  // Funções para atualizar posição, tamanho e rotação
  // ------------------------------------------------------------
  const handleUpdateTablePosition = async (tableId, newX, newY) => {
    if (movementLocked) {
      toast.warn('Movimentação bloqueada.');
      return;
    }
    let ambienteId = '';
    let tableAtual = null;
    for (const amb of ambientes) {
      const mesa = tablesByAmbiente[amb._id]?.find((t) => t._id === tableId);
      if (mesa) {
        ambienteId = amb._id;
        tableAtual = mesa;
        break;
      }
    }
    if (!tableAtual) return;
    const currentPosicao = tableAtual.posicao?.[0] || {};
    try {
      await api.put(
        `/tables/${tableId}`,
        {
          posicao: [{
            _id: currentPosicao._id,
            pos_x: newX,
            pos_y: newY,
            width: currentPosicao.width,
            height: currentPosicao.height
          }]
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setTablesByAmbiente((prev) => ({
        ...prev,
        [ambienteId]: prev[ambienteId].map((t) =>
          t._id === tableId
            ? { ...t, posicao: [{ ...currentPosicao, pos_x: newX, pos_y: newY }] }
            : t
        )
      }));
    } catch (err) {
      console.error('Erro ao atualizar posição da mesa:', err);
      toast.error('Erro ao atualizar posição da mesa.');
    }
  };

  const handleUpdateTableSize = async (tableId, newWidth, newHeight) => {
    if (movementLocked) {
      toast.warn('Movimentação bloqueada.');
      return;
    }
    let ambienteId = '';
    let tableAtual = null;
    for (const amb of ambientes) {
      const mesa = tablesByAmbiente[amb._id]?.find((t) => t._id === tableId);
      if (mesa) {
        ambienteId = amb._id;
        tableAtual = mesa;
        break;
      }
    }
    if (!tableAtual) return;
    const currentPosicao = tableAtual.posicao?.[0] || {};
    try {
      await api.put(
        `/tables/${tableId}`,
        {
          posicao: [{
            _id: currentPosicao._id,
            pos_x: currentPosicao.pos_x,
            pos_y: currentPosicao.pos_y,
            width: newWidth,
            height: newHeight
          }]
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setTablesByAmbiente((prev) => ({
        ...prev,
        [ambienteId]: prev[ambienteId].map((t) =>
          t._id === tableId
            ? { ...t, posicao: [{ ...currentPosicao, width: newWidth, height: newHeight }] }
            : t
        )
      }));
    } catch (err) {
      console.error('Erro ao atualizar tamanho da mesa:', err);
      toast.error('Erro ao atualizar tamanho da mesa.');
    }
  };

  const handleUpdateTableRotation = async (tableId, newRotation) => {
    if (movementLocked) {
      toast.warn('Movimentação bloqueada.');
      return;
    }
    let ambienteId = '';
    let tableAtual = null;
    for (const amb of ambientes) {
      const mesa = tablesByAmbiente[amb._id]?.find((t) => t._id === tableId);
      if (mesa) {
        ambienteId = amb._id;
        tableAtual = mesa;
        break;
      }
    }
    if (!tableAtual) return;
    try {
      await api.put(
        `/tables/${tableId}`,
        { rotation: newRotation },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setTablesByAmbiente((prev) => ({
        ...prev,
        [ambienteId]: prev[ambienteId].map((t) =>
          t._id === tableId ? { ...t, rotation: newRotation } : t
        )
      }));
    } catch (err) {
      console.error('Erro ao atualizar rotação da mesa:', err);
      toast.error('Erro ao atualizar rotação da mesa.');
    }
  };

  // ------------------------------------------------------------
  // Função para alternar bloqueio de movimentação (toggle)
  // ------------------------------------------------------------
  const toggleMovementLock = async () => {
    const newLock = !movementLocked;
    setMovementLocked(newLock);
    try {
      await api.put(
        '/config/draggable',
        { draggable: !newLock },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('Configurações de movimentação atualizadas com sucesso!');
    } catch (err) {
      console.error('Erro ao atualizar configurações de movimentação:', err);
      toast.error('Erro ao atualizar configurações de movimentação.');
      setMovementLocked(!newLock);
    }
  };

  // ------------------------------------------------------------
  // Funções CRUD: Criar, Editar e Excluir Mesa
  // ------------------------------------------------------------
  const handleOpenCreateModal = () => {
    setCreateForm({
      numeroMesa: '',
      ambienteId: activeAmbiente || (ambientes.length > 0 ? ambientes[0]._id : ''),
      capacidade: 1,
      formato: 'quadrada'
    });
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => setShowCreateModal(false);

  const handleCreateFormChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = {
        numeroMesa: parseInt(createForm.numeroMesa, 10),
        ambienteId: createForm.ambienteId,
        capacidade: parseInt(createForm.capacidade, 10),
        formato: createForm.formato
      };
      await api.post('/tables', payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Mesa criada com sucesso!');
      setShowCreateModal(false);
      fetchTablesByAmbiente(ambientes);
    } catch (err) {
      console.error('Erro ao criar mesa:', err);
      const message = err.response?.data?.message || 'Erro ao criar mesa.';
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  const handleOpenEditModal = (table) => {
    setEditForm({
      _id: table._id,
      numeroMesa: table.numeroMesa,
      ambienteId: table.ambiente?._id || '',
      capacidade: table.capacidade,
      formato: table.formato || 'quadrada'
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => setShowEditModal(false);

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const payload = {
        numeroMesa: parseInt(editForm.numeroMesa, 10),
        ambienteId: editForm.ambienteId,
        capacidade: parseInt(editForm.capacidade, 10),
        formato: editForm.formato
      };
      await api.put(`/tables/${editForm._id}`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Mesa atualizada com sucesso!');
      setShowEditModal(false);
      fetchTablesByAmbiente(ambientes);
    } catch (err) {
      console.error('Erro ao atualizar mesa:', err);
      const message = err.response?.data?.message || 'Erro ao atualizar mesa.';
      toast.error(message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta mesa?')) return;
    try {
      let ambienteId = '';
      for (const amb of ambientes) {
        const mesa = tablesByAmbiente[amb._id]?.find((t) => t._id === id);
        if (mesa) {
          ambienteId = amb._id;
          break;
        }
      }
      await api.delete(`/tables/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTablesByAmbiente((prev) => ({
        ...prev,
        [ambienteId]: prev[ambienteId].filter((table) => table._id !== id)
      }));
      toast.success('Mesa excluída com sucesso!');
    } catch (err) {
      console.error('Erro ao excluir mesa:', err);
      toast.error('Erro ao excluir mesa.');
    }
  };

  const handleCancelReservation = async () => {
    if (!currentReservationId) return;
    if (!window.confirm('Tem certeza que deseja remover esta reserva?')) return;
    try {
      await api.put(
        `/reservations/${currentReservationId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('Reserva removida com sucesso!');
      setCurrentReservationId(null);
      setCurrentReservationDetails(null);
      fetchTablesByAmbiente(ambientes);
      handleOpenDetailsModal(selectedTable);
    } catch (err) {
      console.error('Erro ao remover reserva:', err);
      const message = err.response?.data?.message || 'Erro ao remover reserva.';
      toast.error(message);
    }
  };

  // ------------------------------------------------------------
  // Funções para Detalhes, Pedidos e Reservas
  // ------------------------------------------------------------
  const handleOpenDetailsModal = async (table) => {
    setSelectedTable(table);
    setSelectedTableId(table._id);
    setNewCapacity(table.capacidade);
    setShowDetailsModal(true);
    setLoadingPedidos(true);
    setErrorPedidos(null);
    setSelectedSeat(null);
    setCurrentReservationId(null);
    setCurrentReservationDetails(null);
    try {
      const response = await api.get(`/orders?mesaId=${table._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const activeOrders = Array.isArray(response.data.orders)
        ? response.data.orders.filter((o) => o.status.toLowerCase() !== 'finalizado')
        : [];
      setPedidos(activeOrders);
      if (table.status?.toLowerCase() === 'reservada') {
        const reservationsRes = await api.get('/reservations', {
          params: { mesaId: table._id },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const allRes = reservationsRes.data.reservations || [];
        const activeRes = allRes.find(
          (r) => r.mesa && r.mesa._id === table._id && r.status.toLowerCase() === 'ativa'
        );
        if (activeRes) {
          setCurrentReservationId(activeRes._id);
          setCurrentReservationDetails({
            dataReserva: activeRes.dataReserva,
            numeroPessoas: activeRes.numeroPessoas,
            nomeCliente: activeRes.nomeCliente,
            telefoneCliente: activeRes.telefoneCliente
          });
        }
      }
    } catch (err) {
      console.error('Erro ao buscar pedidos/reserva:', err);
      setErrorPedidos('Erro ao buscar pedidos ou reserva desta mesa.');
      toast.error('Erro ao buscar pedidos ou reserva desta mesa.');
    } finally {
      setLoadingPedidos(false);
    }
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedTable(null);
    setSelectedTableId(null);
    setPedidos([]);
    setErrorPedidos(null);
    setSelectedSeat(null);
    setNewCapacity(null);
    setCurrentReservationId(null);
    setCurrentReservationDetails(null);
  };

  // ------------------------------------------------------------
  // Funções para liberação de mesa
  // ------------------------------------------------------------
  const handleLiberarMesa = async (table) => {
    if (!window.confirm(`Tem certeza que deseja liberar a mesa ${table.numeroMesa}?`))
      return;
    try {
      await api.put(
        `/tables/${table._id}/status`,
        { status: 'livre' },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success(`Mesa ${table.numeroMesa} agora está livre!`);
      fetchTablesByAmbiente(ambientes);
    } catch (err) {
      console.error('Erro ao liberar mesa:', err);
      const message = err.response?.data?.message || 'Erro ao liberar mesa.';
      toast.error(message);
    }
  };

  const handleSetStatusLivre = (table) => {
    setTableToFree(table);
    setShowConfirmModal(true);
  };

  const confirmSetStatusLivre = async () => {
    if (!tableToFree) return;
    try {
      await api.put(
        `/tables/${tableToFree._id}/status`,
        { status: 'livre' },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('Status da mesa atualizado para "Livre" com sucesso!');
      fetchTablesByAmbiente(ambientes);
      setShowConfirmModal(false);
      setTableToFree(null);
    } catch (err) {
      console.error('Erro ao atualizar status da mesa:', err);
      toast.error('Erro ao atualizar status.');
      setShowConfirmModal(false);
      setTableToFree(null);
    }
  };

  const cancelSetStatusLivre = () => {
    setShowConfirmModal(false);
    setTableToFree(null);
  };

  // ------------------------------------------------------------
  // Funções para pedidos – encapsuladas
  // ------------------------------------------------------------
  const handleMakeOrderFromFreeTableWrapper = (table) => {
    if (table.status.toLowerCase() === 'suja') {
      toast.error("Mesa suja. Liberar mesa antes de realizar pedido.");
      return;
    }
    try {
      api.put(
        `/tables/${table._id}/status`,
        { status: 'ocupada' },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('Mesa agora está ocupada, pode fazer o pedido!');
      fetchTablesByAmbiente(ambientes);
      handleOpenDetailsModal(table);
      setSelectedSeat(null);
      setShowOrderModal(true);
    } catch (err) {
      console.error('Erro ao mudar status da mesa para ocupada:', err);
      toast.error('Erro ao mudar status da mesa.');
    }
  };

  const handleMakeOrderFromReservedTableWrapper = () => {
    if (!selectedTable) return;
    if (selectedTable.status.toLowerCase() === 'suja') {
      toast.error("Mesa suja. Liberar mesa antes de realizar pedido.");
      return;
    }
    try {
      api.put(
        `/tables/${selectedTable._id}/status`,
        { status: 'ocupada' },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('Mesa agora está ocupada, pode fazer o pedido!');
      fetchTablesByAmbiente(ambientes);
      handleOpenDetailsModal(selectedTable);
      setSelectedSeat(null);
      setShowOrderModal(true);
    } catch (err) {
      console.error('Erro ao mudar status da mesa para ocupada:', err);
      toast.error('Erro ao mudar status da mesa.');
    }
  };

  // ------------------------------------------------------------
  // Funções para reservas
  // ------------------------------------------------------------
  const handleOpenReservationModal = () => {
    setReservationForm({
      dataReserva: '',
      numeroPessoas: 1,
      nomeCliente: '',
      telefoneCliente: ''
    });
    setShowReservationModal(true);
  };

  const handleCloseReservationModal = () => {
    setShowReservationModal(false);
  };

  const handleReservationFormChange = (e) => {
    const { name, value } = e.target;
    setReservationForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateReservation = async (e) => {
    e.preventDefault();
    if (!selectedTableId) return;
    setCreatingReservation(true);
    try {
      const payload = {
        mesaId: selectedTableId,
        dataReserva: reservationForm.dataReserva,
        numeroPessoas: parseInt(reservationForm.numeroPessoas, 10),
        nomeCliente: reservationForm.nomeCliente,
        telefoneCliente: reservationForm.telefoneCliente
      };
      await api.post('/reservations', payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Reserva criada com sucesso!');
      setShowReservationModal(false);
      fetchTablesByAmbiente(ambientes);
      handleOpenDetailsModal(selectedTable);
    } catch (err) {
      console.error('Erro ao criar reserva:', err);
      const message = err.response?.data?.message || 'Erro ao criar reserva.';
      toast.error(message);
    } finally {
      setCreatingReservation(false);
    }
  };

  // ------------------------------------------------------------
  // Funções para DRE (comparativo fiscal consolidado)
  // ------------------------------------------------------------
  const handleCreatePeriods = () => {
    const arr = [];
    for (let i = 0; i < qtdPeriodos; i++) {
      arr.push({
        label: `Período ${i + 1}`,
        dataInicial: '',
        dataFinal: '',
        categoriasSelecionadas: [],
      });
    }
    setDrePeriodos(arr);
    setActiveTab('etapa2');
  };

  const handleChangeLabel = (idx, value) => {
    setDrePeriodos((prev) => {
      const arr = [...prev];
      arr[idx].label = value;
      return arr;
    });
  };

  const handleChangeDataInicial = (idx, value) => {
    setDrePeriodos((prev) => {
      const arr = [...prev];
      arr[idx].dataInicial = value;
      return arr;
    });
  };

  const handleChangeDataFinal = (idx, value) => {
    setDrePeriodos((prev) => {
      const arr = [...prev];
      arr[idx].dataFinal = value;
      return arr;
    });
  };

  const handleToggleCategoria = (periodoIndex, catIdStr) => {
    setDrePeriodos((prev) =>
      prev.map((periodo, idx) => {
        if (idx !== periodoIndex) return periodo;
        const selected = periodo.categoriasSelecionadas;
        if (selected.includes(catIdStr)) {
          return { ...periodo, categoriasSelecionadas: selected.filter((id) => id !== catIdStr) };
        } else {
          return { ...periodo, categoriasSelecionadas: [...selected, catIdStr] };
        }
      })
    );
  };

  const handleGerarDRE = async () => {
    await gerarDREComparativo(drePeriodos, setDreResultado, setActiveTab);
  };

  const handleExportarPDFDRE = async () => {
    await exportarPDFDRE(dreRef);
  };

  // ------------------------------------------------------------
  // Renderização do Modal de DRE usando Tabs
  // ------------------------------------------------------------
  const renderDREModalContent = () => {
    return (
      <Tabs
        id="dre-steps-tabs"
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k || 'etapa1')}
        className="mb-3"
      >
        <Tab eventKey="etapa1" title="Etapa 1">
          <Form.Group className="my-3">
            <Form.Label>Quantidade de períodos</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={qtdPeriodos}
              onChange={(e) => setQtdPeriodos(parseInt(e.target.value) || 1)}
            />
          </Form.Group>
          <div className="text-end">
            <Button variant="primary" onClick={handleCreatePeriods}>
              Próximo
            </Button>
          </div>
        </Tab>
        <Tab eventKey="etapa2" title="Etapa 2">
          {drePeriodos.map((p, idx) => (
            <div key={idx} className="mb-3 p-2 border rounded">
              <Form.Group className="mb-2">
                <Form.Label>Label do Período #{idx + 1}</Form.Label>
                <Form.Control
                  type="text"
                  value={p.label}
                  onChange={(e) => handleChangeLabel(idx, e.target.value)}
                />
              </Form.Group>
              <Row>
                <Col>
                  <Form.Group>
                    <Form.Label>Data Inicial</Form.Label>
                    <Form.Control
                      type="date"
                      value={p.dataInicial}
                      onChange={(e) => handleChangeDataInicial(idx, e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group>
                    <Form.Label>Data Final</Form.Label>
                    <Form.Control
                      type="date"
                      value={p.dataFinal}
                      onChange={(e) => handleChangeDataFinal(idx, e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
          ))}
          <div className="text-end">
            <Button variant="secondary" onClick={() => setActiveTab('etapa1')}>
              Voltar
            </Button>
            <Button variant="primary" className="ms-2" onClick={() => setActiveTab('etapa3')}>
              Próximo
            </Button>
          </div>
        </Tab>
        <Tab eventKey="etapa3" title="Etapa 3">
          {drePeriodos.map((p, idx) => (
            <div key={idx} className="mb-3 p-2 border rounded">
              <h6>{p.label}</h6>
              <p>
                {p.dataInicial} até {p.dataFinal}
              </p>
              {listaCategoriasEmArvore.length === 0 ? (
                <Alert variant="info">Nenhuma categoria disponível.</Alert>
              ) : (
                <div className="ms-2">
                  <CheckableCategoryTree
                    categories={listaCategoriasEmArvore}
                    selectedCategories={p.categoriasSelecionadas}
                    handleCheck={(catIdStr) => handleToggleCategoria(idx, catIdStr)}
                  />
                </div>
              )}
            </div>
          ))}
          <div className="text-end">
            <Button variant="secondary" onClick={() => setActiveTab('etapa2')}>
              Voltar
            </Button>
            <Button variant="primary" className="ms-2" onClick={() => setActiveTab('etapa4')}>
              Próximo
            </Button>
          </div>
        </Tab>
        <Tab eventKey="etapa4" title="Etapa 4">
          {drePeriodos.map((p, idx) => (
            <div key={idx} className="mb-3 border rounded p-2">
              <h6>{p.label}</h6>
              <p>
                {p.dataInicial} até {p.dataFinal}
              </p>
              <p>
                <strong>Categorias Selecionadas:</strong>
              </p>
              <ul>
                {p.categoriasSelecionadas.length > 0
                  ? p.categoriasSelecionadas.map((id) => {
                      const cat = findCategoriaById(id, listaCategoriasEmArvore);
                      return <li key={id}>{cat ? cat.nome : id}</li>;
                    })
                  : <li>Nenhuma selecionada</li>}
              </ul>
            </div>
          ))}
          <div className="text-end">
            <Button variant="secondary" onClick={() => setActiveTab('etapa3')}>
              Voltar
            </Button>
            <Button variant="primary" className="ms-2" onClick={handleGerarDRE}>
              Gerar DRE
            </Button>
          </div>
        </Tab>
        <Tab eventKey="resultado" title="Resultado">
          {(() => {
            let periodo1, periodo2;
            if (Array.isArray(dreResultado)) {
              periodo1 = dreResultado[0];
              periodo2 = dreResultado[1];
            } else {
              periodo1 = dreResultado.periodo1;
              periodo2 = dreResultado.periodo2;
            }
            if (!periodo1 || !periodo2) {
              return <Alert variant="info">O DRE não possui dados para exibir.</Alert>;
            }
            return (
              <div ref={dreRef} style={{ minHeight: '500px', fontSize: '0.9rem' }}>
                <h5 className="mb-3">DRE Fiscal Comparativo Consolidado</h5>
                <Table striped bordered>
                  <thead>
                    <tr>
                      <th>Grupo</th>
                      <th>{periodo1.label}</th>
                      <th>{periodo2.label}</th>
                      <th>Diferença (Valor)</th>
                      <th>Diferença (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['Receitas', 'Despesas', 'Saldo'].map((grupo) => {
                      let valor1 = 0, valor2 = 0;
                      if (grupo === 'Receitas') {
                        valor1 = periodo1.totalReceitas;
                        valor2 = periodo2.totalReceitas;
                      } else if (grupo === 'Despesas') {
                        valor1 = periodo1.totalDespesas;
                        valor2 = periodo2.totalDespesas;
                      } else if (grupo === 'Saldo') {
                        valor1 = periodo1.saldo;
                        valor2 = periodo2.saldo;
                      }
                      const diff = valor2 - valor1;
                      const pct = valor1 !== 0 ? ((diff / valor1) * 100).toFixed(2) : 'N/A';
                      return (
                        <tr key={grupo}>
                          <td>{grupo}</td>
                          <td>R$ {formatarValorBR(valor1)}</td>
                          <td>R$ {formatarValorBR(valor2)}</td>
                          <td>R$ {formatarValorBR(diff)}</td>
                          <td>{pct !== 'N/A' ? `${pct}%` : 'N/A'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
                <div className="text-end mt-3">
                  <Button variant="outline-success" onClick={handleExportarPDFDRE}>
                    <FontAwesomeIcon icon={faSearch} /> Exportar PDF (DRE)
                  </Button>
                </div>
              </div>
            );
          })()}
        </Tab>
      </Tabs>
    );
  };

  // ------------------------------------------------------------
  // Renderização principal do componente
  // ------------------------------------------------------------
  return (
    <DndProvider backend={HTML5Backend}>
      <Container className="mt-4">
        {/* Cabeçalho e Botões */}
        <Row className="mb-3">
          <Col xs={12} md={6}>
            <h2>Layout de Mesas</h2>
          </Col>
          <Col xs={12} md={6} className="text-md-end mt-2 mt-md-0">
            <Button variant="primary" onClick={handleOpenCreateModal} className="me-2" disabled={movementLocked}>
              Nova Mesa
            </Button>
            <Button variant={movementLocked ? 'secondary' : 'warning'} onClick={toggleMovementLock} className="me-2">
              {movementLocked ? (
                <FontAwesomeIcon icon={faLock} /> 
              ) : (
                <>
                  <FontAwesomeIcon icon={faLockOpen} /> Bloquear Movimentação
                </>
              )}
            </Button>
            <Button variant="info" onClick={() => setShowListModal(true)}>
              Ver Lista de Mesas
            </Button>
          </Col>
        </Row>

        {/* Renderização dos ambientes e mesas */}
        {loadingAmbientes ? (
          <div className="text-center my-5">
            <Spinner animation="border" variant="primary" />
            <div>Carregando ambientes...</div>
          </div>
        ) : errorAmbientes ? (
          <Alert variant="danger">{errorAmbientes}</Alert>
        ) : ambientes.length === 0 ? (
          <Alert variant="info">Nenhum ambiente encontrado.</Alert>
        ) : (
          <>
            {/* Omitindo a aba cujo nome seja "entrega" */}
            <Tabs activeKey={activeAmbiente} onSelect={(k) => setActiveAmbiente(k)} className="mb-3">
              {ambientes
                .filter((amb) => amb.nome.toLowerCase() !== 'entrega')
                .map((amb) => {
                  const freeCount =
                    tablesByAmbiente[amb._id]?.filter(
                      (t) => (t.status || '').toLowerCase() === 'livre'
                    ).length || 0;
                  return (
                    <Tab
                      eventKey={amb._id}
                      key={amb._id}
                      title={`${amb.nome} (${freeCount} livres)`}
                    />
                  );
                })}
            </Tabs>
            <DropContainer
              movementLocked={movementLocked}
              onDrop={(id, newX, newY) => handleUpdateTablePosition(id, newX, newY)}
              gridSize={gridSize}
              darkMode={darkMode}
            >
              {ambientes.map((amb) => {
                const tablesThisAmb = tablesByAmbiente[amb._id] || [];
                if (amb._id !== activeAmbiente) return null;
                return (
                  <div key={amb._id} style={{ position: 'relative', width: '100%', height: '100%' }}>
                    {tablesThisAmb.map((table) => (
                      <DraggableTable
                        key={table._id}
                        table={table}
                        movementLocked={movementLocked}
                        onClick={handleOpenDetailsModal}
                        onResize={handleUpdateTableSize}
                        onRotate={handleUpdateTableRotation}
                        gridSize={gridSize}
                        darkMode={darkMode}
                      />
                    ))}
                  </div>
                );
              })}
            </DropContainer>
          </>
        )}

        {/* Modal de Criação de Mesa */}
        <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Nova Mesa</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleCreateSubmit}>
              <Form.Group className="mb-3" controlId="numeroMesaCreate">
                <Form.Label>Número da Mesa</Form.Label>
                <Form.Control
                  type="number"
                  name="numeroMesa"
                  value={createForm.numeroMesa}
                  onChange={handleCreateFormChange}
                  required
                  min="1"
                  disabled={movementLocked}
                  placeholder="Ex: 1"
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="ambienteIdCreate">
                <Form.Label>Ambiente</Form.Label>
                <Form.Select
                  name="ambienteId"
                  value={createForm.ambienteId}
                  onChange={handleCreateFormChange}
                  required
                  disabled={movementLocked}
                >
                  <option value="">Selecione um Ambiente</option>
                  {ambientes.map((ambiente) => (
                    <option key={ambiente._id} value={ambiente._id}>
                      {ambiente.nome}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3" controlId="capacidadeCreate">
                <Form.Label>Capacidade</Form.Label>
                <Form.Control
                  type="number"
                  name="capacidade"
                  value={createForm.capacidade}
                  onChange={handleCreateFormChange}
                  required
                  min="1"
                  disabled={movementLocked}
                  placeholder="Ex: 4"
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formatoCreate">
                <Form.Label>Formato</Form.Label>
                <Form.Select
                  name="formato"
                  value={createForm.formato}
                  onChange={handleCreateFormChange}
                  required
                  disabled={movementLocked}
                >
                  <option value="quadrada">Quadrada</option>
                  <option value="circular">Circular</option>
                </Form.Select>
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button variant="secondary" onClick={() => setShowCreateModal(false)} className="me-2" disabled={movementLocked || creating}>
                  Cancelar
                </Button>
                <Button variant="primary" type="submit" disabled={creating || movementLocked}>
                  {creating ? 'Salvando...' : 'Criar Mesa'}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Modal de Edição de Mesa */}
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Editar Mesa</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleEditSubmit}>
              <Form.Group className="mb-3" controlId="numeroMesaEdit">
                <Form.Label>Número da Mesa</Form.Label>
                <Form.Control
                  type="number"
                  name="numeroMesa"
                  value={editForm.numeroMesa}
                  onChange={handleEditFormChange}
                  required
                  min="1"
                  disabled={movementLocked}
                  placeholder="Ex: 1"
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="ambienteIdEdit">
                <Form.Label>Ambiente</Form.Label>
                <Form.Select
                  name="ambienteId"
                  value={editForm.ambienteId}
                  onChange={handleEditFormChange}
                  required
                  disabled={movementLocked}
                >
                  <option value="">Selecione um Ambiente</option>
                  {ambientes.map((ambiente) => (
                    <option key={ambiente._id} value={ambiente._id}>
                      {ambiente.nome}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3" controlId="capacidadeEdit">
                <Form.Label>Capacidade</Form.Label>
                <Form.Control
                  type="number"
                  name="capacidade"
                  value={editForm.capacidade}
                  onChange={handleEditFormChange}
                  required
                  min="1"
                  disabled={movementLocked}
                  placeholder="Ex: 4"
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formatoEdit">
                <Form.Label>Formato</Form.Label>
                <Form.Select
                  name="formato"
                  value={editForm.formato}
                  onChange={handleEditFormChange}
                  required
                  disabled={movementLocked}
                >
                  <option value="quadrada">Quadrada</option>
                  <option value="circular">Circular</option>
                </Form.Select>
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button variant="secondary" onClick={() => setShowEditModal(false)} className="me-2" disabled={movementLocked || updating}>
                  Cancelar
                </Button>
                <Button variant="primary" type="submit" disabled={updating || movementLocked}>
                  {updating ? 'Salvando...' : 'Atualizar Mesa'}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Modal de Detalhes da Mesa */}
        <TableDetailsModal
          show={showDetailsModal}
          handleClose={handleCloseDetailsModal}
          tableId={selectedTableId}
          onReservationDetails={(id, details) => {
            setCurrentReservationId(id);
            setCurrentReservationDetails(details);
          }}
          handleOpenReservationModal={handleOpenReservationModal}
          handleMakeOrderFromFreeTable={handleMakeOrderFromFreeTableWrapper}
          handleCancelReservation={handleCancelReservation}
          handleMakeOrderFromReservedTable={handleMakeOrderFromReservedTableWrapper}
          movementLocked={movementLocked}
          setSelectedSeat={setSelectedSeat}
          setShowOrderModal={setShowOrderModal}
          refreshTables={fetchTablesByAmbiente}
        />

        {/* Modal de Confirmação para Liberar Mesa */}
        <Modal show={showConfirmModal} onHide={cancelSetStatusLivre} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirmar Liberar Mesa</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {tableToFree && (
              <p>
                Tem certeza que deseja definir a mesa <strong>{tableToFree.numeroMesa}</strong> como "Livre"?
              </p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={cancelSetStatusLivre}>
              Cancelar
            </Button>
            <Button variant="success" onClick={confirmSetStatusLivre}>
              Confirmar
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal de Listagem de Mesas */}
        <Modal show={showListModal} onHide={() => setShowListModal(false)} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>Lista de Mesas</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <TableListing
              tables={activeAmbiente ? tablesByAmbiente[activeAmbiente] || [] : []}
              loading={loadingAmbientes}
              error={errorAmbientes}
              handleDelete={handleDelete}
              handleOpenDetailsModal={handleOpenDetailsModal}
              handleLiberarMesa={handleLiberarMesa}
              onClose={() => setShowListModal(false)}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowListModal(false)}>
              Fechar
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal para Criar Reserva */}
        <Modal show={showReservationModal} onHide={handleCloseReservationModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>Criar Reserva (Mesa {selectedTable?.numeroMesa})</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleCreateReservation}>
              <Form.Group className="mb-3" controlId="dataReserva">
                <Form.Label>Data e Hora da Reserva</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="dataReserva"
                  value={reservationForm.dataReserva}
                  onChange={handleReservationFormChange}
                  required
                  min={new Date().toISOString().slice(0, 16)}
                  placeholder="Selecione a data e hora"
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="numeroPessoas">
                <Form.Label>Número de Pessoas</Form.Label>
                <Form.Control
                  type="number"
                  name="numeroPessoas"
                  value={reservationForm.numeroPessoas}
                  onChange={handleReservationFormChange}
                  required
                  min="1"
                  placeholder="Ex: 4"
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="nomeCliente">
                <Form.Label>Nome do Cliente</Form.Label>
                <Form.Control
                  type="text"
                  name="nomeCliente"
                  value={reservationForm.nomeCliente}
                  onChange={handleReservationFormChange}
                  required
                  placeholder="Ex: João Silva"
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="telefoneCliente">
                <Form.Label>Telefone</Form.Label>
                <Form.Control
                  type="text"
                  name="telefoneCliente"
                  value={reservationForm.telefoneCliente}
                  onChange={handleReservationFormChange}
                  required
                  placeholder="Ex: (11) 99999-9999"
                />
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button variant="secondary" onClick={handleCloseReservationModal} className="me-2">
                  Cancelar
                </Button>
                <Button variant="primary" type="submit" disabled={creatingReservation}>
                  {creatingReservation ? 'Criando...' : 'Criar Reserva'}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Modal DRE – Usando Tabs */}
        <Modal show={showDREModal} onHide={() => setShowDREModal(false)} size="lg" centered backdrop="static" keyboard={false}>
          <Modal.Header closeButton>
            <Modal.Title>DRE Comparativo Fiscal</Modal.Title>
          </Modal.Header>
          <Modal.Body>{renderDREModalContent()}</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDREModal(false)}>
              Fechar
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </DndProvider>
  );
}

export default TableList;
