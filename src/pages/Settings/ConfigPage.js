// src/pages/Settings/Config.js
import React, { useEffect, useState } from 'react';
import {
  Container,
  Card,
  Button,
  Spinner,
  Alert,
  Row,
  Col,
  Image,
  Form,
  Modal,
} from 'react-bootstrap';
import api from '../../services/api';

function ConfigPage() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [printers, setPrinters] = useState([]); // Lista de impressoras disponíveis

  // Busca config
  const fetchConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/config');
      setConfig(response.data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setConfig(null);
      } else {
        console.error('Erro ao obter config:', err);
        setError('Erro ao obter configuração.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Exemplo de endpoint hipotético para obter impressoras
  const fetchPrinters = async () => {
    try {
      const response = await api.get('/printers');
      setPrinters(response.data || []);
    } catch (err) {
      console.error('Erro ao obter impressoras:', err);
      // Opcional: definir um estado de erro específico para impressoras, se necessário
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchPrinters();
  }, []);

  // Salva formData (cria ou atualiza)
  const handleSave = async (formData) => {
    try {
      if (config) {
        // Atualizar config
        const response = await api.put('/config', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setConfig(response.data.config);
      } else {
        // Criar config
        const response = await api.post('/config', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setConfig(response.data.config);
      }
      setShowModal(false);
    } catch (err) {
      console.error('Erro ao salvar config:', err);
      // Opcional: definir um estado de erro específico para salvar configurações, se necessário
    }
  };

  return (
    <Container className="mt-4">
      <h2>Configurações do Estabelecimento</h2>
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" />
          <p>Carregando...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <Card className="p-3">
          {config ? (
            <>
              {config.logotipo && (
                <div className="text-center mb-3">
                  <Image
                    src={
                      config.logotipo.startsWith('http')
                        ? config.logotipo
                        : `http://localhost:8000/images/${config.logotipo}`
                    }
                    alt="Logotipo"
                    fluid
                    style={{ maxWidth: '100px', maxHeight: '100px' }}
                  />
                </div>
              )}
              <Row className="mb-2">
                <Col>
                  <strong>Razão Social:</strong> {config.razaoSocial}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col>
                  <strong>Nome Fantasia:</strong> {config.nomeFantasia}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col>
                  <strong>CNPJ:</strong> {config.cnpj}
                </Col>
                <Col>
                  <strong>IE:</strong> {config.ie}
                </Col>
              </Row>

              <Row className="mb-2">
                <Col>
                  <strong>CEP:</strong> {config.cep}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col>
                  <strong>Endereço:</strong> {config.logradouro}, {config.numero}, {config.bairro}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col>
                  <strong>Cidade/UF:</strong> {config.cidade}/{config.uf}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col>
                  <strong>Telefone:</strong> {config.telefone}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col>
                  <strong>Email:</strong> {config.email}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col>
                  <strong>Taxa de Serviço (%):</strong> {config.taxaServico}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col>
                  <strong>Modo Escuro:</strong> {config.darkMode ? 'Ativado' : 'Desativado'}
                </Col>
              </Row>

              {/* Impressoras */}
              <Row className="mb-2">
                <Col>
                  <strong>Impressora da Cozinha:</strong>{' '}
                  {config.printerKitchen || 'Não configurada'}
                </Col>
              </Row>
              <Row className="mb-2">
                <Col>
                  <strong>Impressora do Bar:</strong> {config.printerBar || 'Não configurada'}
                </Col>
              </Row>

              <div className="text-end mt-3">
                <Button variant="primary" onClick={() => setShowModal(true)}>
                  Editar
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center my-3">
              <Alert variant="info">Nenhuma configuração encontrada. Crie agora mesmo.</Alert>
              <Button variant="success" onClick={() => setShowModal(true)}>
                Criar Configuração
              </Button>
            </div>
          )}
        </Card>
      )}

      {showModal && (
        <ConfigFormModal
          show={showModal}
          onHide={() => setShowModal(false)}
          onSave={handleSave}
          initialData={config}
          printers={printers}
        />
      )}
    </Container>
  );
}

// ----------------------------------------------------------------------
// Subcomponente Modal para criar/editar config
// ----------------------------------------------------------------------
function ConfigFormModal({ show, onHide, onSave, initialData, printers }) {
  const [form, setForm] = useState({
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    ie: '',
    cep: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: '',
    uf: '',
    telefone: '',
    email: '',
    taxaServico: 10,
    site: '',
    observacoes: '',
    darkMode: false,
    logotipo: null,
  });

  const [fetchingCnpj, setFetchingCnpj] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        razaoSocial: initialData.razaoSocial || '',
        nomeFantasia: initialData.nomeFantasia || '',
        cnpj: initialData.cnpj || '',
        ie: initialData.ie || '',
        cep: initialData.cep || '',
        logradouro: initialData.logradouro || '',
        numero: initialData.numero || '',
        bairro: initialData.bairro || '',
        cidade: initialData.cidade || '',
        uf: initialData.uf || '',
        telefone: initialData.telefone || '',
        email: initialData.email || '',
        taxaServico: initialData.taxaServico || 10,
        site: initialData.site || '',
        observacoes: initialData.observacoes || '',
        darkMode: !!initialData.darkMode,
        logotipo: null,
      });
    }
  }, [initialData]);

  // Função para formatar CNPJ (básica)
  const formatCNPJ = (value) => {
    const cnpjLimpo = value.replace(/\D/g, '');
    if (!cnpjLimpo) return '';
    const part1 = cnpjLimpo.substring(0, 2);
    const part2 = cnpjLimpo.substring(2, 5);
    const part3 = cnpjLimpo.substring(5, 8);
    const part4 = cnpjLimpo.substring(8, 12);
    const part5 = cnpjLimpo.substring(12, 14);

    let formatted = part1;
    if (part2) formatted += '.' + part2;
    if (part3) formatted += '.' + part3;
    if (part4) formatted += '/' + part4;
    if (part5) formatted += '-' + part5;
    return formatted;
  };

  // Validação simples de CNPJ
  const validarCNPJ = (cnpj) => {
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    if (cnpjLimpo.length !== 14) return false;
    if (/^(.)\1+$/.test(cnpjLimpo)) return false; // todos dígitos iguais?
    // cálculo dígito verificador
    let tamanho = cnpjLimpo.length - 2;
    let numeros = cnpjLimpo.substring(0, tamanho);
    let digitos = cnpjLimpo.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;
    tamanho++;
    numeros = cnpjLimpo.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(1))) return false;
    return true;
  };

  // Handler de mudança nos campos
  const handleChange = (e) => {
    const { name, type, checked, value, files } = e.target;
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
    } else if (name === 'cnpj') {
      setForm((prev) => ({ ...prev, cnpj: formatCNPJ(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Chamando a ROTA do BACKEND (NÃO diretamente a receitaws)
  const handleFetchCNPJ = async () => {
    const cnpjLimpo = form.cnpj.replace(/\D/g, '');
    // 1) Valida
    if (!validarCNPJ(form.cnpj)) {
      alert('CNPJ inválido!');
      return;
    }
    try {
      setFetchingCnpj(true);
      // Chama o backend: GET /config/cnpj/:cnpj
      const { data } = await api.get(`/config/cnpj/${cnpjLimpo}`);

      if (data.status === 'OK') {
        // Atualiza os campos
        setForm((prev) => ({
          ...prev,
          razaoSocial: data.nome || '',
          nomeFantasia: data.fantasia || '',
          email: data.email ? data.email.toLowerCase() : '',
          cep: data.cep ? data.cep.replace(/\./g, '') : '',
          logradouro: data.logradouro || '',
          numero: data.numero || '',
          bairro: data.bairro || '',
          cidade: data.municipio || '',
          uf: data.uf || '',
          telefone: data.telefone
            ? data.telefone.split('/')[0].replace(/\s/g, '')
            : '',
        }));
      } else {
        alert('CNPJ não encontrado ou status não OK');
      }
    } catch (error) {
      console.error(error);
      if (error.response?.status === 429) {
        alert('Muitas requisições à ReceitaWS (429). Tente novamente mais tarde.');
      } else {
        alert('Erro ao buscar CNPJ (ver console).');
      }
    } finally {
      setFetchingCnpj(false);
    }
  };

  // Enviar (salvar) o form
  const handleSubmit = () => {
    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      if (form[key] !== null && form[key] !== undefined) {
        formData.append(key, form[key]);
      }
    });
    onSave(formData);
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {initialData ? 'Editar Configuração' : 'Nova Configuração'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {/* Razão Social */}
          <Form.Group className="mb-3">
            <Form.Label>Razão Social</Form.Label>
            <Form.Control
              type="text"
              name="razaoSocial"
              value={form.razaoSocial}
              onChange={handleChange}
            />
          </Form.Group>

          {/* Nome Fantasia */}
          <Form.Group className="mb-3">
            <Form.Label>Nome Fantasia</Form.Label>
            <Form.Control
              type="text"
              name="nomeFantasia"
              value={form.nomeFantasia}
              onChange={handleChange}
            />
          </Form.Group>

          {/* CNPJ + Botão */}
          <Form.Group className="mb-3">
            <Form.Label>CNPJ</Form.Label>
            <div className="d-flex">
              <Form.Control
                type="text"
                name="cnpj"
                value={form.cnpj}
                onChange={handleChange}
                placeholder="XX.XXX.XXX/XXXX-XX"
                style={{ marginRight: '8px' }}
              />
              <Button
                variant="outline-primary"
                onClick={handleFetchCNPJ}
                disabled={fetchingCnpj}
              >
                {fetchingCnpj ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>
          </Form.Group>

          {/* IE */}
          <Form.Group className="mb-3">
            <Form.Label>IE</Form.Label>
            <Form.Control
              type="text"
              name="ie"
              value={form.ie}
              onChange={handleChange}
            />
          </Form.Group>

          {/* CEP */}
          <Form.Group className="mb-3">
            <Form.Label>CEP</Form.Label>
            <Form.Control
              type="text"
              name="cep"
              value={form.cep}
              onChange={handleChange}
            />
          </Form.Group>

          {/* Logradouro */}
          <Form.Group className="mb-3">
            <Form.Label>Logradouro</Form.Label>
            <Form.Control
              type="text"
              name="logradouro"
              value={form.logradouro}
              onChange={handleChange}
            />
          </Form.Group>

          {/* Número */}
          <Form.Group className="mb-3">
            <Form.Label>Número</Form.Label>
            <Form.Control
              type="text"
              name="numero"
              value={form.numero}
              onChange={handleChange}
            />
          </Form.Group>

          {/* Bairro */}
          <Form.Group className="mb-3">
            <Form.Label>Bairro</Form.Label>
            <Form.Control
              type="text"
              name="bairro"
              value={form.bairro}
              onChange={handleChange}
            />
          </Form.Group>

          {/* Cidade */}
          <Form.Group className="mb-3">
            <Form.Label>Cidade</Form.Label>
            <Form.Control
              type="text"
              name="cidade"
              value={form.cidade}
              onChange={handleChange}
            />
          </Form.Group>

          {/* UF */}
          <Form.Group className="mb-3">
            <Form.Label>UF</Form.Label>
            <Form.Control
              type="text"
              name="uf"
              value={form.uf}
              onChange={handleChange}
            />
          </Form.Group>

          {/* Telefone */}
          <Form.Group className="mb-3">
            <Form.Label>Telefone (WhatsApp)</Form.Label>
            <Form.Control
              type="text"
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
            />
          </Form.Group>

          {/* Email */}
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
          </Form.Group>

          {/* Taxa de Serviço */}
          <Form.Group className="mb-3">
            <Form.Label>Taxa de Serviço (%)</Form.Label>
            <Form.Control
              type="number"
              name="taxaServico"
              value={form.taxaServico}
              onChange={handleChange}
              min="0"
            />
          </Form.Group>

          {/* Site */}
          <Form.Group className="mb-3">
            <Form.Label>Site</Form.Label>
            <Form.Control
              type="text"
              name="site"
              value={form.site}
              onChange={handleChange}
            />
          </Form.Group>

          {/* Observações */}
          <Form.Group className="mb-3">
            <Form.Label>Observações</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="observacoes"
              value={form.observacoes}
              onChange={handleChange}
            />
          </Form.Group>

          {/* Dark Mode */}
          <Form.Group className="mb-3">
            <Form.Check
              type="switch"
              id="darkMode-switch"
              label="Modo Escuro"
              name="darkMode"
              checked={form.darkMode}
              onChange={handleChange}
            />
          </Form.Group>

          {/* Logotipo */}
          <Form.Group className="mb-3">
            <Form.Label>Logotipo</Form.Label>
            <Form.Control
              type="file"
              name="logotipo"
              onChange={handleChange}
              accept="image/*"
            />
          </Form.Group>

          {/* Se quiser habilitar a seleção de impressoras, etc. */}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Salvar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ConfigPage;
