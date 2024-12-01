// src/pages/Customers/CustomerForm.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Para chamadas ao ViaCEP
import { Form, Button, Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import InputMask from 'react-input-mask';
import { toast } from 'react-toastify';

function CustomerForm() {
  const [customer, setCustomer] = useState({
    cpfCnpj: '',
    nome: '',
    contato: '',
    telefone: '',
    whatsapp: '',
    email: '',
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
  });
  const [loading, setLoading] = useState(false); // Estado para controle de carregamento
  const [loadingCep, setLoadingCep] = useState(false); // Estado para controle de carregamento do CEP
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      setLoading(true);
      api.get(`/customers/${id}`)
        .then((response) => {
          // Garantir que todos os campos estejam presentes
          const data = response.data;
          setCustomer({
            cpfCnpj: data.cpfCnpj || '',
            nome: data.nome || '',
            contato: data.contato || '',
            telefone: data.telefone || '',
            whatsapp: data.whatsapp || '',
            email: data.email || '',
            cep: data.cep || '',
            rua: data.rua || '',
            numero: data.numero || '',
            complemento: data.complemento || '',
            bairro: data.bairro || '',
            cidade: data.cidade || '',
            estado: data.estado || '',
          });
        })
        .catch((error) => {
          console.error('Erro ao obter cliente:', error);
          toast.error('Erro ao obter cliente.');
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handleCepBlur = async () => {
    const cep = customer.cep.replace(/\D/g, '');
    if (cep.length !== 8) {
      toast.error('CEP inválido!');
      return;
    }

    setLoadingCep(true);
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      if (response.data.erro) {
        toast.error('CEP não encontrado!');
        return;
      }

      setCustomer({
        ...customer,
        rua: response.data.logradouro || '',
        complemento: response.data.complemento || '',
        bairro: response.data.bairro || '',
        cidade: response.data.localidade || '',
        estado: response.data.uf || '',
      });
      toast.success('Endereço carregado com sucesso!');
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast.error('Erro ao buscar CEP');
    } finally {
      setLoadingCep(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) {
        await api.put(`/customers/${id}`, customer);
        toast.success('Cliente atualizado com sucesso!');
      } else {
        await api.post('/customers', customer);
        toast.success('Cliente criado com sucesso!');
      }
      navigate('/customers');
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao salvar cliente';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
        <div>Carregando cliente...</div>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h2>{id ? 'Editar Cliente' : 'Novo Cliente'}</h2>
      <Form onSubmit={handleSubmit}>
        <Row>
          {/* CPF/CNPJ */}
          <Col md={6}>
            <Form.Group controlId="cpfCnpj" className="mb-3">
              <Form.Label>CPF/CNPJ*</Form.Label>
              <InputMask
                mask={ (customer.cpfCnpj.replace(/\D/g, '').length > 11) ? '99.999.999/9999-99' : '999.999.999-99' }
                value={customer.cpfCnpj}
                onChange={handleChange}
                onBlur={() => {}} // Evitar chamada excessiva
              >
                {(inputProps) => (
                  <Form.Control
                    type="text"
                    name="cpfCnpj"
                    placeholder={
                      (customer.cpfCnpj.replace(/\D/g, '').length > 11)
                        ? '00.000.000/0000-00'
                        : '000.000.000-00'
                    }
                    required
                    {...inputProps}
                  />
                )}
              </InputMask>
            </Form.Group>
          </Col>

          {/* Nome */}
          <Col md={6}>
            <Form.Group controlId="nome" className="mb-3">
              <Form.Label>Nome*</Form.Label>
              <Form.Control
                type="text"
                name="nome"
                value={customer.nome}
                onChange={handleChange}
                placeholder="Nome do cliente"
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          {/* Contato */}
          <Col md={6}>
            <Form.Group controlId="contato" className="mb-3">
              <Form.Label>Contato</Form.Label>
              <Form.Control
                type="text"
                name="contato"
                value={customer.contato}
                onChange={handleChange}
                placeholder="Nome do contato"
              />
            </Form.Group>
          </Col>

          {/* Whatsapp */}
          <Col md={6}>
            <Form.Group controlId="whatsapp" className="mb-3">
              <Form.Label>Whatsapp*</Form.Label>
              <InputMask
                mask="(99) 99999-9999"
                value={customer.whatsapp}
                onChange={handleChange}
              >
                {(inputProps) => (
                  <Form.Control
                    type="text"
                    name="whatsapp"
                    placeholder="(00) 00000-0000"
                    required
                    {...inputProps}
                  />
                )}
              </InputMask>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          {/* Telefone */}
          <Col md={6}>
            <Form.Group controlId="telefone" className="mb-3">
              <Form.Label>Telefone</Form.Label>
              <InputMask
                mask="(99) 9999-9999"
                value={customer.telefone}
                onChange={handleChange}
              >
                {(inputProps) => (
                  <Form.Control
                    type="text"
                    name="telefone"
                    placeholder="(00) 0000-0000"
                    {...inputProps}
                  />
                )}
              </InputMask>
            </Form.Group>
          </Col>

          {/* Email */}
          <Col md={6}>
            <Form.Group controlId="email" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={customer.email}
                onChange={handleChange}
                placeholder="email@exemplo.com"
              />
            </Form.Group>
          </Col>
        </Row>

        <h4>Endereço</h4>
        <Row>
          {/* CEP */}
          <Col md={4}>
            <Form.Group controlId="cep" className="mb-3">
              <Form.Label>CEP</Form.Label>
              <InputMask
                mask="99999-999"
                value={customer.cep}
                onChange={handleChange}
                onBlur={handleCepBlur}
              >
                {(inputProps) => (
                  <Form.Control
                    type="text"
                    name="cep"
                    placeholder="00000-000"
                    {...inputProps}
                  />
                )}
              </InputMask>
              {loadingCep && <Spinner animation="border" size="sm" className="mt-2" />}
            </Form.Group>
          </Col>

          {/* Rua */}
          <Col md={8}>
            <Form.Group controlId="rua" className="mb-3">
              <Form.Label>Rua</Form.Label>
              <Form.Control
                type="text"
                name="rua"
                value={customer.rua}
                onChange={handleChange}
                placeholder="Rua"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          {/* Número */}
          <Col md={2}>
            <Form.Group controlId="numero" className="mb-3">
              <Form.Label>Número</Form.Label>
              <Form.Control
                type="text"
                name="numero"
                value={customer.numero}
                onChange={handleChange}
                placeholder="Número"
              />
            </Form.Group>
          </Col>

          {/* Complemento */}
          <Col md={5}>
            <Form.Group controlId="complemento" className="mb-3">
              <Form.Label>Complemento</Form.Label>
              <Form.Control
                type="text"
                name="complemento"
                value={customer.complemento}
                onChange={handleChange}
                placeholder="Complemento"
              />
            </Form.Group>
          </Col>

          {/* Bairro */}
          <Col md={5}>
            <Form.Group controlId="bairro" className="mb-3">
              <Form.Label>Bairro</Form.Label>
              <Form.Control
                type="text"
                name="bairro"
                value={customer.bairro}
                onChange={handleChange}
                placeholder="Bairro"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          {/* Cidade */}
          <Col md={6}>
            <Form.Group controlId="cidade" className="mb-3">
              <Form.Label>Cidade</Form.Label>
              <Form.Control
                type="text"
                name="cidade"
                value={customer.cidade}
                onChange={handleChange}
                placeholder="Cidade"
              />
            </Form.Group>
          </Col>

          {/* Estado */}
          <Col md={6}>
            <Form.Group controlId="estado" className="mb-3">
              <Form.Label>Estado</Form.Label>
              <Form.Control
                type="text"
                name="estado"
                value={customer.estado}
                onChange={handleChange}
                placeholder="Estado"
              />
            </Form.Group>
          </Col>
        </Row>

        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />{' '}
              {id ? 'Atualizando...' : 'Criando...'}
            </>
          ) : (
            id ? 'Atualizar' : 'Criar'
          )}
        </Button>
        {' '}
        <Button variant="secondary" onClick={() => navigate('/customers')}>
          Cancelar
        </Button>
      </Form>
    </Container>
  );
}

export default CustomerForm;
