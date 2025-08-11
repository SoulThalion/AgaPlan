import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { Turno, Lugar } from '../types';

export default function DashboardOverview() {
  const { user: _user } = useAuth();
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewAllTurnos, setViewAllTurnos] = useState(true);
  const [currentView, setCurrentView] = useState('dayGridMonth');

  // Estilos CSS personalizados para FullCalendar
  const calendarStyles = `
    /* Estilos básicos esenciales para FullCalendar */
    .fc {
      font-family: inherit;
      background: white;
      border-radius: 8px;
      overflow: visible !important;
      display: block !important;
      width: 100% !important;
    }
    
    /* Toolbar */
    .fc .fc-toolbar {
      padding: 1rem;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      display: flex !important;
      flex-direction: row !important;
      align-items: center !important;
      justify-content: space-between !important;
    }
    
    .fc .fc-toolbar-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0 !important;
    }
    
    .fc .fc-button {
      background: #3b82f6;
      border-color: #3b82f6;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-weight: 500;
      margin: 0 0.25rem !important;
      border: 1px solid !important;
      cursor: pointer !important;
    }
    
    .fc .fc-button:hover {
      background: #2563eb;
      border-color: #2563eb;
    }
    
    .fc .fc-button:focus {
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    /* Grid del calendario */
    .fc .fc-daygrid {
      display: block !important;
      width: 100% !important;
    }
    
    .fc .fc-daygrid-day {
      min-height: 120px;
      border: 1px solid #e2e8f0;
      display: table-cell !important;
      vertical-align: top !important;
      width: 14.2857% !important; /* 100% / 7 días */
      max-width: 14.2857% !important;
      box-sizing: border-box !important;
    }
    
    .fc .fc-daygrid-day-frame {
      min-height: 120px;
      padding: 4px;
      height: 100% !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }
    
    .fc .fc-daygrid-day-events {
      min-height: 2em;
      margin-top: 4px;
      position: relative !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }
    
    /* Eventos */
    .fc .fc-event {
      border-radius: 4px;
      padding: 2px 6px;
      margin: 1px 0;
      font-size: 0.75rem;
      font-weight: 500;
      border: none;
      cursor: pointer;
      display: block !important;
      position: relative !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }
    
    .fc .fc-event:hover {
      opacity: 0.9;
    }
    
    .fc .fc-daygrid-event-dot {
      display: none;
    }
    
    /* Números de día */
    .fc .fc-daygrid-day-number {
      padding: 8px;
      font-weight: 500;
      color: #374151;
      display: block !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }
    
    /* Encabezados de columna */
    .fc .fc-col-header {
      width: 100% !important;
    }
    
    .fc .fc-col-header-cell {
      padding: 12px 8px;
      background-color: #f8fafc;
      font-weight: 600;
      color: #374151;
      border: 1px solid #e2e8f0;
      display: table-cell !important;
      vertical-align: middle !important;
      text-align: center !important;
      width: 14.2857% !important; /* 100% / 7 días */
      max-width: 14.2857% !important;
      box-sizing: border-box !important;
    }
    
    /* Estados de días */
    .fc .fc-daygrid-day.fc-day-today {
      background-color: #fef3c7;
    }
    
    .fc .fc-daygrid-day.fc-day-other {
      background-color: #f9fafb;
    }
    
    .fc .fc-daygrid-day.fc-day-past {
      background-color: #f9fafb;
    }
    
    .fc .fc-daygrid-day.fc-day-future {
      background-color: white;
    }
    
    /* Enlaces "more" */
    .fc .fc-more-link {
      background: #f3f4f6;
      color: #374151;
      border-radius: 4px;
      padding: 2px 6px;
      font-size: 0.75rem;
      cursor: pointer;
      margin-top: 2px;
      display: inline-block !important;
    }
    
    .fc .fc-more-link:hover {
      background: #e5e7eb;
    }
    
    /* Popover */
    .fc .fc-popover {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      position: absolute !important;
      z-index: 1000 !important;
    }
    
    .fc .fc-popover-header {
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      padding: 0.75rem;
      font-weight: 600;
    }
    
    .fc .fc-popover-body {
      padding: 0.75rem;
    }
    
    /* Tabla del calendario */
    .fc .fc-daygrid-body {
      display: table-row-group !important;
      width: 100% !important;
    }
    
    .fc .fc-daygrid-row {
      display: table-row !important;
      width: 100% !important;
    }
    
    /* Asegurar que el contenedor sea visible */
    .fc .fc-view-harness {
      height: auto !important;
      min-height: 400px !important;
      width: 100% !important;
      overflow: visible !important;
    }
    
    /* Botones de navegación */
    .fc .fc-prev-button,
    .fc .fc-next-button,
    .fc .fc-today-button {
      display: inline-block !important;
    }
    
    /* Contenedor principal del calendario */
    .fc .fc-view {
      display: block !important;
      width: 100% !important;
      height: auto !important;
      overflow: visible !important;
    }
    
    /* Asegurar que la tabla del calendario sea visible */
    .fc table {
      border-collapse: collapse !important;
      border-spacing: 0 !important;
      width: 100% !important;
      height: auto !important;
      table-layout: fixed !important;
    }
    
    /* Asegurar que las celdas tengan el tamaño correcto */
    .fc td, .fc th {
      border: 1px solid #e2e8f0 !important;
      padding: 0 !important;
      vertical-align: top !important;
      width: 14.2857% !important; /* 100% / 7 días */
      max-width: 14.2857% !important;
      box-sizing: border-box !important;
    }
    
    /* Asegurar que el contenido del calendario sea visible */
    .fc .fc-daygrid-day-content {
      min-height: 100px !important;
      padding: 4px !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }
    
    /* Mostrar todas las filas del calendario */
    .fc .fc-daygrid-day {
      height: auto !important;
      min-height: 120px !important;
    }
    
    .fc .fc-daygrid-day-frame {
      height: auto !important;
      min-height: 120px !important;
    }
    
    /* Asegurar que las filas se expandan */
    .fc .fc-daygrid-row {
      height: auto !important;
      min-height: 120px !important;
    }
    
         /* Debug: hacer visible cualquier elemento oculto */
     .fc * {
       visibility: visible !important;
     }

     /* Estilos para vistas de timeGrid (semana y día) */
     .fc .fc-timegrid {
       display: block !important;
       width: 100% !important;
     }

     .fc .fc-timegrid-slot {
       height: 2em !important;
       border-bottom: 1px solid #e2e8f0 !important;
     }

     .fc .fc-timegrid-slot-label {
       font-size: 0.75rem !important;
       color: #6b7280 !important;
       padding: 0.25rem !important;
       text-align: center !important;
     }

     .fc .fc-timegrid-axis {
       width: 3.5em !important;
       border-right: 1px solid #e2e8f0 !important;
     }

     .fc .fc-timegrid-axis-cushion {
       padding: 0.25rem !important;
       font-size: 0.75rem !important;
       color: #6b7280 !important;
     }

     .fc .fc-timegrid-col {
       border-right: 1px solid #e2e8f0 !important;
     }

     .fc .fc-timegrid-col.fc-day-today {
       background-color: #fef3c7 !important;
     }

     .fc .fc-timegrid-event {
       border-radius: 4px !important;
       padding: 2px 6px !important;
       margin: 1px !important;
       font-size: 0.75rem !important;
       font-weight: 500 !important;
       border: none !important;
       cursor: pointer !important;
     }
   `;

  // Cargar datos del dashboard
  const { data: turnosData } = useQuery({
    queryKey: ['turnos'],
    queryFn: () => apiService.getTurnos(),
    enabled: true,
  });

  const { data: lugaresData } = useQuery({
    queryKey: ['lugares'],
    queryFn: () => apiService.getLugares(),
    enabled: true,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (turnosData?.data) {
          setTurnos(turnosData.data);
        }
        if (lugaresData?.data) {
          setLugares(lugaresData.data);
        }
      } catch (err) {
        setError('Error al cargar los datos del dashboard');
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [turnosData, lugaresData]);

  const getTurnosToShow = () => {
    if (viewAllTurnos) {
      return turnos;
    }
    // Mostrar solo turnos de la semana actual
    const now = new Date();
    const startOfCurrentWeek = new Date(now);
    startOfCurrentWeek.setDate(now.getDate() - now.getDay() + 1);
    const endOfCurrentWeek = new Date(startOfCurrentWeek);
    endOfCurrentWeek.setDate(startOfCurrentWeek.getDate() + 6);

    return turnos.filter(turno => {
      const turnoDate = new Date(turno.fecha);
      return turnoDate >= startOfCurrentWeek && turnoDate <= endOfCurrentWeek;
    });
  };

  const formatHora = (hora: string) => {
    if (hora.includes('-')) {
      const [horaInicio, horaFin] = hora.split('-');
      return `${horaInicio} - ${horaFin}`;
    }
    return hora;
  };

  const getEventColor = (lugarId: number) => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];
    return colors[(lugarId - 1) % colors.length];
  };

  const calendarEvents = getTurnosToShow().map(turno => {
    // Parsear el rango de horas (formato: "HH:MM-HH:MM")
    let horaInicio = turno.hora;
    let horaFin = turno.hora;
    
    if (turno.hora.includes('-')) {
      [horaInicio, horaFin] = turno.hora.split('-');
    }
    
    // Crear fechas de inicio y fin
    const startDate = new Date(`${turno.fecha}T${horaInicio}:00`);
    const endDate = new Date(`${turno.fecha}T${horaFin}:00`);
    
    // Si la hora de fin es menor que la de inicio, ajustar para el día siguiente
    if (endDate <= startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }
    
    const event = {
      id: turno.id.toString(),
      title: `${turno.usuarios && turno.usuarios.length > 0 ? turno.usuarios.map(u => u.nombre).join(', ') : 'Sin usuarios'} - ${turno.lugar?.nombre || 'Sin lugar'} (${turno.hora})`,
      start: startDate,
      end: endDate,
      backgroundColor: getEventColor(turno.lugarId),
      borderColor: getEventColor(turno.lugarId),
      textColor: 'white',
      extendedProps: {
        lugarId: turno.lugarId,
        usuarios: turno.usuarios,
        lugar: turno.lugar,
        hora: turno.hora,
        estado: turno.estado
      }
    };
    
    return event;
  });

  const handleEventClick = (info: any) => {
    const turno = turnos.find(t => t.id.toString() === info.event.id);
    if (turno) {
      alert(`
Turno #${turno.id}
Fecha: ${new Date(turno.fecha).toLocaleDateString('es-ES')}
Horario: ${formatHora(turno.hora)}
Lugar: ${turno.lugar?.nombre || 'Sin lugar'}
Usuarios: ${turno.usuarios && turno.usuarios.length > 0 ? turno.usuarios.map(u => u.nombre).join(', ') : 'Sin usuarios'}
Estado: ${turno.estado}
      `);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* CSS personalizado para FullCalendar */}
      <style>{calendarStyles}</style>
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          ¡Bienvenido a AgaPlan!
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Sistema de gestión de turnos y disponibilidades
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Turnos</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{turnos.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Lugares Activos</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {lugares.filter(l => l.activo !== false).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Turnos Esta Semana</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {getTurnosToShow().length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendario */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Calendario de Turnos
            </h2>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentView('dayGridMonth')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    currentView === 'dayGridMonth'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Mes
                </button>
                                 <button
                   onClick={() => setCurrentView('timeGridWeek')}
                   className={`px-3 py-1 text-sm rounded-md ${
                     currentView === 'timeGridWeek'
                       ? 'bg-blue-600 text-white'
                       : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                   }`}
                 >
                   Semana
                 </button>
                <button
                  onClick={() => setCurrentView('timeGridDay')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    currentView === 'timeGridDay'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Día
                </button>
              </div>
              <button
                onClick={() => setViewAllTurnos(!viewAllTurnos)}
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
        
        <div className="p-6">
          <div className="w-full h-auto min-h-[600px]">
                         <FullCalendar
               plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
               initialView={currentView}
               headerToolbar={{
                 left: 'prev,next today',
                 center: 'title',
                 right: 'dayGridMonth,timeGridWeek,timeGridDay'
               }}
              events={calendarEvents}
              eventClick={handleEventClick}
              height="auto"
              locale="es"
              buttonText={{
                today: 'Hoy',
                month: 'Mes',
                week: 'Semana',
                day: 'Día'
              }}
              dayMaxEvents={true}
              moreLinkClick="popover"
              eventDisplay="block"
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                meridiem: false
              }}
              expandRows={true}
              aspectRatio={1.35}
              firstDay={1}
              weekNumbers={false}
              dayHeaderFormat={{ weekday: 'long' }}
            />
          </div>
        </div>
      </div>

      {/* Leyenda de colores */}
      {lugares.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Leyenda de Lugares
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {lugares.filter(l => l.activo !== false).map((lugar) => (
              <div key={lugar.id} className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: getEventColor(lugar.id) }}
                ></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {lugar.nombre}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
