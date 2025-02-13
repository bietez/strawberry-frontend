// src/pages/Employees/QrBadge.js
import React, { useState, useEffect, useRef } from 'react';
import { Container, Form, Button, Image, Alert, Spinner, Card } from 'react-bootstrap';
import api from '../../services/api';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/** Mapeia a role (cargo) para exibição amigável. */
const mapRole = (role) => {
  const roleMap = {
    waiter: 'Garçom',
    chef: 'Chefe de Cozinha',
    kitchenAssistant: 'Assistente de Cozinha',
    barman: 'Barman',
    agent: 'Colaborador',
    receptionist: 'Recepcionista',
    deliveryMan: 'Entregador',
    cleaning: 'Limpeza',
  };
  return roleMap[role?.toLowerCase()] 
    || (role ? role.charAt(0).toUpperCase() + role.slice(1) : '');
};

/** Número de cores esperadas: 4 */
const DEFAULT_COLOR_SCHEME = ['#ffffff', '#2196f3', '#ffffff', '#444444'];

function QrBadge() {
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const [error, setError] = useState(null);

  /**
   * config.badgeColorScheme = array de 4 posições:
   * [0] = fundo do Card
   * [1] = cor da Faixa
   * [2] = cor do texto na Faixa
   * [3] = cor do texto de nomeFantasia
   */
  const [config, setConfig] = useState({
    logotipo: '',
    nomeFantasia: '',
    badgeColorScheme: [...DEFAULT_COLOR_SCHEME],
  });

  // Cria um ref para o card do crachá
  const badgeRef = useRef(null);

  useEffect(() => {
    fetchEmployees();
    fetchConfig();
  }, []);

  // 1. Buscar funcionários
  const fetchEmployees = async () => {
    try {
      const response = await api.get('/users/team-members');
      setEmployees(response.data);
    } catch (err) {
      console.error('Erro ao obter funcionários:', err);
      setError('Não foi possível carregar a lista de funcionários.');
    } finally {
      setLoadingEmployees(false);
    }
  };

  // 2. Buscar config do backend
  const fetchConfig = async () => {
    try {
      const resp = await api.get('/config/');
      if (resp.data) {
        setConfig((prev) => {
          // Se vier com array menor que 4, completamos com defaults
          let newColorArray = Array.isArray(resp.data.badgeColorScheme)
            ? [...resp.data.badgeColorScheme]
            : [...DEFAULT_COLOR_SCHEME];

          // Garante que tenha 4 posições
          for (let i = 0; i < 4; i++) {
            if (!newColorArray[i]) {
              newColorArray[i] = DEFAULT_COLOR_SCHEME[i];
            }
          }
          return {
            ...prev,
            logotipo: resp.data.logotipo || '',
            nomeFantasia: resp.data.nomeFantasia || '',
            badgeColorScheme: newColorArray,
          };
        });
      }
    } catch (err) {
      console.error('Erro ao obter config:', err);
    }
  };

  // 3. Salvar config no onBlur
  const handleSaveConfigOnBlur = async () => {
    try {
      await api.put('/config/', {
        ...config,
        badgeColorScheme: config.badgeColorScheme,
      });
      toast.success('Config atualizada com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar config:', err);
      toast.error('Não foi possível salvar a configuração de cores.');
    }
  };

  // 4. Gerar QR Code
  const handleGenerateQRCode = async () => {
    if (!selectedUserId) {
      toast.error('Selecione um funcionário para gerar o crachá.');
      return;
    }
    try {
      const response = await api.post('/qr/generate', { userId: selectedUserId });
      setQrCode(response.data.qrCodeDataURL);
      toast.success('QR Code gerado com sucesso!');
    } catch (err) {
      console.error('Erro ao gerar QR:', err);
      toast.error('Erro ao gerar QR');
    }
  };

  // 5. Gerar PDF do crachá
  const handleGeneratePDF = async () => {
    if (!badgeRef.current) return;
    try {
      const canvas = await html2canvas(badgeRef.current, {
        scale: 2,
        backgroundColor: '#fff',
        useCORS: true, // Habilita o CORS para carregamento das imagens
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ unit: 'px', format: [350, 557] });
      pdf.addImage(imgData, 'PNG', 0, 0, 350, 557);
      pdf.save('generated.pdf');
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      toast.error('Erro ao gerar PDF do crachá.');
    }
  };

  // Selecionado
  const selectedEmployee = employees.find((emp) => emp._id === selectedUserId);

  // Usar as 4 cores definidas
  const [cardBg, faixaBg, faixaText, fantasyTextColor] = config.badgeColorScheme;

  return (
    <Container className="my-4">
      <h2 className="mb-3">Gerar Crachá</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Injeta uma regra CSS para forçar o background do crachá */}
      <style>
        {`
          #unique-badge-container {
            background-color: ${cardBg} !important;
          }
        `}
      </style>

      {/* Seletor de cores */}
      <Card className="p-3 bg-light border-0 shadow-sm mb-4">
        <Form.Group className="mb-3">
          <Form.Label><strong>1) Cor de Fundo do Card</strong></Form.Label>
          <Form.Control
            type="color"
            value={cardBg}
            onChange={(e) => {
              const newColor = e.target.value;
              setConfig((prev) => {
                const updated = { ...prev };
                updated.badgeColorScheme[0] = newColor;
                return updated;
              });
            }}
            onBlur={handleSaveConfigOnBlur}
            style={{ maxWidth: '100px', cursor: 'pointer' }}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label><strong>2) Cor da Faixa</strong></Form.Label>
          <Form.Control
            type="color"
            value={faixaBg}
            onChange={(e) => {
              const newColor = e.target.value;
              setConfig((prev) => {
                const updated = { ...prev };
                updated.badgeColorScheme[1] = newColor;
                return updated;
              });
            }}
            onBlur={handleSaveConfigOnBlur}
            style={{ maxWidth: '100px', cursor: 'pointer' }}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label><strong>3) Cor do Texto da Faixa</strong></Form.Label>
          <Form.Control
            type="color"
            value={faixaText}
            onChange={(e) => {
              const newColor = e.target.value;
              setConfig((prev) => {
                const updated = { ...prev };
                updated.badgeColorScheme[2] = newColor;
                return updated;
              });
            }}
            onBlur={handleSaveConfigOnBlur}
            style={{ maxWidth: '100px', cursor: 'pointer' }}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label><strong>4) Cor do Texto do nomeFantasia</strong></Form.Label>
          <Form.Control
            type="color"
            value={fantasyTextColor}
            onChange={(e) => {
              const newColor = e.target.value;
              setConfig((prev) => {
                const updated = { ...prev };
                updated.badgeColorScheme[3] = newColor;
                return updated;
              });
            }}
            onBlur={handleSaveConfigOnBlur}
            style={{ maxWidth: '100px', cursor: 'pointer' }}
          />
        </Form.Group>
      </Card>

      {/* Seleção de Funcionário */}
      {loadingEmployees ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p>Carregando lista de funcionários...</p>
        </div>
      ) : employees.length === 0 ? (
        <Alert variant="info">Nenhum funcionário encontrado.</Alert>
      ) : (
        <Card className="p-3 bg-light border-0 shadow-sm mb-4">
          <Form.Group className="mb-3">
            <Form.Label><strong>Selecione o Funcionário</strong></Form.Label>
            <Form.Select
              value={selectedUserId}
              onChange={(e) => {
                setSelectedUserId(e.target.value);
                setQrCode(null);
              }}
            >
              <option value="">Escolha um funcionário...</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.nome} - {emp.email}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Button variant="primary" onClick={handleGenerateQRCode}>
            Gerar QR Code
          </Button>
        </Card>
      )}

      {/* Card do crachá */}
      {qrCode && selectedEmployee && (
        <Card
          ref={badgeRef}
          id="unique-badge-container"
          className="mx-auto shadow-sm"
          style={{
            width: '350px',
            height: '557px',
            border: '2px solid #ccc',
            overflow: 'hidden',
            marginBottom: '1rem',
            position: 'relative',
          }}
        >
          {/* Espaço superior para furo */}
          <div style={{ height: '40px', backgroundColor: 'transparent' }} />

          {/* Faixa (nome e cargo) */}
          <div
            className="text-center"
            style={{
              backgroundColor: faixaBg,
              color: faixaText,
              padding: '6px',
            }}
          >
            <h5 style={{ margin: 0 }}>{selectedEmployee.nome}</h5>
            <small>{mapRole(selectedEmployee.role)}</small>
          </div>

          {/* Foto do Funcionário */}
          <div className="text-center mt-3">
            <Image
              src={selectedEmployee.imagem || 'https://placehold.co/80?text=Sem+Imagem'}
              roundedCircle
              width={80}
              height={80}
              alt={`Foto de ${selectedEmployee.nome}`}
              crossOrigin="anonymous" // Permite o uso via CORS
            />
          </div>

          {/* QR Code */}
          <div className="text-center mt-3">
            <Image
              src={qrCode}
              alt="QR Code"
              fluid
              style={{ maxWidth: '200px', maxHeight: '200px' }}
              crossOrigin="anonymous" // Permite o uso via CORS
            />
          </div>

          {/* Rodapé: logo e nomeFantasia */}
          <div style={{ position: 'absolute', bottom: 0, width: '100%', textAlign: 'center' }}>
            <hr style={{ margin: '0 20px', borderColor: '#ccc' }} />
            <div className="mt-2">
              {config.logotipo && (
                <Image
                  src={config.logotipo}
                  alt="Logo do Estabelecimento"
                  style={{ maxHeight: '40px' }}
                  className="mb-1"
                  crossOrigin="anonymous" // Permite o uso via CORS
                />
              )}
              <br />
              <small
                style={{
                  color: fantasyTextColor,
                  fontWeight: 500,
                }}
              >
                {config.nomeFantasia || 'Nome do Estabelecimento'}
              </small>
              <div style={{ height: '10px' }} />
            </div>
          </div>
        </Card>
      )}

      {/* Botão para gerar PDF */}
      {qrCode && selectedEmployee && (
        <div className="text-center mb-5">
          <Button variant="secondary" onClick={handleGeneratePDF}>
            Visualizar PDF do Crachá
          </Button>
        </div>
      )}
    </Container>
  );

}

export default QrBadge;
