import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { Turno, Lugar, Usuario } from '../types';
import Swal from 'sweetalert2';
import DashboardStats from './dashboard/DashboardStats';
import CalendarHeader from './dashboard/CalendarHeader';

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

  // Función para obtener el texto del estado
  const getEstadoText = (estado: string) => {
    switch (estado) {
      case 'libre':
        return 'Libre';
      case 'parcialmente_ocupado':
        return 'Parcialmente Ocupado';
      case 'ocupado':
        return 'Ocupado';
      default:
        return estado;
    }
  };

  // Función para obtener el color del estado
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'libre':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'parcialmente_ocupado':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'ocupado':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
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
                                  onClick={() => handleTurnoClick(turno)}
                                  className="p-3 rounded-lg text-white font-medium z-10 flex-shrink-0 cursor-pointer hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
                                  style={{ 
                                    backgroundColor: getEventColor(turno.lugarId),
                                    height: `${Math.max(duracionHoras * 64 - 4, 20)}px`, // 64px por hora, menos 4px de padding
                                    minHeight: '20px',
                                    width: turnoWidth
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
                                    
                                                                         {/* Indicador de estado */}
                                     <div className="mt-2 text-right">
                                       <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(getTurnoEstado(turno))}`}>
                                         {getEstadoText(getTurnoEstado(turno))}
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
                              
                                                             {/* Indicador de estado y botón ver */}
                               <div className="flex items-center space-x-3">
                                                                   <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(getTurnoEstado(turno))}`}>
                                    {getEstadoText(getTurnoEstado(turno))}
                                  </span>
                                 
                                 <button
                                   onClick={() => handleTurnoClick(turno)}
                                   className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md transition-colors"
                                 >
                                   Ver Detalles
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

       {/* Debug: Información de lugares y turnos */}
       <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
         <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
           Debug: Información del Sistema
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
             <h4 className="font-medium text-gray-900 dark:text-white mb-2">Lugares ({lugares.length})</h4>
             <div className="space-y-2">
               {lugares.map(lugar => (
                 <div key={lugar.id} className="text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                   <strong>{lugar.nombre}</strong> - Capacidad: {lugar.capacidad || 'No definida'} - Activo: {lugar.activo ? 'Sí' : 'No'}
                 </div>
               ))}
             </div>
           </div>
           <div>
             <h4 className="font-medium text-gray-900 dark:text-white mb-2">Turnos ({turnos.length})</h4>
             <div className="space-y-2">
               {turnos.slice(0, 5).map(turno => (
                 <div key={turno.id} className="text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                   <strong>Turno {turno.id}</strong> - Lugar: {turno.lugar?.nombre || 'Sin lugar'} - Capacidad: {turno.lugar?.capacidad || 'No definida'} - Estado: {getTurnoEstado(turno)}
                 </div>
               ))}
               {turnos.length > 5 && (
                 <div className="text-sm text-gray-500">... y {turnos.length - 5} más</div>
               )}
             </div>
           </div>
         </div>
       </div>

      {/* Modal de Turno */}
      {showTurnoModal && selectedTurno && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowTurnoModal(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
                         {/* Header del modal */}
             <div className="p-6 border-b border-gray-200 dark:border-gray-700">
               <div className="flex items-center justify-between">
                 <div>
                   <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                     Detalles del Turno #{selectedTurno.id}
                   </h3>
                   <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                     <p className="text-xs text-blue-700 dark:text-blue-300">
                       💡 <strong>Sistema de Estados:</strong> Libre (0 usuarios) → Parcialmente Ocupado (1+ usuarios) → Ocupado (capacidad máxima alcanzada)
                     </p>
                   </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Fecha:</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedTurno.fecha).toLocaleDateString('es-ES', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Horario:</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatHora(selectedTurno.hora)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Lugar:</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedTurno.lugar?.nombre || 'Sin lugar'}
                      </p>
                    </div>
                                         <div>
                       <p className="text-gray-600 dark:text-gray-400">Estado:</p>
                       <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getEstadoColor(getTurnoEstado(selectedTurno))}`}>
                         {getEstadoText(getTurnoEstado(selectedTurno))}
                       </span>
                     </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowTurnoModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenido del modal */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Información del lugar */}
              {selectedTurno.lugar && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Información del Lugar
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Dirección:</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedTurno.lugar.direccion}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Capacidad:</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedTurno.lugar.capacidad || 'No especificada'}
                      </p>
                    </div>
                    {selectedTurno.lugar.descripcion && (
                      <div className="col-span-2">
                        <p className="text-gray-600 dark:text-gray-400">Descripción:</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {selectedTurno.lugar.descripcion}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

                             {/* Usuarios asignados y puestos disponibles */}
               <div className="mb-6">
                 <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                   Ocupación del Turno ({selectedTurno.usuarios?.length || 0}/{selectedTurno.lugar?.capacidad || '∞'})
                 </h4>
                 
                 {/* Grid de usuarios y puestos vacíos */}
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                   {/* Usuarios ya asignados */}
                   {selectedTurno.usuarios && selectedTurno.usuarios.map((usuario) => (
                     <div key={usuario.id} className="relative group">
                       <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-2 border-blue-300 dark:border-blue-600 rounded-lg text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                         <div className="w-12 h-12 bg-gradient-to-br from-blue-200 to-blue-300 dark:from-blue-700 dark:to-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                           <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                             {usuario.nombre.charAt(0).toUpperCase()}
                           </span>
                         </div>
                         <p className="font-medium text-blue-900 dark:text-blue-100 text-sm truncate">{usuario.nombre}</p>
                         <p className="text-xs text-blue-700 dark:text-blue-300 truncate">{usuario.cargo}</p>
                         
                                                   {/* Botón de remover (solo para admins o para removerte a ti mismo) */}
                          {(_user?.rol === 'admin' || _user?.rol === 'superAdmin' || usuario.id === _user?.id) && (
                            <button
                              onClick={() => handleLiberarTurno(selectedTurno, usuario.id)}
                              disabled={liberarTurnoMutation.isPending}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
                              title={usuario.id === _user?.id ? "Removerte a ti mismo" : "Remover usuario"}
                            >
                              ×
                            </button>
                          )}
                       </div>
                     </div>
                   ))}
                   
                   {/* Puestos vacíos */}
                   {selectedTurno.lugar?.capacidad && Array.from({ length: Math.max(0, selectedTurno.lugar.capacidad - (selectedTurno.usuarios?.length || 0)) }, (_, index) => (
                     <div key={`vacante-${index}`} className="group">
                       <button
                         onClick={() => handleClickPuestoVacio(selectedTurno)}
                         disabled={ocuparTurnoMutation.isPending}
                         className="w-full p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center hover:border-green-400 dark:hover:border-green-500 hover:from-green-50 hover:to-green-100 dark:hover:from-green-900/20 dark:hover:to-green-800/20 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:shadow-lg"
                         title="Haz clic para ocupar este puesto"
                       >
                         <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:from-green-200 group-hover:to-green-300 dark:group-hover:from-green-800 dark:group-hover:to-green-700 transition-all duration-300">
                           <svg className="w-6 h-6 text-gray-500 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                           </svg>
                         </div>
                         <p className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-green-700 dark:group-hover:text-green-300 transition-all duration-300">
                           Puesto Libre
                         </p>
                         <p className="text-xs text-gray-400 dark:text-gray-500 group-hover:text-green-500 dark:group-hover:text-green-400 transition-all duration-300 mt-1">
                           Haz clic para ocupar
                         </p>
                       </button>
                     </div>
                   ))}
                   
                   {/* Indicador cuando no hay puestos disponibles */}
                   {selectedTurno.lugar?.capacidad && (selectedTurno.usuarios?.length || 0) >= selectedTurno.lugar.capacidad && (
                     <div className="col-span-full">
                       <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-center">
                         <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-2">
                           <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                           </svg>
                         </div>
                         <p className="text-sm font-medium text-red-700 dark:text-red-300">
                           Turno Completo
                         </p>
                         <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                           No hay puestos disponibles
                         </p>
                       </div>
                     </div>
                   )}
                 </div>
                 
                                    {/* Mensaje cuando no hay capacidad definida */}
                   {!selectedTurno.lugar?.capacidad && (
                     <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                       <p>Este lugar no tiene capacidad definida</p>
                     </div>
                   )}
                   
                   {/* Mensaje cuando no hay usuarios asignados */}
                   {selectedTurno.lugar?.capacidad && (!selectedTurno.usuarios || selectedTurno.usuarios.length === 0) && (
                     <div className="col-span-full">
                       <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-center">
                         <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-2">
                           <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                         </div>
                         <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                           Turno Vacío
                         </p>
                         <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                           Haz clic en un puesto libre para ocuparlo
                         </p>
                       </div>
                     </div>
                   )}
               </div>

              {/* Asignar usuarios (solo para admins) */}
              {(_user?.rol === 'admin' || _user?.rol === 'superAdmin') && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Asignar Usuario
                  </h4>
                  {loadingUsuarios ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Cargando usuarios...</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {usuariosDisponibles
                        .filter(usuario => !selectedTurno.usuarios?.some(u => u.id === usuario.id))
                        .map((usuario) => (
                          <div key={usuario.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                  {usuario.nombre.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{usuario.nombre}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{usuario.cargo}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                handleAsignarUsuario(selectedTurno, usuario.id);
                                setShowTurnoModal(false);
                              }}
                              disabled={asignarUsuarioMutation.isPending}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs rounded-md"
                            >
                              {asignarUsuarioMutation.isPending ? 'Asignando...' : 'Asignar'}
                            </button>
                          </div>
                        ))}
                      {usuariosDisponibles.filter(usuario => !selectedTurno.usuarios?.some(u => u.id === usuario.id)).length === 0 && (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                          <p>No hay usuarios disponibles para asignar</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

                             {/* Puestos disponibles */}
               {selectedTurno.lugar?.capacidad && (
                 <div className="mb-6">
                   <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                     Puestos Disponibles
                   </h4>
                   <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                     <div className="grid grid-cols-2 gap-4">
                       <div>
                         <p className="text-sm text-gray-600 dark:text-gray-400">
                           Capacidad total del lugar: <span className="font-medium">{selectedTurno.lugar.capacidad}</span>
                         </p>
                         <p className="text-sm text-gray-600 dark:text-gray-400">
                           Usuarios asignados: <span className="font-medium">{selectedTurno.usuarios?.length || 0}</span>
                         </p>
                         <p className="text-sm text-gray-600 dark:text-gray-400">
                           Puestos libres: <span className="font-medium">{Math.max(0, selectedTurno.lugar.capacidad - (selectedTurno.usuarios?.length || 0))}</span>
                         </p>
                       </div>
                       <div className="text-right">
                         <div className={`inline-flex items-center px-3 py-2 rounded-lg text-lg font-bold ${getEstadoColor(getTurnoEstado(selectedTurno))}`}>
                           {getEstadoText(getTurnoEstado(selectedTurno))}
                         </div>
                         <div className="mt-2">
                           <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                             <div 
                               className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                               style={{ 
                                 width: `${Math.min(100, ((selectedTurno.usuarios?.length || 0) / selectedTurno.lugar.capacidad) * 100)}%` 
                               }}
                             ></div>
                           </div>
                           <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                             {Math.round(((selectedTurno.usuarios?.length || 0) / selectedTurno.lugar.capacidad) * 100)}% ocupado
                           </p>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
               )}
            </div>

            {/* Footer del modal */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowTurnoModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cerrar
                </button>
                
                                 {/* Botones de acción según el estado real del turno */}
                 {getTurnoEstado(selectedTurno) === 'ocupado' ? (
                   <button
                     onClick={() => {
                       handleLiberarTurno(selectedTurno);
                       setShowTurnoModal(false);
                     }}
                     disabled={liberarTurnoMutation.isPending}
                     className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                   >
                     {liberarTurnoMutation.isPending ? 'Liberando...' : 'Liberar Turno'}
                   </button>
                                   ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
