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
  getEstadoColor: (estado: string) => string;
  getEstadoText: (estado: string) => string;
  getTurnoEstado: (turno: Turno) => string;
}

export default function MonthView({
  calendarDays,
  weekDayNames,
  expandedDays,
  getTurnosForDate,
  handleTurnoClick,
  toggleDayExpansion,
  getEventColor,
  getEstadoColor,
  getEstadoText,
  getTurnoEstado
}: MonthViewProps) {
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
                          onClick={() => handleTurnoClick(turno)}
                          className="text-xs p-1 rounded text-white font-medium truncate cursor-pointer hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
                          style={{ backgroundColor: getEventColor(turno.lugarId) }}
                          title={`Haz clic para ver detalles del turno en ${turno.lugar?.nombre || 'Sin lugar'}`}
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
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(getTurnoEstado(turno))}`}>
                                {getEstadoText(getTurnoEstado(turno))}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Mostrar "X más" si hay más de 3 turnos y no está expandido */}
                      {turnosDelDia.length > 3 && !isExpanded && (
                        <div 
                          className="text-xs text-gray-500 dark:text-gray-400 text-center cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                          onClick={() => {
                            console.log('Click en +X más para fecha:', dateString);
                            console.log('isExpanded:', isExpanded);
                            toggleDayExpansion(dateString);
                          }}
                        >
                          +{turnosDelDia.length - 3} más
                        </div>
                      )}
                      
                      {/* Mostrar botón para contraer si está expandido */}
                      {turnosDelDia.length > 3 && isExpanded && (
                        <div 
                          className="text-xs text-blue-600 dark:text-blue-400 text-center cursor-pointer hover:text-blue-800 dark:hover:text-blue-300"
                          onClick={() => toggleDayExpansion(dateString)}
                        >
                          Mostrar menos
                        </div>
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
