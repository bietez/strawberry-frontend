// src/components/GerarNotaFiscal.js

import React, { useState } from 'react';
import axios from 'axios';

const GerarNotaFiscal = () => {
    const [emitente, setEmitente] = useState({
        CNPJ: '',
        nome: '',
        nomeFantasia: '',
        endereco: {
            logradouro: '',
            numero: '',
            bairro: '',
            codigoMunicipio: '',
            uf: '',
            cep: ''
        },
        telefone: '',
        inscricaoEstadual: ''
    });

    const [destinatario, setDestinatario] = useState({
        CPF: '',
        nome: '',
        endereco: {
            logradouro: '',
            numero: '',
            bairro: '',
            codigoMunicipio: '',
            municipio: '',
            uf: '',
            cep: ''
        },
        telefone: ''
    });

    const [produtos, setProdutos] = useState([
        {
            codigo: '',
            descricao: '',
            ncm: '',
            cfop: '',
            unidade: '',
            quantidade: 0,
            valorUnitario: 0.00
        }
    ]);

    const [informacoesAdicionais, setInformacoesAdicionais] = useState('');
    const [certificado, setCertificado] = useState(null);
    const [mensagem, setMensagem] = useState('');
    const [loading, setLoading] = useState(false);

    // Função para adicionar mais produtos
    const adicionarProduto = () => {
        setProdutos([...produtos, {
            codigo: '',
            descricao: '',
            ncm: '',
            cfop: '',
            unidade: '',
            quantidade: 0,
            valorUnitario: 0.00
        }]);
    };

    // Função para remover um produto
    const removerProduto = (index) => {
        const novosProdutos = [...produtos];
        novosProdutos.splice(index, 1);
        setProdutos(novosProdutos);
    };

    // Função para atualizar os dados dos produtos
    const atualizarProduto = (index, campo, valor) => {
        const novosProdutos = [...produtos];
        novosProdutos[index][campo] = valor;
        setProdutos(novosProdutos);
    };

    // Função para lidar com o envio do formulário
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validações básicas
        if (!certificado) {
            setMensagem('Certificado digital é obrigatório.');
            return;
        }

        setLoading(true);
        setMensagem('');

        try {
            const formData = new FormData();
            formData.append('emitente', JSON.stringify(emitente));
            formData.append('destinatario', JSON.stringify(destinatario));
            formData.append('produtos', JSON.stringify(produtos));
            formData.append('informacoesAdicionais', informacoesAdicionais);
            formData.append('certificado', certificado);

            const resposta = await axios.post('/api/nfe', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setMensagem(resposta.data.message);

            // Opcional: Manipular a resposta, como baixar o PDF
            // Por exemplo, se a resposta retornar o caminho do PDF
            if (resposta.data.notaFiscal && resposta.data.notaFiscal.pdfPath) {
                window.open(resposta.data.notaFiscal.pdfPath, '_blank');
            }

            // Resetar o formulário
            setEmitente({
                CNPJ: '',
                nome: '',
                nomeFantasia: '',
                endereco: {
                    logradouro: '',
                    numero: '',
                    bairro: '',
                    codigoMunicipio: '',
                    uf: '',
                    cep: ''
                },
                telefone: '',
                inscricaoEstadual: ''
            });
            setDestinatario({
                CPF: '',
                nome: '',
                endereco: {
                    logradouro: '',
                    numero: '',
                    bairro: '',
                    codigoMunicipio: '',
                    municipio: '',
                    uf: '',
                    cep: ''
                },
                telefone: ''
            });
            setProdutos([
                {
                    codigo: '',
                    descricao: '',
                    ncm: '',
                    cfop: '',
                    unidade: '',
                    quantidade: 0,
                    valorUnitario: 0.00
                }
            ]);
            setInformacoesAdicionais('');
            setCertificado(null);
        } catch (error) {
            console.error('Erro ao gerar Nota Fiscal:', error);
            setMensagem(error.response?.data?.message || 'Erro ao gerar Nota Fiscal.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <h2>Gerar Nota Fiscal</h2>
            {mensagem && <div className="alert alert-info">{mensagem}</div>}
            <form onSubmit={handleSubmit}>
                <h4>Emitente</h4>
                <div className="form-group">
                    <label>CNPJ</label>
                    <input
                        type="text"
                        className="form-control"
                        value={emitente.CNPJ}
                        onChange={(e) => setEmitente({ ...emitente, CNPJ: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Nome</label>
                    <input
                        type="text"
                        className="form-control"
                        value={emitente.nome}
                        onChange={(e) => setEmitente({ ...emitente, nome: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Nome Fantasia</label>
                    <input
                        type="text"
                        className="form-control"
                        value={emitente.nomeFantasia}
                        onChange={(e) => setEmitente({ ...emitente, nomeFantasia: e.target.value })}
                        required
                    />
                </div>
                {/* Adicione os campos de endereço do emitente */}
                <div className="form-group">
                    <label>Endereço - Logradouro</label>
                    <input
                        type="text"
                        className="form-control"
                        value={emitente.endereco.logradouro}
                        onChange={(e) => setEmitente({ ...emitente, endereco: { ...emitente.endereco, logradouro: e.target.value } })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Endereço - Número</label>
                    <input
                        type="text"
                        className="form-control"
                        value={emitente.endereco.numero}
                        onChange={(e) => setEmitente({ ...emitente, endereco: { ...emitente.endereco, numero: e.target.value } })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Endereço - Bairro</label>
                    <input
                        type="text"
                        className="form-control"
                        value={emitente.endereco.bairro}
                        onChange={(e) => setEmitente({ ...emitente, endereco: { ...emitente.endereco, bairro: e.target.value } })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Endereço - Código Município</label>
                    <input
                        type="text"
                        className="form-control"
                        value={emitente.endereco.codigoMunicipio}
                        onChange={(e) => setEmitente({ ...emitente, endereco: { ...emitente.endereco, codigoMunicipio: e.target.value } })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Endereço - UF</label>
                    <input
                        type="text"
                        className="form-control"
                        value={emitente.endereco.uf}
                        onChange={(e) => setEmitente({ ...emitente, endereco: { ...emitente.endereco, uf: e.target.value } })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Endereço - CEP</label>
                    <input
                        type="text"
                        className="form-control"
                        value={emitente.endereco.cep}
                        onChange={(e) => setEmitente({ ...emitente, endereco: { ...emitente.endereco, cep: e.target.value } })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Telefone</label>
                    <input
                        type="text"
                        className="form-control"
                        value={emitente.telefone}
                        onChange={(e) => setEmitente({ ...emitente, telefone: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Inscrição Estadual</label>
                    <input
                        type="text"
                        className="form-control"
                        value={emitente.inscricaoEstadual}
                        onChange={(e) => setEmitente({ ...emitente, inscricaoEstadual: e.target.value })}
                        required
                    />
                </div>

                <hr />

                <h4>Destinatário</h4>
                <div className="form-group">
                    <label>CPF</label>
                    <input
                        type="text"
                        className="form-control"
                        value={destinatario.CPF}
                        onChange={(e) => setDestinatario({ ...destinatario, CPF: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Nome</label>
                    <input
                        type="text"
                        className="form-control"
                        value={destinatario.nome}
                        onChange={(e) => setDestinatario({ ...destinatario, nome: e.target.value })}
                        required
                    />
                </div>
                {/* Adicione os campos de endereço do destinatário */}
                <div className="form-group">
                    <label>Endereço - Logradouro</label>
                    <input
                        type="text"
                        className="form-control"
                        value={destinatario.endereco.logradouro}
                        onChange={(e) => setDestinatario({ ...destinatario, endereco: { ...destinatario.endereco, logradouro: e.target.value } })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Endereço - Número</label>
                    <input
                        type="text"
                        className="form-control"
                        value={destinatario.endereco.numero}
                        onChange={(e) => setDestinatario({ ...destinatario, endereco: { ...destinatario.endereco, numero: e.target.value } })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Endereço - Bairro</label>
                    <input
                        type="text"
                        className="form-control"
                        value={destinatario.endereco.bairro}
                        onChange={(e) => setDestinatario({ ...destinatario, endereco: { ...destinatario.endereco, bairro: e.target.value } })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Endereço - Código Município</label>
                    <input
                        type="text"
                        className="form-control"
                        value={destinatario.endereco.codigoMunicipio}
                        onChange={(e) => setDestinatario({ ...destinatario, endereco: { ...destinatario.endereco, codigoMunicipio: e.target.value } })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Endereço - Município</label>
                    <input
                        type="text"
                        className="form-control"
                        value={destinatario.endereco.municipio}
                        onChange={(e) => setDestinatario({ ...destinatario, endereco: { ...destinatario.endereco, municipio: e.target.value } })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Endereço - UF</label>
                    <input
                        type="text"
                        className="form-control"
                        value={destinatario.endereco.uf}
                        onChange={(e) => setDestinatario({ ...destinatario, endereco: { ...destinatario.endereco, uf: e.target.value } })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Endereço - CEP</label>
                    <input
                        type="text"
                        className="form-control"
                        value={destinatario.endereco.cep}
                        onChange={(e) => setDestinatario({ ...destinatario, endereco: { ...destinatario.endereco, cep: e.target.value } })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Telefone</label>
                    <input
                        type="text"
                        className="form-control"
                        value={destinatario.telefone}
                        onChange={(e) => setDestinatario({ ...destinatario, telefone: e.target.value })}
                        required
                    />
                </div>

                <hr />

                <h4>Produtos</h4>
                {produtos.map((produto, index) => (
                    <div key={index} className="border p-3 mb-3">
                        <h5>Produto {index + 1}</h5>
                        <div className="form-group">
                            <label>Código</label>
                            <input
                                type="text"
                                className="form-control"
                                value={produto.codigo}
                                onChange={(e) => atualizarProduto(index, 'codigo', e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Descrição</label>
                            <input
                                type="text"
                                className="form-control"
                                value={produto.descricao}
                                onChange={(e) => atualizarProduto(index, 'descricao', e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>NCM</label>
                            <input
                                type="text"
                                className="form-control"
                                value={produto.ncm}
                                onChange={(e) => atualizarProduto(index, 'ncm', e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>CFOP</label>
                            <input
                                type="text"
                                className="form-control"
                                value={produto.cfop}
                                onChange={(e) => atualizarProduto(index, 'cfop', e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Unidade</label>
                            <input
                                type="text"
                                className="form-control"
                                value={produto.unidade}
                                onChange={(e) => atualizarProduto(index, 'unidade', e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Quantidade</label>
                            <input
                                type="number"
                                step="0.01"
                                className="form-control"
                                value={produto.quantidade}
                                onChange={(e) => atualizarProduto(index, 'quantidade', parseFloat(e.target.value))}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Valor Unitário (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="form-control"
                                value={produto.valorUnitario}
                                onChange={(e) => atualizarProduto(index, 'valorUnitario', parseFloat(e.target.value))}
                                required
                            />
                        </div>
                        {produtos.length > 1 && (
                            <button type="button" className="btn btn-danger mt-2" onClick={() => removerProduto(index)}>
                                Remover Produto
                            </button>
                        )}
                    </div>
                ))}
                <button type="button" className="btn btn-secondary mb-3" onClick={adicionarProduto}>
                    + Adicionar Produto
                </button>

                <hr />

                <div className="form-group">
                    <label>Informações Adicionais</label>
                    <textarea
                        className="form-control"
                        value={informacoesAdicionais}
                        onChange={(e) => setInformacoesAdicionais(e.target.value)}
                        rows="3"
                    ></textarea>
                </div>

                <div className="form-group">
                    <label>Certificado Digital (.pem ou .key)</label>
                    <input
                        type="file"
                        className="form-control-file"
                        accept=".pem,.key"
                        onChange={(e) => setCertificado(e.target.files[0])}
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Gerando Nota Fiscal...' : 'Gerar Nota Fiscal'}
                </button>
            </form>
        </div>
    );
};

export default GerarNotaFiscal;
