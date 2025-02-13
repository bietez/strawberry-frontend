// src/components/OrderList.js

import React from 'react';
import { Table, Badge } from 'react-bootstrap';

function OrderList({ pedidos }) {
  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Número do Pedido</th>
          <th>Garçom</th>
          <th>Itens</th>
          <th>Total</th>
          <th>Status</th>
          <th>Tipo do Pedido</th>
        </tr>
      </thead>
      <tbody>
        {pedidos.map((pedido) => (
          <tr key={pedido._id}>
            <td>{pedido.orderNumber}</td>
            <td>{pedido.garcom?.nome || 'N/A'}</td>
            <td>
              <ul>
                {pedido.itens.map((item) => (
                  <li key={item._id}>
                    {item.quantidade} x {item.product.nome} - R$ {(item.product.preco * item.quantidade).toFixed(2)}
                  </li>
                ))}
              </ul>
            </td>
            <td>R$ {pedido.total.toFixed(2)}</td>
            <td>
              <Badge
                bg={
                  pedido.status.toLowerCase() === 'pendente'
                    ? 'warning'
                    : pedido.status.toLowerCase() === 'pronto'
                    ? 'primary'
                    : pedido.status.toLowerCase() === 'pago'
                    ? 'success'
                    : 'secondary'
                }
              >
                {pedido.status}
              </Badge>
            </td>
            <td>{pedido.tipoPedido.charAt(0).toUpperCase() + pedido.tipoPedido.slice(1)}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default OrderList;
