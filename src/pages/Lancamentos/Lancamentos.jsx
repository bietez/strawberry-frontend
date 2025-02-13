// src/pages/Lancamentos/Lancamentos.jsx

import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
  Modal,
  Alert,
  Card,
  Badge,
  Spinner,
  Tabs,
  Tab,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import {
  FaEdit,
  FaTrash,
  FaSearch,
  FaPlus,
  FaDownload,
  FaCalculator,
  FaLayerGroup,
} from 'react-icons/fa';
import api from '../../services/api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import styles from './Lancamentos.module.css';

/* ================================================================
   COMPONENTE: CheckableCategoryTree
   - Exibe uma árvore de categorias usando checkboxes.
   ================================================================ */
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

/* ================================================================
   FUNÇÕES AUXILIARES DE DRE
   ================================================================ */

// Busca recursivamente uma categoria pelo ID
function findCategoriaById(id, categories) {
  const idStr = String(id);
  for (const cat of categories) {
    if (String(cat._id) === idStr) return cat;
    if (cat.children && cat.children.length > 0) {
      const found = findCategoriaById(idStr, cat.children);
      if (found) return found;
    }
  }
  return null;
}

// Função para gerar o DRE comparativo via API
async function gerarDREComparativo(drePeriodos, setDreResultado, setActiveTab) {
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
    setDreResultado(res.data.periodos || []);
    setActiveTab('resultado');
    toast.success('DRE gerado com sucesso!');
  } catch (err) {
    toast.error('Erro ao gerar DRE');
    console.error(err);
  }
}

