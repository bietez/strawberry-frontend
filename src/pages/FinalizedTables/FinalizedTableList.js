// src/pages/FinalizedOrders/FinalizedOrderList.js

import React, { useEffect, useState } from 'react';
import {
  Container,
  Table,
  Spinner,
  Alert,
  Button,
  Modal,
  Form,
  Row,
  Col,
  Pagination,
  InputGroup,
  FormControl,
} from 'react-bootstrap';
import api from '../../services/api';
import { toast } from 'react-toastify';

// Mapeamento opcional de pagamentos
const paymentNames = {
  dinheiro: 'Dinheiro',
  cartao: 'Cartão',
  pix: 'Pix',
};

// Capitaliza nome do pagamento
function capitalizePayment(method) {
  if (!method) return '';
  const lower = method.toLowerCase();
  return paymentNames[lower] || (method.charAt(0).toUpperCase() + method.slice(1));
}

// Formata lista de pagamentos (array ou string)
function formatPaymentMethods(raw) {
  if (!raw) return '';
  let payments = Array.isArray(raw) ? raw : String(raw).split(',');
  const counts = {};
  payments.forEach((p) => {
    const method = capitalizePayment(p.trim());
    counts[method] = (counts[method] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([method, qty]) => (qty > 1 ? `${method} x${qty}` : method))
    .join(', ');
}

/**
 * Retorna a data no formato yyyy-mm-dd (para inputs type=date)
 */
function formatISODate(date) {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Retorna o primeiro dia do mês atual em yyyy-mm-dd
 */
function getFirstDayOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/**
 * Retorna o último dia do mês atual em yyyy-mm-dd
 */
function getLastDayOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0);
}


function FinalizedOrderList() {
  // Estado principal para a listagem
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Somatório (apenas da página atual)
  const [totalTaxaServico, setTotalTaxaServico] = useState(0);

  // Somatórios do período inteiro (ignorando paginação)
  const [sumTaxaServicoAll, setSumTaxaServicoAll] = useState(0);
  const [sumTotalFinalAll, setSumTotalFinalAll] = useState(0);

  // Loading e erro gerais
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal de Detalhes
  const [showModal, setShowModal] = useState(false);
  const [selectedComanda, setSelectedComanda] = useState(null);

  // Filtros
  // *Setamos data inicial e final para o 1º e último dia do mês*
  const [dataInicial, setDataInicial] = useState(
    formatISODate(getFirstDayOfMonth())
  );
  const [dataFinal, setDataFinal] = useState(
    formatISODate(getLastDayOfMonth())
  );

  const [search, setSearch] = useState('');
  const [formaPagamentoFilter, setFormaPagamentoFilter] = useState('');
  const [sort, setSort] = useState('dataFinalizacao');
  const [order, setOrder] = useState('desc');
  const [limit, setLimit] = useState(10);

  // Estado para envio de email no modal de detalhes
  const [emailDestino, setEmailDestino] = useState('');

  // ---- ESTADOS PARA EDIÇÃO DE GARÇOM ----
  const [showGarcomModal, setShowGarcomModal] = useState(false);
  const [comandaToEditGarcom, setComandaToEditGarcom] = useState(null);
  const [selectedGarcom, setSelectedGarcom] = useState('');
  const [waiters, setWaiters] = useState([]); // lista de garçons do backend

  // ---------------------------------------------------------------------------------
  // Busca das comandas finalizadas
  // ---------------------------------------------------------------------------------
  const fetchComandas = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: currentPage,
        limit,
        search,
        sort,
        order,
        dataInicial, // "2024-12-01"
        dataFinal,   // "2024-12-31"
        formaPagamento: formaPagamentoFilter || '',
      };

      const response = await api.get('/finalized-tables', { params });
      const {
        finalized,
        totalPages,
        currentPage: pg,
        total: tt,
        sumTaxaServicoAll,
        sumTotalFinalAll
      } = response.data;

      // 1) Salva docs
      setData(finalized);
      setTotalPages(totalPages);
      setCurrentPage(pg);
      setTotal(tt);

      // 2) Soma *apenas* a taxa de serviço desta página
      const somaTaxa = finalized.reduce(
        (acc, comanda) => acc + (comanda.valorTaxaServico || 0),
        0
      );
      setTotalTaxaServico(somaTaxa);

      // 3) Soma do período todo (sem paginação)
      //    vem do backend como sumTaxaServicoAll e sumTotalFinalAll
      setSumTaxaServicoAll(sumTaxaServicoAll || 0);
      setSumTotalFinalAll(sumTotalFinalAll || 0);

    } catch (err) {
      console.error('Erro ao obter comandas finalizadas:', err);
      setError(err.response?.data?.message || 'Erro ao obter comandas finalizadas.');
    } finally {
      setLoading(false);
    }
  };

  // Chama fetchComandas ao montar e quando filtros mudam (ver deps)
  useEffect(() => {
    fetchComandas();
    // eslint-disable-next-line
  }, [currentPage, limit, search, dataInicial, dataFinal, formaPagamentoFilter, sort, order]);

  // ---------------------------------------------------------------------------------
  // Modal de Detalhes
  // ---------------------------------------------------------------------------------
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedComanda(null);
    setEmailDestino('');
  };
  const handleShowComanda = (comanda) => {
    setSelectedComanda(comanda);
    setShowModal(true);
  };

  // Print PDF
  const handlePrintPDF = () => {
    if (!selectedComanda || !selectedComanda.pdfPath) {
      toast.error('PDF não disponível.');
      return;
    }
    // Ajuste se seu backend já retorna link completo
    window.open(`http://localhost:8000${selectedComanda.pdfPath}`, '_blank');
  };

  // Enviar email
  const handleSendEmail = async () => {
    if (!emailDestino) {
      toast.error('Informe um email para envio.');
      return;
    }
    if (!selectedComanda) {
      toast.error('Nenhuma comanda selecionada.');
      return;
    }
    try {
      // Ajuste a rota conforme seu backend
      await api.post('/comandas/send-email', {
        comandaId: selectedComanda._id,
        email: emailDestino,
      });
      toast.success('Email enviado com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      toast.error('Erro ao enviar email da comanda.');
    }
  };

  // ---------------------------------------------------------------------------------
  // Paginação
  // ---------------------------------------------------------------------------------
  const paginationItems = [];
  for (let number = 1; number <= totalPages; number++) {
    paginationItems.push(
      <Pagination.Item
        key={number}
        active={number === currentPage}
        onClick={() => setCurrentPage(number)}
      >
        {number}
      </Pagination.Item>,
    );
  }

  // ---------------------------------------------------------------------------------
  // EDIÇÃO DE GARÇOM
  // ---------------------------------------------------------------------------------
  // 1) Buscar lista de garçons
  const fetchWaiters = async () => {
    try {
      const resp = await api.get('/users/team-members');
      const allUsers = resp.data || [];
      const onlyWaiters = allUsers.filter((u) => u.role === 'waiter' || u.role === 'agent');
      setWaiters(onlyWaiters);
    } catch (err) {
      console.error('Erro ao buscar garçons:', err);
      toast.error('Erro ao buscar lista de garçons.');
    }
  };

  useEffect(() => {
    fetchWaiters();
  }, []);

  // 2) Abrir modal de edição do garçom
  const handleOpenGarcomModal = (comanda) => {
    setComandaToEditGarcom(comanda);
    setSelectedGarcom(comanda.garcomId?._id || '');
    setShowGarcomModal(true);
  };

  const handleCloseGarcomModal = () => {
    setShowGarcomModal(false);
    setComandaToEditGarcom(null);
    setSelectedGarcom('');
  };

  // 3) Salvar (PUT /finalized-tables/:id) -> { garcomId: selectedGarcom }
  const handleSaveGarcom = async () => {
    if (!comandaToEditGarcom) {
      return;
    }
    try {
      await api.put(`/finalized-tables/${comandaToEditGarcom._id}`, {
        garcomId: selectedGarcom,
      });
      toast.success('Garçom atualizado com sucesso!');
      handleCloseGarcomModal();
      // Recarregar a listagem
      fetchComandas();
    } catch (error) {
      console.error('Erro ao atualizar garçom:', error);
      toast.error('Erro ao atualizar garçom.');
    }
  };

  // ---------------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------------
  return (
    <Container className="my-5">
      <h2>Comandas Finalizadas</h2>

      {/* Campo de busca */}
      <Form className="mb-4">
        <Row className="mb-3">
          <Col xs={12}>
            <InputGroup>
              <InputGroup.Text>Buscar</InputGroup.Text>
              <FormControl
                placeholder="Número da mesa"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
          </Col>
        </Row>
      </Form>

      {/* Filtros */}
      <Form className="mb-4">
        <Row className="gy-2">
          <Col xs={12} md={3}>
            <Form.Label>Data Inicial</Form.Label>
            <Form.Control
              type="date"
              value={dataInicial}
              onChange={(e) => setDataInicial(e.target.value)}
            />
          </Col>
          <Col xs={12} md={3}>
            <Form.Label>Data Final</Form.Label>
            <Form.Control
              type="date"
              value={dataFinal}
              onChange={(e) => setDataFinal(e.target.value)}
            />
          </Col>

          <Col xs={12} md={3}>
            <Form.Label>Forma de Pagamento</Form.Label>
            <Form.Select
              value={formaPagamentoFilter}
              onChange={(e) => setFormaPagamentoFilter(e.target.value)}
            >
              <option value="">Todas</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="cartao">Cartão</option>
              <option value="pix">Pix</option>
            </Form.Select>
          </Col>

          <Col xs={12} md={3}>
            <Form.Label>Ordenar por</Form.Label>
            <Form.Select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="dataFinalizacao">Data de Finalização</option>
              <option value="valorTotal">Valor Total</option>
              <option value="numeroMesa">Número da Mesa</option>
            </Form.Select>
          </Col>

          <Col xs={12} md={3}>
            <Form.Label>Ordem</Form.Label>
            <Form.Select value={order} onChange={(e) => setOrder(e.target.value)}>
              <option value="asc">Crescente</option>
              <option value="desc">Decrescente</option>
            </Form.Select>
          </Col>

          <Col xs={12} md={3}>
            <Form.Label>Itens por Página</Form.Label>
            <Form.Select value={limit} onChange={(e) => setLimit(parseInt(e.target.value, 10))}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </Form.Select>
          </Col>

          <Col xs={12} md={12}>
            <Button variant="primary" onClick={fetchComandas}>
              Aplicar Filtros
            </Button>
          </Col>
        </Row>
      </Form>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" />
          <p>Carregando comandas...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : data.length === 0 ? (
        <Alert variant="info">Nenhuma comanda finalizada encontrada.</Alert>
      ) : (
        <>
          <p>
            <strong>Total de Comandas:</strong> {total}
          </p>
          
          <p>
            <strong>Somatório Geral de Taxa de Serviço (todo período):</strong> R${' '}
            {sumTaxaServicoAll.toFixed(2)}
          </p>
          

          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>Número da Mesa</th>
                <th>Ambiente</th>
                <th>Garçom</th>
                <th>Forma de Pagamento</th>
                <th>Valor Pago (R$)</th>
                <th>Desconto</th>
                <th>Taxa de Serviço (R$)</th>
                <th>Total (R$)</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.map((comanda) => {
                // “totalComTaxa” se valorTotal for base + valorTaxaServico for taxa
                const totalComTaxa = (comanda.valorTotal || 0) + (comanda.valorTaxaServico || 0);

                return (
                  <tr key={comanda._id}>
                    <td>{comanda.numeroMesa}</td>
                    <td>{comanda.ambienteId?.nome || 'N/A'}</td>
                    <td>{comanda.garcomId?.nome || 'Desconhecido'}</td>
                    <td>{formatPaymentMethods(comanda.formaPagamento)}</td>
                    <td>{comanda.valorPago?.toFixed(2)}</td>
                    <td>
                      {comanda.tipoDesconto === 'porcentagem'
                        ? `${comanda.valorDesconto}%`
                        : comanda.tipoDesconto === 'valor'
                        ? `R$ ${comanda.valorDesconto?.toFixed(2)}`
                        : 'Nenhum'}
                    </td>
                    <td>{comanda.valorTaxaServico?.toFixed(2)}</td>
                    <td>{totalComTaxa.toFixed(2)}</td>
                    <td>
                      <Button
                        variant="info"
                        size="sm"
                        className="me-2"
                        onClick={() => handleShowComanda(comanda)}
                      >
                        Ver Itens
                      </Button>
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleOpenGarcomModal(comanda)}
                      >
                        Editar Garçom
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          {totalPages > 1 && (
            <Pagination className="justify-content-center my-3">
              {paginationItems}
            </Pagination>
          )}
        </>
      )}

      {/* Modal de Detalhes */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Detalhes da Comanda da Mesa {selectedComanda?.numeroMesa}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedComanda ? (
            <>
              <h5>Pedidos:</h5>
              {selectedComanda.pedidos && selectedComanda.pedidos.length > 0 ? (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Nº do Pedido</th>
                      <th>Itens</th>
                      <th>Total (R$)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedComanda.pedidos.map((pedido) => (
                      <tr key={pedido._id}>
                        <td>#{pedido.orderNumber}</td>
                        <td>
                          <ul>
                            {pedido.itens.map((item, i) => {
                              const nomeProduto = item.product?.nome ?? 'Desconhecido';
                              const precoProduto = item.product?.preco ?? 0;
                              const quantidade = item.quantidade ?? 0;
                              const totalItem = (precoProduto * quantidade).toFixed(2);
                              return (
                                <li key={i}>
                                  {quantidade} x {nomeProduto} (R${totalItem})
                                </li>
                              );
                            })}
                          </ul>
                        </td>
                        <td>{pedido.total?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info">Nenhum pedido associado.</Alert>
              )}

              <h5>Detalhes Pagamento:</h5>
              <p>
                <strong>Garçom:</strong> {selectedComanda.garcomId?.nome || 'Desconhecido'} <br />
                <strong>Forma de Pagamento:</strong>{' '}
                {formatPaymentMethods(selectedComanda.formaPagamento)} <br />
                <strong>Valor Pago:</strong> R$ {selectedComanda.valorPago?.toFixed(2)} <br />
                <strong>Desconto:</strong>{' '}
                {selectedComanda.tipoDesconto === 'porcentagem'
                  ? `${selectedComanda.valorDesconto}%`
                  : selectedComanda.tipoDesconto === 'valor'
                  ? `R$ ${selectedComanda.valorDesconto?.toFixed(2)}`
                  : 'Nenhum'}{' '}
                <br />
                <strong>Taxa de Serviço:</strong> R${' '}
                {selectedComanda.valorTaxaServico?.toFixed(2)}{' '}
                <br />
                <strong>Total Final:</strong>{' '}
                {((selectedComanda.valorTotal || 0) + (selectedComanda.valorTaxaServico || 0)).toFixed(2)}{' '}
                <br />
                <strong>Data de Finalização:</strong>{' '}
                {new Date(selectedComanda.dataFinalizacao).toLocaleString()}
              </p>

              {selectedComanda.pdfPath && (
                <div className="mb-3">
                  <strong>PDF da Comanda:</strong>
                  <iframe
                    src={`http://localhost:8000${selectedComanda.pdfPath}`}
                    title="PDF da Comanda"
                    style={{ width: '100%', height: '600px', border: 'none' }}
                  ></iframe>
                </div>
              )}

              <h5>Enviar por Email</h5>
              <InputGroup className="mb-3">
                <FormControl
                  type="email"
                  placeholder="Email de destino"
                  value={emailDestino}
                  onChange={(e) => setEmailDestino(e.target.value)}
                />
                <Button variant="outline-secondary" onClick={handleSendEmail}>
                  Enviar
                </Button>
              </InputGroup>
            </>
          ) : (
            <Spinner animation="border" />
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedComanda?.pdfPath && (
            <Button variant="primary" onClick={handlePrintPDF}>
              Imprimir / Visualizar PDF
            </Button>
          )}
          <Button variant="secondary" onClick={handleCloseModal}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para Editar Garçom */}
      <Modal show={showGarcomModal} onHide={handleCloseGarcomModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Garçom</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {comandaToEditGarcom ? (
            <Form>
              <Form.Group className="mb-3" controlId="garcomId">
                <Form.Label>Selecione o Garçom Responsável</Form.Label>
                <Form.Select
                  value={selectedGarcom}
                  onChange={(e) => setSelectedGarcom(e.target.value)}
                >
                  <option value="">-- Selecione --</option>
                  {waiters.map((w) => (
                    <option key={w._id} value={w._id}>
                      {w.nome} ({w.email})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Form>
          ) : (
            <Spinner animation="border" />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseGarcomModal}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveGarcom}>
            Salvar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default FinalizedOrderList;
