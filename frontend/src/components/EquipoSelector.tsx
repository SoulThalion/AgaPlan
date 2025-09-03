import React from 'react';
import { useEquipo } from '../contexts/EquipoContext';
import { useAuth } from '../contexts/AuthContext';

const EquipoSelector: React.FC = () => {
  const { equipos, currentEquipo, setCurrentEquipo } = useEquipo();
  const { isSuperAdmin } = useAuth();

  // Solo mostrar el selector si es superAdmin y hay equipos disponibles
  if (!isSuperAdmin || equipos.length <= 1) {
    return null;
  }

  const handleEquipoChange = (equipoId: number) => {
    const equipo = equipos.find(e => e.id === equipoId);
    if (equipo) {
      setCurrentEquipo(equipo);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Equipo Actual
      </label>
      <select
        value={currentEquipo?.id || ''}
        onChange={(e) => handleEquipoChange(parseInt(e.target.value))}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
      >
        {equipos.map((equipo) => (
          <option key={equipo.id} value={equipo.id}>
            {equipo.nombre}
          </option>
        ))}
      </select>
      {currentEquipo?.descripcion && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {currentEquipo.descripcion}
        </p>
      )}
    </div>
  );
};

export default EquipoSelector;
