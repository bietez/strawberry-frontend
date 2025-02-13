// src/components/ifood/MerchantTab.js

import React, { useState, useEffect } from "react";
import { Form, Button, Table, Spinner, Row, Col, Collapse, Card } from "react-bootstrap";
import { toast } from "react-toastify";
import api from "../../services/api";

// Lista de dias da semana no mesmo formato que o iFood
const allDays = [
  { label: "Domingo", value: "SUNDAY" },
  { label: "Segunda-feira", value: "MONDAY" },
  { label: "Terça-feira", value: "TUESDAY" },
  { label: "Quarta-feira", value: "WEDNESDAY" },
  { label: "Quinta-feira", value: "THURSDAY" },
  { label: "Sexta-feira", value: "FRIDAY" },
  { label: "Sábado", value: "SATURDAY" },
];

/**
 * Recebe duas strings "HH:MM" e retorna a diferença em minutos.
 * Se endTime < startTime, soma 24h.
 */
function calculateDuration(startTime, endTime) {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  let startTotal = sh * 60 + sm;
  let endTotal = eh * 60 + em;
  let diff = endTotal - startTotal;
  if (diff < 0) diff += 24 * 60;
  return diff;
}

/**
 * Recebe "HH:MM:SS" e retorna "HH:MM".
 */
function extractHM(timeStr) {
  if (!timeStr) return "";
  return timeStr.slice(0, 5); // ex: "14:00:00" -> "14:00"
}

/**
 * Soma duration (em minutos) a "startHHMM" e retorna "HH:MM".
 */
function calcEndTime(startHHMM, duration) {
  if (!startHHMM) return "";
  const [hh, mm] = startHHMM.split(":").map(Number);
  const startMinutes = hh * 60 + mm;
  const endMinutes = (startMinutes + duration) % (24 * 60);
  const endH = Math.floor(endMinutes / 60);
  const endM = endMinutes % 60;
  return String(endH).padStart(2, "0") + ":" + String(endM).padStart(2, "0");
}

/**
 * Monta ISO8601 para data/hora local (sem timezone extra).
 */
function toIso8601(dateString, timeString) {
  return `${dateString}T${timeString}:00.000Z`;
}

