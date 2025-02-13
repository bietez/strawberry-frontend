import React from 'react';
import { Rnd } from 'react-rnd';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import api from '../../services/api';

const EnvironmentBoard = ({ ambiente, tables, refreshTables, movementLocked, onTableClick }) => {
  
  const handleDropTable = async (tableId, newX, newY, newWidth, newHeight) => {
    if (movementLocked) {
      toast.warn('Movimentação bloqueada.');
      return;
    } 

    const table = tables.find((t) => t._id === tableId);
    if (!table) return;

    try {
      await api.put(
        `/tables/${tableId}`,
        {
          posicao: {
            pos_x: newX,
            pos_y: newY,
            width: newWidth,
            height: newHeight,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      toast.success('Posição da mesa atualizada!');
      refreshTables();
    } catch (err) {
      console.error('Erro ao atualizar posição da mesa:', err);
      toast.error('Erro ao atualizar posição da mesa.');
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '800px',
        border: '2px solid #ddd',
        backgroundColor: '#f0f0f0',
        overflow: 'auto',
        backgroundImage:
          'linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px), ' +
          'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      }}
    >
      {tables.map((table) => (
        <Rnd
          key={table._id}
          size={{ width: table.posicao.width, height: table.posicao.height }}
          position={{ x: table.posicao.pos_x, y: table.posicao.pos_y }}
          disableDragging={movementLocked}
          enableResizing={table.formato === 'circular' ? { right: true } : (!movementLocked)}
          lockAspectRatio={table.formato === 'circular'}
          onDragStop={(e, d) => handleDropTable(table._id, d.x, d.y, table.posicao.width, table.posicao.height)}
          onResizeStop={(e, direction, ref, delta, position) => {
            handleDropTable(table._id, position.x, position.y, ref.offsetWidth, ref.offsetHeight);
          }}
          bounds="parent"
          minWidth={table.formato === 'circular' ? 60 : 100}
          minHeight={table.formato === 'circular' ? 60 : 100}
          maxWidth={300}
          maxHeight={300}
          style={{
            border: '1px solid #ccc',
            borderRadius: table.formato === 'circular' ? '50%' : '8px',
            backgroundColor: '#fefefe',
            boxShadow: '3px 3px 10px rgba(0,0,0,0.1)',
            cursor: movementLocked ? 'not-allowed' : 'move',
            zIndex: 1000,
            transition: 'box-shadow 0.2s ease',
          }}
        >
          <div
            onClick={() => onTableClick(table)}
            style={{ width: '100%', height: '100%', padding: '10px', cursor: movementLocked ? 'not-allowed' : 'pointer' }}
          >
            <strong>Mesa {table.numeroMesa}</strong>
            <div>Status: {table.status}</div>
            <div>Capacidade: {table.capacidade}</div>
            {table.status === 'ocupada' && table.occupiedSince && (
              <div>
                <FontAwesomeIcon icon={faInfoCircle} /> Ocupada desde: {new Date(table.occupiedSince).toLocaleTimeString()}
              </div>
            )}
          </div>
        </Rnd>
      ))}
    </div>
  );
};

EnvironmentBoard.propTypes = {
  ambiente: PropTypes.object.isRequired,
  tables: PropTypes.array.isRequired,
  refreshTables: PropTypes.func.isRequired,
  movementLocked: PropTypes.bool.isRequired,
  onTableClick: PropTypes.func.isRequired,
};

export default EnvironmentBoard;
