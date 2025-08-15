import type { Turno } from '../../types';
import { useState } from 'react';

interface WeekViewProps {
  weekDays: Date[];
  weekDayNames: string[];
  getTurnosForDate: (date: Date) => Turno[];
  handleTurnoClick: (turno: Turno) => void;
  getEventColor: (lugarId: number) => string;
}

export default function WeekView({
  weekDays,
  weekDayNames,
  getTurnosForDate,
  handleTurnoClick,
  getEventColor
}: WeekViewProps) {
  const [hoveredTurnoId, setHoveredTurnoId] = useState<number | null>(null);

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
                    // Si el turno empieza en esta hora (ej: 17:30 en hora 17)
                    return hour === horaInicioNum;
                  } else {
                    const [horaTurno] = turno.hora.split(':').map(Number);
                    return hour === horaTurno;
                  }
                });
                
                // Agrupar por franja exacta (misma cadena turno.hora)
                const conteoPorFranja: Record<string, number> = {};
                const primerIndicePorFranja: Record<string, number> = {};
                turnosQueEmpiezanEnEstaHora.forEach((t, idx) => {
                  conteoPorFranja[t.hora] = (conteoPorFranja[t.hora] || 0) + 1;
                  if (primerIndicePorFranja[t.hora] === undefined) {
                    primerIndicePorFranja[t.hora] = idx;
                  }
                });

                return (
                  <div
                    key={hour}
                    className="h-16 border-b border-gray-200 dark:border-gray-600 relative"
                  >
                    {turnosQueEmpiezanEnEstaHora.map((turno, turnoIndex) => {
                      // Calcular la duración del turno y la posición exacta
                      let offsetMinutos = 0; // Offset desde el inicio de la hora
                      let duracionMinutos = 60; // Duración en minutos por defecto
                      let duracionMinutosOriginal = 60; // Duración original sin modificar
                      if (turno.hora.includes('-')) {
                        const [horaInicio, horaFin] = turno.hora.split('-');
                        const [horaInicioNum, minInicioNum] = horaInicio.split(':').map(Number);
                        const [horaFinNum, minFinNum] = horaFin.split(':').map(Number);
                        
                        // Calcular diferencia en minutos
                        const inicioMinutos = horaInicioNum * 60 + minInicioNum;
                        const finMinutos = horaFinNum * 60 + minFinNum;
                        
                        // Si la hora de fin es menor que la de inicio, asumir que es del día siguiente
                        const diferenciaMinutos = finMinutos > inicioMinutos ? finMinutos - inicioMinutos : (24 * 60 - inicioMinutos) + finMinutos;
                        duracionMinutos = diferenciaMinutos;
                        duracionMinutosOriginal = diferenciaMinutos;
                        
                        // Calcular el offset desde el inicio de la hora (ej: 17:30 -> offset 30 minutos)
                        offsetMinutos = minInicioNum;
                      }

                      // Si hay varios turnos con la misma franja exacta y este no es el primero del grupo,
                      // aplicar un desplazamiento visual de 30 minutos y reducir la altura 30 minutos.
                      const cantidadEnFranjaIgual = conteoPorFranja[turno.hora] || 0;
                      const primerIndiceDeEstaFranja = primerIndicePorFranja[turno.hora];
                      const noEsPrimeroDeSuFranja = cantidadEnFranjaIgual > 1 && primerIndiceDeEstaFranja !== turnoIndex;
                      
                      let offsetMinutosAjustado = offsetMinutos;
                      let duracionMinutosAjustada = duracionMinutos;
                      
                      if (noEsPrimeroDeSuFranja) {
                        offsetMinutosAjustado += 30;
                        duracionMinutosAjustada = Math.max(duracionMinutos - 30, 15); // mínimo 15 minutos visuales
                      }

                      // Al hacer hover, recuperar la altura y posición original
                      const isHovered = hoveredTurnoId === turno.id;
                      const offsetFinal = isHovered ? offsetMinutos : offsetMinutosAjustado;
                      const duracionFinal = isHovered ? duracionMinutosOriginal : duracionMinutosAjustada;

                      // Determinar el z-index y la posición del texto según el índice
                      const zIndex = 10 + turnoIndex; // Z-index normal para que se superpongan correctamente
                      const textPosition = turnoIndex === 0 ? 'top' : 'center'; // Primer turno arriba, resto centrado
                      
                      // Calcular el desplazamiento máximo disponible para superposición
                      const alturaTurno = Math.max((duracionFinal / 60) * 64 - 4, 20);
                      const alturaHora = 64; // 64px por hora
                      const desplazamientoMaximo = Math.max(0, alturaHora - alturaTurno);
                      const desplazamientoSuperposicion = Math.min(turnoIndex * 20, desplazamientoMaximo);

                      return (
                        <div
                          key={turno.id}
                          onClick={() => handleTurnoClick(turno)}
                          onMouseEnter={() => setHoveredTurnoId(turno.id)}
                          onMouseLeave={() => setHoveredTurnoId(null)}
                          className="absolute left-1 right-1 text-xs p-1 rounded text-white font-medium truncate cursor-pointer hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
                          style={{ 
                            backgroundColor: getEventColor(turno.lugarId),
                            top: `${desplazamientoSuperposicion + (offsetFinal * 64 / 60)}px`, // Posición limitada + offset de minutos
                            height: `${alturaTurno}px`, // Altura calculada del turno
                            minHeight: '20px',
                            zIndex: zIndex
                          }}
                          title={`Haz clic para ver detalles del turno en ${turno.lugar?.nombre || 'Sin lugar'}`}
                        >
                          <div className={`flex justify-between h-full ${
                            textPosition === 'top' ? 'items-start pt-1' : 'items-center'
                          }`}>
                            <span className="truncate flex-1">
                              {turno.lugar?.nombre || 'Sin lugar'}
                              {turno.lugar?.capacidad && (
                                <span className="ml-1 text-xs opacity-75">
                                  ({turno.usuarios?.length || 0}/{turno.lugar.capacidad})
                                </span>
                              )}
                            </span>
                            <div className="ml-1 flex-shrink-0">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                {turno.lugar?.capacidad ? `${turno.usuarios?.length || 0}/${turno.lugar.capacidad}` : (turno.usuarios?.length || 0)}
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
