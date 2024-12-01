// src/pages/Stock/StockList.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';

function StockList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api
      .get('/products')
      .then((response) => setProducts(response.data))
      .catch((error) => console.error('Erro ao obter produtos:', error));
  }, []);

  const handleUpdateStock = async (productId, newQuantity) => {
    try {
      await api.put(`/stock/${productId}`, { quantidadeEstoque: newQuantity });
      alert('Estoque atualizado com sucesso!');
      // Atualizar a lista de produtos
      const updatedProducts = products.map((product) =>
        product._id === productId
          ? { ...product, quantidadeEstoque: newQuantity }
          : product
      );
      setProducts(updatedProducts);
    } catch (error) {
      alert('Erro ao atualizar estoque: ' + error.response.data.message);
    }
  };

  return (
    <div>
      <h2>Gerenciamento de Estoque</h2>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Estoque Atual</th>
            <th>Atualizar Estoque</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td>{product.nome}</td>
              <td>{product.quantidadeEstoque}</td>
              <td>
                <input
                  type="number"
                  min="0"
                  defaultValue={product.quantidadeEstoque}
                  onBlur={(e) =>
                    handleUpdateStock(product._id, Number(e.target.value))
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StockList;
