// src/pages/Auth/Login.js
import React, { useState } from 'react';
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
import { Helmet } from 'react-helmet-async';

function Login() {
  const navigate = useNavigate();

  // Exibe tela de "Esqueci a senha" ao invés de Login
  const [showForgotForm, setShowForgotForm] = useState(false);

  // Controla se já enviamos o OTP (avança pro segundo passo)
  const [otpSent, setOtpSent] = useState(false);

  // Armazena o email para o qual enviamos o OTP
  const [resetEmail, setResetEmail] = useState('');

  return (
    <Container
      fluid
      className="min-vh-100 bg-dark d-flex align-items-center justify-content-center"
    >
      <Helmet>
        <title>Login - Strawberry</title>
      </Helmet>
      <Row className="w-100">
        <Col xs={12} sm={8} md={6} lg={4} className="mx-auto">
          <Card className="bg-secondary text-white shadow-lg">
            <Card.Body>
              <h3 className="text-center mb-4">
                {showForgotForm ? 'Recuperar Senha' : 'Entrar'}
              </h3>

              {!showForgotForm ? (
                /* ========================================
                   =========== FORM DE LOGIN ==============
                   ======================================== */
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
                      // POST /auth/login
                      const response = await api.post('/auth/login', {
                        email: values.email,
                        senha: values.senha,
                      });
                      const { token, user } = response.data;

                      // Armazena token e user
                      localStorage.setItem('token', token);
                      localStorage.setItem('user', JSON.stringify(user));

                      // Lembrar-me
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
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  {({ isSubmitting, handleChange, handleBlur, values }) => (
                    <FormikForm>
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
              ) : (
                /* ========================================
                   ====== FORM DE RECUPERAÇÃO DE SENHA =====
                   ======================================== */
                <>
                  {!otpSent ? (
                    /* Passo 1: Solicitar OTP via /auth/forgot-password */
                    <Formik
                      initialValues={{ email: '' }}
                      validationSchema={Yup.object({
                        email: Yup.string()
                          .email('Email inválido')
                          .required('Obrigatório'),
                      })}
                      onSubmit={async (values, { setSubmitting }) => {
                        try {
                          // POST /auth/forgot-password
                          const resp = await api.post('/auth/forgot-password', {
                            email: values.email,
                          });
                          toast.success(resp.data.message);
                          // Guarda o email e passa para o Passo 2
                          setResetEmail(values.email);
                          setOtpSent(true);
                        } catch (error) {
                          const errorMessage =
                            error.response?.data?.message || error.message;
                          toast.error(
                            'Erro ao solicitar recuperação de senha: ' +
                              errorMessage
                          );
                        } finally {
                          setSubmitting(false);
                        }
                      }}
                    >
                      {({ isSubmitting, handleChange, handleBlur, values }) => (
                        <FormikForm>
                          <Form.Group controlId="formResetEmail" className="mb-3">
                            <Form.Label>Digite seu Email</Form.Label>
                            <InputGroup>
                              <InputGroup.Text>
                                <FaEnvelope />
                              </InputGroup.Text>
                              <Field
                                name="email"
                                type="email"
                                placeholder="Email cadastrado"
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

                          <Button
                            variant="primary"
                            type="submit"
                            disabled={isSubmitting}
                            className="w-100"
                          >
                            {isSubmitting
                              ? 'Enviando...'
                              : 'Enviar Código de Recuperação'}
                          </Button>
                        </FormikForm>
                      )}
                    </Formik>
                  ) : (
                    /* Passo 2: Enviar OTP + nova senha via /auth/reset-password */
                    <Formik
                      initialValues={{ otp: '', novaSenha: '' }}
                      validationSchema={Yup.object({
                        otp: Yup.string()
                          .required('Obrigatório')
                          .length(6, 'O código deve ter 6 dígitos'),
                        novaSenha: Yup.string().required('Obrigatório'),
                      })}
                      onSubmit={async (values, { setSubmitting }) => {
                        try {
                          // POST /auth/reset-password
                          const resp = await api.post('/auth/reset-password', {
                            email: resetEmail,
                            otp: values.otp,
                            novaSenha: values.novaSenha,
                          });
                          toast.success(resp.data.message);
                          // Sucesso: voltar pro login
                          setShowForgotForm(false);
                          setOtpSent(false);
                          setResetEmail('');
                        } catch (error) {
                          const errorMessage =
                            error.response?.data?.message || error.message;
                          toast.error('Erro ao redefinir senha: ' + errorMessage);
                        } finally {
                          setSubmitting(false);
                        }
                      }}
                    >
                      {({ isSubmitting, handleChange, handleBlur, values }) => (
                        <FormikForm>
                          <Form.Group controlId="formOTP" className="mb-3">
                            <Form.Label>Código de Verificação (OTP)</Form.Label>
                            <Field
                              name="otp"
                              type="text"
                              placeholder="Ex: 123456"
                              className="form-control bg-dark text-white"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={values.otp}
                            />
                            <ErrorMessage
                              name="otp"
                              component="div"
                              className="text-danger mt-1"
                            />
                          </Form.Group>

                          <Form.Group controlId="formNovaSenha" className="mb-3">
                            <Form.Label>Nova Senha</Form.Label>
                            <InputGroup>
                              <InputGroup.Text>
                                <FaLock />
                              </InputGroup.Text>
                              <Field
                                name="novaSenha"
                                type="password"
                                placeholder="Digite a nova senha"
                                className="form-control bg-dark text-white"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.novaSenha}
                              />
                            </InputGroup>
                            <ErrorMessage
                              name="novaSenha"
                              component="div"
                              className="text-danger mt-1"
                            />
                          </Form.Group>

                          <Button
                            variant="primary"
                            type="submit"
                            disabled={isSubmitting}
                            className="w-100"
                          >
                            {isSubmitting
                              ? 'Enviando...'
                              : 'Confirmar Nova Senha'}
                          </Button>
                        </FormikForm>
                      )}
                    </Formik>
                  )}
                </>
              )}
            </Card.Body>

            <Card.Footer className="bg-secondary text-center">
              {!showForgotForm ? (
                <>
                  <small>
                    Não tem uma conta?{' '}
                    <a href="/register" className="text-primary">
                      Registre-se
                    </a>
                  </small>
                  <br />
                  <small>
                    <span
                      role="button"
                      className="text-primary"
                      onClick={() => setShowForgotForm(true)}
                    >
                      Esqueceu a senha?
                    </span>
                  </small>
                </>
              ) : (
                <>
                  <small>
                    <span
                      role="button"
                      className="text-primary"
                      onClick={() => {
                        // Volta para tela de login
                        setShowForgotForm(false);
                        setOtpSent(false);
                        setResetEmail('');
                      }}
                    >
                      Voltar ao login
                    </span>
                  </small>
                </>
              )}
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
