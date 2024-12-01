// src/pages/Auth/Login.js
import React from 'react';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  InputGroup,
} from 'react-bootstrap';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import api from '../../services/api';

function Login() {
  const navigate = useNavigate();

  return (
    <Container fluid className="min-vh-100 bg-dark d-flex align-items-center justify-content-center">
      <Row className="w-100">
        <Col xs={12} sm={8} md={6} lg={4} className="mx-auto">
          <Card className="bg-secondary text-white shadow-lg">
            <Card.Body>
              <h3 className="text-center mb-4">Entrar</h3>
              <Formik
                initialValues={{ email: '', senha: '', rememberMe: false }}
                validationSchema={Yup.object({
                  email: Yup.string()
                    .email('Email inválido')
                    .required('Obrigatório'),
                  senha: Yup.string().required('Obrigatório'),
                })}
                onSubmit={async (values, { setSubmitting }) => {
                  try {
                    const response = await api.post('/auth/login', {
                      email: values.email,
                      senha: values.senha,
                    });
                    const { token, user } = response.data;
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(user));

                    if (values.rememberMe) {
                      localStorage.setItem('rememberMe', 'true');
                    } else {
                      sessionStorage.setItem('token', token);
                      sessionStorage.setItem('user', JSON.stringify(user));
                      sessionStorage.setItem('rememberMe', 'false');
                    }

                    toast.success('Login realizado com sucesso!');
                    navigate('/');
                  } catch (error) {
                    const errorMessage =
                      error.response?.data?.message || error.message;
                    toast.error('Erro ao fazer login: ' + errorMessage);
                  }
                  setSubmitting(false);
                }}
              >
                {({ isSubmitting, handleChange, handleBlur, values }) => (
                  <FormikForm>
                    {/* Campo de E-mail */}
                    <Form.Group controlId="formEmail" className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FaEnvelope />
                        </InputGroup.Text>
                        <Field
                          name="email"
                          type="email"
                          placeholder="Digite seu email"
                          className="form-control bg-dark text-white"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.email}
                        />
                      </InputGroup>
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="text-danger mt-1"
                      />
                    </Form.Group>

                    {/* Campo de Senha */}
                    <Form.Group controlId="formSenha" className="mb-3">
                      <Form.Label>Senha</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          <FaLock />
                        </InputGroup.Text>
                        <Field
                          name="senha"
                          type="password"
                          placeholder="Digite sua senha"
                          className="form-control bg-dark text-white"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.senha}
                        />
                      </InputGroup>
                      <ErrorMessage
                        name="senha"
                        component="div"
                        className="text-danger mt-1"
                      />
                    </Form.Group>

                    {/* Lembrar-me */}
                    <Form.Group controlId="formRememberMe" className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Lembrar-me"
                        name="rememberMe"
                        onChange={handleChange}
                        checked={values.rememberMe}
                        className="text-white"
                      />
                    </Form.Group>

                    {/* Botão de Submit */}
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-100"
                    >
                      {isSubmitting ? 'Entrando...' : 'Entrar'}
                    </Button>
                  </FormikForm>
                )}
              </Formik>
            </Card.Body>
            <Card.Footer className="bg-secondary text-center">
              <small>
                Não tem uma conta?{' '}
                <a href="/register" className="text-primary">
                  Registre-se
                </a>
              </small>
              <br />
              <small>
                <a href="/forgot-password" className="text-primary">
                  Esqueceu a senha?
                </a>
              </small>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
