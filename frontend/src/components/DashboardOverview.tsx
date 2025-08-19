import { useState, useEffect, useCallback } from 'react';
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
import ThemeToggle from './ThemeToggle';
import { generateTurnosPDF, generateMyTurnosPDF, generateWeekTurnosPDF, type TurnoForPDF } from '../utils/pdfGenerator';

export default function DashboardOverview() {
  const { user: _user } = useAuth();
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [loading, setLoading] = useState(true);
  const [turnosKey, setTurnosKey] = useState(0); // Key para forzar re-render

  const [viewAllTurnos, setViewAllTurnos] = useState(true);
  const [viewMyTurnos, setViewMyTurnos] = useState(false);
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

  // Función para obtener turnos con lugares relacionados
  const getTurnosConLugares = (): Turno[] => {
    if (!turnosData?.data || !lugares.length) return [];
    
    return turnosData.data.map(turno => {
      const lugarCompleto = lugares.find(lugar => lugar.id === turno.lugarId);
      return {
        ...turno,
        lugar: lugarCompleto
      };
    });
  };

  // Obtener turnos procesados
  const turnos = getTurnosConLugares();

  // Función para actualizar el selectedTurno con datos frescos
  const updateSelectedTurno = useCallback(() => {
    if (selectedTurno && turnos.length > 0) {
      const turnoActualizado = turnos.find(t => t.id === selectedTurno.id);
      if (turnoActualizado && JSON.stringify(turnoActualizado) !== JSON.stringify(selectedTurno)) {
        setSelectedTurno(turnoActualizado);
      }
    }
  }, [selectedTurno, turnos]);

  // Mutaciones para ocupar y liberar turnos
  const ocuparTurnoMutation = useMutation({
    mutationFn: (turnoId: number) => apiService.ocuparTurno(turnoId),
    onSuccess: () => {
      console.log('✅ Turno ocupado exitosamente, invalidando queries...');
      // Invalidar la query de turnos para traer datos frescos
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
      // Invalidar todas las queries de participación mensual actual para actualizar la información
      queryClient.invalidateQueries({ queryKey: ['participacionMensualActual'] });
      // Actualizar selectedTurno después de invalidar la query
      setTimeout(() => updateSelectedTurno(), 100);
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
    mutationFn: (params: number | { turnoId: number; usuarioId: number }) => {
      if (typeof params === 'number') {
        // Liberar todo el turno
        return apiService.liberarTurno(params);
      } else {
        // Liberar un usuario específico
        return apiService.liberarTurno(params.turnoId, params.usuarioId);
      }
    },
    onSuccess: () => {
      console.log('✅ Usuario removido exitosamente, invalidando queries...');
      // Invalidar la query de turnos para traer datos frescos
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
      // Invalidar todas las queries de participación mensual actual para actualizar la información
      queryClient.invalidateQueries({ queryKey: ['participacionMensualActual'] });
      // Actualizar selectedTurno después de invalidar la query
      setTimeout(() => updateSelectedTurno(), 100);
      
      Swal.fire({
        icon: 'success',
        title: '¡Usuario removido!',
        text: 'El usuario se ha removido del turno correctamente',
        confirmButtonText: 'Aceptar'
      });
    },
    onError: (err: any) => {
      console.error('Error removiendo usuario:', err);
      const errorMessage = err?.response?.data?.message || 'Error al remover el usuario del turno';
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
      console.log('✅ Usuario asignado exitosamente, invalidando queries...');
      // Invalidar la query de turnos para traer datos frescos
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
      // Invalidar todas las queries de participación mensual actual para actualizar la información
      queryClient.invalidateQueries({ queryKey: ['participacionMensualActual'] });
      // Actualizar selectedTurno después de invalidar la query
      setTimeout(() => updateSelectedTurno(), 100);
      
      Swal.fire({
        icon: 'success',
        title: '¡Usuario asignado!',
        text: 'El usuario se ha asignado al turno correctamente',
        confirmButtonText: 'Aceptar'
      });
    },
    onError: (err: any) => {
      console.error('Error asignando usuario:', err);
      const errorMessage = err?.response?.data?.message || 'Error al asignar usuario al turno';
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

        if (lugaresData?.data) {
          console.log('Datos de lugares recibidos:', lugaresData.data);
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
  }, [lugaresData, turnosData]); // Agregar turnosData como dependencia

  // Forzar recarga cuando cambien los turnos
  useEffect(() => {
    if (turnosData?.data) {
      console.log('🔄 Datos de turnos actualizados, forzando recarga...');
      // Cambiar la key para forzar re-render
      setTurnosKey(prev => prev + 1);
    }
  }, [turnosData]);

  // Actualizar selectedTurno cuando cambien los datos de turnos
  useEffect(() => {
    updateSelectedTurno();
  }, [turnos, updateSelectedTurno]);

  const getTurnosToShow = () => {
    let turnosFiltrados = turnos;

    // Si "Mis Turnos" está activado, filtrar solo los turnos del usuario actual
    if (viewMyTurnos && _user) {
      turnosFiltrados = turnos.filter(turno => 
        turno.usuarios && turno.usuarios.some(usuario => usuario.id === _user.id)
      );
    }

    // Si "Ver Todos" está activado, mostrar todos los turnos (o solo los filtrados por "Mis Turnos")
    if (viewAllTurnos) {
      return turnosFiltrados;
    }

    // Mostrar solo turnos de la semana actual (aplicando también el filtro de "Mis Turnos" si está activado)
    const now = new Date();
    const startOfCurrentWeek = new Date(now);
    startOfCurrentWeek.setDate(now.getDate() - now.getDay() + 1);
    const endOfCurrentWeek = new Date(startOfCurrentWeek);
    endOfCurrentWeek.setDate(startOfCurrentWeek.getDate() + 6);

    return turnosFiltrados.filter(turno => {
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

  // Función para obtener todos los turnos de una fecha específica (sin filtros)
  const getTurnosDelDia = (fecha: string) => {
    return turnos.filter(turno => turno.fecha === fecha);
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

  // Función para generar PDF
  const handleGeneratePDF = () => {
    try {
      // Convertir turnos al formato necesario para PDF
      const turnosForPDF: TurnoForPDF[] = turnos.map(turno => ({
        id: turno.id,
        fecha: turno.fecha,
        hora: turno.hora,
        lugar: {
          nombre: turno.lugar?.nombre || 'Sin lugar',
          direccion: turno.lugar?.direccion || 'Sin dirección',
          capacidad: turno.lugar?.capacidad
        },
        exhibidores: turno.exhibidores?.map(e => ({
          nombre: e.nombre,
          descripcion: e.descripcion
        })) || [],
        usuarios: turno.usuarios?.map(u => ({
          id: u.id,
          nombre: u.nombre,
          cargo: u.cargo || 'Sin cargo',
          tieneCoche: u.tieneCoche || false
        })) || []
      }));

      // Determinar qué tipo de PDF generar según los filtros activos
      if (viewMyTurnos) {
        // Filtrar solo mis turnos
        const misTurnos = turnosForPDF.filter(turno => 
          turno.usuarios && turno.usuarios.some(u => u.id === _user?.id)
        );
        
        if (viewAllTurnos) {
          // Mis turnos de esta semana
          generateWeekTurnosPDF(misTurnos);
        } else {
          // Mis turnos de todo el mes
          generateMyTurnosPDF(misTurnos, _user?.nombre || 'Usuario');
        }
      } else {
        // Todos los turnos
        if (viewAllTurnos) {
          // Turnos de esta semana
          generateWeekTurnosPDF(turnosForPDF);
        } else {
          // Todos los turnos del mes
          generateTurnosPDF(turnosForPDF);
        }
      }

      // Mostrar mensaje de éxito
      Swal.fire({
        icon: 'success',
        title: 'PDF generado exitosamente',
        text: 'El archivo se ha descargado automáticamente',
        confirmButtonText: 'Aceptar'
      });
    } catch (error) {
      console.error('Error generando PDF:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al generar PDF',
        text: 'Ocurrió un error al generar el documento',
        confirmButtonText: 'Aceptar'
      });
    }
  };

  // Función para limpiar todos los usuarios de todos los turnos
  const handleLimpiarTodo = async () => {
    try {
      // Confirmar la acción con el usuario
      const result = await Swal.fire({
        icon: 'warning',
        title: '¿Estás seguro?',
        text: 'Esta acción eliminará TODOS los usuarios asignados a TODOS los turnos. Esta operación no se puede deshacer.',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, limpiar todo',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        // Mostrar loading
        Swal.fire({
          title: 'Limpiando turnos...',
          text: 'Por favor espera mientras se procesa la solicitud',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // Llamar a la API para limpiar todos los usuarios
        const response = await apiService.limpiarTodosLosUsuariosDeTurnos();
        
        if (response.success) {
          // Invalidar queries para actualizar la UI
          queryClient.invalidateQueries({ queryKey: ['turnos'] });
          queryClient.invalidateQueries({ queryKey: ['participacionMensualActual'] });
          
          // Cerrar el modal de loading y mostrar éxito
          Swal.fire({
            icon: 'success',
            title: '¡Turnos limpiados exitosamente!',
            text: `Se han eliminado ${response.data?.turnosLimpiados || 0} asignaciones de usuarios. Todos los turnos ahora están libres.`,
            confirmButtonText: 'Aceptar'
          });
        } else {
          throw new Error(response.message || 'Error desconocido');
        }
      }
    } catch (error: any) {
      console.error('Error limpiando usuarios de turnos:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al limpiar usuarios de turnos';
      
      Swal.fire({
        icon: 'error',
        title: 'Error al limpiar turnos',
        text: errorMessage,
        confirmButtonText: 'Aceptar'
      });
    }
  };

  const handleTurnoClick = async (turno: Turno) => {
    setSelectedTurno(turno);
    setShowTurnoModal(true);
    
    // Debug: verificar qué datos tiene el turno
    console.log('🔍 Turno seleccionado:', turno);
    console.log('🔍 Usuarios del turno:', turno.usuarios);
    if (turno.usuarios && turno.usuarios.length > 0) {
      console.log('🔍 Primer usuario del turno:', turno.usuarios[0]);
      console.log('🔍 Campos del primer usuario:', Object.keys(turno.usuarios[0]));
    }
    
    // Cargar usuarios disponibles si soy admin o superAdmin
    if (_user?.rol === 'admin' || _user?.rol === 'superAdmin') {
      setLoadingUsuarios(true);
      try {
        const response = await apiService.getUsuarios();
        if (response.data) {
          console.log('🔍 Usuarios obtenidos del backend:', response.data);
          console.log('🔍 Primer usuario ejemplo:', response.data[0]);
          console.log('🔍 Campos del primer usuario del backend:', Object.keys(response.data[0]));
          // Filtrar usuarios por disponibilidad para este turno
          const usuariosFiltrados = await filtrarUsuariosPorDisponibilidad(response.data, turno);
          console.log('🔍 Usuarios filtrados:', usuariosFiltrados);
          console.log('🔍 Primer usuario filtrado ejemplo:', usuariosFiltrados[0]);
          setUsuariosDisponibles(usuariosFiltrados);
        }
      } catch (error) {
        console.error('Error cargando usuarios:', error);
      } finally {
        setLoadingUsuarios(false);
      }
    }
  };

  // Función para filtrar usuarios por disponibilidad
  const filtrarUsuariosPorDisponibilidad = async (usuarios: Usuario[], turno: Turno): Promise<Usuario[]> => {
    const usuariosFiltrados: Usuario[] = [];
    
    for (const usuario of usuarios) {
      try {
        // Obtener la configuración de disponibilidad del usuario específico para el mes del turno
        const mesTurno = `${new Date(turno.fecha).getFullYear()}-${(new Date(turno.fecha).getMonth() + 1).toString().padStart(2, '0')}`;
        const disponibilidadResponse = await apiService.getUserDisponibilidadConfig(usuario.id, mesTurno);
        const configuraciones = disponibilidadResponse?.data || [];
        
        // Verificar si el usuario tiene disponibilidad para este turno
        if (await verificarDisponibilidadParaTurno(configuraciones, turno, usuario)) {
          usuariosFiltrados.push(usuario);
        }
      } catch (error) {
        console.error(`Error verificando disponibilidad para usuario ${usuario.id}:`, error);
        // Si no se puede verificar, no incluir al usuario
      }
    }
    
    return usuariosFiltrados;
  };

  // Función para verificar si un usuario tiene disponibilidad para un turno específico
  const verificarDisponibilidadParaTurno = async (configuraciones: any[], turno: Turno, usuario: Usuario): Promise<boolean> => {
    const fechaTurno = new Date(turno.fecha);
    const diaSemana = fechaTurno.getDay();
    const [horaInicioTurno, horaFinTurno] = turno.hora.split('-');
    
    // Verificar si el usuario tiene restricción "nuncaCon" y esa persona ya está en el turno
    if (usuario.nuncaCon && turno.usuarios) {
      const usuarioNuncaCon = turno.usuarios.find(u => u.id === usuario.nuncaCon);
      if (usuarioNuncaCon) {
        return false; // El usuario no está disponible porque no quiere trabajar con alguien que ya está en el turno
      }
    }
    
    // Verificar participación mensual actual antes de verificar disponibilidad
    if (usuario.participacionMensual !== null && usuario.participacionMensual !== undefined) {
      try {
        const participacionActual = await apiService.getParticipacionMensualActual(usuario.id);
        if (participacionActual.turnosOcupados >= usuario.participacionMensual) {
          console.log(`❌ Usuario ${usuario.nombre} ya alcanzó su límite mensual (${participacionActual.turnosOcupados}/${usuario.participacionMensual})`);
          return false; // El usuario ya alcanzó su límite mensual
        }
      } catch (error) {
        console.error(`Error verificando participación mensual de usuario ${usuario.nombre}:`, error);
        // En caso de error, continuar con la verificación de disponibilidad
      }
    }
    
    for (const config of configuraciones) {
      switch (config.tipo_disponibilidad) {
        case 'todasTardes':
          // Verificar si es tarde (después de las 12:00)
          if (horaInicioTurno >= '12:00') {
            // Si tiene hora personalizada, verificar que coincida
            if (config.configuracion.hora_inicio && config.configuracion.hora_fin) {
              if (horaInicioTurno >= config.configuracion.hora_inicio && horaFinTurno <= config.configuracion.hora_fin) {
                return true;
              }
            } else {
              // Sin hora personalizada, cualquier tarde
              return true;
            }
          }
          break;
          
        case 'todasMananas':
          // Verificar si es mañana (antes de las 12:00)
          if (horaFinTurno <= '12:00') {
            // Si tiene hora personalizada, verificar que coincida
            if (config.configuracion.hora_inicio && config.configuracion.hora_fin) {
              if (horaInicioTurno >= config.configuracion.hora_inicio && horaFinTurno <= config.configuracion.hora_fin) {
                return true;
              }
            } else {
              // Sin hora personalizada, cualquier mañana
              return true;
            }
          }
          break;
          
        case 'diasSemana':
          // Verificar si el día del turno está en los días configurados
          if (config.configuracion.dias && config.configuracion.dias.includes(diaSemana)) {
            const periodo = config.configuracion.periodo;
            
            if (periodo === 'manana' && horaFinTurno <= '12:00') {
              return true;
            } else if (periodo === 'tarde' && horaInicioTurno >= '12:00') {
              return true;
            } else if (periodo === 'personalizado' && config.configuracion.hora_inicio_personalizado && config.configuracion.hora_fin_personalizado) {
              if (horaInicioTurno >= config.configuracion.hora_inicio_personalizado && horaFinTurno <= config.configuracion.hora_fin_personalizado) {
                return true;
              }
            }
          }
          break;
          
        case 'fechaConcreta':
          // Verificar si la fecha del turno coincide
          if (config.configuracion.fecha === turno.fecha) {
            const periodo = config.configuracion.periodo_fecha;
            
            if (periodo === 'manana' && horaFinTurno <= '12:00') {
              return true;
            } else if (periodo === 'tarde' && horaInicioTurno >= '12:00') {
              return true;
            } else if (periodo === 'personalizado' && config.configuracion.hora_inicio_fecha && config.configuracion.hora_fin_fecha) {
              if (horaInicioTurno >= config.configuracion.hora_inicio_fecha && horaFinTurno <= config.configuracion.hora_fin_fecha) {
                return true;
              }
            }
          }
          break;
          
        case 'noDisponibleFecha':
          // Si el usuario NO está disponible en esta fecha, no incluirlo
          if (config.configuracion.fecha === turno.fecha) {
            const periodo = config.configuracion.periodo_fecha;
            
            if (periodo === 'manana' && horaFinTurno <= '12:00') {
              return false; // No disponible en la mañana
            } else if (periodo === 'tarde' && horaInicioTurno >= '12:00') {
              return false; // No disponible en la tarde
            } else if (periodo === 'personalizado' && config.configuracion.hora_inicio_fecha && config.configuracion.hora_fin_fecha) {
              if (horaInicioTurno >= config.configuracion.hora_inicio_fecha && horaFinTurno <= config.configuracion.hora_fin_fecha) {
                return false; // No disponible en el horario personalizado
              }
            }
          }
          break;
      }
    }
    
    // Si no hay configuraciones específicas, el usuario no está disponible
    return false;
  };


  /**
   * Función para asignar un usuario a un turno
   * Si el usuario tiene configurado un "siempreCon", se asignan automáticamente ambos usuarios
   * Solo si hay espacio suficiente en el turno para los dos
   */
  const handleAsignarUsuario = async (turno: Turno, usuarioId: number) => {
    try {
      // Obtener el usuario que se va a asignar
      const usuario = usuariosDisponibles.find(u => u.id === usuarioId);
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar si el usuario tiene un "siempreCon" configurado
      if (usuario.siempreCon) {
        // Buscar el usuario que siempre debe acompañar
        const usuarioSiempreCon = usuariosDisponibles.find(u => u.id === usuario.siempreCon);
        
        if (usuarioSiempreCon) {
          // Verificar si hay espacio para ambos usuarios
          const capacidadDisponible = (turno.lugar?.capacidad || 0) - (turno.usuarios?.length || 0);
          
          if (capacidadDisponible < 2) {
            // No hay espacio para ambos usuarios
            Swal.fire({
              icon: 'warning',
              title: 'No hay espacio suficiente',
              html: `
                <div class="text-left">
                  <p class="mb-3"><strong>${usuario.nombre}</strong> debe estar siempre con <strong>${usuarioSiempreCon.nombre}</strong>.</p>
                  <p class="mb-3">Este turno solo tiene <strong>${capacidadDisponible}</strong> puesto(s) disponible(s), pero se necesitan <strong>2</strong> para ambos usuarios.</p>
                  <div class="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-sm">
                    <p><strong>Lugar:</strong> ${turno.lugar?.nombre || 'Sin lugar'}</p>
                    <p><strong>Fecha:</strong> ${new Date(turno.fecha).toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                    <p><strong>Horario:</strong> ${formatHora(turno.hora)}</p>
                    <p><strong>Puestos disponibles:</strong> ${capacidadDisponible}</p>
                  </div>
                </div>
              `,
              confirmButtonText: 'Entendido',
              confirmButtonColor: '#f59e0b'
            });
            return;
          }

                     // Mostrar confirmación antes de asignar automáticamente
           const result = await Swal.fire({
             title: 'Confirmar asignación automática',
             html: `
               <div class="text-left">
                 <p class="mb-3"><strong>${usuario.nombre}</strong> debe estar siempre con <strong>${usuarioSiempreCon.nombre}</strong>.</p>
                 <p class="mb-3">¿Deseas asignar automáticamente a ambos usuarios al turno?</p>
                 <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm">
                   <p><strong>Lugar:</strong> ${turno.lugar?.nombre || 'Sin lugar'}</p>
                   <p><strong>Fecha:</strong> ${new Date(turno.fecha).toLocaleDateString('es-ES', { 
                     weekday: 'long', 
                     year: 'numeric', 
                     month: 'long', 
                     day: 'numeric' 
                   })}</p>
                   <p><strong>Horario:</strong> ${formatHora(turno.hora)}</p>
                   <p><strong>Puestos disponibles:</strong> ${capacidadDisponible}</p>
                 </div>
               </div>
             `,
             icon: 'question',
             showCancelButton: true,
             confirmButtonText: 'Sí, asignar ambos',
             cancelButtonText: 'Cancelar',
             confirmButtonColor: '#10b981',
             cancelButtonColor: '#6B7280'
           });
           
           if (result.isConfirmed) {
             // Hay espacio para ambos, asignar primero al usuario principal
             await asignarUsuarioMutation.mutateAsync({ turnoId: turno.id, usuarioId });
             
             // Luego asignar automáticamente al usuario que siempre debe acompañar
             await asignarUsuarioMutation.mutateAsync({ turnoId: turno.id, usuarioId: usuario.siempreCon });
             
             // Mostrar mensaje de éxito
             Swal.fire({
               icon: 'success',
               title: 'Usuarios asignados automáticamente',
               html: `
                 <div class="text-left">
                   <p class="mb-3">Se han asignado automáticamente:</p>
                   <ul class="list-disc list-inside mb-3">
                     <li><strong>${usuario.nombre}</strong></li>
                     <li><strong>${usuarioSiempreCon.nombre}</strong> (siempre debe acompañar)</li>
                   </ul>
                   <div class="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-sm">
                     <p><strong>Lugar:</strong> ${turno.lugar?.nombre || 'Sin lugar'}</p>
                     <p><strong>Fecha:</strong> ${new Date(turno.fecha).toLocaleDateString('es-ES', { 
                       weekday: 'long', 
                       year: 'numeric', 
                       month: 'long', 
                       day: 'numeric' 
                     })}</p>
                     <p><strong>Horario:</strong> ${formatHora(turno.hora)}</p>
                   </div>
                 </div>
               `,
               confirmButtonText: 'Entendido',
               confirmButtonColor: '#10b981'
             });
           }
        } else {
          // El usuario "siempreCon" no está disponible, mostrar advertencia
          Swal.fire({
            icon: 'warning',
            title: 'Usuario no disponible',
            html: `
              <div class="text-left">
                <p class="mb-3"><strong>${usuario.nombre}</strong> debe estar siempre con otro usuario que no está disponible en este momento.</p>
                <p class="mb-3">No se puede asignar a este turno sin su compañero requerido.</p>
                <div class="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-sm">
                  <p><strong>Lugar:</strong> ${turno.lugar?.nombre || 'Sin lugar'}</p>
                  <p><strong>Fecha:</strong> ${new Date(turno.fecha).toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                  <p><strong>Horario:</strong> ${formatHora(turno.hora)}</p>
                </div>
              </div>
            `,
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#f59e0b'
          });
          return;
        }
      } else {
        // Usuario sin "siempreCon", asignar normalmente
        await asignarUsuarioMutation.mutateAsync({ turnoId: turno.id, usuarioId });
      }
    } catch (error) {
      console.error('Error al asignar usuario:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al asignar usuario',
        text: 'No se pudo asignar el usuario al turno',
        confirmButtonText: 'Entendido'
      });
    }
  };



    /**
   * Función para manejar clic en puesto vacío
   * Si el usuario tiene configurado un "siempreCon", se asignan automáticamente ambos usuarios
   * Solo si hay espacio suficiente en el turno para los dos
   */
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

      // Cargar usuarios disponibles si no están cargados y el usuario tiene "siempreCon"
      if (_user?.siempreCon && usuariosDisponibles.length === 0) {
        setLoadingUsuarios(true);
        try {
          const response = await apiService.getUsuarios();
          if (response.data) {
            // Filtrar usuarios por disponibilidad para este turno
            const usuariosFiltrados = await filtrarUsuariosPorDisponibilidad(response.data, turno);
            setUsuariosDisponibles(usuariosFiltrados);
          }
        } catch (error) {
          console.error('Error cargando usuarios:', error);
        } finally {
          setLoadingUsuarios(false);
        }
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
          // Verificar si el usuario actual tiene un "siempreCon" configurado
          if (_user?.siempreCon) {
            // Buscar el usuario que siempre debe acompañar
            const usuarioSiempreCon = usuariosDisponibles.find(u => u.id === _user.siempreCon);
            
            if (usuarioSiempreCon) {
              // Verificar si hay espacio para ambos usuarios
              const capacidadDisponible = (turno.lugar?.capacidad || 0) - (turno.usuarios?.length || 0);
              
              if (capacidadDisponible < 2) {
                // No hay espacio para ambos usuarios
                Swal.fire({
                  icon: 'warning',
                  title: 'No hay espacio suficiente',
                  html: `
                    <div class="text-left">
                      <p class="mb-3"><strong>${_user.nombre}</strong> debe estar siempre con <strong>${usuarioSiempreCon.nombre}</strong>.</p>
                      <p class="mb-3">Este turno solo tiene <strong>${capacidadDisponible}</strong> puesto(s) disponible(s), pero se necesitan <strong>2</strong> para ambos usuarios.</p>
                      <div class="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-sm">
                        <p><strong>Lugar:</strong> ${turno.lugar?.nombre || 'Sin lugar'}</p>
                        <p><strong>Fecha:</strong> ${new Date(turno.fecha).toLocaleDateString('es-ES', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</p>
                        <p><strong>Horario:</strong> ${formatHora(turno.hora)}</p>
                        <p><strong>Puestos disponibles:</strong> ${capacidadDisponible}</p>
                      </div>
                    </div>
                  `,
                  confirmButtonText: 'Entendido',
                  confirmButtonColor: '#f59e0b'
                });
                return;
              }

                             // Mostrar confirmación antes de asignar automáticamente
               const resultSiempreCon = await Swal.fire({
                 title: 'Confirmar asignación automática',
                 html: `
                   <div class="text-left">
                     <p class="mb-3"><strong>${_user.nombre}</strong> debe estar siempre con <strong>${usuarioSiempreCon.nombre}</strong>.</p>
                     <p class="mb-3">¿Deseas asignar automáticamente a ambos usuarios al turno?</p>
                     <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm">
                       <p><strong>Lugar:</strong> ${turno.lugar?.nombre || 'Sin lugar'}</p>
                       <p><strong>Fecha:</strong> ${new Date(turno.fecha).toLocaleDateString('es-ES', { 
                         weekday: 'long', 
                         year: 'numeric', 
                         month: 'long', 
                         day: 'numeric' 
                       })}</p>
                       <p><strong>Horario:</strong> ${formatHora(turno.hora)}</p>
                       <p><strong>Puestos disponibles:</strong> ${capacidadDisponible}</p>
                     </div>
                   </div>
                 `,
                 icon: 'question',
                 showCancelButton: true,
                 confirmButtonText: 'Sí, asignar ambos',
                 cancelButtonText: 'Cancelar',
                 confirmButtonColor: '#10b981',
                 cancelButtonColor: '#6B7280'
               });
               
               if (resultSiempreCon.isConfirmed) {
                 // Hay espacio para ambos, asignar primero al usuario actual
                 await ocuparTurnoMutation.mutateAsync(turno.id);
                 
                 // Luego asignar automáticamente al usuario que siempre debe acompañar
                 await asignarUsuarioMutation.mutateAsync({ turnoId: turno.id, usuarioId: _user.siempreCon });
                 
                 // Mostrar mensaje de éxito
                 Swal.fire({
                   icon: 'success',
                   title: 'Usuarios asignados automáticamente',
                   html: `
                     <div class="text-left">
                       <p class="mb-3">Se han asignado automáticamente:</p>
                       <ul class="list-disc list-inside mb-3">
                         <li><strong>${_user.nombre}</strong></li>
                         <li><strong>${usuarioSiempreCon.nombre}</strong> (siempre debe acompañar)</li>
                       </ul>
                       <div class="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-sm">
                         <p><strong>Lugar:</strong> ${turno.lugar?.nombre || 'Sin lugar'}</p>
                         <p><strong>Fecha:</strong> ${new Date(turno.fecha).toLocaleDateString('es-ES', { 
                           weekday: 'long', 
                           year: 'numeric', 
                           month: 'long', 
                           day: 'numeric' 
                         })}</p>
                         <p><strong>Horario:</strong> ${formatHora(turno.hora)}</p>
                       </div>
                     </div>
                   `,
                   confirmButtonText: 'Entendido',
                   confirmButtonColor: '#10b981'
                 });
               }
            } else {
              // El usuario "siempreCon" no está disponible, mostrar advertencia
              Swal.fire({
                icon: 'warning',
                title: 'Usuario no disponible',
                html: `
                  <div class="text-left">
                    <p class="mb-3"><strong>${_user.nombre}</strong> debe estar siempre con otro usuario que no está disponible en este momento.</p>
                    <p class="mb-3">No se puede asignar a este turno sin su compañero requerido.</p>
                    <div class="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-sm">
                      <p><strong>Lugar:</strong> ${turno.lugar?.nombre || 'Sin lugar'}</p>
                      <p><strong>Fecha:</strong> ${new Date(turno.fecha).toLocaleDateString('es-ES', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</p>
                      <p><strong>Horario:</strong> ${formatHora(turno.hora)}</p>
                    </div>
                  </div>
                `,
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#f59e0b'
              });
              return;
            }
          } else {
            // Usuario sin "siempreCon", asignar normalmente
            await ocuparTurnoMutation.mutateAsync(turno.id);
          }
          
          setShowTurnoModal(false);
        }
      } catch (error) {
        console.error('Error al ocupar puesto:', error);
      }
    };

         /**
      * Función para liberar turno (solo para admins o para liberarse a sí mismo)
      * Si el usuario tiene configurado un "siempreCon", se eliminan automáticamente ambos usuarios
      */
     const handleLiberarTurno = async (turno: Turno, usuarioId?: number) => {
       try {
         console.log('🔍 handleLiberarTurno ejecutado:', { turnoId: turno.id, usuarioId, turno });
         
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

                   // Si se especifica un usuarioId, verificar si tiene "siempreCon"
          if (usuarioId) {
            console.log('🔍 Verificando usuarioId:', usuarioId);
            const usuarioAEliminar = turno.usuarios?.find(u => u.id === usuarioId);
            console.log('🔍 Usuario a eliminar encontrado:', usuarioAEliminar);
            console.log('🔍 Campo siempreCon del usuario:', usuarioAEliminar?.siempreCon);
            console.log('🔍 Tipo de siempreCon:', typeof usuarioAEliminar?.siempreCon);
            console.log('🔍 ¿Es truthy?', !!usuarioAEliminar?.siempreCon);
            
            // Verificar si el usuario tiene "siempreCon" configurado
            if (usuarioAEliminar?.siempreCon && typeof usuarioAEliminar.siempreCon === 'number' && usuarioAEliminar.siempreCon > 0) {
              console.log('🔍 Usuario tiene siempreCon válido:', usuarioAEliminar.siempreCon);
              
              // Buscar al usuario que siempre debe acompañar (puede estar o no en el turno)
              // Primero buscar en usuariosDisponibles, luego en turno.usuarios
              let usuarioSiempreCon = usuariosDisponibles.find(u => u.id === usuarioAEliminar.siempreCon);
              if (!usuarioSiempreCon) {
                usuarioSiempreCon = turno.usuarios?.find(u => u.id === usuarioAEliminar.siempreCon);
              }
              
              console.log('🔍 Usuario siempreCon encontrado:', usuarioSiempreCon);
              
              if (usuarioSiempreCon) {
                               // Confirmar eliminación de ambos usuarios
                const result = await Swal.fire({
                  title: '⚠️ Usuarios relacionados detectados',
                  html: `
                    <div class="text-left">
                      <div class="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4">
                        <p class="text-red-800 dark:text-red-200 font-semibold mb-2">¡Atención!</p>
                        <p class="mb-3"><strong>${usuarioAEliminar.nombre}</strong> debe estar siempre con <strong>${usuarioSiempreCon.nombre}</strong>.</p>
                        <p class="mb-3">Al eliminar a uno, se eliminarán <strong>automáticamente ambos usuarios</strong> del turno.</p>
                      </div>
                      
                      <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm">
                        <p><strong>Lugar:</strong> ${turno.lugar?.nombre || 'Sin lugar'}</p>
                        <p><strong>Fecha:</strong> ${new Date(turno.fecha).toLocaleDateString('es-ES', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</p>
                        <p><strong>Horario:</strong> ${formatHora(turno.hora)}</p>
                      </div>
                      
                      <div class="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <p class="text-sm text-yellow-800 dark:text-yellow-200">
                          <strong>¿Estás seguro de que quieres eliminar a ambos usuarios?</strong>
                        </p>
                      </div>
                    </div>
                  `,
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonText: 'Sí, eliminar ambos',
                  cancelButtonText: 'Cancelar',
                  confirmButtonColor: '#d33',
                  cancelButtonColor: '#3085d6'
                });
               
               if (result.isConfirmed) {
                 try {
                   // Eliminar ambos usuarios en una sola operación para evitar problemas de sincronización
                   await Promise.all([
                     liberarTurnoMutation.mutateAsync({ turnoId: turno.id, usuarioId }),
                     liberarTurnoMutation.mutateAsync({ turnoId: turno.id, usuarioId: usuarioAEliminar.siempreCon })
                   ]);
                   
                   // Mostrar mensaje de éxito
                   Swal.fire({
                     icon: 'success',
                     title: 'Usuarios eliminados del turno',
                     html: `
                       <div class="text-left">
                         <p class="mb-3">Se han eliminado del turno:</p>
                         <ul class="list-disc list-inside mb-3">
                           <li><strong>${usuarioAEliminar.nombre}</strong></li>
                           <li><strong>${usuarioSiempreCon.nombre}</strong> (siempre debe acompañar)</li>
                         </ul>
                         <div class="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-sm">
                           <p><strong>Lugar:</strong> ${turno.lugar?.nombre || 'Sin lugar'}</p>
                           <p><strong>Fecha:</strong> ${new Date(turno.fecha).toLocaleDateString('es-ES', { 
                             weekday: 'long', 
                             year: 'numeric', 
                             month: 'long', 
                             day: 'numeric' 
                           })}</p>
                           <p><strong>Horario:</strong> ${formatHora(turno.hora)}</p>
                         </div>
                       </div>
                     `,
                     confirmButtonText: 'Entendido',
                     confirmButtonColor: '#10b981'
                   });
                 } catch (error) {
                   console.error('Error eliminando usuarios relacionados:', error);
                   Swal.fire({
                     icon: 'error',
                     title: 'Error al eliminar usuarios',
                     text: 'Ocurrió un error al eliminar los usuarios relacionados del turno',
                     confirmButtonText: 'Entendido'
                   });
                 }
               }
               return;
             }
           }
           
           // Usuario sin "siempreCon" o no se encontró el usuario relacionado, eliminar solo al especificado
           const mensaje = `¿Estás seguro de que quieres remover a este usuario del turno en ${turno.lugar?.nombre}?`;
           
           const result = await Swal.fire({
             title: 'Confirmar remoción',
             text: mensaje,
             icon: 'warning',
             showCancelButton: true,
             confirmButtonText: 'Sí, remover',
             cancelButtonText: 'Cancelar',
             confirmButtonColor: '#d33',
             cancelButtonColor: '#3085d6'
           });
           
           if (result.isConfirmed) {
             await liberarTurnoMutation.mutateAsync({ turnoId: turno.id, usuarioId });
           }
         } else {
           // Si no se especifica usuarioId, liberar todo el turno
           const mensaje = `¿Estás seguro de que quieres liberar el turno en ${turno.lugar?.nombre} el ${new Date(turno.fecha).toLocaleDateString('es-ES')} de ${turno.hora}?`;
           
           const result = await Swal.fire({
             title: 'Confirmar liberación',
             text: mensaje,
             icon: 'warning',
             showCancelButton: true,
             confirmButtonText: 'Sí, liberar',
             cancelButtonText: 'Cancelar',
             confirmButtonColor: '#d33',
             cancelButtonColor: '#3085d6'
           });
           
           if (result.isConfirmed) {
             await liberarTurnoMutation.mutateAsync(turno.id);
           }
         }
       } catch (error) {
         console.error('Error al liberar turno:', error);
         Swal.fire({
           icon: 'error',
           title: 'Error',
           text: 'Ocurrió un error al liberar el turno',
           confirmButtonText: 'Entendido'
         });
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
    <div className="space-y-6" key={turnosKey}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 relative">
        {/* Theme Toggle en la esquina superior derecha */}
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        
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
          viewMyTurnos={viewMyTurnos}
          setViewMyTurnos={setViewMyTurnos}
          onGeneratePDF={handleGeneratePDF}
          onLimpiarTodo={handleLimpiarTodo}
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
        turnosDelDia={selectedTurno ? getTurnosDelDia(selectedTurno.fecha) : []}
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
