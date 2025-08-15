import type { Turno } from '../../types';

interface WeekViewProps {
  weekDays: Date[];
  weekDayNames: string[];
  getTurnosForDate: (date: Date) => Turno[];
  handleTurnoClick: (turno: Turno) => void;
  getEventColor: (lugarId: number) => string;
  getEstadoColor: (estado: string) => string;
  getEstadoText: (estado: string) => string;
  getTurnoEstado: (turno: Turno) => string;
}

export default function WeekView({
  weekDays,
  weekDayNames,
  getTurnosForDate,
  handleTurnoClick,
  getEventColor,
  getEstadoColor,
  getEstadoText,
  getTurnoEstado
}: WeekViewProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Encabezados de días */}
      <div className="grid grid-cols-8 bg-gray-50 dark:bg-gray-700">
        <div className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">
          Hora
        </div>
        {weekDays.map((day, index) => (
          <div
            key={index}
            className={`p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600 last:border-r-0 ${
              day.toDateString() === new Date().toDateString() ? 'bg-blue-100 dark:bg-blue-900/30' : ''
            }`}
          >
            <div className="font-bold">{weekDayNames[index]}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {day.getDate()}/{day.getMonth() + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Horas y turnos */}
      <div className="grid grid-cols-8">
        {/* Columna de horas */}
        <div className="border-r border-gray-200 dark:border-gray-600">
          {Array.from({ length: 24 }, (_, hour) => (
            <div
              key={hour}
              className="h-16 border-b border-gray-200 dark:border-gray-600 p-2 text-xs text-gray-500 dark:text-gray-400 text-right"
            >
              {hour.toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* Columnas de días */}
        {weekDays.map((day, dayIndex) => {
          const turnosDelDia = getTurnosForDate(day);
          const isToday = day.toDateString() === new Date().toDateString();
           
          return (
            <div
              key={dayIndex}
              className={`border-r border-gray-200 dark:border-gray-600 last:border-r-0 ${
                isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              {Array.from({ length: 24 }, (_, hour) => {
                // Buscar turnos que empiecen en esta hora específica
                const turnosQueEmpiezanEnEstaHora = turnosDelDia.filter(turno => {
                  if (turno.hora.includes('-')) {
                    const [horaInicio] = turno.hora.split('-');
                    const [horaInicioNum] = horaInicio.split(':').map(Number);
                    return hour === horaInicioNum;
                  } else {
                    const [horaTurno] = turno.hora.split(':').map(Number);
                    return hour === horaTurno;
                  }
                });

                return (
                  <div
                    key={hour}
                    className="h-16 border-b border-gray-200 dark:border-gray-600 relative"
                  >
                    {turnosQueEmpiezanEnEstaHora.map((turno, turnoIndex) => {
                      // Calcular la duración del turno
                      let duracionHoras = 1; // Por defecto 1 hora
                      if (turno.hora.includes('-')) {
                        const [horaInicio, horaFin] = turno.hora.split('-');
                        const [horaInicioNum, minInicioNum] = horaInicio.split(':').map(Number);
                        const [horaFinNum, minFinNum] = horaFin.split(':').map(Number);
                        
                        // Calcular diferencia en minutos
                        const inicioMinutos = horaInicioNum * 60 + minInicioNum;
                        const finMinutos = horaFinNum * 60 + minFinNum;
                        
                        // Si la hora de fin es menor que la de inicio, asumir que es del día siguiente
                        const diferenciaMinutos = finMinutos > inicioMinutos ? finMinutos - inicioMinutos : (24 * 60 - inicioMinutos) + finMinutos;
                        duracionHoras = diferenciaMinutos / 60;
                      }

                      return (
                        <div
                          key={turno.id}
                          onClick={() => handleTurnoClick(turno)}
                          className="absolute left-1 right-1 text-xs p-1 rounded text-white font-medium truncate z-10 cursor-pointer hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
                          style={{ 
                            backgroundColor: getEventColor(turno.lugarId),
                            top: `${turnoIndex * 20 + 2}px`,
                            height: `${Math.max(duracionHoras * 64 - 4, 20)}px`, // 64px por hora, menos 4px de padding
                            minHeight: '20px'
                          }}
                          title={`Haz clic para ver detalles del turno en ${turno.lugar?.nombre || 'Sin lugar'}`}
                        >
                          <div className="flex items-center justify-between h-full">
                            <span className="truncate flex-1">
                              {turno.lugar?.nombre || 'Sin lugar'}
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
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
