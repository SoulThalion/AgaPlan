import type { Turno, Lugar } from '../../types';

interface DebugInfoProps {
  lugares: Lugar[];
  turnos: Turno[];
  getTurnoEstado: (turno: Turno) => string;
}

export default function DebugInfo({
  lugares,
  turnos,
  getTurnoEstado
}: DebugInfoProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Debug: Información del Sistema
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Lugares ({lugares.length})</h4>
          <div className="space-y-2">
            {lugares.map(lugar => (
              <div key={lugar.id} className="text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <strong>{lugar.nombre}</strong> - Capacidad: {lugar.capacidad || 'No definida'} - Activo: {lugar.activo ? 'Sí' : 'No'}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Turnos ({turnos.length})</h4>
          <div className="space-y-2">
            {turnos.slice(0, 5).map(turno => (
              <div key={turno.id} className="text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <strong>Turno {turno.id}</strong> - Lugar: {turno.lugar?.nombre || 'Sin lugar'} - Capacidad: {turno.lugar?.capacidad || 'No definida'} - Estado: {getTurnoEstado(turno)}
              </div>
            ))}
            {turnos.length > 5 && (
              <div className="text-sm text-gray-500">... y {turnos.length - 5} más</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
