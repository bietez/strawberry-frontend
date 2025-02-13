// src/components/ifood/EventsTab.js

import React, { useState } from "react";
import { Form, Button, Table, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import api from "../../services/api";

function EventsTab() {
  const [types, setTypes] = useState("PLC,REC,CFM");       // Exemplo de valor default
  const [groups, setGroups] = useState("ORDER_STATUS");    // Exemplo de valor default
  const [categories, setCategories] = useState("");
  const [events, setEvents] = useState([]);
  const [selectedEventIds, setSelectedEventIds] = useState([]);
  const [loading, setLoading] = useState(false);

  // Buscar eventos (GET /ifood/events)
  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Montar querystring
      // Ex: ?types=PLC,REC,CFM&groups=ORDER_STATUS&categories=FOOD
      const params = {};
      if (types) params.types = types;
      if (groups) params.groups = groups;
      if (categories) params.categories = categories;

      const res = await api.get("/ifood/events", { params });
      setEvents(res.data);
      toast.success("Eventos carregados com sucesso!");
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
      toast.error("Erro ao buscar eventos do iFood.");
    } finally {
      setLoading(false);
    }
  };

  // Lidar com checkbox de seleção de eventos
  const handleEventCheckboxChange = (eventId, isChecked) => {
    if (isChecked) {
      setSelectedEventIds((prev) => [...prev, eventId]);
    } else {
      setSelectedEventIds((prev) => prev.filter((id) => id !== eventId));
    }
  };

  // Dar ACK nos eventos selecionados
  const ackSelectedEvents = async () => {
    if (selectedEventIds.length === 0) {
      toast.warning("Nenhum evento selecionado para ACK.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/ifood/events/ack", {
        eventIds: selectedEventIds,
      });
      toast.success("ACK realizado com sucesso!");

      // Após dar ACK, podemos remover esses eventos da lista local
      setEvents((prev) => prev.filter((evt) => !selectedEventIds.includes(evt.id)));
      setSelectedEventIds([]);
      console.log("Resposta do ack:", res.data);
    } catch (error) {
      console.error("Erro ao dar ACK:", error);
      toast.error("Erro ao dar ACK nos eventos do iFood.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h4>Eventos (Polling)</h4>
      <p>Obtenha os eventos mais recentes do iFood e faça ACK após tratá-los.</p>

      {/* Filtros */}
      <Form className="mb-3">
        <Form.Group className="mb-2">
          <Form.Label>Types (separados por vírgula)</Form.Label>
          <Form.Control
            type="text"
            value={types}
            onChange={(e) => setTypes(e.target.value)}
            placeholder="Ex: PLC,REC,CFM"
          />
          <Form.Text>Tipos de evento (code). Ex: PLC (PLACED), REC (RECEIVED)...</Form.Text>
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>Groups (separados por vírgula)</Form.Label>
          <Form.Control
            type="text"
            value={groups}
            onChange={(e) => setGroups(e.target.value)}
            placeholder="Ex: ORDER_STATUS,DELIVERY"
          />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>Categories (separados por vírgula)</Form.Label>
          <Form.Control
            type="text"
            value={categories}
            onChange={(e) => setCategories(e.target.value)}
            placeholder="Ex: FOOD,GROCERY"
          />
        </Form.Group>
        <Button variant="primary" onClick={fetchEvents} disabled={loading}>
          {loading ? <Spinner size="sm" animation="border" /> : "Buscar Eventos"}
        </Button>
      </Form>

      {/* Lista de eventos */}
      <Table bordered hover size="sm">
        <thead>
          <tr>
            <th>Selecionar</th>
            <th>Event ID</th>
            <th>Order ID</th>
            <th>Code</th>
            <th>Full Code</th>
            <th>Criado em</th>
          </tr>
        </thead>
        <tbody>
          {events && events.length > 0 ? (
            events.map((evt) => (
              <tr key={evt.id}>
                <td>
                  <Form.Check
                    type="checkbox"
                    checked={selectedEventIds.includes(evt.id)}
                    onChange={(e) => handleEventCheckboxChange(evt.id, e.target.checked)}
                  />
                </td>
                <td>{evt.id}</td>
                <td>{evt.orderId}</td>
                <td>{evt.code}</td>
                <td>{evt.fullCode}</td>
                <td>{evt.createdAt}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center">
                Nenhum evento carregado.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Botão ACK */}
      {events && events.length > 0 && (
        <Button variant="success" onClick={ackSelectedEvents} disabled={loading}>
          {loading ? <Spinner size="sm" animation="border" /> : "Dar ACK (Eventos Selecionados)"}
        </Button>
      )}
    </div>
  );
}

export default EventsTab;
