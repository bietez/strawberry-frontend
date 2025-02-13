// src/pages/Unauthorized.js
import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Unauthorized() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <Container
      className="d-flex flex-column justify-content-center align-items-center"
      style={{ minHeight: '100vh' }}
    >
      <Card className="shadow-lg" style={{ width: '100%', maxWidth: '500px' }}>
        <Card.Body className="text-center">
          <Card.Title className="mb-4">Acesso Proibido</Card.Title>
          <Card.Text className="mb-4">
            Ops! Parece que você não tem permissão para acessar esta página.
          </Card.Text>
          <Button variant="primary" onClick={handleGoBack}>
            Voltar para a página inicial
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Unauthorized;
