import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { Turno, Lugar } from '../types';

export default function DashboardOverview() {
  const { user: _user } = useAuth();
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewAllTurnos, setViewAllTurnos] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day' | 'list'>('month');
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

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

  const queryClient = useQueryClient();

  // Mutaciones para ocupar y liberar turnos
  const ocuparTurnoMutation = useMutation({
    mutationFn: (turnoId: number) => apiService.ocuparTurno(turnoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
    },
    onError: (error: any) => {
      console.error('Error ocupando turno:', error);
      setError('Error al ocupar el turno');
    }
  });

  const liberarTurnoMutation = useMutation({
    mutationFn: (turnoId: number) => apiService.liberarTurno(turnoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
    },
    onError: (error: any) => {
      console.error('Error liberando turno:', error);
      setError('Error al liberar el turno');
    }
  });

  const asignarUsuarioMutation = useMutation({
    mutationFn: ({ turnoId, usuarioId }: { turnoId: number; usuarioId: number }) => 
      apiService.asignarUsuarioATurno(turnoId, usuarioId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
    },
    onError: (error: any) => {
      console.error('Error asignando usuario:', error);
      setError('Error al asignar usuario al turno');
    }
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

  const getTurnosDelMes = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return turnos.filter(turno => {
      const turnoDate = new Date(turno.fecha);
      return turnoDate >= startOfMonth && turnoDate <= endOfMonth;
    });
  };

  const turnoTieneUsuario = (turno: Turno, userId?: number) => {
    if (!userId) return false;
    return turno.usuarios && turno.usuarios.some(usuario => usuario.id === userId);
  };

  const getTurnosForDate = (date: Date) => {
    // Crear una fecha local sin zona horaria para comparar correctamente
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    // Formatear la fecha como YYYY-MM-DD para comparar con turno.fecha
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Usar getTurnosToShow() en lugar de turnos para respetar el filtro de semana
    return getTurnosToShow().filter(turno => turno.fecha === dateString);
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

  const toggleDayExpansion = (dateString: string) => {
    console.log('toggleDayExpansion ejecutada con:', dateString);
    console.log('Estado actual expandedDays:', Array.from(expandedDays));
    
    const newExpandedDays = new Set(expandedDays);
    if (newExpandedDays.has(dateString)) {
      newExpandedDays.delete(dateString);
      console.log('Día contraído:', dateString);
    } else {
      newExpandedDays.add(dateString);
      console.log('Día expandido:', dateString);
    }
    
    console.log('Nuevo estado expandedDays:', Array.from(newExpandedDays));
    setExpandedDays(newExpandedDays);
  };

  // Funciones para el calendario personalizado - Vista Mensual
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Ajustar para que la semana empiece en lunes (1) en lugar de domingo (0)
    // Si el primer día del mes es domingo (0), ajustar a 6 (sábado anterior)
    // Si es lunes (1), ajustar a 0 (lunes mismo)
    // Si es martes (2), ajustar a 1 (lunes anterior)
    // etc.
    const adjustedStartingDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    
    return { daysInMonth, startingDayOfWeek: adjustedStartingDay };
  };

  const getCalendarDays = (date: Date) => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(date);
    const days = [];
    
    // Agregar días del mes anterior para completar la primera semana
    const prevMonth = new Date(date.getFullYear(), date.getMonth() - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();
    
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      days.push({
        date: new Date(date.getFullYear(), date.getMonth() - 1, day),
        isCurrentMonth: false,
        isToday: false
      });
    }
    
    // Agregar días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(date.getFullYear(), date.getMonth(), day);
      const today = new Date();
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        isToday: currentDate.toDateString() === today.toDateString()
      });
    }
    
    // Agregar días del mes siguiente para completar la última semana
    const remainingDays = 42 - days.length; // 6 semanas * 7 días = 42
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(date.getFullYear(), date.getMonth() + 1, day),
        isCurrentMonth: false,
        isToday: false
      });
    }
    
    return days;
  };

  // Funciones para la vista semanal
  const getWeekDays = (date: Date) => {
    const days = [];
    const startOfWeek = new Date(date);
    
    // Obtener el día de la semana (0 = domingo, 1 = lunes, ..., 6 = sábado)
    const dayOfWeek = date.getDay();
    
    // Calcular cuántos días retroceder para llegar al lunes
    // Si es domingo (0), retroceder 6 días; si es lunes (1), no retroceder; etc.
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    // Establecer la fecha al lunes de la semana actual
    startOfWeek.setDate(date.getDate() - daysToSubtract);
    
    // Generar los 7 días de la semana empezando por el lunes
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    
    return days;
  };



  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setDate(prev.getDate() - 7);
      } else {
        newDate.setDate(prev.getDate() + 7);
      }
      return newDate;
    });
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setDate(prev.getDate() - 1);
      } else {
        newDate.setDate(prev.getDate() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const formatWeekRange = (date: Date) => {
    const weekDays = getWeekDays(date);
    const start = weekDays[0];
    const end = weekDays[6];
    
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()} - ${end.getDate()} ${start.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`;
    } else if (start.getFullYear() === end.getFullYear()) {
      return `${start.getDate()} ${start.toLocaleDateString('es-ES', { month: 'short' })} - ${end.getDate()} ${end.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}`;
    } else {
      return `${start.getDate()} ${start.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })} - ${end.getDate()} ${end.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}`;
    }
  };

  const formatDay = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const handleTurnoClick = (turno: Turno) => {
    alert(`
Turno #${turno.id}
Fecha: ${new Date(turno.fecha).toLocaleDateString('es-ES')}
Horario: ${formatHora(turno.hora)}
Lugar: ${turno.lugar?.nombre || 'Sin lugar'}
Usuarios: ${turno.usuarios && turno.usuarios.length > 0 ? turno.usuarios.map(u => u.nombre).join(', ') : 'Sin usuarios'}
Estado: ${turno.estado}
    `);
  };

  const handleOcuparTurno = async (turno: Turno) => {
    try {
      // Si soy admin o superAdmin, puedo ocupar cualquier turno
      if (_user?.rol === 'admin' || _user?.rol === 'superAdmin') {
        await ocuparTurnoMutation.mutateAsync(turno.id);
      } else {
        // Si soy usuario normal, verificar disponibilidad
        await ocuparTurnoMutation.mutateAsync(turno.id);
      }
    } catch (error) {
      console.error('Error al ocupar turno:', error);
    }
  };

  const handleAsignarUsuario = async (turno: Turno, usuarioId: number) => {
    try {
      // Si me estoy asignando a mí mismo, no verificar disponibilidad
      if (usuarioId === _user?.id) {
        await asignarUsuarioMutation.mutateAsync({ turnoId: turno.id, usuarioId });
        return;
      }

      // Si estoy asignando a otro usuario, verificar disponibilidad y mostrar confirmación
      try {
        const disponibilidadResponse = await apiService.getDisponibilidadesByUsuario(usuarioId);
        const disponibilidades = disponibilidadResponse.data;
        
        // Buscar disponibilidad para el día del turno
        const diaSemana = new Date(turno.fecha).getDay();
        const disponibilidad = disponibilidades?.find(d => d.diaSemana === diaSemana);
        
        let mensaje = `¿Estás seguro de que quieres asignar a este usuario al turno?\n\n`;
        mensaje += `Turno: ${turno.lugar?.nombre} - ${turno.fecha} ${turno.hora}\n`;
        
        if (disponibilidad) {
          mensaje += `\nDisponibilidad del usuario:\n`;
          mensaje += `Día: ${['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][diaSemana]}\n`;
          mensaje += `Horario: ${disponibilidad.horaInicio} - ${disponibilidad.horaFin}\n`;
          
          // Verificar si el turno está dentro de la disponibilidad
          const [horaInicio, horaFin] = turno.hora.split('-');
          if (horaInicio >= disponibilidad.horaInicio && horaFin <= disponibilidad.horaFin) {
            mensaje += `✅ El turno está dentro de la disponibilidad del usuario`;
          } else {
            mensaje += `⚠️ El turno NO está dentro de la disponibilidad del usuario`;
          }
        } else {
          mensaje += `\n⚠️ El usuario no tiene disponibilidad configurada para este día`;
        }
        
        if (confirm(mensaje)) {
          await asignarUsuarioMutation.mutateAsync({ turnoId: turno.id, usuarioId });
        }
      } catch (error) {
        console.error('Error obteniendo disponibilidad:', error);
        // Si no se puede obtener la disponibilidad, asignar de todas formas
        if (confirm('No se pudo verificar la disponibilidad del usuario. ¿Deseas asignarlo de todas formas?')) {
          await asignarUsuarioMutation.mutateAsync({ turnoId: turno.id, usuarioId });
        }
      }
    } catch (error) {
      console.error('Error al asignar usuario:', error);
    }
  };

  const handleLiberarTurno = async (turno: Turno) => {
    try {
      await liberarTurnoMutation.mutateAsync(turno.id);
    } catch (error) {
      console.error('Error al liberar turno:', error);
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

  const calendarDays = getCalendarDays(currentDate);
  const weekDays = getWeekDays(currentDate);
  const weekDayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  return (
    <div className="space-y-6">
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
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {viewAllTurnos ? 'Mis Turnos del Mes' : 'Mis Turnos Esta Semana'}
                </p>
                                 <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                   {viewAllTurnos 
                     ? getTurnosDelMes().filter(turno => turnoTieneUsuario(turno, _user?.id)).length
                     : getTurnosToShow().filter(turno => turnoTieneUsuario(turno, _user?.id)).length
                   }
                 </p>
              </div>
            </div>
          </div>
      </div>

      {/* Calendario Personalizado */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Calendario de Turnos
            </h2>
            <div className="flex items-center space-x-4">
                             {/* Selector de vista */}
               <div className="flex space-x-2">
                 <button
                   onClick={() => setCurrentView('month')}
                   className={`px-3 py-1 text-sm rounded-md ${
                     currentView === 'month'
                       ? 'bg-blue-600 text-white'
                       : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                   }`}
                 >
                   Mes
                 </button>
                 <button
                   onClick={() => setCurrentView('week')}
                   className={`px-3 py-1 text-sm rounded-md ${
                     currentView === 'week'
                       ? 'bg-blue-600 text-white'
                       : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                   }`}
                 >
                   Semana
                 </button>
                 <button
                   onClick={() => setCurrentView('day')}
                   className={`px-3 py-1 text-sm rounded-md ${
                     currentView === 'day'
                       ? 'bg-blue-600 text-white'
                       : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                   }`}
                 >
                   Día
                 </button>
                 <button
                   onClick={() => setCurrentView('list')}
                   className={`px-3 py-1 text-sm rounded-md ${
                     currentView === 'list'
                       ? 'bg-blue-600 text-white'
                       : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                   }`}
                 >
                   Lista
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
          {/* Navegación del calendario */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => {
                if (currentView === 'month') navigateMonth('prev');
                else if (currentView === 'week') navigateWeek('prev');
                else if (currentView === 'day') navigateDay('prev');
              }}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
              {currentView === 'month' ? formatMonthYear(currentDate) : 
               currentView === 'week' ? formatWeekRange(currentDate) :
               currentView === 'day' ? formatDay(currentDate) :
               'Lista de Turnos'}
            </h3>
            
            <div className="flex space-x-2">
              <button
                onClick={goToToday}
                className="px-3 py-1 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                Hoy
              </button>
                             <button
                 onClick={() => {
                   if (currentView === 'month') navigateMonth('next');
                   else if (currentView === 'week') navigateWeek('next');
                   else if (currentView === 'day') navigateDay('next');
                 }}
                 className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                 </svg>
               </button>
            </div>
          </div>

          {/* Vista del Mes */}
          {currentView === 'month' && (
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
                                  className="text-xs p-1 rounded text-white font-medium truncate relative group"
                                  style={{ backgroundColor: getEventColor(turno.lugarId) }}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="truncate">
                                      {turno.lugar?.nombre || 'Sin lugar'} ({turno.hora})
                                    </span>
                                    <div className="flex space-x-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      {turno.estado === 'libre' ? (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOcuparTurno(turno);
                                          }}
                                          disabled={ocuparTurnoMutation.isPending}
                                          className="w-4 h-4 bg-green-700 hover:bg-green-800 disabled:bg-green-500 rounded text-white text-xs flex items-center justify-center"
                                          title="Ocupar turno"
                                        >
                                          +
                                        </button>
                                      ) : (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleLiberarTurno(turno);
                                          }}
                                          disabled={liberarTurnoMutation.isPending}
                                          className="w-4 h-4 bg-red-700 hover:bg-red-800 disabled:bg-red-500 rounded text-white text-xs flex items-center justify-center"
                                          title="Liberar turno"
                                        >
                                          -
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleTurnoClick(turno)}
                                        className="w-4 h-4 bg-blue-700 hover:bg-blue-800 rounded text-white text-xs flex items-center justify-center"
                                        title="Ver detalles"
                                      >
                                          i
                                      </button>
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
          )}

          {/* Vista de la Semana */}
          {currentView === 'week' && (
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
                                  className="absolute left-1 right-1 text-xs p-1 rounded text-white font-medium truncate z-10 group"
                                  style={{ 
                                    backgroundColor: getEventColor(turno.lugarId),
                                    top: `${turnoIndex * 20 + 2}px`,
                                    height: `${Math.max(duracionHoras * 64 - 4, 20)}px`, // 64px por hora, menos 4px de padding
                                    minHeight: '20px'
                                  }}
                                >
                                  <div className="flex items-center justify-between h-full">
                                    <span className="truncate flex-1">
                                      {turno.lugar?.nombre || 'Sin lugar'}
                                    </span>
                                    <div className="flex space-x-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      {turno.estado === 'libre' ? (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOcuparTurno(turno);
                                          }}
                                          disabled={ocuparTurnoMutation.isPending}
                                          className="w-4 h-4 bg-green-700 hover:bg-green-800 disabled:bg-green-500 rounded text-white text-xs flex items-center justify-center"
                                          title="Ocupar turno"
                                        >
                                          +
                                        </button>
                                      ) : (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleLiberarTurno(turno);
                                          }}
                                          disabled={liberarTurnoMutation.isPending}
                                          className="w-4 h-4 bg-red-700 hover:bg-red-800 disabled:bg-red-500 rounded text-white text-xs flex items-center justify-center"
                                          title="Liberar turno"
                                        >
                                          -
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleTurnoClick(turno)}
                                        className="w-4 h-4 bg-blue-700 hover:bg-blue-800 rounded text-white text-xs flex items-center justify-center"
                                        title="Ver detalles"
                                      >
                                          i
                                      </button>
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
          )}

          {/* Vista del Día */}
          {currentView === 'day' && (
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

                              // Calcular el ancho del turno basado en cuántos turnos hay en esta hora
                              const totalTurnos = turnosEnEstaHora.length;
                              const turnoWidth = totalTurnos > 1 ? `calc((100% - ${(totalTurnos - 1) * 8}px) / ${totalTurnos})` : '100%';

                              return (
                                <div
                                  key={turno.id}
                                  className="p-3 rounded-lg text-white font-medium z-10 flex-shrink-0 group"
                                  style={{ 
                                    backgroundColor: getEventColor(turno.lugarId),
                                    height: `${Math.max(duracionHoras * 64 - 4, 20)}px`, // 64px por hora, menos 4px de padding
                                    minHeight: '20px',
                                    width: turnoWidth
                                  }}
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
                                    
                                    {/* Botones de acción */}
                                    <div className="flex space-x-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      {turno.estado === 'libre' ? (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOcuparTurno(turno);
                                          }}
                                          disabled={ocuparTurnoMutation.isPending}
                                          className="w-5 h-5 bg-green-700 hover:bg-green-800 disabled:bg-green-500 rounded text-white text-xs flex items-center justify-center"
                                          title="Ocupar turno"
                                        >
                                          +
                                        </button>
                                      ) : (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleLiberarTurno(turno);
                                          }}
                                          disabled={liberarTurnoMutation.isPending}
                                          className="w-5 h-5 bg-red-700 hover:bg-red-800 disabled:bg-red-500 rounded text-white text-xs flex items-center justify-center"
                                          title="Liberar turno"
                                        >
                                          -
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleTurnoClick(turno)}
                                        className="w-5 h-5 bg-blue-700 hover:bg-blue-800 rounded text-white text-xs flex items-center justify-center"
                                        title="Ver detalles"
                                      >
                                          i
                                      </button>
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
          )}

          {/* Vista de Lista */}
          {currentView === 'list' && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              {/* Encabezado de la lista */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 border-b border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Lista de Turnos
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {viewAllTurnos ? 'Todos los turnos' : 'Turnos de esta semana'}
                </p>
              </div>

              {/* Lista de turnos */}
              <div className="p-4">
                {getTurnosToShow().length > 0 ? (
                  <div className="space-y-3">
                    {getTurnosToShow()
                      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
                      .map((turno) => (
                        <div
                          key={turno.id}
                          className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <div
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: getEventColor(turno.lugarId) }}
                                ></div>
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {turno.lugar?.nombre || 'Sin lugar'}
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {new Date(turno.fecha).toLocaleDateString('es-ES')} • {turno.hora}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="text-right mr-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {turno.usuarios && turno.usuarios.length > 0 
                                    ? turno.usuarios.map(u => u.nombre).join(', ')
                                    : 'Sin usuarios'
                                  }
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {turno.estado}
                                </div>
                              </div>
                              
                                                             {/* Botones de acción */}
                               <div className="flex space-x-2">
                                 {turno.estado === 'libre' ? (
                                   <button
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       handleOcuparTurno(turno);
                                     }}
                                     disabled={ocuparTurnoMutation.isPending}
                                     className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-xs rounded-md transition-colors"
                                   >
                                     {ocuparTurnoMutation.isPending ? 'Ocupando...' : 'Ocupar'}
                                   </button>
                                 ) : (
                                   <button
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       handleLiberarTurno(turno);
                                     }}
                                     disabled={liberarTurnoMutation.isPending}
                                     className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-xs rounded-md transition-colors"
                                   >
                                     {liberarTurnoMutation.isPending ? 'Liberando...' : 'Liberar'}
                                   </button>
                                 )}
                                 
                                 {/* Botón para asignar usuarios (solo para admins) */}
                                 {(_user?.rol === 'admin' || _user?.rol === 'superAdmin') && (
                                   <button
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       // Por ahora asignar al usuario actual, pero esto se puede expandir
                                       handleAsignarUsuario(turno, _user.id);
                                     }}
                                     disabled={asignarUsuarioMutation.isPending}
                                     className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-xs rounded-md transition-colors"
                                   >
                                     {asignarUsuarioMutation.isPending ? 'Asignando...' : 'Asignar'}
                                   </button>
                                 )}
                                 
                                 <button
                                   onClick={() => handleTurnoClick(turno)}
                                   className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md transition-colors"
                                 >
                                   Ver
                                 </button>
                               </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No hay turnos para mostrar
                  </div>
                )}
              </div>
            </div>
          )}
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
