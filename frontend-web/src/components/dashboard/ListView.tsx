import type { Turno } from '../../types';

interface ListViewProps {
  viewAllTurnos: boolean;
  getTurnosToShow: () => Turno[];
  handleTurnoClick: (turno: Turno) => void;
  getEventColor: (lugarId: number) => string;
}

export default function ListView({
  viewAllTurnos,
  getTurnosToShow,
  handleTurnoClick,
  getEventColor
}: ListViewProps) {

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {viewAllTurnos ? 'Todos los Turnos' : 'Mis Turnos'}
        </h3>
      </div>

      <div className="p-6">
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
                        {turno.usuarios?.length || 0}
                        {turno.lugar?.capacidad && ` / ${turno.lugar.capacidad}`}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {turno.estado === 'ocupado' ? 'Ocupado' : 'Libre'}
                      </div>
                    </div>
                    <button
                      onClick={() => handleTurnoClick(turno)}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors flex items-center space-x-2"
                      title="Haz clic para ver detalles del turno"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="text-sm">Ver</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
