import React, { useState, useEffect } from 'react';
import { Calendar, Views, type View, type Event as CalendarEvent } from 'react-big-calendar';
import { dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import type { Turno, Lugar } from '../types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const localizer = dateFnsLocalizer({
  format,
  parse: parseISO,
  startOfWeek: (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    return start;
  },
  getDay: (date: Date) => date.getDay(),
  locales: { es }
});

const DashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewAllTurnos, setViewAllTurnos] = useState(false);
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [turnosResponse, lugaresResponse] = await Promise.all([
        apiService.getTurnos(),
        apiService.getLugares()
      ]);

      if (turnosResponse.success) {
        setTurnos(turnosResponse.data || []);
      }
      if (lugaresResponse.success) {
        setLugares(lugaresResponse.data || []);
      }
    } catch (err) {
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const getTurnosToShow = () => {
    if (viewAllTurnos && (user?.rol === 'admin' || user?.rol === 'superAdmin')) {
      return turnos;
    }
    return turnos.filter(turno => turno.usuarioId === user?.id);
  };

  const getEventStyle = (event: any) => {
    const baseStyle = {
      borderRadius: '8px',
      border: 'none',
      padding: '4px 8px',
      fontSize: '12px',
      fontWeight: '500',
      fontFamily: 'Poppins, sans-serif'
    };

    if (event.usuarioId) {
      return {
        ...baseStyle,
        backgroundColor: '#EF4444',
        color: 'white'
      };
    } else {
      return {
        ...baseStyle,
        backgroundColor: '#6CC070',
        color: 'white'
      };
    }
  };

  const calendarEvents: CalendarEvent[] = getTurnosToShow().map(turno => ({
    id: turno.id,
    title: `${turno.lugar?.nombre || 'Lugar desconocido'} - ${turno.usuario?.nombre || 'Disponible'}`,
    start: new Date(`${turno.fecha}T${turno.horaInicio}`),
    end: new Date(`${turno.fecha}T${turno.horaFin}`),
    resource: turno
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral dark:bg-neutral-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral-text dark:text-white font-roboto">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Dashboard Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl font-bold font-poppins text-neutral-text dark:text-white">
              Vista General
            </h2>
            <p className="text-gray-600 dark:text-gray-300 font-roboto">
              Gestiona tus turnos y disponibilidad
            </p>
          </div>

          {/* Controles del dashboard */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            {/* Toggle para ver todos los turnos (solo admin/superadmin) */}
            {(user?.rol === 'admin' || user?.rol === 'superAdmin') && (
              <div className="flex items-center space-x-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={viewAllTurnos}
                    onChange={(e) => setViewAllTurnos(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    viewAllTurnos ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                  }`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      viewAllTurnos ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </div>
                  <span className="ml-3 text-sm font-medium font-roboto text-neutral-text dark:text-white">
                    Ver todos los turnos
                  </span>
                </label>
              </div>
            )}

            {/* Selector de vista del calendario */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium font-roboto text-neutral-text dark:text-white">
                Vista:
              </label>
              <select
                value={currentView}
                onChange={(e) => setCurrentView(e.target.value as any)}
                className="input-field text-sm px-3 py-2 w-auto"
              >
                <option value={Views.MONTH}>Mes</option>
                <option value={Views.WEEK}>Semana</option>
                <option value={Views.DAY}>Día</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-primary-light rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium font-roboto text-gray-500 dark:text-gray-400">
                Total Turnos
              </p>
              <p className="text-2xl font-bold font-poppins text-neutral-text dark:text-white">
                {turnos.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-success-light rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium font-roboto text-gray-500 dark:text-gray-400">
                Disponibles
              </p>
              <p className="text-2xl font-bold font-poppins text-neutral-text dark:text-white">
                {turnos.filter(t => !t.usuarioId).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium font-roboto text-gray-500 dark:text-gray-400">
                Mis Turnos
              </p>
              <p className="text-2xl font-bold font-poppins text-neutral-text dark:text-white">
                {turnos.filter(t => t.usuarioId === user?.id).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium font-roboto text-gray-500 dark:text-gray-400">
                Lugares
              </p>
              <p className="text-2xl font-bold font-poppins text-neutral-text dark:text-white">
                {lugares.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendario */}
      <div className="card">
        <div className="calendar-container">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            view={currentView}
            onView={setCurrentView}
            style={{ height: 600 }}
            eventPropGetter={() => ({})}
            components={{
              event: (props) => (
                <div style={getEventStyle(props.event)}>
                  {props.title}
                </div>
              )
            }}
            messages={{
              next: "Siguiente",
              previous: "Anterior",
              today: "Hoy",
              month: "Mes",
              week: "Semana",
              day: "Día",
              agenda: "Agenda",
              date: "Fecha",
              time: "Hora",
              event: "Evento",
              noEventsInRange: "No hay turnos en este rango de fechas."
            }}
            className="dark:text-white"
          />
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg font-roboto text-sm animate-slide-up">
          {error}
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;
