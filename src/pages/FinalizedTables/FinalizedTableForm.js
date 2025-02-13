// src/pages/FinalizedOrders/FinalizedOrderForm.js

import React, { useState, useEffect } from 'react';
import {
  Container,
  Form,
  Button,
  Alert,
  Spinner,
  Table,
  Badge,
  Modal,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../../services/api';

const FinalizedOrderForm = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [finalizing, setFinalizing] = useState(false);

  // Mesas
  const [mesas, setMesas]     = useState([]);
  const [mesaId, setMesaId]   = useState('');
  const [pedidos, setPedidos] = useState([]);

  // Garçom
  const [waiters, setWaiters]         = useState([]);
  const [selectedGarcom, setSelectedGarcom] = useState('');

  // Desconto / Taxa
  const [tipoDesconto, setTipoDesconto] = useState('nenhum');
  const [valorDesconto, setValorDesconto] = useState('');
  const [taxaServico, setTaxaServico] = useState(10); // 10%
  const [cobrarTaxaServico, setCobrarTaxaServico] = useState(true);

  // Totais
  const [totalMesa, setTotalMesa] = useState(0);
  const [totalComDesconto, setTotalComDesconto] = useState(0);

  // Pagamentos
  const [pagamentos, setPagamentos] = useState([{ metodo: 'dinheiro', valor: '' }]);

  // PDF, troco, etc.
  const [pdfPath, setPdfPath] = useState('');
  const [troco, setTroco]     = useState(0);

  // Estados para Email
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailDestino, setEmailDestino] = useState('');
  const [enviandoEmail, setEnviandoEmail] = useState(false);

  // Recalcular total c/ desconto
  useEffect(() => {
    let valor = totalMesa;
    if (tipoDesconto === 'porcentagem' && valorDesconto) {
      const pct = parseFloat(valorDesconto) || 0;
      valor -= (valor * pct) / 100;
    } else if (tipoDesconto === 'valor' && valorDesconto) {
      const val = parseFloat(valorDesconto) || 0;
      valor = Math.max(valor - val, 0);
    }
    setTotalComDesconto(valor);
  }, [totalMesa, tipoDesconto, valorDesconto]);

  // totalTaxaServico
  const totalTaxaServico = cobrarTaxaServico
    ? parseFloat((totalComDesconto * (taxaServico / 100)).toFixed(2))
    : 0;

  // totalFinal
  const totalFinal = parseFloat((totalComDesconto + totalTaxaServico).toFixed(2));

  // soma dos pagamentos
  const totalPagoSomado = pagamentos.reduce(
    (acc, p) => acc + (parseFloat(p.valor) || 0),
    0
  );

  // troco
  useEffect(() => {
    if (totalPagoSomado > totalFinal) {
      setTroco(totalPagoSomado - totalFinal);
    } else {
      setTroco(0);
    }
  }, [totalPagoSomado, totalFinal]);

  // Inicia fluxo
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1) config
        const configRes = await api.get('/config');
        if (configRes.data && configRes.data.taxaServico !== undefined) {
          setTaxaServico(configRes.data.taxaServico);
        }

        // 2) mesas
        const mesasResp = await api.get('/tables');
        const ocupadas = mesasResp.data.filter((m) => m.status === 'ocupada');
        setMesas(ocupadas);

        // 3) garçons
        const waitersResp = await api.get('/users/team-members');
        const allWaiters = waitersResp.data.filter(
          (u) => u.role === 'waiter' || u.role === 'agent'
        );
        setWaiters(allWaiters);
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar dados iniciais.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ao trocar mesaId
  useEffect(() => {
    if (!mesaId) {
      setPedidos([]);
      setTotalMesa(0);
      setCobrarTaxaServico(true);
      return;
    }
    const fetchPedidos = async () => {
      try {
        const res = await api.get('/orders', { params: { mesaId } });
        const pedidosAll = res.data.orders || [];
        // Filtra status "Entregue"
        const entregues = pedidosAll.filter((p) => p.status === 'Entregue');
        setPedidos(entregues);
        const soma = entregues.reduce((acc, p) => acc + (p.total || 0), 0);
        setTotalMesa(soma);
      } catch (err) {
        console.error(err);
        toast.error('Erro ao obter pedidos da mesa.');
      }
    };
    fetchPedidos();
  }, [mesaId]);

  // handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mesaId) {
      toast.error('Selecione a mesa.');
      return;
    }
    if (!selectedGarcom) {
      toast.error('Selecione o garçom.');
      return;
    }
    if (totalPagoSomado < totalFinal) {
      toast.error('Pagamentos são menores que total final.');
      return;
    }

    setFinalizing(true);
    try {
      const payload = {
        formaPagamento: pagamentos.map((p) => p.metodo),
        valorPago: totalPagoSomado,
        tipoDesconto,
        valorDesconto: parseFloat(valorDesconto) || 0,
        cobrarTaxaServico,
        valorTaxaServico: cobrarTaxaServico ? totalTaxaServico : 0,
        garcomId: selectedGarcom,
      };

      console.log('[FinalizedOrderForm] Payload:', JSON.stringify(payload, null, 2));

      const resp = await api.post(`/tables/${mesaId}/finalizar`, payload);
      toast.success('Mesa finalizada com sucesso!');

      if (resp.data.pdfPath) {
        setPdfPath(resp.data.pdfPath);
        // Removida a abertura automática do modal
        // setShowEmailModal(true); // Abre o modal para enviar email
      } else {
        setPdfPath('');
      }

      // Ex.: remover a mesa finalizada da lista
      setMesas((prev) => prev.filter((m) => m._id !== mesaId));

      // Reset
      setMesaId('');
      setSelectedGarcom('');
      setPedidos([]);
      setTipoDesconto('nenhum');
      setValorDesconto('');
      setCobrarTaxaServico(true);
      setPagamentos([{ metodo: 'dinheiro', valor: '' }]);
      setTroco(0);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Erro ao finalizar mesa.');
    } finally {
      setFinalizing(false);
    }
  };

  // Gerar PDF conferência (opcional)
  const handleGenerateConferencePDF = async () => {
    if (!mesaId) {
      toast.error('Selecione uma mesa primeiro.');
      return;
    }
    try {
      const resp = await api.get(`/comandas/${mesaId}/conferencia`);
      if (resp.data.pdfPath) {
        window.open(`http://localhost:8000${resp.data.pdfPath}`, '_blank');
      } else {
        toast.error('Falha ao gerar PDF de conferência.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro ao gerar PDF de conferência.');
    }
  };

  const handlePrintPDF = () => {
    if (!pdfPath) {
      toast.error('Nenhum PDF disponível.');
      return;
    }
    window.open(pdfPath, '_blank');
  };

  // Adicionar / remover pagamento
  const addPagamento = () => setPagamentos([...pagamentos, { metodo: 'dinheiro', valor: '' }]);
  const removePagamento = (index) => {
    const tmp = [...pagamentos];
    tmp.splice(index, 1);
    setPagamentos(tmp);
  };
  const handlePaymentChange = (index, field, val) => {
    const tmp = [...pagamentos];
    tmp[index][field] = val;
    setPagamentos(tmp);
  };

  // Funções para Gerar e Enviar PDF
  const handleGeneratePDF = () => {
    if (!pdfPath) {
      toast.error('Nenhum PDF disponível para download.');
      return;
    }
    // Abre o PDF em uma nova aba
    window.open(pdfPath, '_blank');
  };

  const handleSendEmail = async () => {
    if (!emailDestino) {
      toast.error('Por favor, insira um endereço de email.');
      return;
    }
    if (!pdfPath) {
      toast.error('Nenhum PDF disponível para enviar.');
      return;
    }

    setEnviandoEmail(true);
    try {
      const response = await api.post('/send-invoice-email', {
        email: emailDestino,
        pdfPath,
      });

      if (response.status === 200) {
        toast.success('Email enviado com sucesso!');
        setShowEmailModal(false);
        setEmailDestino('');
      } else {
        toast.error('Falha ao enviar o email.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao enviar o email.');
    } finally {
      setEnviandoEmail(false);
    }
  };

  // Render
  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" role="status" />
        <p>Carregando dados...</p>
      </Container>
    );
  }
  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2>Finalizar Mesa</h2>
      {mesas.length === 0 ? (
        <Alert variant="info">Nenhuma mesa ocupada.</Alert>
      ) : (
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="mesaSelect">
            <Form.Label>Mesa</Form.Label>
            <Form.Select
              value={mesaId}
              onChange={(e) => setMesaId(e.target.value)}
            >
              <option value="">Selecione a mesa</option>
              {mesas.map((m) => (
                <option key={m._id} value={m._id}>
                  Mesa {m.numeroMesa} - {m.ambiente?.nome || 'N/A'}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {mesaId && (
            <Form.Group className="mb-3" controlId="garcomSelect">
              <Form.Label>Garçom Responsável</Form.Label>
              <Form.Select
                value={selectedGarcom}
                onChange={(e) => setSelectedGarcom(e.target.value)}
                required
              >
                <option value="">Selecione o garçom</option>
                {waiters.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.nome} ({w.email})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

          {mesaId && (
            <div className="mb-3">
              <Button variant="outline-primary" onClick={handleGenerateConferencePDF}>
                Gerar PDF de Conferência
              </Button>
            </div>
          )}

          {pedidos.length > 0 ? (
            <>
              <h5>Pedidos (status = "Entregue")</h5>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>ID do Pedido</th>
                    <th>Itens</th>
                    <th>Total (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((p) => (
                    <tr key={p._id}>
                      <td>{p.orderNumber || p._id}</td>
                      <td>
                        <ul>
                          {p.itens.map((item, i) => (
                            <li key={i}>
                              {item.quantidade} x {item.product?.nome || '???'} (
                              R${(item.product?.preco * item.quantidade).toFixed(2)})
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td>R$ {p.total?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          ) : (
            mesaId && <Alert variant="info">Nenhum pedido "Entregue" nesta mesa.</Alert>
          )}

          <p>
            <strong>Total Mesa (sem desconto): </strong>R$ {totalMesa.toFixed(2)}
          </p>

          <h5>Desconto</h5>
          <Form.Group className="mb-3">
            <Form.Label>Tipo de Desconto</Form.Label>
            <Form.Select
              value={tipoDesconto}
              onChange={(e) => setTipoDesconto(e.target.value)}
            >
              <option value="nenhum">Nenhum</option>
              <option value="porcentagem">Porcentagem (%)</option>
              <option value="valor">Valor (R$)</option>
            </Form.Select>
          </Form.Group>

          {tipoDesconto !== 'nenhum' && (
            <Form.Group className="mb-3">
              <Form.Label>
                {tipoDesconto === 'porcentagem'
                  ? 'Porcentagem de Desconto (%)'
                  : 'Valor de Desconto (R$)'}
              </Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={valorDesconto}
                onChange={(e) => setValorDesconto(e.target.value)}
                required
              />
            </Form.Group>
          )}

          <p>
            <strong>Total c/ Desconto:</strong> R$ {totalComDesconto.toFixed(2)}
          </p>

          <div className="mb-3">
            <h5>Taxa de Serviço</h5>
            <Form.Check
              type="switch"
              label="Cobrar Taxa de Serviço?"
              checked={cobrarTaxaServico}
              onChange={(e) => setCobrarTaxaServico(e.target.checked)}
            />
            {cobrarTaxaServico && (
              <p>
                <strong>Valor da Taxa:</strong> R$ {totalTaxaServico.toFixed(2)}
              </p>
            )}
          </div>

          <p>
            <strong>Total Final:</strong>{' '}
            <Badge bg="success" className="fs-5">
              R$ {totalFinal.toFixed(2)}
            </Badge>
          </p>

          {troco > 0 && (
            <p>
              <strong>Troco:</strong>{' '}
              <Badge bg="warning" text="dark" className="fs-5">
                R$ {troco.toFixed(2)}
              </Badge>
            </p>
          )}

          <h5>Pagamentos</h5>
          {pagamentos.map((pay, idx) => (
            <div
              key={idx}
              style={{
                border: '1px solid #ccc',
                padding: 10,
                marginBottom: 10,
                borderRadius: 6,
              }}
            >
              <Form.Group className="mb-2">
                <Form.Label>Método</Form.Label>
                <Form.Select
                  value={pay.metodo}
                  onChange={(e) => handlePaymentChange(idx, 'metodo', e.target.value)}
                  required
                >
                  <option value="dinheiro">Dinheiro</option>
                  <option value="cartao">Cartão</option>
                  <option value="pix">Pix</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Valor (R$)</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={pay.valor}
                  onChange={(e) => handlePaymentChange(idx, 'valor', e.target.value)}
                  required
                />
              </Form.Group>
              {idx > 0 && (
                <Button variant="danger" onClick={() => removePagamento(idx)}>
                  Remover
                </Button>
              )}
            </div>
          ))}
          <Button variant="secondary" onClick={addPagamento}>
            + Adicionar Pagamento
          </Button>
          <p className="mt-2">Total Pago: R$ {totalPagoSomado.toFixed(2)}</p>

          <Button variant="primary" type="submit" disabled={finalizing}>
            {finalizing ? 'Finalizando...' : 'Finalizar Mesa'}
          </Button>

          {pdfPath && (
            <div className="mt-3">
              <Button variant="success" onClick={handleGeneratePDF} className="me-2">
                Gerar PDF Finalização
              </Button>
              <Button
                variant="primary"
                onClick={() => setShowEmailModal(true)}
                className="me-2"
              >
                Enviar por Email
              </Button>
            </div>
          )}

          {/* Modal para Enviar Email */}
          <Modal show={showEmailModal} onHide={() => setShowEmailModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Enviar PDF por Email</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group controlId="emailDestino">
                  <Form.Label>Endereço de Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Digite o email do destinatário"
                    value={emailDestino}
                    onChange={(e) => setEmailDestino(e.target.value)}
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowEmailModal(false)}>
                Fechar
              </Button>
              <Button
                variant="primary"
                onClick={handleSendEmail}
                disabled={enviandoEmail}
              >
                {enviandoEmail ? 'Enviando...' : 'Enviar Email'}
              </Button>
            </Modal.Footer>
          </Modal>
        </Form>
      )}
    </Container>
  );
};

export default FinalizedOrderForm;
