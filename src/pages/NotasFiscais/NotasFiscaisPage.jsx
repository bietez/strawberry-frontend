// src/pages/NotasFiscais/NotasFiscaisPage.jsx

import React, { useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Table,
  Alert,
  Card,
  Spinner,
  Modal
} from 'react-bootstrap';
import { FaSearch, FaTrash, FaEdit, FaUpload } from 'react-icons/fa';
import api from '../../services/api';

function NotasFiscaisPage() {
  const [file, setFile] = useState(null);
  const [notas, setNotas] = useState([]);
  const [error, setError] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [uploading, setUploading] = useState(false);

  // Estados para Upload de Certificado
  const [certFile, setCertFile] = useState(null);
  const [certUploading, setCertUploading] = useState(false);

  // Estado para Modal de Edição
  const [showModal, setShowModal] = useState(false);
  const [notaSelecionada, setNotaSelecionada] = useState(null);
  const [editData, setEditData] = useState({
    numero: '',
    dataEmissao: '',
    fornecedor: '',
    valorTotal: '',
    impostos: []
  });

  const listarNotas = async () => {
    try {
      const res = await api.get('/nfe');
      setNotas(res.data);
    } catch (err) {
      setError('Erro ao listar notas fiscais.');
      console.error(err);
    }
  };

  useEffect(() => {
    listarNotas();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Selecione um arquivo (XML ou PDF).');
      return;
    }
    try {
      setError('');
      setMensagem('');
      setUploading(true);

      const formData = new FormData();
      formData.append('nfFile', file);

      const res = await api.post('/nfe/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMensagem(res.data.message || 'Nota enviada com sucesso!');
      listarNotas();
      setFile(null);
    } catch (err) {
      console.error(err);
      setError('Falha ao enviar nota fiscal.');
    } finally {
      setUploading(false);
    }
  };

  // **Função para Upload de Certificado**
  const handleCertUpload = async (e) => {
    e.preventDefault();
    if (!certFile) {
      setError('Selecione um certificado (.pfx ou .pem).');
      return;
    }
    try {
      setError('');
      setMensagem('');
      setCertUploading(true);

      const formData = new FormData();
      formData.append('certificate', certFile);

      const res = await api.post('/nfe/upload-certificate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMensagem(res.data.message || 'Certificado enviado com sucesso!');
      // Opcional: Salvar o caminho do certificado no estado ou contexto, se necessário
      setCertFile(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Falha ao enviar certificado.');
    } finally {
      setCertUploading(false);
    }
  };

  const handlePreview = (nota) => {
    if (!nota.uploadPath) {
      setError('Caminho do arquivo não disponível ou não salvo no BD.');
      return;
    }
    const backendURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
    let pathPublico = nota.uploadPath.replace(/.*public[\\/]/, '');
    if (!pathPublico.startsWith('/')) {
      pathPublico = '/' + pathPublico;
    }
    const urlCompleta = backendURL + pathPublico;
    window.open(urlCompleta, '_blank');
  };

  const handleDeleteNota = async (notaId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta Nota Fiscal?')) return;
    try {
      setError('');
      setMensagem('');
      await api.delete(`/nfe/${notaId}`);
      setMensagem('Nota excluída com sucesso!');
      listarNotas();
    } catch (err) {
      console.error(err);
      setError('Erro ao excluir Nota Fiscal.');
    }
  };

  const handleEditNota = (nota) => {
    setNotaSelecionada(nota);
    setEditData({
      numero: nota.numero || '',
      dataEmissao: nota.dataEmissao ? nota.dataEmissao.split('T')[0] : '',
      fornecedor: nota.fornecedor || '',
      valorTotal: nota.valorTotal || '',
      impostos: nota.impostos || []
    });
    setShowModal(true);
  };

  const handleChangeEdit = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEdit = async () => {
    try {
      const updatedNota = {
        numero: editData.numero,
        dataEmissao: editData.dataEmissao,
        fornecedor: editData.fornecedor,
        valorTotal: parseFloat(editData.valorTotal),
        impostos: editData.impostos
      };
      const res = await api.put(`/nfe/${notaSelecionada._id}`, updatedNota);
      setMensagem(res.data.message);
      setShowModal(false);
      listarNotas();
    } catch (err) {
      console.error(err);
      setError('Erro ao atualizar Nota Fiscal.');
    }
  };

  return (
    <Container className="my-4">
      <Row>
        <Col>
          <h2 className="mb-4">Notas Fiscais</h2>
        </Col>
      </Row>

      {error && (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger" onClose={() => setError('')} dismissible>
              {error}
            </Alert>
          </Col>
        </Row>
      )}
      {mensagem && (
        <Row className="mb-3">
          <Col>
            <Alert variant="success" onClose={() => setMensagem('')} dismissible>
              {mensagem}
            </Alert>
          </Col>
        </Row>
      )}

      {/* **Seção de Upload de Certificado** */}
      <Card className="mb-4 shadow-sm">
        <Card.Header>Upload de Certificado Digital</Card.Header>
        <Card.Body>
          <Form onSubmit={handleCertUpload}>
            <Form.Group className="mb-3" controlId="formCertFile">
              <Form.Label>Certificado (.pfx ou .pem)</Form.Label>
              <Form.Control
                type="file"
                accept=".pfx,.pem"
                onChange={(e) => setCertFile(e.target.files[0])}
              />
            </Form.Group>

            {/* Se o certificado exigir senha, adicione um campo de senha aqui */}
            {/* 
            <Form.Group className="mb-3" controlId="formCertPassword">
              <Form.Label>Senha do Certificado</Form.Label>
              <Form.Control
                type="password"
                placeholder="Digite a senha do certificado"
                onChange={(e) => setCertPassword(e.target.value)}
              />
            </Form.Group>
            */}

            <div className="d-flex align-items-center">
              <Button variant="primary" type="submit" disabled={certUploading}>
                {certUploading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Enviando...
                  </>
                ) : (
                  <>
                    <FaUpload className="me-2" /> Enviar Certificado
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* **Seção de Upload de NF-e** */}
      <Card className="mb-4 shadow-sm">
        <Card.Header>Enviar nova Nota Fiscal</Card.Header>
        <Card.Body>
          <Form onSubmit={handleUpload}>
            <Form.Group className="mb-3" controlId="formNotaFile">
              <Form.Label>Arquivo da Nota (XML ou PDF)</Form.Label>
              <Form.Control
                type="file"
                accept=".xml, .pdf"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </Form.Group>

            <div className="d-flex align-items-center">
              <Button variant="primary" type="submit" disabled={uploading}>
                {uploading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Enviando...
                  </>
                ) : (
                  <>Enviar</>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* **Seção de Listagem de NF-e** */}
      <Card className="shadow-sm">
        <Card.Header>Notas Registradas</Card.Header>
        <Card.Body>
          {notas.length === 0 ? (
            <Alert variant="info">Nenhuma nota cadastrada.</Alert>
          ) : (
            <Table striped bordered hover responsive>
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Arquivo</th>
                  <th>Número</th>
                  <th>Data Emissão</th>
                  <th>Fornecedor</th>
                  <th>Valor Total</th>
                  <th>Impostos</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {notas.map((n) => (
                  <tr key={n._id}>
                    <td>{n._id.substring(0, 6)}</td>
                    <td>
                      {n.originalFileName} ({n.tipoArquivo})
                    </td>
                    <td>{n.numero || <em>—</em>}</td>
                    <td>
                      {n.dataEmissao
                        ? new Date(n.dataEmissao).toLocaleDateString()
                        : '-'}
                    </td>
                    <td>{n.fornecedor || <em>—</em>}</td>
                    <td>
                      R${' '}
                      {n.valorTotal
                        ? n.valorTotal.toFixed(2)
                        : '0.00'}
                    </td>
                    <td>
                      {n.impostos && n.impostos.length > 0 ? (
                        n.impostos.map((imp, idx) => (
                          <div key={idx}>
                            {imp.nome}: R$ {imp.valor?.toFixed(2)}
                          </div>
                        ))
                      ) : (
                        <em>Nenhum</em>
                      )}
                    </td>
                    <td className="text-center">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handlePreview(n)}
                        title="Visualizar Nota"
                        className="me-2"
                      >
                        <FaSearch />
                      </Button>

                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleEditNota(n)}
                        title="Editar Nota"
                        className="me-2"
                      >
                        <FaEdit />
                      </Button>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteNota(n._id)}
                        title="Excluir Nota"
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal de Edição */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Nota Fiscal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {notaSelecionada && (
            <Form>
              <Form.Group className="mb-3" controlId="formNumero">
                <Form.Label>Número</Form.Label>
                <Form.Control
                  type="text"
                  name="numero"
                  value={editData.numero}
                  onChange={handleChangeEdit}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formDataEmissao">
                <Form.Label>Data Emissão</Form.Label>
                <Form.Control
                  type="date"
                  name="dataEmissao"
                  value={editData.dataEmissao}
                  onChange={handleChangeEdit}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formFornecedor">
                <Form.Label>Fornecedor</Form.Label>
                <Form.Control
                  type="text"
                  name="fornecedor"
                  value={editData.fornecedor}
                  onChange={handleChangeEdit}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formValorTotal">
                <Form.Label>Valor Total</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="valorTotal"
                  value={editData.valorTotal}
                  onChange={handleChangeEdit}
                />
              </Form.Group>

              {/* Impostos */}
              <Form.Group className="mb-3" controlId="formImpostos">
                <Form.Label>Impostos</Form.Label>
                {editData.impostos.map((imp, idx) => (
                  <Row key={idx} className="mb-2">
                    <Col>
                      <Form.Control
                        type="text"
                        placeholder="Nome do Imposto"
                        value={imp.nome}
                        onChange={(e) => {
                          const novosImpostos = [...editData.impostos];
                          novosImpostos[idx].nome = e.target.value;
                          setEditData(prev => ({ ...prev, impostos: novosImpostos }));
                        }}
                      />
                    </Col>
                    <Col>
                      <Form.Control
                        type="number"
                        step="0.01"
                        placeholder="Valor"
                        value={imp.valor}
                        onChange={(e) => {
                          const novosImpostos = [...editData.impostos];
                          novosImpostos[idx].valor = parseFloat(e.target.value) || 0;
                          setEditData(prev => ({ ...prev, impostos: novosImpostos }));
                        }}
                      />
                    </Col>
                    <Col xs="auto">
                      <Button
                        variant="danger"
                        onClick={() => {
                          const novosImpostos = editData.impostos.filter((_, i) => i !== idx);
                          setEditData(prev => ({ ...prev, impostos: novosImpostos }));
                        }}
                      >
                        &times;
                      </Button>
                    </Col>
                  </Row>
                ))}
                <Button
                  variant="secondary"
                  onClick={() => setEditData(prev => ({ ...prev, impostos: [...prev.impostos, { nome: '', valor: 0 }] }))}
                >
                  Adicionar Imposto
                </Button>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Fechar
          </Button>
          <Button variant="primary" onClick={handleSaveEdit}>
            Salvar Alterações
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default NotasFiscaisPage;
