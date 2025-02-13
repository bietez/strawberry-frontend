// src/pages/Reservations/ReservationForm.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import { Button, Container, Row, Col, Alert, Spinner, Form } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // Remova ToastContainer daqui
import * as Yup from 'yup';

function ReservationForm() {
  const [clientes, setClientes] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  const [initialValues, setInitialValues] = useState({
    clienteId: '',
    mesaId: '',
    dataReserva: '',
    numeroPessoas: 1,
    status: 'ativa',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obter a lista de clientes
        const clientesRes = await api.get('/customers');
        setClientes(clientesRes.data);

        if (id) {
          // Edição: obter detalhes da reserva existente
          const reservaRes = await api.get(`/reservations/${id}`);
          const reserva = reservaRes.data;
          setInitialValues({
            clienteId: reserva.cliente?._id || '',
            mesaId: reserva.mesa?._id || '',
            dataReserva: reserva.dataReserva
              ? new Date(reserva.dataReserva).toISOString().slice(0, 16)
              : '',
            numeroPessoas: reserva.numeroPessoas || 1,
            status: reserva.status || 'ativa',
          });
          // Buscar mesas disponíveis para a data da reserva existente
          await fetchAvailableTables(reserva.dataReserva);
        } else {
          // Criação: definir dataReserva para 1 hora no futuro
          const currentDate = new Date();
          currentDate.setHours(currentDate.getHours() + 1);
          const currentDateISO = currentDate.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
          setInitialValues((prev) => ({
            ...prev,
            dataReserva: currentDateISO,
          }));
          await fetchAvailableTables(currentDateISO);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        const errorMessage = 'Erro ao carregar dados. Por favor, tente novamente mais tarde.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [id]);

  const fetchAvailableTables = async (dataReserva) => {
    try {
      const reservaDate = new Date(dataReserva);
      if (isNaN(reservaDate)) {
        throw new Error('Data da reserva inválida');
      }
      const isoDate = reservaDate.toISOString();

      const response = await api.get('/reservations/available-tables', {
        params: { dataReserva: isoDate },
      });
      setMesas(response.data);
      setError(null); // Limpa erros anteriores
    } catch (error) {
      console.error('Erro ao obter mesas disponíveis:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao obter mesas disponíveis.';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const validationSchema = Yup.object().shape({
    clienteId: Yup.string().required('Cliente é obrigatório'),
    mesaId: Yup.string().required('Mesa é obrigatória'),
    dataReserva: Yup.date()
      .min(new Date(new Date().getTime() + 60 * 60 * 1000), 'A data da reserva deve ser pelo menos 1 hora no futuro')
      .required('Data da reserva é obrigatória'),
    numeroPessoas: Yup.number()
      .min(1, 'Pelo menos uma pessoa')
      .required('Número de pessoas é obrigatório'),
    status: Yup.string()
      .oneOf(['ativa', 'concluida', 'cancelada'], 'Status inválido')
      .required('Status é obrigatório'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const reservaDate = new Date(values.dataReserva);
      if (isNaN(reservaDate)) {
        throw new Error('Data da reserva inválida');
      }
      const reservaData = {
        clienteId: values.clienteId,
        mesaId: values.mesaId,
        dataReserva: reservaDate.toISOString(),
        numeroPessoas: values.numeroPessoas,
        status: values.status,
      };

      if (id) {
        // Edição
        await api.put(`/reservations/${id}`, reservaData);
        toast.success('Reserva atualizada com sucesso!');
      } else {
        // Criação
        await api.post('/reservations', reservaData);
        toast.success('Reserva criada com sucesso!');
      }
      navigate('/reservations');
    } catch (error) {
      console.error('Erro ao salvar reserva:', error);
      const message = error.response?.data?.message || 'Erro ao salvar reserva.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </Spinner>
        <div className="mt-2">Carregando dados...</div>
      </Container>
    );
  }

  if (error && !mesas.length) { // Exibe o erro apenas se não houver mesas disponíveis
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      {/* Remova <ToastContainer /> daqui */}
      <Row className="mb-4">
        <Col>
          <h2>{id ? 'Editar Reserva' : 'Nova Reserva'}</h2>
        </Col>
        <Col className="text-end">
          <Button variant="secondary" onClick={() => navigate('/reservations')}>
            Voltar para Reservas
          </Button>
        </Col>
      </Row>
      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values, setFieldValue }) => (
          <FormikForm>
            <Form.Group className="mb-3" controlId="clienteId">
              <Form.Label>Cliente</Form.Label>
              <Field as="select" name="clienteId" className="form-select">
                <option value="">Selecione um cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente._id} value={cliente._id}>
                    {cliente.nome}
                  </option>
                ))}
              </Field>
              <ErrorMessage name="clienteId" component="div" className="text-danger" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="mesaId">
              <Form.Label>Mesa</Form.Label>
              <Field as="select" name="mesaId" className="form-select">
                <option value="">Selecione uma mesa</option>
                {mesas.map((mesa) => (
                  <option key={mesa._id} value={mesa._id}>
                    Mesa {mesa.numeroMesa} - Ambiente {mesa.ambiente?.nome || 'N/A'}
                  </option>
                ))}
              </Field>
              <ErrorMessage name="mesaId" component="div" className="text-danger" />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="dataReserva">
                  <Form.Label>Data da Reserva</Form.Label>
                  <Field
                    type="datetime-local"
                    name="dataReserva"
                    className="form-control"
                    onChange={(e) => {
                      const value = e.target.value;
                      setFieldValue('dataReserva', value);
                      if (value) {
                        fetchAvailableTables(value);
                        setFieldValue('mesaId', ''); // Resetar a seleção da mesa ao mudar a data
                      }
                    }}
                  />
                  <ErrorMessage name="dataReserva" component="div" className="text-danger" />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3" controlId="numeroPessoas">
                  <Form.Label>Número de Pessoas</Form.Label>
                  <Field
                    type="number"
                    name="numeroPessoas"
                    className="form-control"
                    min="1"
                  />
                  <ErrorMessage name="numeroPessoas" component="div" className="text-danger" />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3" controlId="status">
                  <Form.Label>Status</Form.Label>
                  <Field as="select" name="status" className="form-select">
                    <option value="ativa">Ativa</option>
                    <option value="concluida">Concluída</option>
                    <option value="cancelada">Cancelada</option>
                  </Field>
                  <ErrorMessage name="status" component="div" className="text-danger" />
                </Form.Group>
              </Col>
            </Row>

            <Button variant="primary" type="submit" disabled={isSubmitting || !mesas.length}>
              {isSubmitting ? 'Salvando...' : id ? 'Atualizar Reserva' : 'Criar Reserva'}
            </Button>
          </FormikForm>
        )}
      </Formik>
    </Container>
  );
}

export default ReservationForm;
