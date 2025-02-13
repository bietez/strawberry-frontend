// src/components/ProductSelectionModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Button, Card, Row, Col, Form, Spinner, Alert } from 'react-bootstrap';
import './ProductSelectionModal.css'; // Importar CSS personalizado

function ProductSelectionModal({ show, handleClose, products, onSelectProduct }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    // Filtrar produtos com base no termo de busca
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();
      const filtered = products.filter((product) =>
        product.nome.toLowerCase().includes(lowercasedTerm)
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  return (
    <Modal show={show} onHide={handleClose} size="xl" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>Selecione um Produto</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form className="mb-4">
          <Form.Control
            type="text"
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Form>
        {filteredProducts.length > 0 ? (
          <Row xs={1} sm={2} md={3} lg={4} className="g-4">
            {filteredProducts.map((product) => (
              <Col key={product._id}>
                <Card className="product-card h-100 shadow-sm">
                  <Card.Img
                    variant="top"
                    src={
                      product.imagem ||
                      'https://placehold.co/150?text=Produto+Indisponível'
                    }
                    alt={product.nome}
                    className="product-image"
                    style={{
                      height: '150px',
                      objectFit: 'cover',
                    }}
                  />
                  <Card.Body className="d-flex flex-column">
                    <Card.Title>{product.nome}</Card.Title>
                    <Card.Text className="flex-grow-1">
                      {product.descricao || 'Descrição não disponível.'}
                    </Card.Text>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="price">R$ {product.preco.toFixed(2)}</span>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onSelectProduct(product)}
                      >
                        Adicionar
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Alert variant="info">Nenhum produto encontrado.</Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ProductSelectionModal;
