// src/components/OrderItemCard.js
import React from 'react';
import { Card, Button, Form, Row, Col } from 'react-bootstrap';

function OrderItemCard({ index, item, products, handleFormChange, handleRemoveItem }) {
  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body>
        <Row className="align-items-center">
          <Col md={4}>
            <Form.Group controlId={`itens.${index}.product`}>
              <Form.Label>Produto</Form.Label>
              <Form.Select
                name="product"
                value={item.product}
                onChange={(e) => handleFormChange(e, index, 'itens')}
                required
              >
                <option value="">Selecione um produto</option>
                {products.map((produto) => (
                  <option key={produto._id} value={produto._id}>
                    {produto.nome} - R$ {produto.preco.toFixed(2)}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group controlId={`itens.${index}.quantidade`}>
              <Form.Label>Quantidade</Form.Label>
              <Form.Control
                type="number"
                name="quantidade"
                value={item.quantidade}
                min="1"
                onChange={(e) => handleFormChange(e, index, 'itens')}
                required
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group controlId={`itens.${index}.tipo`}>
              <Form.Label>Tipo</Form.Label>
              <Form.Select
                name="tipo"
                value={item.tipo}
                onChange={(e) => handleFormChange(e, index, 'itens')}
                required
              >
                <option value="entrada">Entrada</option>
                <option value="prato principal">Prato Principal</option>
                <option value="sobremesa">Sobremesa</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={2} className="d-flex justify-content-end">
            <Button variant="danger" onClick={() => handleRemoveItem(index)}>
              Remover
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}

export default OrderItemCard;
