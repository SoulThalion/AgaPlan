import React from 'react';
import { useEquipo } from '../contexts/EquipoContext';
import { useAuth } from '../contexts/AuthContext';

const EquipoSelector: React.FC = () => {
  const { equipos, currentEquipo, setCurrentEquipo } = useEquipo();
  const { isSuperAdmin } = useAuth();

  // Debug: mostrar información en consola
  console.log('EquipoSelector - equipos:', equipos);
  console.log('EquipoSelector - currentEquipo:', currentEquipo);

  // Solo mostrar el selector si es superAdmin y hay equipos disponibles
  if (!isSuperAdmin || equipos.length <= 1) {
    return null;
  }

  const handleEquipoChange = (equipoId: number) => {
    console.log('EquipoSelector - handleEquipoChange called with equipoId:', equipoId);
    const equipo = equipos.find(e => e.id === equipoId);
    console.log('EquipoSelector - found equipo:', equipo);
    if (equipo) {
      console.log('EquipoSelector - calling setCurrentEquipo with:', equipo);
      setCurrentEquipo(equipo);
    }
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
        Equipo Actual
      </label>
      <select
        value={currentEquipo?.id || ''}
        onChange={(e) => handleEquipoChange(parseInt(e.target.value))}
        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
      >
        {equipos.map((equipo) => (
          <option key={equipo.id} value={equipo.id}>
            {equipo.nombre}
          </option>
        ))}
      </select>
    </div>
  );
};

export default EquipoSelector;
