// src/components/ifood/AuthenticationTab.js

import React, { useState, useEffect } from "react";
import { Button, Spinner, Form, ToggleButtonGroup, ToggleButton } from "react-bootstrap";
import { toast } from "react-toastify";
import api from "../../services/api";      // Instância geral do Axios
import ifoodApi from "../../services/ifoodApi"; // Instância específica do iFood

function AuthenticationTab() {
  const [ifoodAuthData, setIfoodAuthData] = useState({
    ifoodUserCode: "",
    verificationUrlComplete: "",
    authorizationCode: "",
  });
  const [ifoodAuthStateId, setIfoodAuthStateId] = useState(null);
  const [ifoodIsAuthStarted, setIfoodIsAuthStarted] = useState(false);
  const [ifoodIsAuthCompleted, setIfoodIsAuthCompleted] = useState(false);
  const [ifoodLoading, setIfoodLoading] = useState(false);

  // { authenticated: boolean, expired: boolean }
  const [ifoodStatus, setIfoodStatus] = useState({ authenticated: false, expired: false });

  // Polling status (caso queira exibir para "Loja Online/Offline")
  const [ifoodPollingStatus, setIfoodPollingStatus] = useState(false);

  // ------------------------------------------
  // 1) Verifica status da autenticação
  // ------------------------------------------
  const ifoodCheckStatus = async () => {
    try {
      const res = await ifoodApi.get("/ifood/auth/status"); 
      setIfoodStatus(res.data);

      if (res.data.authenticated) {
        setIfoodIsAuthCompleted(true);
      } else {
        setIfoodIsAuthCompleted(false);
      }
    } catch (error) {
      console.error("Erro ao verificar status:", error);
      toast.error("Erro ao verificar status da autenticação com o iFood.");
    }
  };

  useEffect(() => {
    ifoodCheckStatus();
  }, []);

  // ------------------------------------------
  // 2) Iniciar Autenticação
  // ------------------------------------------
  const ifoodStartAuth = async () => {
    setIfoodLoading(true);
    try {
      const response = await ifoodApi.post("/ifood/auth/start");
      setIfoodAuthData({
        ifoodUserCode: response.data.ifoodUserCode,
        verificationUrlComplete: response.data.verificationUrlComplete,
        authorizationCode: "",
      });
      setIfoodAuthStateId(response.data.ifoodAuthStateId);
      setIfoodIsAuthStarted(true);

      toast.success("Processo de autenticação iniciado com o iFood. Siga as instruções.");
    } catch (error) {
      console.error("Erro ao iniciar a autenticação com o iFood:", error);
      toast.error("Erro ao iniciar a autenticação com o iFood.");
    }
    setIfoodLoading(false);
  };

  // ------------------------------------------
  // 3) Concluir Autenticação
  // ------------------------------------------
  const ifoodCompleteAuth = async (e) => {
    e.preventDefault();
    if (!ifoodAuthData.authorizationCode) {
      toast.error("Por favor, insira o código de autorização.");
      return;
    }
    if (!ifoodAuthStateId) {
      toast.error("Estado de autenticação inválido. Inicie novamente.");
      return;
    }
    setIfoodLoading(true);
    try {
      const response = await ifoodApi.post("/ifood/auth/complete", {
        authorizationCode: ifoodAuthData.authorizationCode,
        ifoodAuthStateId,
      });
      setIfoodIsAuthCompleted(true);
      ifoodSetToken(response.data.ifoodAccessToken);

      toast.success("Autenticação com o iFood concluída com sucesso!");
      ifoodCheckStatus();
    } catch (error) {
      console.error("Erro ao concluir a autenticação com o iFood:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Erro ao concluir a autenticação com o iFood.");
      }
    }
    setIfoodLoading(false);
  };

  // ------------------------------------------
  // 4) Renovar Token
  // ------------------------------------------
  const ifoodRefreshToken = async () => {
    setIfoodLoading(true);
    try {
      const response = await ifoodApi.post("/ifood/auth/refresh");
      ifoodSetToken(response.data.ifoodAccessToken);
      toast.success("Token renovado com sucesso!");
      ifoodCheckStatus();
    } catch (error) {
      console.error("Erro ao renovar token do iFood:", error);
      toast.error("Erro ao renovar token do iFood.");
      ifoodClearToken();
    }
    setIfoodLoading(false);
  };

  // ------------------------------------------
  // 5) Controlar Polling (Online/Offline)
  // ------------------------------------------
  const ifoodHandlePollingChange = async (val) => {
    if (val === "online") {
      try {
        await api.post("/ifood/polling/start");
        setIfoodPollingStatus(true);
        toast.success("Polling iniciado.");
      } catch (error) {
        console.error("Erro ao iniciar polling:", error);
        toast.error("Erro ao iniciar polling.");
      }
    } else if (val === "offline") {
      try {
        await api.post("/ifood/polling/stop");
        setIfoodPollingStatus(false);
        toast.success("Polling parado.");
      } catch (error) {
        console.error("Erro ao parar polling:", error);
        toast.error("Erro ao parar polling.");
      }
    }
  };

  // ------------------------------------------
  // 6) Helpers de Token local
  // ------------------------------------------
  const ifoodSetToken = (token) => {
    localStorage.setItem("ifoodAccessToken", token);
  };
  const ifoodClearToken = () => {
    localStorage.removeItem("ifoodAccessToken");
  };

  // ------------------------------------------
  // Render
  // ------------------------------------------
  return (
    <div>
      <h4>Autenticação com iFood</h4>

      <p>
        Status da autenticação:{" "}
        {ifoodStatus.authenticated ? (
          <span style={{ color: "green" }}>Autenticado</span>
        ) : (
          <span style={{ color: "red" }}>Não autenticado</span>
        )}
      </p>

      {ifoodStatus.expired && (
        <p style={{ color: "orange" }}>
          Token expirado, clique em "Renovar Token" para continuar.
        </p>
      )}

      {/* Botão "Iniciar Autenticação" -> só se NÃO temos token no backend e não está no meio do fluxo */}
      {!ifoodStatus.authenticated &&
       !ifoodStatus.expired &&
       !ifoodIsAuthStarted &&
       !ifoodIsAuthCompleted && (
        <Button variant="primary" onClick={ifoodStartAuth} disabled={ifoodLoading}>
          {ifoodLoading ? <Spinner size="sm" animation="border" /> : "Iniciar Autenticação com iFood"}
        </Button>
      )}

      {/* Formulário para inserir código, aparece se já iniciamos mas não concluímos */}
      {ifoodIsAuthStarted && !ifoodIsAuthCompleted && (
        <div className="mt-3">
          <p>
            Acesse o seguinte link para autorizar o aplicativo:
            <br />
            <a
              href={ifoodAuthData.verificationUrlComplete}
              target="_blank"
              rel="noopener noreferrer"
            >
              {ifoodAuthData.verificationUrlComplete}
            </a>
          </p>
          <p>
            Use o código de usuário: <strong>{ifoodAuthData.ifoodUserCode}</strong>
          </p>
          <Form onSubmit={ifoodCompleteAuth}>
            <Form.Group>
              <Form.Label>Código de Autorização</Form.Label>
              <Form.Control
                type="text"
                value={ifoodAuthData.authorizationCode}
                onChange={(e) =>
                  setIfoodAuthData({ ...ifoodAuthData, authorizationCode: e.target.value })
                }
                required
              />
            </Form.Group>
            <Button variant="success" type="submit" className="mt-3" disabled={ifoodLoading}>
              {ifoodLoading ? <Spinner size="sm" animation="border" /> : "Concluir Autenticação"}
            </Button>
          </Form>
        </div>
      )}

      {/* Se tiver token (seja válido ou expirado), exibe botões */}
      {(ifoodStatus.authenticated || ifoodStatus.expired) && (
        <div className="mt-4">
          {!ifoodStatus.expired && (
            <p>Autenticação concluída! O sistema está conectado ao iFood.</p>
          )}
          <Button
            variant="warning"
            onClick={ifoodRefreshToken}
            className="me-2"
            disabled={ifoodLoading}
          >
            {ifoodLoading ? <Spinner size="sm" animation="border" /> : "Renovar Token"}
          </Button>

          {/* Exemplo: se quiser exibir Toggle de Loja Online/Offline:
          
          <div className="mt-4">
            <h5>Status da Loja / Polling</h5>
            <ToggleButtonGroup
              type="radio"
              name="ifoodPollingStatus"
              defaultValue={ifoodPollingStatus ? "online" : "offline"}
              onChange={ifoodHandlePollingChange}
            >
              <ToggleButton id="tbg-radio-1" value={"online"} variant="outline-success">
                Loja Online
              </ToggleButton>
              <ToggleButton id="tbg-radio-2" value={"offline"} variant="outline-danger">
                Loja Offline
              </ToggleButton>
            </ToggleButtonGroup>
          </div>
          */}
        </div>
      )}
    </div>
  );
}

export default AuthenticationTab;
