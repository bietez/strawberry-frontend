// src/components/ifood/OrdersTab.js

import React, { useState, useEffect } from "react";
import { Button, Spinner, Table, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import api from "../../services/api";

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pollingActive, setPollingActive] = useState(false);

  // Filtros de evento
  const [filterTypes, setFilterTypes] = useState("PLC,REC");         // Ex.: "PLC,REC"
  const [filterGroups, setFilterGroups] = useState("ORDER_STATUS");  // Ex.: "ORDER_STATUS"
  const [filterCategories, setFilterCategories] = useState("");      // Ex.: "FOOD"

  // 1. Iniciar o Polling (chama /ifood/polling/start)
  const startPolling = async () => {
    setLoading(true);
    try {
      await api.post("/ifood/polling/start", {
        // Se quiser mandar filtros no body
        categories: filterCategories,
        groups: filterGroups,
        types: filterTypes
      });
      toast.success("Polling iniciado!");
      setPollingActive(true);
    } catch (error) {
      console.error("Erro ao iniciar polling:", error);
      toast.error("Erro ao iniciar polling.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Parar o Polling (chama /ifood/polling/stop)
  const stopPolling = async () => {
    setLoading(true);
    try {
      await api.post("/ifood/polling/stop");
      toast.success("Polling parado!");
      setPollingActive(false);
    } catch (error) {
      console.error("Erro ao parar polling:", error);
      toast.error("Erro ao parar polling.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Buscar eventos MANUALMENTE
  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Passar os filtros pela query: ?types=PLC,REC&groups=ORDER_STATUS&categories=FOOD
      const params = {};
      if (filterTypes) params.types = filterTypes;
      if (filterGroups) params.groups = filterGroups;
      if (filterCategories) params.categories = filterCategories;

      const response = await api.get("/ifood/events", { params });
      const events = response.data;

      if (!Array.isArray(events) || events.length === 0) {
        toast.info("Nenhum evento novo.");
      } else {
        console.log("Eventos recebidos:", events);

        // Processar cada evento
        const eventIdsToAck = [];

        for (const ev of events) {
          eventIdsToAck.push(ev.id);

          // LOG para ver code e orderId
          console.log("Event code:", ev.code, "fullCode:", ev.fullCode, "orderId:", ev.orderId);

          // Se for novo pedido (code=PLC) ou alterado (REC)
          if (ev.code === "PLC" || ev.code === "REC") {
            // Buscar detalhes do pedido
            await handleNewOrderEvent(ev.orderId);
          }
        }

        // Dar ACK nos eventos recebidos
        if (eventIdsToAck.length > 0) {
          await ackEvents(eventIdsToAck);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
      toast.error("Erro ao buscar eventos.");
    } finally {
      setLoading(false);
    }
  };

  // 4. Dar ACK
  const ackEvents = async (eventIds) => {
    try {
      await api.post("/ifood/events/ack", { eventIds });
      console.log(`ACK enviado para ${eventIds.length} evento(s).`);
    } catch (error) {
      console.error("Erro ao dar ACK:", error);
      toast.error("Erro ao dar ACK nos eventos.");
    }
  };

  // 5. Ao detectar um PLC/REC, buscar detalhes do pedido
  const handleNewOrderEvent = async (orderId) => {
    if (!orderId) return; // Se não tiver ID
    try {
      const res = await api.get(`/ifood/orders/${orderId}`);
      const orderDetails = res.data;
      // Salvar no state
      setOrders((prev) => {
        const exists = prev.find((o) => o.id === orderDetails.id);
        if (exists) {
          return prev.map((o) => (o.id === orderDetails.id ? orderDetails : o));
        } else {
          return [...prev, orderDetails];
        }
      });
      toast.success(`Novo pedido ${orderId} adicionado!`);
    } catch (error) {
      console.error("Erro ao obter detalhes do pedido:", error);
    }
  };

  // 6. Ações no pedido
  const confirmOrder = async (orderId) => {
    setLoading(true);
    try {
      await api.post(`/ifood/orders/${orderId}/confirm`);
      toast.success(`Pedido ${orderId} confirmado!`);
    } catch (error) {
      console.error("Erro ao confirmar pedido:", error);
      toast.error(`Erro ao confirmar pedido ${orderId}.`);
    } finally {
      setLoading(false);
    }
  };

  const startPreparation = async (orderId) => {
    setLoading(true);
    try {
      await api.post(`/ifood/orders/${orderId}/startPreparation`);
      toast.success(`Preparo iniciado no pedido ${orderId}!`);
    } catch (error) {
      console.error("Erro ao iniciar preparo:", error);
      toast.error(`Erro ao iniciar preparo do pedido ${orderId}.`);
    } finally {
      setLoading(false);
    }
  };

  const readyToPickup = async (orderId) => {
    setLoading(true);
    try {
      await api.post(`/ifood/orders/${orderId}/readyToPickup`);
      toast.success(`Pedido ${orderId} pronto para retirada!`);
    } catch (error) {
      console.error("Erro ao marcar pronto:", error);
      toast.error(`Erro ao marcar pedido ${orderId} como pronto.`);
    } finally {
      setLoading(false);
    }
  };

  const dispatchOrder = async (orderId) => {
    setLoading(true);
    try {
      await api.post(`/ifood/orders/${orderId}/dispatch`);
      toast.success(`Pedido ${orderId} despachado!`);
    } catch (error) {
      console.error("Erro ao despachar pedido:", error);
      toast.error(`Erro ao despachar pedido ${orderId}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h4>iFood Orders</h4>
      <p>Página para receber pedidos em tempo real via Polling.</p>

      {/* Polling Automático */}
      <div className="mb-3">
        <Button
          variant="success"
          onClick={startPolling}
          className="me-2"
          disabled={pollingActive || loading}
        >
          {loading ? <Spinner size="sm" animation="border" /> : "Iniciar Polling"}
        </Button>
        <Button
          variant="danger"
          onClick={stopPolling}
          disabled={!pollingActive || loading}
        >
          {loading ? <Spinner size="sm" animation="border" /> : "Parar Polling"}
        </Button>
      </div>

      {/* Poll manual */}
      <div className="mb-3">
        <Form.Label>Filtrar Eventos</Form.Label>
        <Form.Control
          type="text"
          placeholder='Ex: "PLC,REC"'
          value={filterTypes}
          onChange={(e) => setFilterTypes(e.target.value)}
          className="mb-2"
        />
        <Form.Control
          type="text"
          placeholder='Ex: "ORDER_STATUS"'
          value={filterGroups}
          onChange={(e) => setFilterGroups(e.target.value)}
          className="mb-2"
        />
        <Form.Control
          type="text"
          placeholder='Ex: "FOOD"'
          value={filterCategories}
          onChange={(e) => setFilterCategories(e.target.value)}
          className="mb-2"
        />
        <Button variant="info" onClick={fetchEvents} disabled={loading}>
          {loading ? <Spinner size="sm" animation="border" /> : "Buscar Eventos Agora"}
        </Button>
      </div>

      <hr />

      {/* Tabela de pedidos salvos localmente */}
      <h5>Pedidos Recebidos</h5>
      {orders.length === 0 ? (
        <p>Nenhum pedido armazenado ainda.</p>
      ) : (
        <Table bordered hover size="sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>OrderType</th>
              <th>Criado em</th>
              <th>Total (R$)</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              return (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.orderType}</td>
                  <td>{o.createdAt ? new Date(o.createdAt).toLocaleString() : "--"}</td>
                  <td>{o.total?.orderAmount ?? 0}</td>
                  <td>
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => confirmOrder(o.id)}
                      className="me-1"
                      disabled={loading}
                    >
                      Confirmar
                    </Button>
                    <Button
                      variant="outline-warning"
                      size="sm"
                      onClick={() => startPreparation(o.id)}
                      className="me-1"
                      disabled={loading}
                    >
                      Iniciar Preparo
                    </Button>
                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={() => readyToPickup(o.id)}
                      className="me-1"
                      disabled={loading}
                    >
                      Pronto
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => dispatchOrder(o.id)}
                      disabled={loading}
                    >
                      Despachar
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </div>
  );
}

export default OrdersTab;
