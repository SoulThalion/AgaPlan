import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { Turno, Lugar, Usuario } from '../types';
import Swal from 'sweetalert2';
import DashboardStats from './dashboard/DashboardStats';
import CalendarHeader from './dashboard/CalendarHeader';
import CalendarNavigation from './dashboard/CalendarNavigation';
import MonthView from './dashboard/MonthView';
import WeekView from './dashboard/WeekView';
import DayView from './dashboard/DayView';
import ListView from './dashboard/ListView';
import ColorLegend from './dashboard/ColorLegend';
import DebugInfo from './dashboard/DebugInfo';
import TurnoModal from './dashboard/TurnoModal';

export default function DashboardOverview() {
  const { user: _user } = useAuth();
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [loading, setLoading] = useState(true);

  const [viewAllTurnos, setViewAllTurnos] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day' | 'list'>('month');
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  // Estado para el modal del turno
  const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null);
  const [showTurnoModal, setShowTurnoModal] = useState(false);
  const [usuariosDisponibles, setUsuariosDisponibles] = useState<Usuario[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);

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
      Swal.fire({
        icon: 'success',
        title: '¡Turno ocupado!',
        text: 'El turno se ha ocupado correctamente',
        confirmButtonText: 'Aceptar'
      });
    },
    onError: (error: any) => {
      console.error('Error ocupando turno:', error);
      const errorMessage = error?.response?.data?.message || 'Error al ocupar el turno';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonText: 'Aceptar'
      });
    }
  });

  const liberarTurnoMutation = useMutation({
    mutationFn: (turnoId: number) => apiService.liberarTurno(turnoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
      Swal.fire({
        icon: 'success',
        title: '¡Turno liberado!',
        text: 'El turno se ha liberado correctamente',
        confirmButtonText: 'Aceptar'
      });
    },
    onError: (error: any) => {
      console.error('Error liberando turno:', error);
      const errorMessage = error?.response?.data?.message || 'Error al liberar el turno';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonText: 'Aceptar'
      });
    }
  });

  const asignarUsuarioMutation = useMutation({
    mutationFn: ({ turnoId, usuarioId }: { turnoId: number; usuarioId: number }) => 
      apiService.asignarUsuarioATurno(turnoId, usuarioId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
      Swal.fire({
        icon: 'success',
        title: '¡Usuario asignado!',
        text: 'El usuario se ha asignado al turno correctamente',
        confirmButtonText: 'Aceptar'
      });
    },
    onError: (error: any) => {
      console.error('Error asignando usuario:', error);
      const errorMessage = error?.response?.data?.message || 'Error al asignar usuario al turno';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonText: 'Aceptar'
      });
    }
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        if (turnosData?.data && lugaresData?.data) {
          console.log('Datos de turnos recibidos:', turnosData.data);
          console.log('Datos de lugares recibidos:', lugaresData.data);
          
          // Relacionar turnos con información completa del lugar
          const turnosConLugares = turnosData.data.map(turno => {
            const lugarCompleto = lugaresData.data!.find(lugar => lugar.id === turno.lugarId);
            console.log(`Relacionando turno ${turno.id} con lugar:`, lugarCompleto?.nombre, 'capacidad:', lugarCompleto?.capacidad);
            return {
              ...turno,
              lugar: lugarCompleto
            };
          });
          console.log('Turnos con lugares:', turnosConLugares);
          setTurnos(turnosConLugares);
          setLugares(lugaresData.data);
        } else if (turnosData?.data) {
          setTurnos(turnosData.data);
        } else if (lugaresData?.data) {
          setLugares(lugaresData.data);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al cargar los datos del dashboard',
          confirmButtonText: 'Aceptar'
        });
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

  const turnoTieneUsuario = (turno: Turno, userId?: number): boolean => {
    if (!userId) return false;
    return !!(turno.usuarios && turno.usuarios.some(usuario => usuario.id === userId));
  };

  // Función para calcular el estado real del turno basado en la capacidad del lugar
  const getTurnoEstado = (turno: Turno) => {
    // Debug: verificar qué información tenemos del lugar
    console.log('Turno:', turno.id, 'Lugar:', turno.lugar?.nombre, 'Capacidad:', turno.lugar?.capacidad);
    
    if (!turno.lugar?.capacidad) {
      console.log('No hay capacidad definida para el turno', turno.id, 'usando estado del backend:', turno.estado);
      // Si no hay capacidad definida, usar el estado del backend
      return turno.estado;
    }
    
    const usuariosAsignados = turno.usuarios?.length || 0;
    const capacidad = turno.lugar.capacidad;
    
    console.log(`Turno ${turno.id}: ${usuariosAsignados}/${capacidad} usuarios`);
    
    if (usuariosAsignados >= capacidad) {
      return 'ocupado';
    } else if (usuariosAsignados > 0) {
      return 'parcialmente_ocupado';
    } else {
      return 'libre';
    }
  };




  // Función para verificar si un turno puede aceptar más usuarios
  const turnoPuedeAceptarUsuarios = (turno: Turno) => {
    if (!turno.lugar?.capacidad) return true; // Si no hay capacidad definida, permitir
    return (turno.usuarios?.length || 0) < turno.lugar.capacidad;
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

  const handleTurnoClick = async (turno: Turno) => {
    setSelectedTurno(turno);
    setShowTurnoModal(true);
    
    // Cargar usuarios disponibles si soy admin o superAdmin
    if (_user?.rol === 'admin' || _user?.rol === 'superAdmin') {
      setLoadingUsuarios(true);
      try {
        const response = await apiService.getUsuarios();
        if (response.data) {
          setUsuariosDisponibles(response.data);
        }
      } catch (error) {
        console.error('Error cargando usuarios:', error);
      } finally {
        setLoadingUsuarios(false);
      }
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
        
        let mensaje = `¿Estás seguro de que quieres asignar a este usuario al turno?<br><br>`;
        mensaje += `<strong>Turno:</strong> ${turno.lugar?.nombre} - ${turno.fecha} ${turno.hora}<br>`;
        
        if (disponibilidad) {
          mensaje += `<br><strong>Disponibilidad del usuario:</strong><br>`;
          mensaje += `Día: ${['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][diaSemana]}<br>`;
          mensaje += `Horario: ${disponibilidad.horaInicio} - ${disponibilidad.horaFin}<br>`;
          
          // Verificar si el turno está dentro de la disponibilidad
          const [horaInicio, horaFin] = turno.hora.split('-');
          if (horaInicio >= disponibilidad.horaInicio && horaFin <= disponibilidad.horaFin) {
            mensaje += `✅ El turno está dentro de la disponibilidad del usuario`;
          } else {
            mensaje += `⚠️ El turno NO está dentro de la disponibilidad del usuario`;
          }
        } else {
          mensaje += `<br>⚠️ El usuario no tiene disponibilidad configurada para este día`;
        }
        
        const result = await Swal.fire({
          title: 'Confirmar asignación',
          html: mensaje,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Sí, asignar',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33'
        });
        
        if (result.isConfirmed) {
          await asignarUsuarioMutation.mutateAsync({ turnoId: turno.id, usuarioId });
        }
      } catch (error) {
        console.error('Error obteniendo disponibilidad:', error);
        // Si no se puede obtener la disponibilidad, asignar de todas formas
        const result = await Swal.fire({
          title: 'Confirmar asignación',
          text: 'No se pudo verificar la disponibilidad del usuario. ¿Deseas asignarlo de todas formas?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, asignar',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33'
        });
        
        if (result.isConfirmed) {
          await asignarUsuarioMutation.mutateAsync({ turnoId: turno.id, usuarioId });
        }
      }
    } catch (error) {
      console.error('Error al asignar usuario:', error);
    }
  };



       // Función para manejar clic en puesto vacío
    const handleClickPuestoVacio = async (turno: Turno) => {
      try {
        // Verificar si ya estoy asignado a este turno
        if (turnoTieneUsuario(turno, _user?.id)) {
          Swal.fire({
            icon: 'info',
            title: 'Ya estás asignado',
            text: 'Ya tienes un puesto en este turno',
            confirmButtonText: 'Entendido'
          });
          return;
        }

        // Verificar si el turno puede aceptar más usuarios
        if (!turnoPuedeAceptarUsuarios(turno)) {
          Swal.fire({
            icon: 'warning',
            title: 'Turno completo',
            text: 'Este turno ya no puede aceptar más usuarios',
            confirmButtonText: 'Entendido'
          });
          return;
        }

        const result = await Swal.fire({
          title: '¿Ocupar puesto?',
          html: `
            <div class="text-left">
              <p class="mb-3">¿Te quieres añadir a este turno?</p>
              <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm">
                <p><strong>Lugar:</strong> ${turno.lugar?.nombre || 'Sin lugar'}</p>
                <p><strong>Fecha:</strong> ${new Date(turno.fecha).toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
                <p><strong>Horario:</strong> ${formatHora(turno.hora)}</p>
                <p><strong>Puestos disponibles:</strong> ${Math.max(0, (turno.lugar?.capacidad || 0) - (turno.usuarios?.length || 0))}</p>
              </div>
            </div>
          `,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Sí, ocupar puesto',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#10B981',
          cancelButtonColor: '#6B7280',
          customClass: {
            popup: 'text-left'
          }
        });
        
        if (result.isConfirmed) {
          await ocuparTurnoMutation.mutateAsync(turno.id);
          setShowTurnoModal(false);
        }
      } catch (error) {
        console.error('Error al ocupar puesto:', error);
      }
    };

    // Función para liberar turno (solo para admins o para liberarse a sí mismo)
    const handleLiberarTurno = async (turno: Turno, usuarioId?: number) => {
      try {
        // Si no soy admin/superAdmin, solo puedo liberarme a mí mismo
        if (!(_user?.rol === 'admin' || _user?.rol === 'superAdmin')) {
          if (usuarioId && usuarioId !== _user?.id) {
            Swal.fire({
              icon: 'error',
              title: 'Acceso denegado',
              text: 'Solo puedes liberarte a ti mismo de un turno',
              confirmButtonText: 'Entendido'
            });
            return;
          }
        }

        const mensaje = usuarioId 
          ? `¿Estás seguro de que quieres remover a este usuario del turno en ${turno.lugar?.nombre}?`
          : `¿Estás seguro de que quieres liberar el turno en ${turno.lugar?.nombre} el ${new Date(turno.fecha).toLocaleDateString('es-ES')} de ${turno.hora}?`;

        const result = await Swal.fire({
          title: usuarioId ? 'Confirmar remoción' : 'Confirmar liberación',
          text: mensaje,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: usuarioId ? 'Sí, remover' : 'Sí, liberar',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6'
        });
        
        if (result.isConfirmed) {
          await liberarTurnoMutation.mutateAsync(turno.id);
        }
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
      <DashboardStats
        turnos={turnos}
        lugares={lugares}
        viewAllTurnos={viewAllTurnos}
        getTurnosDelMes={getTurnosDelMes}
        getTurnosToShow={getTurnosToShow}
        turnoTieneUsuario={turnoTieneUsuario}
        currentUser={_user}
      />

      {/* Calendario Personalizado */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <CalendarHeader
          currentView={currentView}
          setCurrentView={setCurrentView}
          viewAllTurnos={viewAllTurnos}
          setViewAllTurnos={setViewAllTurnos}
        />
        
                <div className="p-6">
          <CalendarNavigation
            currentView={currentView}
            currentDate={currentDate}
            navigateMonth={navigateMonth}
            navigateWeek={navigateWeek}
            navigateDay={navigateDay}
            goToToday={goToToday}
            formatMonthYear={formatMonthYear}
            formatWeekRange={formatWeekRange}
            formatDay={formatDay}
          />

          {/* Vista del Mes */}
          {currentView === 'month' && (
            <MonthView
              calendarDays={calendarDays}
              weekDayNames={weekDayNames}
              expandedDays={expandedDays}
              getTurnosForDate={getTurnosForDate}
              handleTurnoClick={handleTurnoClick}
              toggleDayExpansion={toggleDayExpansion}
              getEventColor={getEventColor}
            />
          )}

          {/* Vista de la Semana */}
          {currentView === 'week' && (
            <WeekView
              weekDays={weekDays}
              weekDayNames={weekDayNames}
              getTurnosForDate={getTurnosForDate}
              handleTurnoClick={handleTurnoClick}
              getEventColor={getEventColor}
            />
          )}

          {/* Vista del Día */}
          {currentView === 'day' && (
            <DayView
              currentDate={currentDate}
              getTurnosForDate={getTurnosForDate}
              handleTurnoClick={handleTurnoClick}
              getEventColor={getEventColor}
              formatDay={formatDay}
            />
          )}

          {/* Vista de Lista */}
          {currentView === 'list' && (
            <ListView
              viewAllTurnos={viewAllTurnos}
              getTurnosToShow={getTurnosToShow}
              handleTurnoClick={handleTurnoClick}
              getEventColor={getEventColor}
            />
          )}
        </div>
      </div>

                           {/* Leyenda de colores */}
        <ColorLegend
          lugares={lugares}
          getEventColor={getEventColor}
        />

               {/* Debug: Información de lugares y turnos */}
        <DebugInfo
          lugares={lugares}
          turnos={turnos}
          getTurnoEstado={getTurnoEstado}
        />

      {/* Modal de Turno */}
      <TurnoModal
        showTurnoModal={showTurnoModal}
        selectedTurno={selectedTurno}
        setShowTurnoModal={setShowTurnoModal}
        _user={_user}
        loadingUsuarios={loadingUsuarios}
        usuariosDisponibles={usuariosDisponibles}
        ocuparTurnoMutation={ocuparTurnoMutation}
        liberarTurnoMutation={liberarTurnoMutation}
        asignarUsuarioMutation={asignarUsuarioMutation}
        handleClickPuestoVacio={handleClickPuestoVacio}
        handleLiberarTurno={handleLiberarTurno}
        handleAsignarUsuario={handleAsignarUsuario}
        formatHora={formatHora}
      />
    </div>
  );
}
