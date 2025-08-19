import type { Turno } from '../../types';

interface DayViewProps {
  currentDate: Date;
  getTurnosForDate: (date: Date) => Turno[];
  handleTurnoClick: (turno: Turno) => void;
  getEventColor: (lugarId: number) => string;
  formatDay: (date: Date) => string;
  onTurnoDrop?: (turnoId: number, newDate: Date) => void;
}

export default function DayView({
  currentDate,
  getTurnosForDate,
  handleTurnoClick,
  getEventColor,
  formatDay,
  onTurnoDrop
}: DayViewProps) {
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
      {/* Encabezado del día */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 border-b border-gray-200 dark:border-gray-600">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {formatDay(currentDate)}
        </h3>
      </div>
        
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

        // Agrupar por franja exacta (misma cadena turno.hora)
        const conteoPorFranja: Record<string, number> = {};
        const primerIndicePorFranja: Record<string, number> = {};
        turnosEnEstaHora.forEach((t, idx) => {
          conteoPorFranja[t.hora] = (conteoPorFranja[t.hora] || 0) + 1;
          if (primerIndicePorFranja[t.hora] === undefined) {
            primerIndicePorFranja[t.hora] = idx;
          }
        });

        return (
          <div
            key={hour}
            className="h-16 border-b border-gray-200 dark:border-gray-600 relative bg-white dark:bg-gray-800"
            onDrop={(e) => handleDrop(e, currentDate)}
            onDragOver={handleDragOver}
          >
            {/* Etiqueta de hora */}
            <div className="absolute left-0 top-0 w-16 h-full flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600">
              {hour.toString().padStart(2, '0')}:00
            </div>

            {/* Turnos en esta hora */}
            <div className="ml-16 h-full relative">
                             {turnosEnEstaHora.map((turno) => {
                // Calcular la duración del turno y la posición exacta
                let duracionHoras = 1;

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

                const totalTurnos = turnosEnEstaHora.length;
                const turnoWidth = totalTurnos > 1 ? `calc((100% - ${(totalTurnos - 1) * 8}px) / ${totalTurnos})` : '100%';

                return (
                  <div
                    key={turno.id}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, turno)}
                    onClick={() => handleTurnoClick(turno)}
                    className="p-3 rounded-lg text-white font-medium z-10 flex-shrink-0 cursor-pointer hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
                    style={{ 
                      backgroundColor: getEventColor(turno.lugarId),
                      height: `${Math.max(duracionHoras * 64 - 4, 20)}px`, // 64px por hora, menos 4px de padding
                      minHeight: '20px',
                      width: turnoWidth,
                      marginTop: `${(turno.hora.includes('-') ? (() => { const [h] = turno.hora.split('-')[0].split(':'); return parseInt(h[1]) || 0; })() : 0) * 64 / 60}px` // Posición exacta considerando minutos
                    }}
                    title={`Arrastra para mover o haz clic para ver detalles del turno en ${turno.lugar?.nombre || 'Sin lugar'}`}
                  >
                    <div className="h-full flex flex-col justify-between">
                      <div>
                        <div className="font-medium truncate">
                          {turno.lugar?.nombre || 'Sin lugar'}
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
                      <div className="flex justify-end">
                        <svg className="w-3 h-3 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
