import type { Turno } from '../../types';

import React from 'react'; // Added missing import for React

interface WeekViewProps {
  weekDays: Date[];
  weekDayNames: string[];
  getTurnosForDate: (date: Date) => Turno[];
  handleTurnoClick: (turno: Turno) => void;
  getEventColor: (lugarId: number) => string;
  onTurnoDrop?: (turnoId: number, newDate: Date) => void;
}

export default function WeekView({
  weekDays,
  weekDayNames,
  getTurnosForDate,
  handleTurnoClick,
  getEventColor,
  onTurnoDrop
}: WeekViewProps) {


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
      <div className="grid grid-cols-8 bg-gray-50 dark:bg-gray-700">
        <div className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">
          Hora
        </div>
        {weekDayNames.map((day, index) => (
          <div
            key={index}
            className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600 last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Horas y turnos */}
      <div className="grid grid-cols-8">
        {Array.from({ length: 24 }, (_, hour) => {
          const hourLabel = `${hour.toString().padStart(2, '0')}:00`;
          
          return (
            <React.Fragment key={hour}>
              {/* Etiqueta de hora */}
              <div className="p-2 text-xs text-gray-600 dark:text-gray-400 border-r border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
                {hourLabel}
              </div>
              
              {/* Días de la semana */}
              {weekDays.map((day, dayIndex) => {
                const turnosDelDia = getTurnosForDate(day);
                
                // Buscar turnos que empiecen en esta hora específica
                const turnosQueEmpiezanEnEstaHora = turnosDelDia.filter(turno => {
                  const [horaInicio] = turno.hora.split('-');
                  const [hora] = horaInicio.split(':').map(Number);
                  return hora === hour;
                });

                return (
                  <div
                    key={dayIndex}
                    className="relative border-r border-b border-gray-200 dark:border-gray-600 last:border-r-0 min-h-[64px] bg-white dark:bg-gray-800"
                    onDrop={(e) => handleDrop(e, day)}
                    onDragOver={handleDragOver}
                  >
                    {turnosQueEmpiezanEnEstaHora.map((turno, turnoIndex) => {
                      // Calcular la duración del turno
                      const [horaInicio, horaFin] = turno.hora.split('-');
                      const [horaInicioNum, minutosInicio] = horaInicio.split(':').map(Number);
                      const [horaFinNum, minutosFin] = horaFin.split(':').map(Number);
                      
                      const duracionMinutos = (horaFinNum * 60 + minutosFin) - (horaInicioNum * 60 + minutosInicio);
                      const alturaTurno = Math.max((duracionMinutos / 60) * 64, 20); // 64px por hora
                      
                      // Calcular offset para minutos
                      const offsetMinutos = minutosInicio;
                      const offsetFinal = offsetMinutos;
                      
                      // Calcular z-index y posición para superposiciones
                      const totalTurnos = turnosQueEmpiezanEnEstaHora.length;
                      const desplazamientoMaximo = Math.min(totalTurnos * 20, 60);
                      const zIndex = totalTurnos - turnoIndex;
                      const desplazamientoSuperposicion = Math.min(turnoIndex * 20, desplazamientoMaximo);

                      return (
                        <div
                          key={turno.id}
                          draggable={true}
                          onDragStart={(e) => handleDragStart(e, turno)}
                          onClick={() => handleTurnoClick(turno)}

                          className="absolute left-1 right-1 text-xs p-1 rounded text-white font-medium truncate cursor-pointer hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md border-2 border-white/30"
                          style={{ 
                            backgroundColor: getEventColor(turno.lugarId),
                            top: `${desplazamientoSuperposicion + (offsetFinal * 64 / 60)}px`, // Posición limitada + offset de minutos
                            height: `${alturaTurno}px`, // Altura calculada del turno
                            minHeight: '20px',
                            zIndex: zIndex
                          }}
                          title={`Arrastra para mover o haz clic para ver detalles del turno en ${turno.lugar?.nombre || 'Sin lugar'}`}
                        >
                                                      <div className="flex flex-col justify-between h-full">
                            <div className="flex items-center justify-between">
                              <span className="truncate flex-1">
                                {turno.lugar?.nombre || 'Sin lugar'}
                              </span>
                              <svg className="w-3 h-3 opacity-75 ml-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                              </svg>
                            </div>
                            <div className="text-xs opacity-75">
                              {turno.hora}
                              {turno.lugar?.capacidad && (
                                <span className="ml-1">
                                  ({turno.usuarios?.length || 0}/{turno.lugar.capacidad})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
