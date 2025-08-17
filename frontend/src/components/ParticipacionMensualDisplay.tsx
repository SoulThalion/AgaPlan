import React from 'react';
import { useParticipacionMensualActual } from '../hooks/useParticipacionMensual';

interface ParticipacionMensualDisplayProps {
  userId: number;
  participacionMensual?: number | null;
  className?: string;
  showDetails?: boolean;
}

const ParticipacionMensualDisplay: React.FC<ParticipacionMensualDisplayProps> = ({
  userId,
  participacionMensual,
  className = '',
  showDetails = false
}) => {
  const { data: participacionActual, isLoading, error } = useParticipacionMensualActual(userId);

  // Si no hay límite de participación mensual, no mostrar nada
  if (participacionMensual === null || participacionMensual === undefined) {
    return null;
  }

  // Si está cargando, mostrar un placeholder
  if (isLoading) {
    return (
      <div className={`text-xs text-gray-400 ${className}`}>
        Cargando...
      </div>
    );
  }

  // Si hay error, mostrar solo el límite
  if (error || !participacionActual) {
    return (
      <div className={`text-xs font-medium ${className}`}>
        {participacionMensual} turnos/mes
      </div>
    );
  }

  const { turnosOcupados, limiteMensual, porcentaje } = participacionActual;
  const turnosRestantes = (limiteMensual || 0) - turnosOcupados;

  // Determinar el color basado en el estado
  const getColorClasses = () => {
    if (turnosOcupados >= limiteMensual) {
      return 'text-red-600 dark:text-red-400'; // Límite alcanzado
    } else if (turnosOcupados >= (limiteMensual * 0.8)) {
      return 'text-orange-600 dark:text-orange-400'; // Cerca del límite
    } else {
      return 'text-green-600 dark:text-green-400'; // Disponible
    }
  };

  return (
    <div className={`text-xs font-medium ${getColorClasses()} ${className}`}>
      {showDetails ? (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span>{turnosOcupados}/{limiteMensual} turnos/mes</span>
            {porcentaje !== null && (
              <span className="text-xs opacity-75">({porcentaje}%)</span>
            )}
          </div>
          {turnosRestantes > 0 && (
            <div className="text-xs opacity-75">
              {turnosRestantes} restantes
            </div>
          )}
          {turnosRestantes <= 0 && (
            <div className="text-xs font-semibold">
              Límite alcanzado
            </div>
          )}
        </div>
      ) : (
        <span>{turnosOcupados}/{limiteMensual} turnos/mes</span>
      )}
    </div>
  );
};

export default ParticipacionMensualDisplay;
