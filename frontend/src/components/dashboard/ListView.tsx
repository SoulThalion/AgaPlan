import type { Turno } from '../../types';

interface ListViewProps {
  viewAllTurnos: boolean;
  getTurnosToShow: () => Turno[];
  handleTurnoClick: (turno: Turno) => void;
  getEventColor: (lugarId: number) => string;
  getEstadoColor: (estado: string) => string;
  getEstadoText: (estado: string) => string;
  getTurnoEstado: (turno: Turno) => string;
}

export default function ListView({
  viewAllTurnos,
  getTurnosToShow,
  handleTurnoClick,
  getEventColor,
  getEstadoColor,
  getEstadoText,
  getTurnoEstado
}: ListViewProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Encabezado de la lista */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 border-b border-gray-200 dark:border-gray-600">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Lista de Turnos
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {viewAllTurnos ? 'Todos los turnos' : 'Turnos de esta semana'}
        </p>
      </div>

      {/* Lista de turnos */}
      <div className="p-4">
        {getTurnosToShow().length > 0 ? (
          <div className="space-y-3">
            {getTurnosToShow()
              .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
              .map((turno) => (
                <div
                  key={turno.id}
                  className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: getEventColor(turno.lugarId) }}
                        ></div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {turno.lugar?.nombre || 'Sin lugar'}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(turno.fecha).toLocaleDateString('es-ES')} • {turno.hora}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right mr-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {turno.usuarios && turno.usuarios.length > 0 
                            ? turno.usuarios.map(u => u.nombre).join(', ')
                            : 'Sin usuarios'
                          }
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {turno.estado}
                        </div>
                      </div>
                      
                      {/* Indicador de estado y botón ver */}
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(getTurnoEstado(turno))}`}>
                          {getEstadoText(getTurnoEstado(turno))}
                        </span>
                       
                        <button
                          onClick={() => handleTurnoClick(turno)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md transition-colors"
                        >
                          Ver Detalles
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No hay turnos para mostrar
          </div>
        )}
      </div>
    </div>
  );
}
