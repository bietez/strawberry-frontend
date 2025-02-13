// src/components/ConfigModal.js
import React, { useState } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';

function ConfigModal({ show, onHide, onSave, initialData }) {
  const [formData, setFormData] = useState({
    logotipo: initialData?.logotipo || '',
    logotipoFile: null, // Arquivo de logotipo
    razaoSocial: initialData?.razaoSocial || '',
    cnpj: initialData?.cnpj || '',
    ie: initialData?.ie || '',
    logradouro: initialData?.logradouro || '',
    numero: initialData?.numero || '',
    bairro: initialData?.bairro || '',
    cidade: initialData?.cidade || '',
    uf: initialData?.uf || '',
    telefone: initialData?.telefone || '',
    email: initialData?.email || '',
    taxaServico: initialData?.taxaServico !== undefined ? initialData.taxaServico : 10,
    site: initialData?.site || '',
    observacoes: initialData?.observacoes || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        toast.error('Apenas arquivos JPEG, JPG, PNG e GIF são permitidos.');
        return;
      }

      if (file.size > maxSize) {
        toast.error('O tamanho do arquivo excede 5MB.');
        return;
      }

      setFormData(prev => ({ ...prev, logotipoFile: file }));

      // Exibir pré-visualização da imagem
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logotipo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveClick = () => {
    // Prepara formData multipart se houver arquivo
    const data = new FormData();
    data.append('razaoSocial', formData.razaoSocial);
    data.append('cnpj', formData.cnpj);
    data.append('ie', formData.ie);
    data.append('logradouro', formData.logradouro);
    data.append('numero', formData.numero);
    data.append('bairro', formData.bairro);
    data.append('cidade', formData.cidade);
    data.append('uf', formData.uf);
    data.append('telefone', formData.telefone);
    data.append('email', formData.email);
    data.append('taxaServico', formData.taxaServico);
    if (formData.site) data.append('site', formData.site);
    if (formData.observacoes) data.append('observacoes', formData.observacoes);

    // Se tiver arquivo de logo, envia
    if (formData.logotipoFile) {
      data.append('logotipo', formData.logotipoFile);
    }

    onSave(data);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{initialData ? 'Editar Configuração' : 'Criar Configuração'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {/* Campo para upload da logomarca */}
          <Form.Group className="mb-3">
            <Form.Label>Logotipo</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
            />
            {formData.logotipo && (
              <div className="mt-2 text-center">
                <img src={formData.logotipo} alt="Logotipo" style={{ maxHeight: '100px' }} />
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Razão Social*</Form.Label>
            <Form.Control type="text" name="razaoSocial" value={formData.razaoSocial} onChange={handleChange} required />
          </Form.Group>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>CNPJ*</Form.Label>
                <Form.Control type="text" name="cnpj" value={formData.cnpj} onChange={handleChange} placeholder="Apenas números" required />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>IE*</Form.Label>
                <Form.Control type="text" name="ie" value={formData.ie} onChange={handleChange} required />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Logradouro*</Form.Label>
                <Form.Control type="text" name="logradouro" value={formData.logradouro} onChange={handleChange} required />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Número*</Form.Label>
                <Form.Control type="text" name="numero" value={formData.numero} onChange={handleChange} required />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Bairro*</Form.Label>
            <Form.Control type="text" name="bairro" value={formData.bairro} onChange={handleChange} required />
          </Form.Group>
          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Cidade*</Form.Label>
                <Form.Control type="text" name="cidade" value={formData.cidade} onChange={handleChange} required />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>UF*</Form.Label>
                <Form.Control type="text" name="uf" value={formData.uf} onChange={handleChange} placeholder="Ex: SP" required />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Telefone*</Form.Label>
            <Form.Control type="text" name="telefone" value={formData.telefone} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>E-mail*</Form.Label>
            <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Taxa de Serviço (%)*</Form.Label>
            <Form.Control type="number" name="taxaServico" value={formData.taxaServico} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Site</Form.Label>
            <Form.Control type="text" name="site" value={formData.site} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Observações</Form.Label>
            <Form.Control as="textarea" rows={3} name="observacoes" value={formData.observacoes} onChange={handleChange} />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Cancelar</Button>
        <Button variant="primary" onClick={handleSaveClick}>
          {initialData ? 'Salvar Alterações' : 'Criar Configuração'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ConfigModal;
