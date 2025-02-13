// src/pages/NotasFiscais/NfeEmiter.js

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import api from '../../services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Lista de NCMs para exemplo
const NCM_OPTIONS = [
  {
    value: "21069090",
    label: "21069090 - Preparações alimentícias diversas (ex: pizzas, refeições, etc.)"
  },
  {
    value: "22021000",
    label: "22021000 - Refrigerantes e Águas"
  },
  {
    value: "20089900",
    label: "20089900 - Sucos"
  },
  {
    value: "18069000",
    label: "18069000 - Bombons e Chocolates"
  },
  {
    value: "21069050",
    label: "21069050 - Gomas de mascar, chicletes"
  },
  {
    value: "22030000",
    label: "22030000 - Cervejas"
  },
  {
    value: "21069060",
    label: "21069060 - Balas, confeitos sem açúcar"
  },
  {
    value: "04022110",
    label: "04022110 - Leites e laticínios"
  },
  {
    value: "21069029",
    label: "21069029 - Outras preparações alimentícias diversas"
  }
];

const NfeEmiter = () => {
  // 1) React Hook Form
  const { register, control, handleSubmit, reset, getValues, formState: { errors } } = useForm({
    defaultValues: {
      ide: {
        cUF: "52", // GO
        cNF: "",
        natOp: "Venda de produtos alimentícios",
        mod: "55",
        serie: "1",
        nNF: "",
        dhEmi: new Date().toISOString(),
        dhSaiEnt: new Date().toISOString(),
        tpNF: "1", // 1=Saída
        idDest: "1",
        cMunFG: "5208707", // ibge de Goiânia
        tpImp: "1",
        tpEmis: "1",
        cDV: "",
        tpAmb: "2", // 2=Homologação
        finNFe: "1",
        indFinal: "1",
        indPres: "1",
        procEmi: "0",
        verProc: "1.0.0",
      },
      emit: {
        CNPJ: "",
        xNome: "",
        xFant: "",
        enderEmit: {
          xLgr: "",
          nro: "",
          xBairro: "",
          cMun: "",
          xMun: "Goiânia",
          UF: "GO",
          CEP: "",
          cPais: "1058",
          xPais: "Brasil",
          fone: "",
        },
        IE: "",
        CRT: "1",
      },
      dest: {
        CNPJ: "",
        CPF: "",
        xNome: "",
        enderDest: {
          xLgr: "",
          nro: "",
          xBairro: "",
          cMun: "",
          xMun: "",
          UF: "",
          CEP: "",
          cPais: "1058",
          xPais: "Brasil",
          fone: "",
        },
      },
      produtos: [
        {
          cProd: "",
          xProd: "",
          NCM: "",
          CFOP: "5.102",
          uCom: "",
          qCom: 0.00,
          vUnCom: 0.00,
          indTot: "1",
          imposto: {
            ICMS: {
              ICMS00: {
                orig: "0",
                CST: "00",
                modBC: "3",
                vBC: "0.00",
                pICMS: "18.00",
                vICMS: "0.00",
              }
            },
            PIS: {
              PISAliq: {
                CST: "01",
                vBC: "0.00",
                pPIS: "1.65",
                vPIS: "0.00",
              }
            },
            COFINS: {
              COFINSAliq: {
                CST: "01",
                vBC: "0.00",
                pCOFINS: "7.60",
                vCOFINS: "0.00",
              }
            },
          },
        }
      ],
      total: {
        ICMSTot: {
          vBC: "0.00",
          vICMS: "0.00",
          vPIS: "0.00",
          vCOFINS: "0.00",
          vProd: "0.00",
          vNF: "0.00",
        }
      },
      transp: {
        modFrete: "0",
      },
      infAdic: {
        infCpl: "Operação sujeita à tributação de alimentos preparados.",
      },
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'produtos'
  });

  // 2) State loading
  const [loading, setLoading] = useState(false);

  // 3) Buscar config e popular emit
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await api.get('/config');
        const cfg = response.data;
        const currentValues = getValues();

        const newValues = {
          ...currentValues,
          emit: {
            ...currentValues.emit,
            CNPJ: cfg.cnpj || "",
            xNome: cfg.razaoSocial || "",
            xFant: cfg.nomeFantasia || "",
            IE: cfg.ie || "",
            enderEmit: {
              ...currentValues.emit.enderEmit,
              xLgr: cfg.logradouro || "",
              nro: cfg.numero || "",
              xBairro: cfg.bairro || "",
              xMun: cfg.cidade || "",
              UF: cfg.uf || "",
              CEP: cfg.cep || "",
              fone: cfg.telefone || "",
            }
          }
        };
        reset(newValues);
      } catch (error) {
        console.error('Erro ao buscar config:', error);
      }
    };
    fetchConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset, getValues]);

  // 4) Funções Aux
  const gerarCodigoRandomico = (length) => {
    let codigo = '';
    for (let i = 0; i < length; i++) {
      codigo += Math.floor(Math.random() * 10);
    }
    return codigo;
  };

  const calcularDigitoVerificador = (chave) => {
    let soma = 0;
    let peso = 2;

    for (let i = chave.length - 1; i >= 0; i--) {
      soma += parseInt(chave[i], 10) * peso;
      peso = peso === 9 ? 2 : peso + 1;
    }

    const resto = soma % 11;
    const dv = resto < 2 ? 0 : 11 - resto;
    return dv.toString();
  };

  // 5) onSubmit
  const onSubmit = async (data) => {
    if (!data.ide.cNF) {
      data.ide.cNF = gerarCodigoRandomico(8);
    }
    const chaveSemDV = `${data.ide.cUF}${data.ide.dhEmi.slice(2, 4)}${data.ide.dhEmi.slice(5,7)}${data.emit.CNPJ}${data.ide.mod}${data.ide.serie}${data.ide.nNF.toString().padStart(9, '0')}${data.ide.tpEmis}${data.ide.cNF}`;
    data.ide.cDV = calcularDigitoVerificador(chaveSemDV);

    // Calcula totais
    const totalProd = data.produtos.reduce((acc, p) => {
      return acc + (parseFloat(p.qCom) * parseFloat(p.vUnCom));
    }, 0).toFixed(2);

    const totalICMS = data.produtos.reduce((acc, p) => {
      return acc + (parseFloat(p.qCom) * parseFloat(p.vUnCom) * 0.18);
    }, 0).toFixed(2);

    const totalPIS = data.produtos.reduce((acc, p) => {
      return acc + (parseFloat(p.qCom) * parseFloat(p.vUnCom) * 0.0165);
    }, 0).toFixed(2);

    const totalCOFINS = data.produtos.reduce((acc, p) => {
      return acc + (parseFloat(p.qCom) * parseFloat(p.vUnCom) * 0.076);
    }, 0).toFixed(2);

    data.total.ICMSTot.vBC = totalProd;
    data.total.ICMSTot.vICMS = totalICMS;
    data.total.ICMSTot.vPIS = totalPIS;
    data.total.ICMSTot.vCOFINS = totalCOFINS;
    data.total.ICMSTot.vProd = totalProd;
    data.total.ICMSTot.vNF = totalProd;

    setLoading(true);
    try {
      const response = await api.post('/nfe/emitir', data);
      toast.success(response.data.message || 'NF-e gerada com sucesso!');

      if (response.data.pdfPath) {
        const backendURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
        const pdfURL = `${backendURL}${response.data.pdfPath}`;
        window.open(pdfURL, '_blank');
      }

      // resetar form
      reset();
    } catch (error) {
      console.error('Erro ao gerar NF-e:', error);
      toast.error(error.response?.data?.message || 'Erro ao gerar NF-e.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Gerar Nota Fiscal Eletrônica (NF-e)</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* IDENTIFICAÇÃO */}
        <h4>Identificação</h4>
        <div className="row">
          <div className="mb-3 col-md-2">
            <label>Código da UF</label>
            <input
              type="text"
              className={`form-control ${errors.ide?.cUF ? 'is-invalid' : ''}`}
              {...register('ide.cUF', { required: 'Código da UF é obrigatório' })}
              placeholder="Ex: 52 (GO)"
            />
            {errors.ide?.cUF && <div className="invalid-feedback">{errors.ide.cUF.message}</div>}
          </div>
          <div className="mb-3 col-md-2">
            <label>Código NF</label>
            <input
              type="text"
              className={`form-control ${errors.ide?.cNF ? 'is-invalid' : ''}`}
              {...register('ide.cNF', { required: 'Código NF é obrigatório' })}
              placeholder="Ex: 12345678"
            />
            {errors.ide?.cNF && <div className="invalid-feedback">{errors.ide.cNF.message}</div>}
          </div>
          <div className="mb-3 col-md-4">
            <label>Natureza da Operação</label>
            <input
              type="text"
              className={`form-control ${errors.ide?.natOp ? 'is-invalid' : ''}`}
              {...register('ide.natOp', { required: 'Natureza da Operação é obrigatória' })}
              placeholder="Ex: Venda de produtos alimentícios"
            />
            {errors.ide?.natOp && <div className="invalid-feedback">{errors.ide.natOp.message}</div>}
          </div>
          <div className="mb-3 col-md-2">
            <label>Modelo</label>
            <input
              type="text"
              className={`form-control ${errors.ide?.mod ? 'is-invalid' : ''}`}
              {...register('ide.mod', { required: 'Modelo é obrigatório' })}
              placeholder="Ex: 55"
            />
            {errors.ide?.mod && <div className="invalid-feedback">{errors.ide.mod.message}</div>}
          </div>
          <div className="mb-3 col-md-2">
            <label>Série</label>
            <input
              type="text"
              className={`form-control ${errors.ide?.serie ? 'is-invalid' : ''}`}
              {...register('ide.serie', { required: 'Série é obrigatória' })}
              placeholder="Ex: 1"
            />
            {errors.ide?.serie && <div className="invalid-feedback">{errors.ide.serie.message}</div>}
          </div>
        </div>
        <div className="row">
          <div className="mb-3 col-md-2">
            <label>Número NF</label>
            <input
              type="number"
              className={`form-control ${errors.ide?.nNF ? 'is-invalid' : ''}`}
              {...register('ide.nNF', { required: 'Número NF é obrigatório' })}
              placeholder="Ex: 12345"
            />
            {errors.ide?.nNF && <div className="invalid-feedback">{errors.ide.nNF.message}</div>}
          </div>
          <div className="mb-3 col-md-4">
            <label>Data de Emissão</label>
            <input
              type="datetime-local"
              className={`form-control ${errors.ide?.dhEmi ? 'is-invalid' : ''}`}
              {...register('ide.dhEmi', { required: 'Data de Emissão é obrigatória' })}
            />
            {errors.ide?.dhEmi && <div className="invalid-feedback">{errors.ide.dhEmi.message}</div>}
          </div>
          <div className="mb-3 col-md-4">
            <label>Data de Saída/Entrada</label>
            <input
              type="datetime-local"
              className={`form-control ${errors.ide?.dhSaiEnt ? 'is-invalid' : ''}`}
              {...register('ide.dhSaiEnt', { required: 'Data de Saída/Entrada é obrigatória' })}
            />
            {errors.ide?.dhSaiEnt && <div className="invalid-feedback">{errors.ide.dhSaiEnt.message}</div>}
          </div>
          <div className="mb-3 col-md-2">
            <label>Tipo NF</label>
            <select
              className={`form-select ${errors.ide?.tpNF ? 'is-invalid' : ''}`}
              {...register('ide.tpNF', { required: 'Tipo NF é obrigatório' })}
            >
              <option value="">Selecione</option>
              <option value="1">Saída</option>
              <option value="0">Entrada</option>
            </select>
            {errors.ide?.tpNF && <div className="invalid-feedback">{errors.ide.tpNF.message}</div>}
          </div>
        </div>

        {/* EMITENTE */}
        <h4>Emitente</h4>
        <div className="row">
          <div className="mb-3 col-md-4">
            <label>CNPJ</label>
            <input
              type="text"
              className={`form-control ${errors.emit?.CNPJ ? 'is-invalid' : ''}`}
              {...register('emit.CNPJ', { required: 'CNPJ é obrigatório' })}
              placeholder="Ex: 12345678000195"
            />
            {errors.emit?.CNPJ && <div className="invalid-feedback">{errors.emit.CNPJ.message}</div>}
          </div>
          <div className="mb-3 col-md-4">
            <label>Nome (Razão Social)</label>
            <input
              type="text"
              className={`form-control ${errors.emit?.xNome ? 'is-invalid' : ''}`}
              {...register('emit.xNome', { required: 'Nome é obrigatório' })}
              placeholder="Nome da Empresa"
            />
            {errors.emit?.xNome && <div className="invalid-feedback">{errors.emit.xNome.message}</div>}
          </div>
          <div className="mb-3 col-md-4">
            <label>Nome Fantasia</label>
            <input
              type="text"
              className={`form-control ${errors.emit?.xFant ? 'is-invalid' : ''}`}
              {...register('emit.xFant', { required: 'Nome Fantasia é obrigatório' })}
              placeholder="Nome Fantasia"
            />
            {errors.emit?.xFant && <div className="invalid-feedback">{errors.emit.xFant.message}</div>}
          </div>
        </div>
        {/* Endereço Emitente */}
        <div className="row">
          <div className="mb-3 col-md-4">
            <label>Logradouro</label>
            <input
              type="text"
              className={`form-control ${errors.emit?.enderEmit?.xLgr ? 'is-invalid' : ''}`}
              {...register('emit.enderEmit.xLgr', { required: 'Logradouro é obrigatório' })}
              placeholder="Rua, Avenida, etc."
            />
            {errors.emit?.enderEmit?.xLgr && <div className="invalid-feedback">{errors.emit.enderEmit.xLgr.message}</div>}
          </div>
          <div className="mb-3 col-md-2">
            <label>Número</label>
            <input
              type="text"
              className={`form-control ${errors.emit?.enderEmit?.nro ? 'is-invalid' : ''}`}
              {...register('emit.enderEmit.nro', { required: 'Número é obrigatório' })}
              placeholder="Ex: 100"
            />
            {errors.emit?.enderEmit?.nro && <div className="invalid-feedback">{errors.emit.enderEmit.nro.message}</div>}
          </div>
          <div className="mb-3 col-md-3">
            <label>Bairro</label>
            <input
              type="text"
              className={`form-control ${errors.emit?.enderEmit?.xBairro ? 'is-invalid' : ''}`}
              {...register('emit.enderEmit.xBairro', { required: 'Bairro é obrigatório' })}
              placeholder="Bairro"
            />
            {errors.emit?.enderEmit?.xBairro && <div className="invalid-feedback">{errors.emit.enderEmit.xBairro.message}</div>}
          </div>
          <div className="mb-3 col-md-3">
            <label>Código Município</label>
            <input
              type="text"
              className={`form-control ${errors.emit?.enderEmit?.cMun ? 'is-invalid' : ''}`}
              {...register('emit.enderEmit.cMun', { required: 'Código do Município é obrigatório' })}
              placeholder="Ex: 5208707"
            />
            {errors.emit?.enderEmit?.cMun && <div className="invalid-feedback">{errors.emit.enderEmit.cMun.message}</div>}
          </div>
        </div>
        <div className="row">
          <div className="mb-3 col-md-2">
            <label>UF</label>
            <input
              type="text"
              className={`form-control ${errors.emit?.enderEmit?.UF ? 'is-invalid' : ''}`}
              {...register('emit.enderEmit.UF', { required: 'UF é obrigatório' })}
              placeholder="Ex: GO"
            />
            {errors.emit?.enderEmit?.UF && <div className="invalid-feedback">{errors.emit.enderEmit.UF.message}</div>}
          </div>
          <div className="mb-3 col-md-2">
            <label>CEP</label>
            <input
              type="text"
              className={`form-control ${errors.emit?.enderEmit?.CEP ? 'is-invalid' : ''}`}
              {...register('emit.enderEmit.CEP', { required: 'CEP é obrigatório' })}
              placeholder="Ex: 74000000"
            />
            {errors.emit?.enderEmit?.CEP && <div className="invalid-feedback">{errors.emit.enderEmit.CEP.message}</div>}
          </div>
          <div className="mb-3 col-md-3">
            <label>Telefone</label>
            <input
              type="text"
              className={`form-control ${errors.emit?.enderEmit?.fone ? 'is-invalid' : ''}`}
              {...register('emit.enderEmit.fone', { required: 'Telefone é obrigatório' })}
              placeholder="Ex: 61999999999"
            />
            {errors.emit?.enderEmit?.fone && <div className="invalid-feedback">{errors.emit.enderEmit.fone.message}</div>}
          </div>
          <div className="mb-3 col-md-3">
            <label>Inscrição Estadual (IE)</label>
            <input
              type="text"
              className={`form-control ${errors.emit?.IE ? 'is-invalid' : ''}`}
              {...register('emit.IE', { required: 'Inscrição Estadual é obrigatória' })}
              placeholder="Ex: 123456789"
            />
            {errors.emit?.IE && <div className="invalid-feedback">{errors.emit.IE.message}</div>}
          </div>
          <div className="mb-3 col-md-2">
            <label>CRT</label>
            <select
              className={`form-select ${errors.emit?.CRT ? 'is-invalid' : ''}`}
              {...register('emit.CRT', { required: 'CRT é obrigatório' })}
            >
              <option value="">Selecione</option>
              <option value="1">Simples Nacional</option>
              <option value="2">Simples Nacional - Excesso</option>
              <option value="3">Regime Normal</option>
            </select>
            {errors.emit?.CRT && <div className="invalid-feedback">{errors.emit.CRT.message}</div>}
          </div>
        </div>

        {/* DESTINATÁRIO */}
        <h4>Destinatário</h4>
        <div className="row">
          <div className="mb-3 col-md-4">
            <label>CPF</label>
            <input
              type="text"
              className={`form-control ${errors.dest?.CPF ? 'is-invalid' : ''}`}
              {...register('dest.CPF', {
                // custom validate: se CPF for vazio, verifique se CNPJ também está vazio
                validate: (value) => {
                  const cnpj = getValues('dest.CNPJ');
                  // se CPF e CNPJ vazios => erro
                  if (!value && !cnpj) {
                    return "Informe CPF ou CNPJ";
                  }
                  return true;
                }
              })}
              placeholder="Ex: 123.456.789-00"
            />
            {errors.dest?.CPF && <div className="invalid-feedback">{errors.dest.CPF.message}</div>}
          </div>
          <div className="mb-3 col-md-4">
            <label>CNPJ</label>
            <input
              type="text"
              className={`form-control ${errors.dest?.CNPJ ? 'is-invalid' : ''}`}
              {...register('dest.CNPJ', {
                validate: (value) => {
                  const cpf = getValues('dest.CPF');
                  if (!value && !cpf) {
                    return "Informe CPF ou CNPJ";
                  }
                  return true;
                }
              })}
              placeholder="Ex: 12345678000195"
            />
            {errors.dest?.CNPJ && <div className="invalid-feedback">{errors.dest.CNPJ.message}</div>}
          </div>
          <div className="mb-3 col-md-4">
            <label>Nome</label>
            <input
              type="text"
              className={`form-control ${errors.dest?.xNome ? 'is-invalid' : ''}`}
              {...register('dest.xNome', { required: 'Nome do Destinatário é obrigatório' })}
              placeholder="Nome do Destinatário"
            />
            {errors.dest?.xNome && <div className="invalid-feedback">{errors.dest.xNome.message}</div>}
          </div>
        </div>
        {/* Endereço Destinatário */}
        <div className="row">
          <div className="mb-3 col-md-4">
            <label>Logradouro</label>
            <input
              type="text"
              className={`form-control ${errors.dest?.enderDest?.xLgr ? 'is-invalid' : ''}`}
              {...register('dest.enderDest.xLgr', { required: 'Logradouro é obrigatório' })}
              placeholder="Rua, Avenida, etc."
            />
            {errors.dest?.enderDest?.xLgr && <div className="invalid-feedback">{errors.dest.enderDest.xLgr.message}</div>}
          </div>
          <div className="mb-3 col-md-2">
            <label>Número</label>
            <input
              type="text"
              className={`form-control ${errors.dest?.enderDest?.nro ? 'is-invalid' : ''}`}
              {...register('dest.enderDest.nro', { required: 'Número é obrigatório' })}
              placeholder="Ex: 200"
            />
            {errors.dest?.enderDest?.nro && <div className="invalid-feedback">{errors.dest.enderDest.nro.message}</div>}
          </div>
          <div className="mb-3 col-md-3">
            <label>Bairro</label>
            <input
              type="text"
              className={`form-control ${errors.dest?.enderDest?.xBairro ? 'is-invalid' : ''}`}
              {...register('dest.enderDest.xBairro', { required: 'Bairro é obrigatório' })}
              placeholder="Bairro"
            />
            {errors.dest?.enderDest?.xBairro && <div className="invalid-feedback">{errors.dest.enderDest.xBairro.message}</div>}
          </div>
          <div className="mb-3 col-md-3">
            <label>Código Município</label>
            <input
              type="text"
              className={`form-control ${errors.dest?.enderDest?.cMun ? 'is-invalid' : ''}`}
              {...register('dest.enderDest.cMun', { required: 'Código do Município é obrigatório' })}
              placeholder="Ex: 5208707"
            />
            {errors.dest?.enderDest?.cMun && <div className="invalid-feedback">{errors.dest.enderDest.cMun.message}</div>}
          </div>
        </div>
        <div className="row">
          <div className="mb-3 col-md-2">
            <label>UF</label>
            <input
              type="text"
              className={`form-control ${errors.dest?.enderDest?.UF ? 'is-invalid' : ''}`}
              {...register('dest.enderDest.UF', { required: 'UF é obrigatório' })}
              placeholder="Ex: GO"
            />
            {errors.dest?.enderDest?.UF && <div className="invalid-feedback">{errors.dest.enderDest.UF.message}</div>}
          </div>
          <div className="mb-3 col-md-2">
            <label>CEP</label>
            <input
              type="text"
              className={`form-control ${errors.dest?.enderDest?.CEP ? 'is-invalid' : ''}`}
              {...register('dest.enderDest.CEP', { required: 'CEP é obrigatório' })}
              placeholder="Ex: 74000000"
            />
            {errors.dest?.enderDest?.CEP && <div className="invalid-feedback">{errors.dest.enderDest.CEP.message}</div>}
          </div>
          <div className="mb-3 col-md-3">
            <label>Município</label>
            <input
              type="text"
              className={`form-control ${errors.dest?.enderDest?.xMun ? 'is-invalid' : ''}`}
              {...register('dest.enderDest.xMun', { required: 'Município é obrigatório' })}
              placeholder="Município"
            />
            {errors.dest?.enderDest?.xMun && <div className="invalid-feedback">{errors.dest.enderDest.xMun.message}</div>}
          </div>
          <div className="mb-3 col-md-3">
            <label>Telefone</label>
            <input
              type="text"
              className={`form-control ${errors.dest?.enderDest?.fone ? 'is-invalid' : ''}`}
              {...register('dest.enderDest.fone', { required: 'Telefone é obrigatório' })}
              placeholder="Ex: 61988888888"
            />
            {errors.dest?.enderDest?.fone && <div className="invalid-feedback">{errors.dest.enderDest.fone.message}</div>}
          </div>
        </div>

        {/* PRODUTOS */}
        <h4>Produtos</h4>
        {fields.map((field, index) => (
          <div key={field.id} className="border p-3 mb-3">
            <h5>Produto {index + 1}</h5>
            <div className="row">
              <div className="mb-3 col-md-3">
                <label>Código</label>
                <input
                  type="text"
                  className={`form-control ${errors.produtos?.[index]?.cProd ? 'is-invalid' : ''}`}
                  {...register(`produtos.${index}.cProd`, { required: 'Código do Produto é obrigatório' })}
                  placeholder="Ex: 001"
                />
                {errors.produtos?.[index]?.cProd && <div className="invalid-feedback">{errors.produtos[index].cProd.message}</div>}
              </div>
              <div className="mb-3 col-md-3">
                <label>Descrição</label>
                <input
                  type="text"
                  className={`form-control ${errors.produtos?.[index]?.xProd ? 'is-invalid' : ''}`}
                  {...register(`produtos.${index}.xProd`, { required: 'Descrição do Produto é obrigatória' })}
                  placeholder="Descrição do Produto"
                />
                {errors.produtos?.[index]?.xProd && <div className="invalid-feedback">{errors.produtos[index].xProd.message}</div>}
              </div>
              <div className="mb-3 col-md-2">
                <label>NCM</label>
                <select
                  className={`form-select ${errors.produtos?.[index]?.NCM ? 'is-invalid' : ''}`}
                  {...register(`produtos.${index}.NCM`, { required: 'NCM é obrigatório' })}
                >
                  <option value="">Selecione</option>
                  {NCM_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.produtos?.[index]?.NCM && <div className="invalid-feedback">{errors.produtos[index].NCM.message}</div>}
              </div>
              <div className="mb-3 col-md-2">
                <label>CFOP</label>
                <input
                  type="text"
                  className={`form-control ${errors.produtos?.[index]?.CFOP ? 'is-invalid' : ''}`}
                  {...register(`produtos.${index}.CFOP`)}
                  placeholder="Ex: 5.102"
                />
                {errors.produtos?.[index]?.CFOP && <div className="invalid-feedback">{errors.produtos[index].CFOP.message}</div>}
              </div>
              <div className="mb-3 col-md-2">
                <label>Unidade</label>
                <input
                  type="text"
                  className={`form-control ${errors.produtos?.[index]?.uCom ? 'is-invalid' : ''}`}
                  {...register(`produtos.${index}.uCom`, { required: 'Unidade é obrigatória' })}
                  placeholder="Ex: UN"
                />
                {errors.produtos?.[index]?.uCom && <div className="invalid-feedback">{errors.produtos[index].uCom.message}</div>}
              </div>
            </div>
            <div className="row">
              <div className="mb-3 col-md-2">
                <label>Quantidade</label>
                <input
                  type="number"
                  step="0.01"
                  className={`form-control ${errors.produtos?.[index]?.qCom ? 'is-invalid' : ''}`}
                  {...register(`produtos.${index}.qCom`, { required: 'Quantidade é obrigatória' })}
                  placeholder="Ex: 2.00"
                />
                {errors.produtos?.[index]?.qCom && <div className="invalid-feedback">{errors.produtos[index].qCom.message}</div>}
              </div>
              <div className="mb-3 col-md-2">
                <label>Valor Unitário (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  className={`form-control ${errors.produtos?.[index]?.vUnCom ? 'is-invalid' : ''}`}
                  {...register(`produtos.${index}.vUnCom`, { required: 'Valor Unitário é obrigatório' })}
                  placeholder="Ex: 50.00"
                />
                {errors.produtos?.[index]?.vUnCom && <div className="invalid-feedback">{errors.produtos[index].vUnCom.message}</div>}
              </div>
              <div className="mb-3 col-md-2">
                <label>Valor Produto (R$)</label>
                <input
                  type="text"
                  className="form-control"
                  value={(
                    parseFloat(getValues(`produtos.${index}.qCom`) || 0) *
                    parseFloat(getValues(`produtos.${index}.vUnCom`) || 0)
                  ).toFixed(2)}
                  readOnly
                />
              </div>
            </div>

            {/* Impostos */}
            <h6>Impostos</h6>
            <div className="row">
              <div className="mb-3 col-md-3">
                <label>ICMS CST</label>
                <input
                  type="text"
                  className={`form-control ${errors.produtos?.[index]?.imposto?.ICMS?.ICMS00?.CST ? 'is-invalid' : ''}`}
                  {...register(`produtos.${index}.imposto.ICMS.ICMS00.CST`, { required: 'CST do ICMS é obrigatório' })}
                  placeholder="Ex: 00"
                />
                {errors.produtos?.[index]?.imposto?.ICMS?.ICMS00?.CST && (
                  <div className="invalid-feedback">
                    {errors.produtos[index].imposto.ICMS.ICMS00.CST.message}
                  </div>
                )}
              </div>
              <div className="mb-3 col-md-3">
                <label>ICMS pICMS (%)</label>
                <input
                  type="number"
                  step="0.01"
                  className={`form-control ${errors.produtos?.[index]?.imposto?.ICMS?.ICMS00?.pICMS ? 'is-invalid' : ''}`}
                  {...register(`produtos.${index}.imposto.ICMS.ICMS00.pICMS`, { required: 'Alíquota do ICMS é obrigatória' })}
                  placeholder="Ex: 18.00"
                />
                {errors.produtos?.[index]?.imposto?.ICMS?.ICMS00?.pICMS && (
                  <div className="invalid-feedback">
                    {errors.produtos[index].imposto.ICMS.ICMS00.pICMS.message}
                  </div>
                )}
              </div>
              <div className="mb-3 col-md-3">
                <label>PIS CST</label>
                <input
                  type="text"
                  className={`form-control ${errors.produtos?.[index]?.imposto?.PIS?.PISAliq?.CST ? 'is-invalid' : ''}`}
                  {...register(`produtos.${index}.imposto.PIS.PISAliq.CST`, { required: 'CST do PIS é obrigatório' })}
                  placeholder="Ex: 01"
                />
                {errors.produtos?.[index]?.imposto?.PIS?.PISAliq?.CST && (
                  <div className="invalid-feedback">
                    {errors.produtos[index].imposto.PIS.PISAliq.CST.message}
                  </div>
                )}
              </div>
              <div className="mb-3 col-md-3">
                <label>COFINS CST</label>
                <input
                  type="text"
                  className={`form-control ${errors.produtos?.[index]?.imposto?.COFINS?.COFINSAliq?.CST ? 'is-invalid' : ''}`}
                  {...register(`produtos.${index}.imposto.COFINS.COFINSAliq.CST`, { required: 'CST do COFINS é obrigatório' })}
                  placeholder="Ex: 01"
                />
                {errors.produtos?.[index]?.imposto?.COFINS?.COFINSAliq?.CST && (
                  <div className="invalid-feedback">
                    {errors.produtos[index].imposto.COFINS.COFINSAliq.CST.message}
                  </div>
                )}
              </div>
            </div>

            {/* Botão remover produto */}
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => remove(index)}
              disabled={fields.length === 1}
            >
              Remover Produto
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-secondary mb-3"
          onClick={() => append({
            cProd: "",
            xProd: "",
            NCM: "",
            CFOP: "5.102",
            uCom: "",
            qCom: 0.00,
            vUnCom: 0.00,
            indTot: "1",
            imposto: {
              ICMS: {
                ICMS00: {
                  orig: "0",
                  CST: "00",
                  modBC: "3",
                  vBC: "0.00",
                  pICMS: "18.00",
                  vICMS: "0.00",
                }
              },
              PIS: {
                PISAliq: {
                  CST: "01",
                  vBC: "0.00",
                  pPIS: "1.65",
                  vPIS: "0.00",
                }
              },
              COFINS: {
                COFINSAliq: {
                  CST: "01",
                  vBC: "0.00",
                  pCOFINS: "7.60",
                  vCOFINS: "0.00",
                }
              },
            },
          })}
        >
          + Adicionar Produto
        </button>

        {/* TOTAL */}
        <h4>Total</h4>
        <div className="row">
          <div className="mb-3 col-md-2">
            <label>vBC</label>
            <input
              type="text"
              className="form-control"
              value={parseFloat(getValues('total.ICMSTot.vBC')).toFixed(2)}
              readOnly
            />
          </div>
          <div className="mb-3 col-md-2">
            <label>vICMS</label>
            <input
              type="text"
              className="form-control"
              value={parseFloat(getValues('total.ICMSTot.vICMS')).toFixed(2)}
              readOnly
            />
          </div>
          <div className="mb-3 col-md-2">
            <label>vPIS</label>
            <input
              type="text"
              className="form-control"
              value={parseFloat(getValues('total.ICMSTot.vPIS')).toFixed(2)}
              readOnly
            />
          </div>
          <div className="mb-3 col-md-2">
            <label>vCOFINS</label>
            <input
              type="text"
              className="form-control"
              value={parseFloat(getValues('total.ICMSTot.vCOFINS')).toFixed(2)}
              readOnly
            />
          </div>
          <div className="mb-3 col-md-2">
            <label>vProd</label>
            <input
              type="text"
              className="form-control"
              value={parseFloat(getValues('total.ICMSTot.vProd')).toFixed(2)}
              readOnly
            />
          </div>
          <div className="mb-3 col-md-2">
            <label>vNF</label>
            <input
              type="text"
              className="form-control"
              value={parseFloat(getValues('total.ICMSTot.vNF')).toFixed(2)}
              readOnly
            />
          </div>
        </div>

        {/* TRANSPORTE */}
        <h4>Transporte</h4>
        <div className="row">
          <div className="mb-3 col-md-2">
            <label>Modalidade do Frete</label>
            <select
              className="form-select"
              {...register('transp.modFrete', { required: 'Modalidade do Frete é obrigatória' })}
            >
              <option value="">Selecione</option>
              <option value="0">Sem frete</option>
              <option value="1">Por conta do emitente</option>
              <option value="2">Por conta do destinatário</option>
              <option value="3">Por conta de terceiros</option>
            </select>
            {errors.transp?.modFrete && <div className="invalid-feedback">{errors.transp.modFrete.message}</div>}
          </div>
        </div>

        {/* INFORMAÇÕES ADICIONAIS */}
        <h4>Informações Adicionais</h4>
        <div className="mb-3">
          <textarea
            className="form-control"
            rows="3"
            {...register('infAdic.infCpl')}
            placeholder="Informações adicionais sobre a operação"
          ></textarea>
        </div>

        {/* BOTÃO DE SUBMIT */}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Gerando NF-e...' : 'Gerar NF-e'}
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default NfeEmiter;
