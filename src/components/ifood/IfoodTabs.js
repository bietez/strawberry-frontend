// src/components/ifood/IfoodTabs.js
import React, { useState } from "react";
import { Tabs, Tab } from "react-bootstrap";

import AuthenticationTab from "./AuthenticationTab";
import MerchantTab from "./MerchantTab";
import EventsTab from "./EventsTab";
import OrdersTab from "./OrdersTab";
import LogisticsTab from "./LogisticsTab";
import ShippingTab from "./ShippingTab";
import CatalogTab from "./CatalogTab";
import FinancialTab from "./FinancialTab";
import ReviewTab from "./ReviewTab";

function IfoodTabs() {
  const [activeKey, setActiveKey] = useState("autenticacao");

  return (
    <div className="container mt-4">
      <h2>Integração iFood</h2>
      <Tabs
        id="ifood-tabs"
        activeKey={activeKey}
        onSelect={(k) => setActiveKey(k)}
        className="mb-3"
      >
        <Tab eventKey="autenticacao" title="Autenticação">
          <AuthenticationTab />
        </Tab>
        <Tab eventKey="loja" title="Loja">
          <MerchantTab />
        </Tab>
        <Tab eventKey="eventos" title="Eventos">
          <EventsTab />
        </Tab>
        <Tab eventKey="pedidos" title="Pedidos">
          <OrdersTab />
        </Tab>
        <Tab eventKey="logistica" title="Logística">
          <LogisticsTab />
        </Tab>
        <Tab eventKey="envio" title="Envio">
          <ShippingTab />
        </Tab>
        <Tab eventKey="catalogo" title="Catálogo">
          <CatalogTab />
        </Tab>
        <Tab eventKey="financeiro" title="Financeiro">
          <FinancialTab />
        </Tab>
        <Tab eventKey="avaliacoes" title="Avaliações">
          <ReviewTab />
        </Tab>
      </Tabs>
    </div>
  );
}

export default IfoodTabs;
