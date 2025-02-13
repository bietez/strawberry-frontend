import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';

function TableForm() {
  const [ambientes, setAmbientes] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams(); // Se houver id, é edição
  const navigate = useNavigate();

  // Estado inicial do formulário – inclui o novo campo "formato"
  const [formData, setFormData] = useState({
    numeroMesa: '',
    ambienteId: '',
    capacidade: 1,
    positionX: '',
    positionY: '',
    formato: 'quadrada'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ambientesRes = await api.get('/ambientes');
        setAmbientes(ambientesRes.data);

        if (id) {
          const mesaRes = await api.get(`/tables/${id}`);
          const mesa = mesaRes.data;
          setFormData({
            numeroMesa: mesa.numeroMesa || '',
            ambienteId: mesa.ambiente?._id || '',
            capacidade: mesa.capacidade || 1,
            positionX: mesa.position?.x || '',
            positionY: mesa.position?.y || '',
            formato: mesa.formato || 'quadrada'
          });
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados. Por favor, tente novamente mais tarde.');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'capacidade' || name === 'numeroMesa' ? Number(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      numeroMesa: formData.numeroMesa,
      ambienteId: formData.ambienteId,
      capacidade: formData.capacidade,
      formato: formData.formato
    };

    if (formData.positionX || formData.positionY) {
      payload.position = {
        x: formData.positionX,
        y: formData.positionY,
      };
    }

    try {
      if (id) {
        await api.put(`/tables/${id}`, payload);
        alert('Mesa atualizada com sucesso!');
      } else {
        await api.post('/tables', payload);
        alert('Mesa criada com sucesso!');
      }
      navigate('/tables');
    } catch (err) {
      console.error('Erro ao salvar mesa:', err);
      const message = err.response?.data?.message || 'Erro ao salvar mesa.';
      alert(`Erro ao salvar mesa: ${message}`);
    }
  };

  if (loadingData) {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <p>Carregando dados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h2>{id ? 'Editar Mesa' : 'Nova Mesa'}</h2>
      <form onSubmit={handleSubmit}>
        {/* Número da Mesa */}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="numeroMesa">Número da Mesa:</label>
          <input
            type="number"
            id="numeroMesa"
            name="numeroMesa"
            value={formData.numeroMesa}
            onChange={handleChange}
            required
            min="1"
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        {/* Ambiente */}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="ambienteId">Ambiente:</label>
          <select
            id="ambienteId"
            name="ambienteId"
            value={formData.ambienteId}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          >
            <option value="">Selecione um Ambiente</option>
            {ambientes.map((ambiente) => (
              <option key={ambiente._id} value={ambiente._id}>
                {ambiente.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Capacidade */}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="capacidade">Capacidade:</label>
          <input
            type="number"
            id="capacidade"
            name="capacidade"
            value={formData.capacidade}
            onChange={handleChange}
            required
            min="1"
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        {/* Formato da Mesa */}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="formato">Formato:</label>
          <select
            id="formato"
            name="formato"
            value={formData.formato}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          >
            <option value="quadrada">Quadrada</option>
            <option value="circular">Circular</option>
          </select>
        </div>

        {/* Posição X (opcional) */}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="positionX">Posição X (opcional):</label>
          <input
            type="text"
            id="positionX"
            name="positionX"
            value={formData.positionX}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        {/* Posição Y (opcional) */}
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="positionY">Posição Y (opcional):</label>
          <input
            type="text"
            id="positionY"
            name="positionY"
            value={formData.positionY}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        {/* Botões */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button type="submit" style={{ padding: '0.5rem 1rem' }}>
            {id ? 'Atualizar Mesa' : 'Criar Mesa'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/tables')}
            style={{ padding: '0.5rem 1rem' }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default TableForm;
