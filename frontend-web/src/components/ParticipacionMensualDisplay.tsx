import React from 'react';
import { useParticipacionMensualActual } from '../hooks/useParticipacionMensual';

interface ParticipacionMensualDisplayProps {
  userId: number;
  participacionMensual?: number | null;
  className?: string;
  showDetails?: boolean;
  mes?: number;
  año?: number;
}

const ParticipacionMensualDisplay: React.FC<ParticipacionMensualDisplayProps> = ({
  userId,
  participacionMensual,
  className = '',
  showDetails = false,
  mes,
  año
}) => {
  const { data: participacionActual, isLoading, error } = useParticipacionMensualActual(userId, mes, año);

  // Si no hay límite de participación mensual, solo mostrar el contador
  if (participacionMensual === null || participacionMensual === undefined) {
    // Si está cargando, mostrar un placeholder
    if (isLoading) {
      return (
        <div className={`text-xs text-gray-400 ${className}`}>
          Cargando...
        </div>
      );
    }

    // Si hay error, mostrar solo el contador si está disponible
    if (error || !participacionActual) {
      return (
        <div className={`text-xs font-medium text-gray-600 dark:text-gray-400 ${className}`}>
          -- turnos asignados
        </div>
      );
    }

    // Mostrar solo el contador para usuarios sin límite
    return (
      <div className={`text-xs font-medium text-gray-600 dark:text-gray-400 ${className}`}>
        {participacionActual.turnosOcupados} turnos asignados
      </div>
    );
  }

  // Si está cargando, mostrar un placeholder
  if (isLoading) {
    return (
      <div className={`text-xs text-gray-400 ${className}`}>
        Cargando...
      </div>
    );
  }

  // Si hay error, mostrar el límite y un contador por defecto
  if (error || !participacionActual) {
    return (
      <div className={`text-xs font-medium ${className}`}>
        0/{participacionMensual} turnos/mes
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
