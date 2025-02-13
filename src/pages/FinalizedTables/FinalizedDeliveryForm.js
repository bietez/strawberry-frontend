// src/pages/FinalizedDeliveries/FinalizedDeliveryForm.js

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

const FinalizedDeliveryForm = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [finalizing, setFinalizing] = useState(false);

  // Lista de pedidos com status "Entregue" e tipoPedido="local"
  const [deliveries, setDeliveries] = useState([]);
  // ID do pedido selecionado
  const [deliveryId, setDeliveryId] = useState('');
  // Detalhes do pedido
  const [pedido, setPedido] = useState(null);

  // Lista de garçons/responsáveis
  const [waiters, setWaiters] = useState([]);
  const [selectedGarcom, setSelectedGarcom] = useState('');

  // Desconto
  const [tipoDesconto, setTipoDesconto] = useState('nenhum');
  const [valorDesconto, setValorDesconto] = useState('');

  // Taxa de Entrega
  const [cobrarTaxaEntrega, setCobrarTaxaEntrega] = useState(true);
  const [valorTaxaEntrega, setValorTaxaEntrega] = useState(10);

  // Totais
  const [totalPedido, setTotalPedido] = useState(0);
  const [totalComDesconto, setTotalComDesconto] = useState(0);

  // Pagamentos
  const [pagamentos, setPagamentos] = useState([{ metodo: 'dinheiro', valor: '' }]);

  // PDF e troco
  const [pdfPath, setPdfPath] = useState('');
  const [troco, setTroco] = useState(0);

  // Modal de email
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailDestino, setEmailDestino] = useState('');
  const [enviandoEmail, setEnviandoEmail] = useState(false);

  /**
   * 1) Carregar pedidos com:
   *    - status = "Entregue"
   *    - tipoPedido = "local"
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/orders', {
          params: { tipoPedido: 'entrega', status: 'Entregue' },
        });
        setDeliveries(res.data.orders || []);
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar dados iniciais.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /**
   * 2) Buscar os detalhes do pedido selecionado
   */
  useEffect(() => {
    if (!deliveryId) {
      setPedido(null);
      setTotalPedido(0);
      return;
    }
    const fetchPedido = async () => {
      try {
        const resp = await api.get(`/orders/${deliveryId}`);
        const p = resp.data;
        setPedido(p);
        setTotalPedido(p.total || 0);
      } catch (err) {
        console.error(err);
        toast.error('Erro ao obter os detalhes do pedido.');
      }
    };
    fetchPedido();
  }, [deliveryId]);

  /**
   * 3) Carregar os garçons/responsáveis
   */
  useEffect(() => {
    const fetchWaiters = async () => {
      try {
        const waitersResp = await api.get('/users/team-members');
        const allWaiters = waitersResp.data.filter(
          (u) => u.role === 'waiter' || u.role === 'agent'
        );
        setWaiters(allWaiters);
      } catch (error) {
        console.error(error);
        setError('Erro ao carregar garçons/responsáveis.');
      }
    };
    fetchWaiters();
  }, []);

  /**
   * 4) Recalcular total com desconto
   */
  useEffect(() => {
    let valor = totalPedido;
    if (tipoDesconto === 'porcentagem' && valorDesconto) {
      const pct = parseFloat(valorDesconto) || 0;
      valor -= (valor * pct) / 100;
    } else if (tipoDesconto === 'valor' && valorDesconto) {
      const val = parseFloat(valorDesconto) || 0;
      valor = Math.max(valor - val, 0);
    }
    setTotalComDesconto(valor);
  }, [totalPedido, tipoDesconto, valorDesconto]);

  /**
   * 5) Calcular total final (incluindo taxa de entrega)
   */
  const totalFinal = (() => {
    let total = totalComDesconto;
    if (cobrarTaxaEntrega) {
      total += parseFloat(valorTaxaEntrega) || 0;
    }
    return parseFloat(total.toFixed(2));
  })();

  /**
   * 6) Calcular total pago e o troco
   */
  const totalPagoSomado = pagamentos.reduce(
    (acc, p) => acc + (parseFloat(p.valor) || 0),
    0
  );

  useEffect(() => {
    if (totalPagoSomado > totalFinal) {
      setTroco(totalPagoSomado - totalFinal);
    } else {
      setTroco(0);
    }
  }, [totalPagoSomado, totalFinal]);

  // Adicionar pagamento
  const addPagamento = () => {
    setPagamentos([...pagamentos, { metodo: 'dinheiro', valor: '' }]);
  };

  // Remover pagamento
  const removePagamento = (index) => {
    const tmp = [...pagamentos];
    tmp.splice(index, 1);
    setPagamentos(tmp);
  };

  const handlePaymentChange = (index, field, value) => {
    const tmp = [...pagamentos];
    tmp[index][field] = value;
    setPagamentos(tmp);
  };

  /**
   * 7) Finalizar o pedido (tipoPedido = local)
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!deliveryId) {
      toast.error('Selecione um pedido.');
      return;
    }
    if (!selectedGarcom) {
      toast.error('Selecione o responsável (garçom).');
      return;
    }
    if (totalPagoSomado < totalFinal) {
      toast.error('Pagamentos são menores que o total final.');
      return;
    }

    setFinalizing(true);
    try {
      const payload = {
        tipoPedido: 'local', // Continua marcado como local
        formaPagamento: pagamentos.map((p) => p.metodo),
        valorPago: totalPagoSomado,
        tipoDesconto,
        valorDesconto: parseFloat(valorDesconto) || 0,
        cobrarTaxaEntrega,
        valorTaxaEntrega: parseFloat(valorTaxaEntrega) || 0,
        garcomId: selectedGarcom,
      };

      /**
       * A rota abaixo é apenas um exemplo. 
       * Ajuste conforme sua rota real de finalização.
       * Exemplo: /finalized-tables/delivery/:deliveryId/finalizar
       */
      const resp = await api.post(
        `/finalized-tables/delivery/${deliveryId}/finalizar`,
        payload
      );
      toast.success('Pedido finalizado com sucesso!');

      if (resp.data.pdfPath) {
        setPdfPath(resp.data.pdfPath);
      } else {
        setPdfPath('');
      }

      // Remove o pedido finalizado da lista
      setDeliveries((prev) => prev.filter((d) => d._id !== deliveryId));

      // Resetar estados
      setDeliveryId('');
      setPedido(null);
      setSelectedGarcom('');
      setTipoDesconto('nenhum');
      setValorDesconto('');
      setCobrarTaxaEntrega(true);
      setValorTaxaEntrega(10);
      setPagamentos([{ metodo: 'dinheiro', valor: '' }]);
      setTroco(0);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Erro ao finalizar o pedido.');
    } finally {
      setFinalizing(false);
    }
  };

  /**
   * 8) Gerar PDF de conferência
   * Ajuste a rota conforme sua necessidade
   */
  const handleGenerateConferencePDF = async () => {
    if (!deliveryId) {
      toast.error('Selecione um pedido primeiro.');
      return;
    }
    try {
      // Exemplo de rota GET
      const resp = await api.get(`/comandas/delivery/${deliveryId}/conferencia`, {
        params: { tipo: 'local' },
      });
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

  /**
   * 9) Gerar PDF final
   */
  const handleGeneratePDF = () => {
    if (!pdfPath) {
      toast.error('Nenhum PDF disponível.');
      return;
    }
    window.open(pdfPath, '_blank');
  };

  /**
   * 10) Enviar PDF por email
   */
  const handleSendEmail = async () => {
    if (!emailDestino) {
      toast.error('Insira um endereço de email.');
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

  // Renderização do componente
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
      <h2>Finalizar Pedido Local</h2>
      {deliveries.length === 0 ? (
        <Alert variant="info">Nenhum pedido local pendente.</Alert>
      ) : (
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="deliverySelect">
            <Form.Label>Pedido Local (status=Entregue)</Form.Label>
            <Form.Select
              value={deliveryId}
              onChange={(e) => setDeliveryId(e.target.value)}
            >
              <option value="">Selecione um pedido</option>
              {deliveries.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.orderNumber
                    ? `Pedido #${d.orderNumber} - ${d.nomeCliente || 'Sem nome'}`
                    : `ID: ${d._id}`}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {deliveryId && (
            <>
              <Form.Group className="mb-3" controlId="garcomSelect">
                <Form.Label>Responsável pela Finalização (Garçom)</Form.Label>
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

              <div className="mb-3">
                <Button variant="outline-primary" onClick={handleGenerateConferencePDF}>
                  Gerar PDF de Conferência
                </Button>
              </div>

              {pedido && (
                <>
                  <h5>Itens do Pedido</h5>
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th>Quantidade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedido.itens.map((item, index) => (
                        <tr key={index}>
                          <td>{item.product?.nome || '??'}</td>
                          <td>{item.quantidade}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  <p>
                    <strong>Valor Total Pedido (sem desconto):</strong>{' '}
                    R$ {totalPedido.toFixed(2)}
                  </p>
                </>
              )}

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
                <strong>Total c/ Desconto:</strong>{' '}
                R$ {totalComDesconto.toFixed(2)}
              </p>

              <div className="mb-3">
                <h5>Taxa de Entrega</h5>
                <Form.Check
                  type="switch"
                  label="Cobrar Taxa de Entrega?"
                  checked={cobrarTaxaEntrega}
                  onChange={(e) => setCobrarTaxaEntrega(e.target.checked)}
                />
                {cobrarTaxaEntrega && (
                  <Form.Group className="mt-2">
                    <Form.Label>Valor da Taxa de Entrega (R$)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={valorTaxaEntrega}
                      onChange={(e) => setValorTaxaEntrega(e.target.value)}
                    />
                  </Form.Group>
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
                {finalizing ? 'Finalizando...' : 'Finalizar Pedido'}
              </Button>

              {pdfPath && (
                <div className="mt-3">
                  <Button
                    variant="success"
                    onClick={handleGeneratePDF}
                    className="me-2"
                  >
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
            </>
          )}

          {/* Modal para envio de PDF por email */}
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
              <Button variant="primary" onClick={handleSendEmail} disabled={enviandoEmail}>
                {enviandoEmail ? 'Enviando...' : 'Enviar Email'}
              </Button>
            </Modal.Footer>
          </Modal>
        </Form>
      )}
    </Container>
  );
};

export default FinalizedDeliveryForm;
