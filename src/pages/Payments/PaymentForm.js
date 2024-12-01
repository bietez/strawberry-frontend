// src/pages/Payments/PaymentForm.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

function PaymentForm() {
  const [orders, setOrders] = useState([]);
  const [payment, setPayment] = useState({
    pedidoId: '',
    metodoPagamento: 'Dinheiro',
    valorPago: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/orders')
      .then((response) => setOrders(response.data.filter(order => order.status !== 'Pago')))
      .catch((error) => console.error('Erro ao obter pedidos:', error));
  }, []);

  const handleChange = (e) => {
    setPayment({ ...payment, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/payments', payment);
      alert('Pagamento processado com sucesso!');
      navigate('/orders');
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      alert('Erro ao processar pagamento');
    }
  };

  return (
    <div>
      <h2>Processar Pagamento</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Pedido:</label>
          <select name="pedidoId" value={payment.pedidoId} onChange={handleChange} required>
            <option value="">Selecione um pedido</option>
            {orders.map(order => (
              <option key={order._id} value={order._id}>
                Pedido {order._id} - Mesa {order.mesa.numeroMesa}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Método de Pagamento:</label>
          <select name="metodoPagamento" value={payment.metodoPagamento} onChange={handleChange}>
            <option value="Dinheiro">Dinheiro</option>
            <option value="Cartão">Cartão</option>
            <option value="PIX">PIX</option>
          </select>
        </div>
        <div>
          <label>Valor Pago:</label>
          <input type="number" name="valorPago" value={payment.valorPago} onChange={handleChange} required />
        </div>
        <button type="submit">Processar Pagamento</button>
      </form>
    </div>
  );
}

export default PaymentForm;
