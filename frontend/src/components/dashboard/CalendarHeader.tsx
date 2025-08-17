interface CalendarHeaderProps {
  currentView: 'month' | 'week' | 'day' | 'list';
  setCurrentView: (view: 'month' | 'week' | 'day' | 'list') => void;
  viewAllTurnos: boolean;
  setViewAllTurnos: (value: boolean) => void;
  viewMyTurnos: boolean;
  setViewMyTurnos: (value: boolean) => void;
}

export default function CalendarHeader({
  currentView,
  setCurrentView,
  viewAllTurnos,
  setViewAllTurnos,
  viewMyTurnos,
  setViewMyTurnos
}: CalendarHeaderProps) {
  return (
    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Calendario de Turnos
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          💡 <strong>Consejo:</strong> Haz clic en cualquier turno para ver sus detalles completos y gestionar usuarios
        </p>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Selector de vista */}
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentView('month')}
              className={`px-3 py-1 text-sm rounded-md ${
                currentView === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setCurrentView('week')}
              className={`px-3 py-1 text-sm rounded-md ${
                currentView === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setCurrentView('day')}
              className={`px-3 py-1 text-sm rounded-md ${
                currentView === 'day'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Día
            </button>
            <button
              onClick={() => setCurrentView('list')}
              className={`px-3 py-1 text-sm rounded-md ${
                currentView === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Lista
            </button>
          </div>
          
          {/* Filtros de turnos */}
          <div className="flex space-x-2">
            <button
              onClick={() => {
                const newValue = !viewMyTurnos;
                setViewMyTurnos(newValue);
                // Si se activa "Mis Turnos", desactivar "Ver Todos"
                if (newValue) {
                  setViewAllTurnos(false);
                } else {
                  // Si se desactiva "Mis Turnos", activar "Ver Todos" por defecto
                  setViewAllTurnos(true);
                }
              }}
              className={`px-4 py-2 text-sm rounded-md flex items-center space-x-2 ${
                viewMyTurnos
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{viewMyTurnos ? 'Mis Turnos ✓' : 'Mis Turnos'}</span>
            </button>
            
            <button
              onClick={() => {
                const newValue = !viewAllTurnos;
                setViewAllTurnos(newValue);
                // Si se activa "Ver Todos", desactivar "Mis Turnos"
                if (newValue) {
                  setViewMyTurnos(false);
                }
                // Si se desactiva "Ver Todos", mantener "Mis Turnos" si está activo
              }}
              className={`px-4 py-2 text-sm rounded-md ${
                viewAllTurnos
                  ? 'bg-gray-600 text-white'
                  : 'bg-blue-600 text-white'
              }`}
            >
              {viewAllTurnos ? 'Ver Solo Esta Semana' : 'Ver Todos los Turnos'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
