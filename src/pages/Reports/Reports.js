// src/pages/Reports/Reports.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';

function Reports() {
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    api
      .get('/reports/statistics')
      .then((response) => setStatistics(response.data))
      .catch((error) => console.error('Erro ao obter estatísticas:', error));
  }, []);

  if (!statistics) {
    return <div>Carregando estatísticas...</div>;
  }

  return (
    <div>
      <h2>Relatórios e Estatísticas</h2>
      <p>Total de Vendas: {statistics.totalSales}</p>
      <p>Total de Pedidos: {statistics.totalOrders}</p>
      <p>Produto Mais Vendido: {statistics.topProduct?.nome || 'N/A'}</p>
      {/* Exiba outras estatísticas conforme necessário */}
    </div>
  );
}

export default Reports;
