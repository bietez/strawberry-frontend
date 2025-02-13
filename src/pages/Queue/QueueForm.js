// src/pages/Queue/QueueForm.js
import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Alert, Row, Col, Card, Container } from 'react-bootstrap';
import InputMask from 'react-input-mask';
import { toast } from 'react-toastify';

function QueueForm() {
    const [name, setName] = useState('');
    const [numberOfPeople, setNumberOfPeople] = useState(1);
    const [contact, setContact] = useState('');
    const [telefone, setTelefone] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const telefoneNumeros = telefone.replace(/\D/g, '');
        if (name.trim() === '' || numberOfPeople < 1 || contact.trim() === '' || telefoneNumeros.length !== 11) {
            setError('Por favor, preencha todos os campos corretamente. Certifique-se de que o telefone tenha 11 dígitos.');
            setSuccess('');
            return;
        }

        try {
            await axios.post(process.env.REACT_APP_API_URL, { 
                name, 
                numberOfPeople, 
                contact, 
                telefone: telefoneNumeros 
            });
            setName('');
            setNumberOfPeople(1);
            setContact('');
            setTelefone('');
            setSuccess('Entrada adicionada com sucesso!');
            setError('');
            toast.success('Entrada adicionada com sucesso!');
        } catch (err) {
            console.error(err);
            setError('Erro ao adicionar entrada.');
            setSuccess('');
            toast.error('Erro ao adicionar entrada.');
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center min-vh-100">
            <Card style={{ width: '100%', maxWidth: '700px' }}>
                <Card.Body>
                    <Card.Title className="text-center mb-4">Adicionar à Fila</Card.Title>
                    <Form onSubmit={handleSubmit}>
                        {error && <Alert variant="danger">{error}</Alert>}
                        {success && <Alert variant="success">{success}</Alert>}
                        <Row className="mb-3">
                            <Col>
                                <Form.Group controlId="formName">
                                    <Form.Label>Nome da Pessoa</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        placeholder="Digite o nome" 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)} 
                                        required 
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group controlId="formNumberOfPeople">
                                    <Form.Label>Número de Pessoas</Form.Label>
                                    <Form.Control 
                                        type="number" 
                                        min="1"
                                        placeholder="Quantidade" 
                                        value={numberOfPeople} 
                                        onChange={(e) => setNumberOfPeople(e.target.value)} 
                                        required 
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="formContact">
                                    <Form.Label>Contato (Email)</Form.Label>
                                    <Form.Control 
                                        type="email" 
                                        placeholder="Email ou outra forma de contato" 
                                        value={contact} 
                                        onChange={(e) => setContact(e.target.value)} 
                                        required 
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="mb-4">
                            <Col>
                                <Form.Group controlId="formTelefone">
                                    <Form.Label>Telefone</Form.Label>
                                    <InputMask 
                                        mask="(99) 99999-9999" 
                                        value={telefone} 
                                        onChange={(e) => setTelefone(e.target.value)}
                                        required
                                    >
                                        {(inputProps) => <Form.Control type="text" placeholder="(XX) XXXXX-XXXX" {...inputProps} />}
                                    </InputMask>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col className="text-center">
                                <Button variant="primary" type="submit" className="w-50">
                                    Adicionar
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default QueueForm;
