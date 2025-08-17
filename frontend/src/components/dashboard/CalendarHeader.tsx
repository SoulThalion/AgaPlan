interface CalendarHeaderProps {
  currentView: 'month' | 'week' | 'day' | 'list';
  setCurrentView: (view: 'month' | 'week' | 'day' | 'list') => void;
  viewAllTurnos: boolean;
  setViewAllTurnos: (value: boolean) => void;
  viewMyTurnos: boolean;
  setViewMyTurnos: (value: boolean) => void;
  onGeneratePDF: () => void;
}

export default function CalendarHeader({
  currentView,
  setCurrentView,
  viewAllTurnos,
  setViewAllTurnos,
  viewMyTurnos,
  setViewMyTurnos,
  onGeneratePDF // Destructure onGeneratePDF
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
                // "Mis Turnos" puede funcionar independientemente de "Ver Todos"
                // No desactivamos "Ver Todos" automáticamente
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
                // "Ver Todos" puede funcionar independientemente de "Mis Turnos"
                // No desactivamos "Mis Turnos" automáticamente
              }}
              className={`px-4 py-2 text-sm rounded-md ${
                viewAllTurnos
                  ? 'bg-gray-600 text-white'
                  : 'bg-blue-600 text-white'
              }`}
            >
              {viewAllTurnos 
                ? (viewMyTurnos ? 'Solo Esta Semana' : 'Ver Solo Esta Semana')
                : (viewMyTurnos ? 'Todo el Mes' : 'Ver Todos los Turnos')
              }
            </button>
          </div>
        </div>
        
        {/* Lado derecho: Indicadores y botón PDF */}
        <div className="flex items-center space-x-4">
          {/* Indicador del estado de filtros */}
          {viewMyTurnos && (
            <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
              {viewAllTurnos 
                ? '📅 Mis turnos de esta semana'
                : '📅 Mis turnos de todo el mes'
              }
            </div>
          )}
          
          {/* Botón para generar PDF */}
          <button
            onClick={() => {
              // Llamar a la función que se pasará como prop
              if (onGeneratePDF) {
                onGeneratePDF();
              }
            }}
            className="px-4 py-2 text-sm rounded-md bg-red-600 hover:bg-red-700 text-white flex items-center space-x-2 transition-colors duration-200 shadow-lg hover:shadow-xl"
            title="Generar PDF con todos los turnos visibles"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Generar PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
