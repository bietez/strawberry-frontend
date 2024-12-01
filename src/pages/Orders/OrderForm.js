// src/pages/Orders/OrderForm.js
import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Card,
  Alert,
  Spinner,
} from 'react-bootstrap';

function OrderForm() {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // For loading state
  const [error, setError] = useState(null); // For error handling

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tablesResponse, productsResponse] = await Promise.all([
          api.get('/tables'),
          api.get('/products'),
        ]);
        setTables(tablesResponse.data);
        setProducts(productsResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao obter dados:', error);
        setError('Erro ao obter dados. Por favor, tente novamente.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const initialValues = {
    mesaId: '',
    assentos: [],
    itens: [],
  };

  const validationSchema = Yup.object({
    mesaId: Yup.string().required('Selecione uma mesa'),
    assentos: Yup.array().min(1, 'Selecione pelo menos um assento'),
    itens: Yup.array().min(1, 'Selecione pelo menos um produto'),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await api.post('/orders', values);
      alert('Pedido criado com sucesso!');
      navigate('/orders');
    } catch (error) {
      alert('Erro ao criar pedido: ' + (error.response?.data?.message || error.message));
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header>
          <h2>Novo Pedido</h2>
        </Card.Header>
        <Card.Body>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, setFieldValue, isSubmitting }) => (
              <FormikForm>
                <Form.Group as={Row} className="mb-3">
                  <Form.Label column sm={2}>
                    Mesa
                  </Form.Label>
                  <Col sm={10}>
                    <Field
                      as="select"
                      name="mesaId"
                      className="form-control"
                      onChange={(e) => {
                        setFieldValue('mesaId', e.target.value);
                        setFieldValue('assentos', []);
                      }}
                    >
                      <option value="">Selecione uma mesa</option>
                      {tables.map((table) => (
                        <option key={table._id} value={table._id}>
                          Mesa {table.numeroMesa}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name="mesaId"
                      component="div"
                      className="text-danger"
                    />
                  </Col>
                </Form.Group>

                {values.mesaId && (
                  <>
                    <Form.Group as={Row} className="mb-3">
                      <Form.Label as="legend" column sm={2}>
                        Assentos
                      </Form.Label>
                      <Col sm={10}>
                        {(() => {
                          const selectedTable = tables.find(
                            (table) => table._id === values.mesaId
                          );
                          if (selectedTable) {
                            return selectedTable.assentos.map((assento) => (
                              <Form.Check
                                key={assento._id}
                                type="checkbox"
                                label={`Assento ${assento.numeroAssento}`}
                                name="assentos"
                                value={assento._id}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFieldValue('assentos', [
                                      ...values.assentos,
                                      assento._id,
                                    ]);
                                  } else {
                                    setFieldValue(
                                      'assentos',
                                      values.assentos.filter(
                                        (id) => id !== assento._id
                                      )
                                    );
                                  }
                                }}
                                checked={values.assentos.includes(assento._id)}
                              />
                            ));
                          } else {
                            return <div>Mesa não encontrada</div>;
                          }
                        })()}
                        <ErrorMessage
                          name="assentos"
                          component="div"
                          className="text-danger"
                        />
                      </Col>
                    </Form.Group>
                  </>
                )}

                <Form.Group as={Row} className="mb-3">
                  <Form.Label as="legend" column sm={2}>
                    Produtos
                  </Form.Label>
                  <Col sm={10}>
                    {products.map((product) => (
                      <Form.Check
                        key={product._id}
                        type="checkbox"
                        label={`${product.nome} - R$ ${product.preco.toFixed(2)}`}
                        name="itens"
                        value={product._id}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFieldValue('itens', [...values.itens, product._id]);
                          } else {
                            setFieldValue(
                              'itens',
                              values.itens.filter((id) => id !== product._id)
                            );
                          }
                        }}
                        checked={values.itens.includes(product._id)}
                      />
                    ))}
                    <ErrorMessage
                      name="itens"
                      component="div"
                      className="text-danger"
                    />
                  </Col>
                </Form.Group>

                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando...' : 'Enviar Pedido'}
                </Button>
              </FormikForm>
            )}
          </Formik>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default OrderForm;