// Função para exportar o DRE para PDF
async function exportarPDFDRE(dreRef) {
  if (!dreRef.current) {
    toast.error('Nenhum DRE para exportar.');
    return;
  }
  try {
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
}

/* ================================================================
   COMPONENTE PRINCIPAL: Lancamentos
   ================================================================ */
const Lancamentos = () => {
  /* ------------------------------------------------------------------
   *                          ESTADOS
   * ------------------------------------------------------------------ */
  const [lancamentos, setLancamentos] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filtros
  const [search, setSearch] = useState('');
  const [tipo, setTipo] = useState('');
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');
  const [clienteFornecedor, setClienteFornecedor] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');

  // Novo/Editar Lançamento
  const [showModal, setShowModal] = useState(false);
  const [modalTipo, setModalTipo] = useState('Receita');
  const [modalLanc, setModalLanc] = useState({
    tipo: 'Receita',
    clienteFornecedor: '',
    descricao: '',
    categoria: '',
    data: '',
    valor: 0,
    nomeFuncionario: '',
    observacao: '',
  });
  const [editingId, setEditingId] = useState(null);

  // Resumo
  const [resumo, setResumo] = useState({
    totalReceitas: 0,
    totalDespesas: 0,
    saldo: 0,
  });

  // Equipe
  const [teamMembers, setTeamMembers] = useState([]);

  // Vales
  const [showValesModal, setShowValesModal] = useState(false);
  const [vales, setVales] = useState([]);
  const [loadingVales, setLoadingVales] = useState(false);

  // Modal Categorias
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [novaCategoria, setNovaCategoria] = useState({
    nome: '',
    tipo: 'Receita',
    parent: null,
  });

  // Lista de Categorias em Árvore
  const [listaCategoriasEmArvore, setListaCategoriasEmArvore] = useState([]);

  // DRE – Usando abas para as etapas
  const [showDREModal, setShowDREModal] = useState(false);
  const [activeTab, setActiveTab] = useState('etapa1'); // 'etapa1', 'etapa2', 'etapa3', 'etapa4', 'resultado'
  const [qtdPeriodos, setQtdPeriodos] = useState(2);
  const [drePeriodos, setDrePeriodos] = useState([]);
  const [dreResultado, setDreResultado] = useState([]);

  // Refs para exportar PDF
  const dreRef = useRef(null);
  const contentRef = useRef(null);

  /* ------------------------------------------------------------------
   *                          USE EFFECTS
   * ------------------------------------------------------------------ */
  useEffect(() => {
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    const formato = (dt) => dt.toISOString().split('T')[0];
    setDataInicial(formato(primeiroDia));
    setDataFinal(formato(ultimoDia));
  }, []);

  useEffect(() => {
    if (dataInicial && dataFinal) {
      listarLancamentos();
      obterResumo();
    }
  }, [page, search, tipo, dataInicial, dataFinal, clienteFornecedor, filtroCategoria]);

  useEffect(() => {
    carregarTeamMembers();
    carregarCategoriasEmArvore();
  }, []);

  useEffect(() => {
    if (dataInicial && dataFinal) {
      importarFinalizedTables();
    }
  }, [dataInicial, dataFinal]);

  /* ------------------------------------------------------------------
   *                          FUNÇÕES
   * ------------------------------------------------------------------ */
  const listarLancamentos = async () => {
    try {
      const params = {
        page,
        limit: 50,
        search,
        tipo,
        dataInicial,
        dataFinal,
        clienteFornecedor,
        categoria: filtroCategoria,
      };
      const res = await api.get('/lancamentos', { params });
      setLancamentos(res.data.lancamentos || []);
      setPage(res.data.currentPage || 1);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      toast.error('Erro ao listar lançamentos.');
      console.error(error);
    }
  };

  const obterResumo = async () => {
    try {
      const params = { dataInicial, dataFinal };
      const res = await api.get('/lancamentos/summary/resumo', { params });
      setResumo(res.data);
    } catch (error) {
      toast.error('Erro ao obter resumo.');
      console.error(error);
    }
  };

  const carregarTeamMembers = async () => {
    try {
      const res = await api.get('/users/team-members');
      setTeamMembers(res.data || []);
    } catch (err) {
      console.error('Erro ao carregar funcionários:', err);
    }
  };

  const carregarCategoriasEmArvore = async () => {
    try {
      const res = await api.get('/categorias/arvore');
      setListaCategoriasEmArvore(res.data || []);
    } catch (err) {
      console.error('Erro ao carregar categorias em árvore:', err);
    }
  };

  const importarFinalizedTables = async () => {
    try {
      const params = {};
      if (dataInicial) params.dataInicial = dataInicial;
      if (dataFinal) params.dataFinal = dataFinal;
      const res = await api.get('/finalized-tables', { params });
      const finalizedList = res.data.finalized || [];
      let importedCount = 0;
      for (const item of finalizedList) {
        const dup = await api.get(`/lancamentos/check-duplicate?importId=${item._id}`);
        if (dup.data.found) continue;
        const novaCategoria = await obterCategoriaIdPorNome('Mesas Finalizadas', 'Receita');
        if (!novaCategoria) continue;
        const novo = {
          tipo: 'Receita',
          importId: item._id,
          importSource: 'finalized-tables',
          clienteFornecedor: item.garcomId?.nome || `Mesa #${item.numeroMesa}`,
          descricao: `Finalized table #${item._id}`,
          categoria: novaCategoria,
          data: item.dataFinalizacao
            ? new Date(item.dataFinalizacao).toISOString()
            : new Date().toISOString(),
          valor: item.valorTotal ?? 0,
        };
        await api.post('/lancamentos', novo);
        importedCount++;
      }
      if (importedCount > 0) {
        toast.success(`Importação finalizada. ${importedCount} novos lançamentos.`);
        listarLancamentos();
        obterResumo();
      }
    } catch (error) {
      toast.error('Erro ao importar finalized-tables.');
      console.error(error);
    }
  };

  const obterCategoriaIdPorNome = async (nome, tipo) => {
    try {
      const res = await api.get('/categorias', { params: { nome, tipo } });
      if (res.data.length > 0) {
        return String(res.data[0]._id);
      } else {
        const nova = await api.post('/categorias', { nome, tipo });
        return String(nova.data.categoria._id);
      }
    } catch (err) {
      console.error('Erro ao obter/criar categoria:', err);
      return null;
    }
  };

  const abrirModal = (modo, lanc = null) => {
    setModalTipo(modo);
    if (lanc) {
      setEditingId(lanc._id);
      const dataFormatada = lanc.data ? new Date(lanc.data).toISOString().split('T')[0] : '';
      setModalLanc({
        tipo: lanc.tipo || 'Despesa',
        clienteFornecedor: lanc.clienteFornecedor ?? '',
        descricao: lanc.descricao ?? '',
        categoria: lanc.categoria?._id ? String(lanc.categoria._id) : '',
        data: dataFormatada,
        valor: lanc.valor ?? 0,
        nomeFuncionario: lanc.nomeFuncionario ?? '',
        observacao: lanc.observacao || '',
      });
    } else {
      setEditingId(null);
      setModalLanc({
        tipo: modo,
        clienteFornecedor: '',
        descricao: '',
        categoria: '',
        data: '',
        valor: 0,
        nomeFuncionario: '',
        observacao: '',
      });
    }
    setShowModal(true);
  };

  const fecharModal = () => {
    setShowModal(false);
  };

  const salvarLancamento = async () => {
    try {
      if (!modalLanc.data) {
        toast.error('Data é obrigatória!');
        return;
      }
      if (!modalLanc.valor) {
        toast.error('Valor é obrigatória!');
        return;
      }
      if (modalLanc.tipo === 'Receita') {
        setModalLanc((prev) => ({ ...prev, nomeFuncionario: '' }));
      } else {
        if (!modalLanc.categoria) {
          toast.error('Selecione a categoria para a Despesa!');
          return;
        }
      }
      if (editingId) {
        await api.put(`/lancamentos/${editingId}`, modalLanc);
        toast.success('Lançamento atualizado!');
      } else {
        await api.post('/lancamentos', modalLanc);
        toast.success('Lançamento criado!');
      }
      fecharModal();
      listarLancamentos();
      obterResumo();
    } catch (error) {
      toast.error('Erro ao salvar lançamento.');
      console.error(error);
    }
  };

  const excluirLancamento = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este lançamento?')) return;
    try {
      await api.delete(`/lancamentos/${id}`);
      toast.success('Lançamento excluído!');
      listarLancamentos();
      obterResumo();
    } catch (error) {
      toast.error('Erro ao excluir lançamento.');
      console.error(error);
    }
  };

  const abrirValesModal = async () => {
    try {
      setShowValesModal(true);
      setLoadingVales(true);
      function findCatVale(arr) {
        for (const c of arr) {
          if (c.nome === 'Vale Funcionários') return c;
          if (c.children && c.children.length > 0) {
            const found = findCatVale(c.children);
            if (found) return found;
          }
        }
        return null;
      }
      const catVale = findCatVale(listaCategoriasEmArvore);
      if (!catVale) {
        toast.error('Categoria "Vale Funcionários" não encontrada.');
        setLoadingVales(false);
        return;
      }
      const params = { tipo: 'Despesa', categoria: catVale._id, dataInicial, dataFinal };
      const res = await api.get('/lancamentos', { params });
      setVales(res.data.lancamentos || []);
      setLoadingVales(false);
    } catch (err) {
      toast.error('Erro ao carregar vales dos funcionários.');
      console.error(err);
      setLoadingVales(false);
    }
  };

  const fecharValesModal = () => {
    setShowValesModal(false);
    setVales([]);
  };

  function renderCategoryOptions(arvore, level = 0) {
    const indent = '  '.repeat(level);
    return arvore.flatMap((cat) => {
      const option = (
        <option key={cat._id} value={cat._id}>
          {indent + cat.nome}
        </option>
      );
      let childOptions = [];
      if (cat.children && cat.children.length > 0) {
        childOptions = renderCategoryOptions(cat.children, level + 1);
      }
      return [option, ...childOptions];
    });
  }

  const formatarValorBR = (valor) => {
    return (valor ?? 0).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const abrirCategoriaModal = () => {
    setNovaCategoria({ nome: '', tipo: 'Receita', parent: null });
    setShowCategoriaModal(true);
  };

  const fecharCategoriaModal = () => {
    setShowCategoriaModal(false);
  };

  const salvarCategoria = async () => {
    try {
      if (!novaCategoria.nome.trim()) {
        toast.error('Nome da categoria é obrigatória.');
        return;
      }
      const body = { nome: novaCategoria.nome.trim(), tipo: novaCategoria.tipo, parent: novaCategoria.parent || null };
      await api.post('/categorias', body);
      toast.success('Categoria criada com sucesso!');
      fecharCategoriaModal();
      carregarCategoriasEmArvore();
    } catch (err) {
      toast.error('Erro ao criar categoria.');
      console.error(err);
    }
  };

  const excluirCategoria = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) return;
    try {
      await api.delete(`/categorias/${id}`);
      toast.success('Categoria excluída!');
      carregarCategoriasEmArvore();
    } catch (err) {
      toast.error('Erro ao excluir categoria.');
      console.error(err);
    }
  };

  const exportarPDF = async () => {
    try {
      if (!contentRef.current) {
        toast.error('Conteúdo não encontrado para exportar.');
        return;
      }
      const canvas = await html2canvas(contentRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);
      pdf.save(`lancamentos_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Exportado PDF com sucesso!');
    } catch (err) {
      toast.error('Falha ao exportar para PDF.');
      console.error(err);
    }
  };

  /* ================================================================
     FUNÇÕES PARA O DRE – USANDO ABAS
     ================================================================ */
  // Aba 1: Criação dos períodos
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

  // Aba 2: Atualiza rótulo e datas
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

  // Aba 3: Seleção de categorias com checkboxes
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

  // Aba 4 → 5: Gera o DRE comparativo
  const handleGerarDRE = async () => {
    await gerarDREComparativo(drePeriodos, setDreResultado, setActiveTab);
  };

  // Aba "Resultado": Exporta o DRE para PDF
  const handleExportarPDFDRE = async () => {
    await exportarPDFDRE(dreRef);
  };

  /* ================================================================
     RENDERIZAÇÃO DO MODAL DE DRE USANDO TABS
     ================================================================ */
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
          {dreResultado.length === 0 ? (
            <Alert variant="info">Nenhum resultado para exibir.</Alert>
          ) : (
            <div ref={dreRef} style={{ minHeight: '500px', fontSize: '0.9rem' }}>
              <h5 className="mb-3">DRE Comparativo por Categoria</h5>
              {(() => {
                // Se os períodos não tiverem a propriedade "categorias", usamos array vazio.
                const periodo1 = dreResultado[0] || {};
                const periodo2 = dreResultado[1] || {};
                const categorias1 = Array.isArray(periodo1.categorias) ? periodo1.categorias : [];
                const categorias2 = Array.isArray(periodo2.categorias) ? periodo2.categorias : [];
                // Agrupa os itens por categoria para cada período
                const union = {};
                categorias1.forEach((item) => {
                  const key = item.categoria;
                  union[key] = {
                    categoria: item.categoria,
                    totalReceitas1: item.totalReceitas || 0,
                    totalDespesas1: item.totalDespesas || 0,
                    saldo1: item.saldo || 0,
                    totalReceitas2: 0,
                    totalDespesas2: 0,
                    saldo2: 0,
                  };
                });
                categorias2.forEach((item) => {
                  const key = item.categoria;
                  if (union[key]) {
                    union[key].totalReceitas2 = item.totalReceitas || 0;
                    union[key].totalDespesas2 = item.totalDespesas || 0;
                    union[key].saldo2 = item.saldo || 0;
                  } else {
                    union[key] = {
                      categoria: item.categoria,
                      totalReceitas1: 0,
                      totalDespesas1: 0,
                      saldo1: 0,
                      totalReceitas2: item.totalReceitas || 0,
                      totalDespesas2: item.totalDespesas || 0,
                      saldo2: item.saldo || 0,
                    };
                  }
                });
                const arrayCategorias = Object.values(union);
                // Se não houver nenhum item agrupado, exibe uma mensagem
                if (arrayCategorias.length === 0) {
                  return <Alert variant="info">O DRE não possui dados para exibir.</Alert>;
                }
                return (
                  <>
                    <h6>Receitas</h6>
                    <Table striped bordered>
                      <thead>
                        <tr>
                          <th>Categoria</th>
                          <th>{periodo1.label || 'Período 1'}</th>
                          <th>{periodo2.label || 'Período 2'}</th>
                          <th>Diferença</th>
                        </tr>
                      </thead>
                      <tbody>
                        {arrayCategorias.map((cat) => {
                          const diff = cat.totalReceitas1 - cat.totalReceitas2;
                          return (
                            <tr key={cat.categoria}>
                              <td>{cat.categoria}</td>
                              <td>R$ {formatarValorBR(cat.totalReceitas1)}</td>
                              <td>R$ {formatarValorBR(cat.totalReceitas2)}</td>
                              <td>R$ {formatarValorBR(diff)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                    <h6 className="mt-3">Despesas</h6>
                    <Table striped bordered>
                      <thead>
                        <tr>
                          <th>Categoria</th>
                          <th>{periodo1.label || 'Período 1'}</th>
                          <th>{periodo2.label || 'Período 2'}</th>
                          <th>Diferença</th>
                        </tr>
                      </thead>
                      <tbody>
                        {arrayCategorias.map((cat) => {
                          const diff = cat.totalDespesas1 - cat.totalDespesas2;
                          return (
                            <tr key={cat.categoria}>
                              <td>{cat.categoria}</td>
                              <td>R$ {formatarValorBR(cat.totalDespesas1)}</td>
                              <td>R$ {formatarValorBR(cat.totalDespesas2)}</td>
                              <td>R$ {formatarValorBR(diff)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                    <h6 className="mt-3">Resultado</h6>
                    <Table striped bordered>
                      <thead>
                        <tr>
                          <th>Categoria</th>
                          <th>{periodo1.label || 'Período 1'}</th>
                          <th>{periodo2.label || 'Período 2'}</th>
                          <th>Diferença</th>
                        </tr>
                      </thead>
                      <tbody>
                        {arrayCategorias.map((cat) => {
                          const diff = cat.saldo1 - cat.saldo2;
                          return (
                            <tr key={cat.categoria}>
                              <td>{cat.categoria}</td>
                              <td>R$ {formatarValorBR(cat.saldo1)}</td>
                              <td>R$ {formatarValorBR(cat.saldo2)}</td>
                              <td>R$ {formatarValorBR(diff)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </>
                );
              })()}
              <div className="text-end mt-3">
                <Button variant="outline-success" onClick={handleExportarPDFDRE}>
                  <FaDownload /> Exportar PDF (DRE)
                </Button>
              </div>
            </div>
          )}
        </Tab>
      </Tabs>
    );
  };

  /* ------------------------------------------------------------------
   * RENDERIZAÇÃO PRINCIPAL
   * ------------------------------------------------------------------ */
  return (
    <Container fluid className={styles.container}>
      <Row className="mt-3 mb-4">
        <Col>
          <h3>Lançamentos Financeiros (DRE + Comparativo)</h3>
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Body>
          <Row className="gy-2 gx-3 align-items-end">
            <Col md={2}>
              <Form.Group>
                <Form.Label>Data Inicial</Form.Label>
                <Form.Control
                  type="date"
                  value={dataInicial}
                  onChange={(e) => setDataInicial(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Data Final</Form.Label>
                <Form.Control
                  type="date"
                  value={dataFinal}
                  onChange={(e) => setDataFinal(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Tipo</Form.Label>
                <Form.Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="Receita">Receita</option>
                  <option value="Despesa">Despesa</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Categoria</Form.Label>
                <Form.Select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
                  <option value="">Todas</option>
                  {renderCategoryOptions(listaCategoriasEmArvore)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Cliente/Fornecedor</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Buscar por nome..."
                  value={clienteFornecedor}
                  onChange={(e) => setClienteFornecedor(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={1}>
              <Button variant="primary" className="w-100" onClick={listarLancamentos}>
                <FaSearch /> Filtrar
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row className="mb-3">
        <Col md="12">
          <div className="d-flex gap-2 flex-wrap">
            <Button variant="success" onClick={() => abrirModal('Receita')}>
              + Nova Receita
            </Button>
            <Button variant="danger" onClick={() => abrirModal('Despesa')}>
              + Nova Despesa
            </Button>
            <Button variant="secondary" onClick={abrirValesModal}>
              Vales Funcionários
            </Button>
            <Button variant="outline-dark" onClick={() => setShowDREModal(true)}>
              <FaCalculator className="me-1" />
              Gerar DRE Comparativo
            </Button>
            <Button variant="outline-primary" onClick={abrirCategoriaModal}>
              <FaLayerGroup className="me-1" />
              Gerir Categorias
            </Button>
            <div className="ms-auto">
              <Button variant="outline-success" onClick={exportarPDF}>
                <FaDownload /> Exportar PDF
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <div ref={contentRef}>
        <Card>
          <Card.Body>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>#ID</th>
                  <th>Tipo</th>
                  <th>Cliente/Fornecedor</th>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Funcionário</th>
                  <th>Data</th>
                  <th>Valor</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {lancamentos.map((l) => (
                  <tr key={l._id}>
                    <td>{l._id ? `${l._id.substring(0, 6)}...` : ''}</td>
                    <td>
                      {l.tipo === 'Receita' ? (
                        <Badge bg="success">{l.tipo}</Badge>
                      ) : (
                        <Badge bg="danger">{l.tipo}</Badge>
                      )}
                    </td>
                    <td>{l.clienteFornecedor}</td>
                    <td>{l.descricao}</td>
                    <td>
                      {l.categoria ? (
                        <>
                          {l.categoria.nome}{' '}
                          {l.categoria.parent ? ` (Pai: ${l.categoria.parent.nome})` : ''}
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>{l.nomeFuncionario || '—'}</td>
                    <td>{l.data ? new Date(l.data).toLocaleDateString() : ''}</td>
                    <td>R$ {l.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td>
                      <Button variant="outline-success" size="sm" className="me-2" onClick={() => abrirModal(l.tipo, l)}>
                        <FaEdit />
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => excluirLancamento(l._id)}>
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {lancamentos.length === 0 && (
              <Alert variant="info" className="mt-3">
                Nenhum lançamento encontrado.
              </Alert>
            )}
          </Card.Body>
        </Card>

        <Row className="my-3">
          <Col>
            <div className="d-flex align-items-center">
              <Button variant="outline-secondary" className="me-2" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Anterior
              </Button>
              <Button variant="outline-secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Próximo
              </Button>
              <span className="ms-3">Página {page} de {totalPages}</span>
            </div>
          </Col>
        </Row>

        <Row className="mt-4 justify-content-end">
          <Col md="auto">
            <Card className="p-3 mb-2 text-center bg-light">
              <h5 className="mb-1">Total Receitas</h5>
              <h4 className="text-success fw-bold">{formatarValorBR(resumo.totalReceitas)}</h4>
            </Card>
          </Col>
          <Col md="auto">
            <Card className="p-3 mb-2 text-center bg-light">
              <h5 className="mb-1">Total Despesas</h5>
              <h4 className="text-danger fw-bold">{formatarValorBR(resumo.totalDespesas)}</h4>
            </Card>
          </Col>
          <Col md="auto">
            <Card className="p-3 mb-2 text-center bg-light">
              <h5 className="mb-1">Saldo</h5>
              <h4 className="fw-bold">R$ {formatarValorBR(resumo.saldo)}</h4>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Modal Novo/Editar Lançamento */}
      <Modal show={showModal} onHide={fecharModal} centered backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? `Editar Lançamento (${modalTipo})` : `Novo Lançamento (${modalTipo})`}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Tipo</Form.Label>
            <Form.Select
              value={modalLanc.tipo}
              onChange={(e) => setModalLanc((prev) => ({ ...prev, tipo: e.target.value }))}
              disabled
            >
              <option value="Receita">Receita</option>
              <option value="Despesa">Despesa</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Cliente/Fornecedor</Form.Label>
            <Form.Control
              type="text"
              value={modalLanc.clienteFornecedor}
              onChange={(e) => setModalLanc((prev) => ({ ...prev, clienteFornecedor: e.target.value }))}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Descrição</Form.Label>
            <Form.Control
              type="text"
              value={modalLanc.descricao}
              onChange={(e) => setModalLanc((prev) => ({ ...prev, descricao: e.target.value }))}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Categoria</Form.Label>
            <Form.Select
              value={modalLanc.categoria}
              onChange={(e) => setModalLanc((prev) => ({ ...prev, categoria: e.target.value }))}
            >
              <option value="">Selecione...</option>
              {listaCategoriasEmArvore.length > 0 && renderCategoryOptions(listaCategoriasEmArvore)}
            </Form.Select>
          </Form.Group>
          {modalLanc.tipo === 'Despesa' &&
            listaCategoriasEmArvore.some(
              (c) => String(c._id) === String(modalLanc.categoria) && c.nome === 'Vale Funcionários'
            ) && (
              <Form.Group className="mb-3">
                <Form.Label>Nome do Funcionário</Form.Label>
                <Form.Select
                  value={modalLanc.nomeFuncionario}
                  onChange={(e) => setModalLanc((prev) => ({ ...prev, nomeFuncionario: e.target.value }))}
                >
                  <option value="">Selecione o funcionário</option>
                  {teamMembers.map((m) => (
                    <option key={m._id} value={m.nome}>
                      {m.nome}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}
          <Form.Group className="mb-3">
            <Form.Label>Data</Form.Label>
            <Form.Control
              type="date"
              value={modalLanc.data ? new Date(modalLanc.data).toISOString().split('T')[0] : ''}
              onChange={(e) => setModalLanc((prev) => ({ ...prev, data: e.target.value }))}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Valor</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              value={modalLanc.valor}
              onChange={(e) => setModalLanc((prev) => ({ ...prev, valor: parseFloat(e.target.value) || 0 }))}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="observacao">
            <Form.Label>Observação</Form.Label>
            <Form.Control
              as="textarea"
              name="observacao"
              value={modalLanc.observacao}
              onChange={(e) => setModalLanc((prev) => ({ ...prev, observacao: e.target.value }))}
              placeholder="Insira uma observação para o lançamento..."
              rows={3}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={fecharModal}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={salvarLancamento}>
            Salvar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Vales Funcionários */}
      <Modal show={showValesModal} onHide={() => setShowValesModal(false)} size="lg" centered backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Vales Funcionários</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingVales ? (
            <div className="d-flex justify-content-center">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : vales.length === 0 ? (
            <Alert variant="info">Nenhum vale encontrado.</Alert>
          ) : (
            <Table striped bordered hover responsive>
              <thead className="table-light">
                <tr>
                  <th>#ID</th>
                  <th>Funcionário</th>
                  <th>Data</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {vales.map((v) => (
                  <tr key={v._id}>
                    <td>{v._id ? `${v._id.substring(0, 6)}...` : ''}</td>
                    <td>{v.nomeFuncionario || '—'}</td>
                    <td>{v.data ? new Date(v.data).toLocaleDateString() : ''}</td>
                    <td>R$ {formatarValorBR(v.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowValesModal(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Gerir Categorias */}
      <Modal show={showCategoriaModal} onHide={() => setShowCategoriaModal(false)} centered backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Gerir Categorias</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nome da Categoria</Form.Label>
            <Form.Control
              type="text"
              value={novaCategoria.nome}
              onChange={(e) => setNovaCategoria((prev) => ({ ...prev, nome: e.target.value }))}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Tipo</Form.Label>
            <Form.Select
              value={novaCategoria.tipo}
              onChange={(e) => setNovaCategoria((prev) => ({ ...prev, tipo: e.target.value }))}
            >
              <option value="Receita">Receita</option>
              <option value="Despesa">Despesa</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Categoria Pai (opcional)</Form.Label>
            <Form.Select
              value={novaCategoria.parent || ''}
              onChange={(e) => {
                const val = e.target.value;
                setNovaCategoria((prev) => ({ ...prev, parent: val === '' ? null : val }));
              }}
            >
              <option value="">(Nenhuma - categoria raiz)</option>
              {renderCategoryOptions(listaCategoriasEmArvore)}
            </Form.Select>
          </Form.Group>
          <Button variant="primary" onClick={salvarCategoria} className="mb-3">
            <FaPlus /> Criar Categoria
          </Button>
          <hr />
          {listaCategoriasEmArvore.length === 0 ? (
            <Alert variant="info" className="mt-3">
              Nenhuma categoria cadastrada.
            </Alert>
          ) : (
            <Table striped bordered hover responsive className="mt-3">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {listaCategoriasEmArvore.flatMap((cat) => {
                  const makeRows = (node, level = 0) => {
                    const indent = '-- '.repeat(level);
                    const row = (
                      <tr key={node._id}>
                        <td>{indent + node.nome}</td>
                        <td>{node.tipo}</td>
                        <td>
                          <Button variant="outline-danger" size="sm" onClick={() => excluirCategoria(node._id)}>
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    );
                    let childrenRows = [];
                    if (node.children && node.children.length > 0) {
                      node.children.forEach((child) => {
                        childrenRows.push(...makeRows(child, level + 1));
                      });
                    }
                    return [row, ...childrenRows];
                  };
                  return makeRows(cat, 0);
                })}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCategoriaModal(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal DRE – Usando Tabs */}
      <Modal show={showDREModal} onHide={() => setShowDREModal(false)} size="lg" centered backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>DRE Comparativo</Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderDREModalContent()}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDREModal(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Lancamentos;
