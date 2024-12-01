// src/pages/IfoodAuth/IfoodAuthPage.js

import React, { useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

function IfoodAuthPage() {
  const [authData, setAuthData] = useState({
    userCode: '',
    verificationUrlComplete: '',
    authorizationCode: '',
  });
  const [isAuthStarted, setIsAuthStarted] = useState(false);
  const [isAuthCompleted, setIsAuthCompleted] = useState(false);

  const startAuth = async () => {
    try {
      const response = await api.post('/ifood/auth/start');
      setAuthData({
        userCode: response.data.userCode,
        verificationUrlComplete: response.data.verificationUrlComplete,
        authorizationCode: '',
      });
      setIsAuthStarted(true);
      toast.success('Processo de autenticação iniciado. Siga as instruções.');
    } catch (error) {
      console.error('Erro ao iniciar a autenticação com o iFood:', error);
      toast.error('Erro ao iniciar a autenticação com o iFood.');
    }
  };

  const completeAuth = async (e) => {
    e.preventDefault();
    try {
      await api.post('/ifood/auth/complete', {
        authorizationCode: authData.authorizationCode,
      });
      setIsAuthCompleted(true);
      toast.success('Autenticação com o iFood concluída com sucesso!');
    } catch (error) {
      console.error('Erro ao concluir a autenticação com o iFood:', error);
      toast.error('Erro ao concluir a autenticação com o iFood.');
    }
  };

  return (
    <div>
      <h2>Integração com o iFood</h2>
      {!isAuthStarted && !isAuthCompleted && (
        <button onClick={startAuth}>Iniciar Autenticação com o iFood</button>
      )}

      {isAuthStarted && !isAuthCompleted && (
        <div>
          <p>
            Por favor, acesse o seguinte link para autorizar o aplicativo:
            <br />
            <a href={authData.verificationUrlComplete} target="_blank" rel="noopener noreferrer">
              {authData.verificationUrlComplete}
            </a>
          </p>
          <p>
            Use o código de usuário: <strong>{authData.userCode}</strong>
          </p>
          <form onSubmit={completeAuth}>
            <label>Código de Autorização:</label>
            <input
              type="text"
              name="authorizationCode"
              value={authData.authorizationCode}
              onChange={(e) => setAuthData({ ...authData, authorizationCode: e.target.value })}
              required
            />
            <button type="submit">Concluir Autenticação</button>
          </form>
        </div>
      )}

      {isAuthCompleted && (
        <div>
          <p>Autenticação com o iFood foi concluída com sucesso!</p>
        </div>
      )}
    </div>
  );
}

export default IfoodAuthPage;
