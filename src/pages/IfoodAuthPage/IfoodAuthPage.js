import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Button, Spinner, Form } from 'react-bootstrap';

function IfoodAuthPage() {
  const [authData, setAuthData] = useState({
    userCode: '',
    verificationUrlComplete: '',
    authorizationCode: ''
  });
  const [isAuthStarted, setIsAuthStarted] = useState(false);
  const [isAuthCompleted, setIsAuthCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ authenticated: false, expired: false });

  const checkStatus = async () => {
    try {
      const res = await api.get('/ifood/auth/status');
      setStatus(res.data);
      if (res.data.authenticated) {
        setIsAuthCompleted(true);
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const [authStateId, setAuthStateId] = useState(null);

const startAuth = async () => {
  setLoading(true);
  try {
    const response = await api.post('/ifood/auth/start');
    setAuthData({
      userCode: response.data.userCode,
      verificationUrlComplete: response.data.verificationUrlComplete,
      authorizationCode: ''
    });
    // Guardar o ID retornado
    setAuthStateId(response.data.authStateId);

    setIsAuthStarted(true);
    toast.success('Processo de autenticação iniciado. Siga as instruções.');
  } catch (error) {
    console.error('Erro ao iniciar a autenticação com o iFood:', error);
    toast.error('Erro ao iniciar a autenticação com o iFood.');
  }
  setLoading(false);
};

const completeAuth = async (e) => {
  e.preventDefault();
  if (!authData.authorizationCode) {
    toast.error('Por favor, insira o código de autorização.');
    return;
  }
  setLoading(true);
  try {
    await api.post('/ifood/auth/complete', {
      authorizationCode: authData.authorizationCode,
      authStateId: authStateId, // AQUI: passamos o ID que recebemos
    });
    setIsAuthCompleted(true);
    toast.success('Autenticação com o iFood concluída com sucesso!');
    checkStatus();
  } catch (error) {
    console.error('Erro ao concluir a autenticação com o iFood:', error);
    toast.error('Erro ao concluir a autenticação com o iFood.');
  }
  setLoading(false);
};


  const refreshIfoodToken = async () => {
    setLoading(true);
    try {
      await api.post('/ifood/auth/refresh');
      toast.success('Token renovado com sucesso!');
      checkStatus();
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      toast.error('Erro ao renovar token do iFood.');
    }
    setLoading(false);
  };

  const getOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ifood/orders');
      console.log('Pedidos do iFood:', res.data);
      toast.success('Pedidos obtidos com sucesso! Verifique o console.');
    } catch (error) {
      console.error('Erro ao obter pedidos:', error);
      toast.error('Erro ao obter pedidos do iFood.');
    }
    setLoading(false);
  };

  return (
    <div className="mt-4">
      <h2>Integração com o iFood</h2>

      <p>
        Status da autenticação:{' '}
        {status.authenticated ? (
          <span style={{ color: 'green' }}>Autenticado</span>
        ) : (
          <span style={{ color: 'red' }}>Não autenticado</span>
        )}
      </p>
      {status.expired && (
        <p style={{ color: 'orange' }}>
          Token expirado, clique em "Renovar Token" para continuar.
        </p>
      )}

      {!isAuthStarted && !isAuthCompleted && (
        <Button variant="primary" onClick={startAuth} disabled={loading}>
          {loading ? <Spinner size="sm" animation="border" /> : 'Iniciar Autenticação com iFood'}
        </Button>
      )}

      {isAuthStarted && !isAuthCompleted && (
        <div className="mt-3">
          <p>
            Acesse o seguinte link para autorizar o aplicativo:
            <br />
            <a href={authData.verificationUrlComplete} target="_blank" rel="noopener noreferrer">
              {authData.verificationUrlComplete}
            </a>
          </p>
          <p>
            Use o código de usuário: <strong>{authData.userCode}</strong>
          </p>
          <Form onSubmit={completeAuth}>
            <Form.Group>
              <Form.Label>Código de Autorização</Form.Label>
              <Form.Control
                type="text"
                value={authData.authorizationCode}
                onChange={(e) => setAuthData({ ...authData, authorizationCode: e.target.value })}
                required
              />
            </Form.Group>
            <Button variant="success" type="submit" className="mt-3" disabled={loading}>
              {loading ? <Spinner size="sm" animation="border" /> : 'Concluir Autenticação'}
            </Button>
          </Form>
        </div>
      )}

      {isAuthCompleted && (
        <div className="mt-4">
          <p>Autenticação concluída! O sistema está conectado ao iFood.</p>
          <Button variant="warning" onClick={refreshIfoodToken} className="me-2" disabled={loading}>
            {loading ? <Spinner size="sm" animation="border" /> : 'Renovar Token'}
          </Button>
          <Button variant="info" onClick={getOrders} disabled={loading}>
            {loading ? <Spinner size="sm" animation="border" /> : 'Obter Pedidos do iFood'}
          </Button>
        </div>
      )}
    </div>
  );
}

export default IfoodAuthPage;
