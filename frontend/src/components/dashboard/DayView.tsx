import type { Turno } from '../../types';

interface DayViewProps {
  currentDate: Date;
  getTurnosForDate: (date: Date) => Turno[];
  handleTurnoClick: (turno: Turno) => void;
  getEventColor: (lugarId: number) => string;
  formatDay: (date: Date) => string;
}

export default function DayView({
  currentDate,
  getTurnosForDate,
  handleTurnoClick,
  getEventColor,
  formatDay
}: DayViewProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Encabezado del día */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 border-b border-gray-200 dark:border-gray-600">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center">
          {formatDay(currentDate)}
        </h3>
      </div>

      {/* Horas y turnos del día */}
      <div className="relative">
        {/* Líneas de tiempo */}
        <div className="absolute left-20 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-600"></div>
        
        {/* Horas y turnos */}
        {Array.from({ length: 24 }, (_, hour) => {
          const turnosEnEstaHora = getTurnosForDate(currentDate).filter(turno => {
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
            <div key={hour} className="flex items-start relative" style={{ height: '64px' }}>
              {/* Hora */}
              <div className="w-20 text-sm font-medium text-gray-500 dark:text-gray-400 text-right pr-4 pt-2">
                {hour.toString().padStart(2, '0')}:00
              </div>
              
              {/* Línea horizontal de la hora */}
              <div className="absolute left-20 right-0 top-0 w-full h-px bg-gray-200 dark:bg-gray-600"></div>
              
              {/* Turnos en esta hora */}
              <div className="flex-1 pl-4 relative">
                {turnosEnEstaHora.length > 0 ? (
                  <div className="flex space-x-2">
                    {turnosEnEstaHora.map((turno) => {
                      // Calcular la duración del turno y la posición exacta
                      let duracionHoras = 1; // Por defecto 1 hora
                      let offsetMinutos = 0; // Offset desde el inicio de la hora
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
                        
                        // Calcular el offset desde el inicio de la hora (ej: 17:30 -> offset 30 minutos)
                        offsetMinutos = minInicioNum;
                      }

                      // Calcular el ancho del turno basado en cuántos turnos hay en esta hora
                      const totalTurnos = turnosEnEstaHora.length;
                      const turnoWidth = totalTurnos > 1 ? `calc((100% - ${(totalTurnos - 1) * 8}px) / ${totalTurnos})` : '100%';

                      return (
                        <div
                          key={turno.id}
                          onClick={() => handleTurnoClick(turno)}
                          className="p-3 rounded-lg text-white font-medium z-10 flex-shrink-0 cursor-pointer hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
                          style={{ 
                            backgroundColor: getEventColor(turno.lugarId),
                            height: `${Math.max(duracionHoras * 64 - 4, 20)}px`, // 64px por hora, menos 4px de padding
                            minHeight: '20px',
                            width: turnoWidth,
                            marginTop: `${offsetMinutos * 64 / 60}px` // Posición exacta considerando minutos
                          }}
                          title={`Haz clic para ver detalles del turno en ${turno.lugar?.nombre || 'Sin lugar'}`}
                        >
                          <div className="h-full flex flex-col justify-between">
                            <div>
                              <div className="font-bold text-sm truncate">{turno.lugar?.nombre || 'Sin lugar'}</div>
                              <div className="text-xs opacity-90 truncate">{turno.hora}</div>
                              {turno.usuarios && turno.usuarios.length > 0 && (
                                <div className="text-xs opacity-75 mt-1 truncate">
                                  {turno.usuarios.map(u => u.nombre).join(', ')}
                                </div>
                              )}
                            </div>
                            
                            {/* Indicador de ocupación */}
                            <div className="mt-2 text-right">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                {turno.lugar?.capacidad ? `${turno.usuarios?.length || 0}/${turno.lugar.capacidad}` : (turno.usuarios?.length || 0)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400 dark:text-gray-500 pt-2">
                    Sin turnos
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
