interface CalendarHeaderProps {
  currentView: 'month' | 'week' | 'day' | 'list';
  setCurrentView: (view: 'month' | 'week' | 'day' | 'list') => void;
  viewAllTurnos: boolean;
  setViewAllTurnos: (value: boolean) => void;
  viewMyTurnos: boolean;
  setViewMyTurnos: (value: boolean) => void;
  onGeneratePDF: () => void;
  onLimpiarTodo: () => void;
  onAsignacionAutomaticaTodos: () => void;
}

export default function CalendarHeader({
  currentView,
  setCurrentView,
  viewAllTurnos,
  setViewAllTurnos,
  viewMyTurnos,
  setViewMyTurnos,
  onGeneratePDF,
  onLimpiarTodo,
  onAsignacionAutomaticaTodos
}: CalendarHeaderProps) {
  return (
    <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
      <div className="mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Calendario de Turnos
        </h2>
        <p className="text-xs sm:text-sm text-gris-texto dark:text-dark-gris-texto">
          💡 <strong>Consejo:</strong> Haz clic en cualquier turno para ver sus detalles completos y gestionar usuarios
        </p>
      </div>
      
      {/* Primera fila: Filtros de turnos y botones de acción */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 space-y-4 lg:space-y-0">
        {/* Filtros de turnos - Se mantienen en la parte superior en móvil */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                         <button
               onClick={() => {
                 const newValue = !viewMyTurnos;
                 setViewMyTurnos(newValue);
                 // "Mis Turnos" puede funcionar independientemente de "Ver Todos"
                 // No desactivamos "Ver Todos" automáticamente
               }}
                               className={`px-3 sm:px-4 py-2 text-sm rounded-md flex items-center justify-center sm:justify-start space-x-2 transition-colors duration-200 ${
                  viewMyTurnos
                    ? 'bg-verde-esperanza dark:bg-dark-verde-esperanza text-white hover:bg-green-700 dark:hover:bg-green-600'
                    : 'bg-azul-claro dark:bg-dark-azul-claro text-gris-texto dark:text-dark-gris-texto hover:bg-azul-sereno hover:text-white dark:hover:bg-azul-sereno dark:hover:text-white'
                }`}
             >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="whitespace-nowrap">{viewMyTurnos ? 'Mis Turnos ✓' : 'Mis Turnos'}</span>
            </button>
            
                         <button
               onClick={() => {
                 const newValue = !viewAllTurnos;
                 setViewAllTurnos(newValue);
                 // "Ver Todos" puede funcionar independientemente de "Mis Turnos"
                 // No desactivamos "Mis Turnos" automáticamente
               }}
                               className={`px-3 sm:px-4 py-2 text-sm rounded-md transition-colors duration-200 ${
                  viewAllTurnos
                    ? 'bg-azul-claro dark:bg-dark-azul-claro text-gris-texto dark:text-dark-gris-texto border border-azul-sereno dark:border-dark-azul-sereno hover:bg-azul-sereno hover:text-white dark:hover:bg-azul-sereno dark:hover:text-white'
                    : 'bg-azul-sereno dark:bg-dark-azul-sereno text-white hover:bg-azul-sereno-hover dark:hover:bg-azul-sereno-hover'
                }`}
             >
              <span className="whitespace-nowrap">
                {viewAllTurnos 
                  ? (viewMyTurnos ? 'Solo Esta Semana' : 'Ver Solo Esta Semana')
                  : (viewMyTurnos ? 'Todo el Mes' : 'Ver Todos los Turnos')
                }
              </span>
            </button>
          </div>
        </div>
        
        {/* Lado derecho: Botones de acción y selector de vista */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          
          {/* Selector de vista del calendario */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <span className="text-sm text-gris-texto dark:text-dark-gris-texto font-medium">Vista:</span>
            <select
              value={currentView}
              onChange={(e) => setCurrentView(e.target.value as 'month' | 'week' | 'day' | 'list')}
              className="px-3 py-2 text-sm rounded-md border border-azul-sereno dark:border-dark-azul-sereno bg-white dark:bg-dark-gris-fondo text-gris-texto dark:text-dark-gris-texto focus:outline-none focus:ring-2 focus:ring-azul-sereno dark:focus:ring-dark-azul-sereno focus:border-azul-sereno dark:focus:border-dark-azul-sereno transition-colors duration-200"
            >
              <option value="month">Mes</option>
              <option value="week">Semana</option>
              <option value="day">Día</option>
              <option value="list">Lista</option>
            </select>
          </div>
          
          {/* Botones de acción - Se reorganizan en móvil */}
          <div className="grid grid-cols-2 sm:flex sm:space-x-2 gap-2 sm:gap-0">
            {/* Botón para asignación automática de todos los turnos */}
            <button
              onClick={onAsignacionAutomaticaTodos}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-md bg-azul-sereno dark:bg-dark-azul-sereno hover:bg-azul-sereno-hover dark:hover:bg-azul-sereno text-white flex items-center justify-center space-x-1 sm:space-x-2 transition-colors duration-200 shadow-lg hover:shadow-xl"
              title="Asignar automáticamente usuarios a todos los turnos incompletos"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="hidden sm:inline">Asignación Automática</span>
              <span className="sm:hidden">Auto</span>
            </button>
            
            {/* Botón para limpiar todos los usuarios de turnos */}
            <button
              onClick={onLimpiarTodo}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-md bg-azul-sereno dark:bg-dark-azul-sereno hover:bg-azul-sereno-hover dark:hover:bg-azul-sereno text-white flex items-center justify-center space-x-1 sm:space-x-2 transition-colors duration-200 shadow-lg hover:shadow-xl"
              title="Limpiar todos los usuarios asignados de todos los turnos"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="hidden sm:inline">Limpiar Todo</span>
              <span className="sm:hidden">Limpiar</span>
            </button>
          </div>
          
          {/* Botón para generar PDF - Se mantiene separado para mejor organización */}
          <button
            onClick={() => {
              // Llamar a la función que se pasará como prop
              if (onGeneratePDF) {
                onGeneratePDF();
              }
            }}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-md bg-azul-sereno dark:bg-dark-azul-sereno hover:bg-azul-sereno-hover dark:hover:bg-azul-sereno text-white flex items-center justify-center space-x-1 sm:space-x-2 transition-colors duration-200 shadow-lg hover:shadow-xl"
            title="Generar PDF con todos los turnos visibles"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden sm:inline">Generar PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