function MerchantTab() {
  // Lista de merchants
  const [merchants, setMerchants] = useState([]);
  // Merchant selecionado
  const [selectedMerchant, setSelectedMerchant] = useState(null);

  // Horários: array de { dayOfWeek, start, end }
  const [weekSchedule, setWeekSchedule] = useState(
    allDays.map((d) => ({
      dayOfWeek: d.value,
      start: "",
      end: "",
    }))
  );

  // Interrupções
  const [interruptions, setInterruptions] = useState([]);
  const [newInterruption, setNewInterruption] = useState({
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  });

  // Status
  const [merchantStatus, setMerchantStatus] = useState([]);
  const [merchantOperationStatus, setMerchantOperationStatus] = useState(null);
  const [selectedOperation, setSelectedOperation] = useState("");

  // Collapse flags
  const [openStatusList, setOpenStatusList] = useState(false);
  const [openOperationStatus, setOpenOperationStatus] = useState(false);

  // Paginação
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);

  // ---------------------------------------------------
  // 1) Listar merchants
  // ---------------------------------------------------
  const fetchMerchants = async () => {
    setLoading(true);
    try {
      // GET /api/ifood/merchants?page=X&size=Y
      const response = await api.get("/ifood/merchants", { params: { page, size } });
      setMerchants(response.data);
      toast.success("Merchants carregados com sucesso!");
    } catch (error) {
      console.error("Erro ao carregar merchants:", error);
      toast.error("Erro ao carregar merchants.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------
  // 2) Buscar detalhes + horários do merchant
  // ---------------------------------------------------
  const fetchMerchantDetails = async (merchantId) => {
    setLoading(true);
    try {
      // a) Detalhes
      const response = await api.get(`/ifood/merchants/${merchantId}`);
      setSelectedMerchant(response.data);

      // b) Horários
      await fetchOpeningHours(merchantId);

      // Zera interrupções e status
      setInterruptions([]);
      setMerchantStatus([]);
      setMerchantOperationStatus(null);
      setSelectedOperation("");
      setOpenStatusList(false);
      setOpenOperationStatus(false);

      toast.success("Detalhes carregados!");
    } catch (error) {
      console.error("Erro ao obter detalhes do merchant:", error);
      toast.error("Erro ao obter detalhes do merchant.");
    } finally {
      setLoading(false);
    }
  };

  // 2.2) Buscar opening hours
  const fetchOpeningHours = async (merchantId) => {
    setLoading(true);
    try {
      // GET /ifood/merchants/{merchantId}/opening-hours
      const res = await api.get(`/ifood/merchants/${merchantId}/opening-hours`);
      console.log("Resposta bruta de opening-hours:", res.data);
      // Exemplo real: array de shifts. Ex:
      // [
      //   { dayOfWeek: "SUNDAY", start: "08:00:00", duration: 480, ... },
      //   { dayOfWeek: "MONDAY", start: "08:00:00", duration: 480, ... },
      //   ...
      // ]
      const shifts = Array.isArray(res.data) ? res.data : [];

      // Mapeia os 7 dias, procurando se há shift para cada dia
      const newWeek = allDays.map((day) => {
        const foundShift = shifts.find((s) => s.dayOfWeek === day.value);
        if (foundShift) {
          const startHM = extractHM(foundShift.start); // "08:00:00" -> "08:00"
          const endHM = calcEndTime(startHM, foundShift.duration);
          return {
            dayOfWeek: day.value,
            start: startHM,
            end: endHM,
          };
        } else {
          return { dayOfWeek: day.value, start: "", end: "" };
        }
      });

      setWeekSchedule(newWeek);
    } catch (error) {
      console.error("Erro ao buscar opening hours:", error);
      toast.error("Erro ao obter horários de funcionamento.");
      // Zera a tabela
      setWeekSchedule(allDays.map((d) => ({ dayOfWeek: d.value, start: "", end: "" })));
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------
  // 3) Criar/Atualizar Horários
  // ---------------------------------------------------
  const createOpeningHoursForWeek = async () => {
    if (!selectedMerchant) {
      toast.warning("Selecione um merchant antes de criar horários.");
      return;
    }
    setLoading(true);
    try {
      // Precisamos enviar: { storeId, shifts: [ { dayOfWeek, start: 'HH:MM:SS', duration }, ... ] }
      const shifts = weekSchedule.map((dayItem) => {
        const duration = calculateDuration(dayItem.start, dayItem.end);
        return {
          dayOfWeek: dayItem.dayOfWeek,
          start: (dayItem.start || "00:00") + ":00", // ex: "08:00:00"
          duration,
        };
      });

      const payload = {
        storeId: selectedMerchant.id,
        shifts,
      };

      // PUT /ifood/merchants/{merchantId}/opening-hours
      await api.put(`/ifood/merchants/${selectedMerchant.id}/opening-hours`, payload);

      toast.success("Horários de funcionamento atualizados!");
      // Buscar novamente para refletir a alteração
      await fetchOpeningHours(selectedMerchant.id);
    } catch (error) {
      console.error("Erro ao criar/atualizar horários:", error);
      toast.error("Erro ao criar/atualizar horários.");
    } finally {
      setLoading(false);
    }
  };

  const handleTimeChange = (dayValue, field, newValue) => {
    setWeekSchedule((prev) =>
      prev.map((d) => (d.dayOfWeek === dayValue ? { ...d, [field]: newValue } : d))
    );
  };

  // ---------------------------------------------------
  // 4) Interrupções
  // ---------------------------------------------------
  // a) Listar
  const fetchInterruptions = async () => {
    if (!selectedMerchant) {
      toast.warning("Selecione um merchant primeiro.");
      return;
    }
    setLoading(true);
    try {
      const response = await api.get(`/ifood/merchants/${selectedMerchant.id}/interruptions`);
      setInterruptions(response.data);
      toast.success("Interrupções carregadas!");
    } catch (error) {
      console.error("Erro ao listar interrupções:", error);
      toast.error("Erro ao listar interrupções.");
    } finally {
      setLoading(false);
    }
  };

  // b) Criar interrupção
  const createInterruption = async () => {
    if (!selectedMerchant) {
      toast.warning("Selecione um merchant antes de criar interrupções.");
      return;
    }
    const { description, startDate, startTime, endDate, endTime } = newInterruption;
    if (!description || !startDate || !startTime || !endDate || !endTime) {
      toast.warning("Preencha todos os campos de interrupção.");
      return;
    }

    const startIso = toIso8601(startDate, startTime);
    const endIso = toIso8601(endDate, endTime);

    const payload = { description, start: startIso, end: endIso };

    setLoading(true);
    try {
      await api.post(`/ifood/merchants/${selectedMerchant.id}/interruptions`, payload);
      toast.success("Interrupção criada com sucesso!");
      setNewInterruption({
        description: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
      });
      fetchInterruptions();
    } catch (error) {
      console.error("Erro ao criar interrupção:", error);
      toast.error("Erro ao criar interrupção.");
    } finally {
      setLoading(false);
    }
  };

  // c) Excluir interrupção
  const deleteInterruption = async (interruptionId) => {
    if (!selectedMerchant) return;
    setLoading(true);
    try {
      await api.delete(`/ifood/merchants/${selectedMerchant.id}/interruptions/${interruptionId}`);
      toast.success("Interrupção deletada!");
      fetchInterruptions();
    } catch (error) {
      console.error("Erro ao deletar interrupção:", error);
      toast.error("Erro ao deletar interrupção.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------
  // 5) Status do Merchant
  // ---------------------------------------------------
  const fetchMerchantStatus = async (merchantId) => {
    setLoading(true);
    try {
      const res = await api.get(`/ifood/merchants/${merchantId}/status`);
      setMerchantStatus(res.data);
      setOpenStatusList(true);
    } catch (error) {
      console.error("Erro ao buscar status do merchant:", error);
      toast.error("Erro ao buscar status do merchant.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMerchantStatusByOperation = async (merchantId, operation) => {
    setLoading(true);
    try {
      const res = await api.get(`/ifood/merchants/${merchantId}/status/${operation}`);
      setMerchantOperationStatus(res.data);
      setOpenOperationStatus(true);
    } catch (error) {
      console.error("Erro ao buscar status da operação:", error);
      toast.error(`Erro ao buscar status da operação ${operation}.`);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------
  // useEffect para carregar merchants
  // ---------------------------------------------------
  useEffect(() => {
    fetchMerchants();
    // eslint-disable-next-line
  }, [page, size]);

  // ---------------------------------------------------
  // Render
  // ---------------------------------------------------
  return (
    <div>
      <h4>Merchants</h4>
      <p>Gerencie os merchants associados à sua conta iFood.</p>

      {/* Filtros de paginação */}
      <Form className="mb-3">
        <Row>
          <Col xs={2}>
            <Form.Group>
              <Form.Label>Tamanho da página</Form.Label>
              <Form.Control
                type="number"
                min={1}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
              />
            </Form.Group>
          </Col>
          <Col xs={2}>
            <Form.Group>
              <Form.Label>Página</Form.Label>
              <Form.Control
                type="number"
                min={1}
                value={page}
                onChange={(e) => setPage(Number(e.target.value))}
              />
            </Form.Group>
          </Col>
          <Col className="d-flex align-items-end">
            <Button variant="primary" onClick={fetchMerchants} disabled={loading}>
              {loading ? <Spinner size="sm" animation="border" /> : "Atualizar Lista"}
            </Button>
          </Col>
        </Row>
      </Form>

      {/* Tabela de merchants */}
      <Table bordered hover size="sm">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {merchants.map((m) => (
            <tr key={m.id}>
              <td>{m.id}</td>
              <td>{m.name}</td>
              <td>
                <Button
                  variant="info"
                  size="sm"
                  onClick={() => fetchMerchantDetails(m.id)}
                  disabled={loading}
                >
                  Detalhes
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Se o usuário selecionou um merchant, mostra detalhes */}
      {selectedMerchant && (
        <div className="mt-4">
          <h5>Detalhes do Merchant Selecionado</h5>
          <p>
            <strong>ID:</strong> {selectedMerchant.id}
          </p>
          <p>
            <strong>Nome:</strong> {selectedMerchant.name}
          </p>
          {selectedMerchant.corporateName && (
            <p>
              <strong>Razão Social:</strong> {selectedMerchant.corporateName}
            </p>
          )}

          <hr />
          <h5>Horários de Funcionamento (Domingo a Sábado)</h5>
          <Table bordered hover size="sm">
            <thead>
              <tr>
                <th>Dia</th>
                <th>Início</th>
                <th>Fim</th>
              </tr>
            </thead>
            <tbody>
              {weekSchedule.map((item) => {
                const dayLabel = allDays.find((d) => d.value === item.dayOfWeek)?.label;
                return (
                  <tr key={item.dayOfWeek}>
                    <td>{dayLabel || item.dayOfWeek}</td>
                    <td>
                      <Form.Control
                        type="time"
                        value={item.start}
                        onChange={(e) =>
                          handleTimeChange(item.dayOfWeek, "start", e.target.value)
                        }
                        size="sm"
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="time"
                        value={item.end}
                        onChange={(e) =>
                          handleTimeChange(item.dayOfWeek, "end", e.target.value)
                        }
                        size="sm"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          <Button
            variant="warning"
            size="sm"
            onClick={createOpeningHoursForWeek}
            disabled={loading}
          >
            {loading ? <Spinner size="sm" animation="border" /> : "Criar/Atualizar Horários"}
          </Button>

          <hr />
          <h5>Status do Merchant</h5>
          <Button
            variant="info"
            size="sm"
            onClick={() => fetchMerchantStatus(selectedMerchant.id)}
            disabled={loading}
            className="mb-3"
          >
            {loading ? <Spinner size="sm" animation="border" /> : "Obter Status"}
          </Button>

          <Collapse in={openStatusList}>
            <div>
              {merchantStatus.length > 0 ? (
                <Table bordered hover size="sm" className="mb-4">
                  <thead>
                    <tr>
                      <th>Operação</th>
                      <th>Canal</th>
                      <th>Disponível</th>
                      <th>Estado</th>
                      <th>Reabrir</th>
                      <th>Mensagem</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {merchantStatus.map((st) => (
                      <tr key={st.operation}>
                        <td>{st.operation}</td>
                        <td>{st.salesChannel}</td>
                        <td>{st.available ? "Sim" : "Não"}</td>
                        <td>{st.state}</td>
                        <td>{st.reopenable ? "Sim" : "Não"}</td>
                        <td>
                          {st.message && (
                            <>
                              <strong>{st.message.title}</strong>
                              <div>{st.message.subtitle}</div>
                              <div>{st.message.description}</div>
                            </>
                          )}
                        </td>
                        <td>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedOperation(st.operation);
                              fetchMerchantStatusByOperation(selectedMerchant.id, st.operation);
                            }}
                            disabled={loading}
                          >
                            Ver Detalhes
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p>Nenhum status disponível.</p>
              )}
            </div>
          </Collapse>

          <h5>Status por Operação</h5>
          <Form.Group className="mb-2" controlId="operationSelect">
            <Form.Label>Selecione a Operação</Form.Label>
            <Form.Control
              as="select"
              value={selectedOperation}
              onChange={(e) => setSelectedOperation(e.target.value)}
            >
              <option value="">-- Selecione --</option>
              {merchantStatus.map((st) => (
                <option key={st.operation} value={st.operation}>
                  {st.operation}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          <Button
            variant="info"
            size="sm"
            onClick={() =>
              fetchMerchantStatusByOperation(selectedMerchant.id, selectedOperation)
            }
            disabled={!selectedOperation || loading}
          >
            {loading ? <Spinner size="sm" animation="border" /> : "Obter Status da Operação"}
          </Button>

          <Collapse in={openOperationStatus}>
            <div>
              {merchantOperationStatus && (
                <Card className="mt-3">
                  <Card.Body>
                    <Card.Title>{merchantOperationStatus.operation}</Card.Title>
                    <p>
                      <strong>Canal de Vendas:</strong>{" "}
                      {merchantOperationStatus.salesChannel}
                    </p>
                    <p>
                      <strong>Disponível:</strong>{" "}
                      {merchantOperationStatus.available ? "Sim" : "Não"}
                    </p>
                    <p>
                      <strong>Estado:</strong> {merchantOperationStatus.state}
                    </p>
                    {merchantOperationStatus.message && (
                      <>
                        <strong>{merchantOperationStatus.message.title}</strong>
                        <p>{merchantOperationStatus.message.subtitle}</p>
                        <p>{merchantOperationStatus.message.description}</p>
                      </>
                    )}
                    {merchantOperationStatus.validations &&
                      merchantOperationStatus.validations.length > 0 && (
                        <>
                          <h6>Validações:</h6>
                          <Table bordered hover size="sm">
                            <thead>
                              <tr>
                                <th>ID</th>
                                <th>Código</th>
                                <th>Estado</th>
                                <th>Mensagem</th>
                              </tr>
                            </thead>
                            <tbody>
                              {merchantOperationStatus.validations.map((v) => (
                                <tr key={v.id}>
                                  <td>{v.id}</td>
                                  <td>{v.code}</td>
                                  <td>{v.state}</td>
                                  <td>
                                    <strong>{v.message.title}</strong>
                                    <div>{v.message.subtitle}</div>
                                    <div>{v.message.description}</div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </>
                      )}
                  </Card.Body>
                </Card>
              )}
            </div>
          </Collapse>

          <hr />
          <h5>Interrupções</h5>
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchInterruptions}
            disabled={loading}
            className="mb-2"
          >
            {loading ? <Spinner size="sm" animation="border" /> : "Listar Interrupções"}
          </Button>

          {interruptions.length > 0 ? (
            <Table bordered hover size="sm">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Descrição</th>
                  <th>Início</th>
                  <th>Fim</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {interruptions.map((intr) => (
                  <tr key={intr.id}>
                    <td>{intr.id}</td>
                    <td>{intr.description}</td>
                    <td>{new Date(intr.start).toLocaleString()}</td>
                    <td>{new Date(intr.end).toLocaleString()}</td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => deleteInterruption(intr.id)}
                        disabled={loading}
                      >
                        {loading ? <Spinner size="sm" animation="border" /> : "Excluir"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>Nenhuma interrupção listada.</p>
          )}

          <div className="mt-3">
            <h6>Criar Interrupção</h6>
            <Form>
              <Form.Group className="mb-2">
                <Form.Label>Descrição</Form.Label>
                <Form.Control
                  type="text"
                  value={newInterruption.description}
                  onChange={(e) =>
                    setNewInterruption({
                      ...newInterruption,
                      description: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Row>
                <Col xs={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Data de Início</Form.Label>
                    <Form.Control
                      type="date"
                      value={newInterruption.startDate}
                      onChange={(e) =>
                        setNewInterruption({
                          ...newInterruption,
                          startDate: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col xs={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Hora de Início</Form.Label>
                    <Form.Control
                      type="time"
                      value={newInterruption.startTime}
                      onChange={(e) =>
                        setNewInterruption({
                          ...newInterruption,
                          startTime: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col xs={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Data de Fim</Form.Label>
                    <Form.Control
                      type="date"
                      value={newInterruption.endDate}
                      onChange={(e) =>
                        setNewInterruption({
                          ...newInterruption,
                          endDate: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
                <Col xs={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Hora de Fim</Form.Label>
                    <Form.Control
                      type="time"
                      value={newInterruption.endTime}
                      onChange={(e) =>
                        setNewInterruption({
                          ...newInterruption,
                          endTime: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Button
                variant="success"
                size="sm"
                onClick={createInterruption}
                disabled={loading}
              >
                {loading ? <Spinner size="sm" animation="border" /> : "Criar Interrupção"}
              </Button>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MerchantTab;
