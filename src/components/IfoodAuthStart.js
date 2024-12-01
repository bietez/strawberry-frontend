// src/components/IfoodAuthStart.js
import React, { useState } from 'react';
import axios from 'axios';

const IfoodAuthStart = () => {
  const [verificationUrl, setVerificationUrl] = useState('');
  const [userCode, setUserCode] = useState('');
  const [authorizationCode, setAuthorizationCode] = useState('');

  const startAuth = async () => {
    try {
      const response = await axios.post('/api/ifood/auth/start');
      setVerificationUrl(response.data.verificationUrlComplete);
      setUserCode(response.data.userCode);
    } catch (error) {
      console.error('Erro ao iniciar a autenticação:', error);
    }
  };

  const completeAuth = async () => {
    try {
      await axios.post('/api/ifood/auth/complete', { authorizationCode });
      alert('Autenticação concluída com sucesso!');
    } catch (error) {
      console.error('Erro ao concluir a autenticação:', error);
    }
  };

  return (
    <div>
      <h2>Integração com o iFood</h2>
      {!verificationUrl && (
        <button onClick={startAuth}>Iniciar Autenticação com o iFood</button>
      )}
      {verificationUrl && (
        <div>
          <p>
            Por favor, acesse o seguinte link para autorizar o aplicativo:{' '}
            <a href={verificationUrl} target="_blank" rel="noopener noreferrer">
              {verificationUrl}
            </a>
          </p>
          <p>
            Use o código de usuário: <strong>{userCode}</strong>
          </p>
          <p>Após autorizar, insira o código de autorização abaixo:</p>
          <input
            type="text"
            placeholder="Código de Autorização"
            value={authorizationCode}
            onChange={(e) => setAuthorizationCode(e.target.value)}
          />
          <button onClick={completeAuth}>Concluir Autenticação</button>
        </div>
      )}
    </div>
  );
};

export default IfoodAuthStart;
