import type { Turno } from '../../types';

interface MonthViewProps {
  calendarDays: Array<{
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
  }>;
  weekDayNames: string[];
  expandedDays: Set<string>;
  getTurnosForDate: (date: Date) => Turno[];
  handleTurnoClick: (turno: Turno) => void;
  toggleDayExpansion: (dateString: string) => void;
  getEventColor: (lugarId: number) => string;
  onTurnoDrop?: (turnoId: number, newDate: Date) => void;
}

export default function MonthView({
  calendarDays,
  weekDayNames,
  expandedDays,
  getTurnosForDate,
  handleTurnoClick,
  toggleDayExpansion,
  getEventColor,
  onTurnoDrop
}: MonthViewProps) {
  // Función para manejar el inicio del drag
  const handleDragStart = (e: React.DragEvent, turno: Turno) => {
    e.dataTransfer.setData('application/json', JSON.stringify(turno));
    e.dataTransfer.effectAllowed = 'move';
  };

  // Función para manejar el drop
  const handleDrop = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    
    try {
      const turnoData = JSON.parse(e.dataTransfer.getData('application/json'));
      if (onTurnoDrop && turnoData.id) {
        onTurnoDrop(turnoData.id, targetDate);
      }
    } catch (error) {
      console.error('Error parsing turno data:', error);
    }
  };

  // Función para permitir el drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Encabezados de días */}
      <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-700">
        {weekDayNames.map((day, index) => (
          <div
            key={index}
            className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600 last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Días del calendario */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          const turnosDelDia = getTurnosForDate(day.date);
          const isCurrentMonth = day.isCurrentMonth;
          const isToday = day.isToday;
           
          return (
            <div
              key={index}
              className={`min-h-[120px] border-r border-b border-gray-200 dark:border-gray-600 last:border-r-0 ${
                isCurrentMonth 
                  ? 'bg-white dark:bg-gray-800' 
                  : 'bg-gray-50 dark:bg-gray-900'
              } ${
                isToday 
                  ? 'bg-blue-50 dark:bg-blue-900/20' 
                  : ''
              }`}
              onDrop={(e) => handleDrop(e, day.date)}
              onDragOver={handleDragOver}
            >
              {/* Número del día */}
              <div className={`p-2 text-sm font-medium ${
                isCurrentMonth 
                  ? 'text-gray-900 dark:text-white' 
                  : 'text-gray-400 dark:text-gray-500'
              } ${
                isToday 
                  ? 'text-blue-600 dark:text-blue-400 font-bold' 
                  : ''
              }`}>
                {day.date.getDate()}
              </div>

              {/* Turnos del día */}
              <div className="px-2 pb-2 space-y-1">
                {(() => {
                  // Crear la fecha en formato YYYY-MM-DD para comparar
                  const dateString = `${day.date.getFullYear()}-${String(day.date.getMonth() + 1).padStart(2, '0')}-${String(day.date.getDate()).padStart(2, '0')}`;
                  const isExpanded = expandedDays.has(dateString);
                  const turnosToShow = isExpanded ? turnosDelDia : turnosDelDia.slice(0, 3);
                  
                  return (
                    <>
                      {turnosToShow.map((turno) => (
                        <div
                          key={turno.id}
                          draggable={true}
                          onDragStart={(e) => handleDragStart(e, turno)}
                          onClick={() => handleTurnoClick(turno)}
                          className="text-xs p-1 rounded text-white font-medium truncate cursor-pointer hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
                          style={{ backgroundColor: getEventColor(turno.lugarId) }}
                          title={`Arrastra para mover o haz clic para ver detalles del turno en ${turno.lugar?.nombre || 'Sin lugar'}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate flex-1">
                              {turno.lugar?.nombre || 'Sin lugar'} ({turno.hora})
                              {turno.lugar?.capacidad && (
                                <span className="ml-1 text-xs opacity-75">
                                  ({turno.usuarios?.length || 0}/{turno.lugar.capacidad})
                                </span>
                              )}
                            </span>
                            <div className="ml-1 flex-shrink-0">
                              <svg className="w-3 h-3 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Mostrar contador si hay más turnos */}
                      {turnosDelDia.length > 3 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-1">
                          +{turnosDelDia.length - 3} más
                        </div>
                      )}
                      
                      {/* Botón para expandir/contraer */}
                      {turnosDelDia.length > 3 && (
                        <button
                          onClick={() => toggleDayExpansion(dateString)}
                          className="w-full text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors py-1"
                        >
                          {isExpanded ? 'Ver menos' : 'Ver más'}
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
