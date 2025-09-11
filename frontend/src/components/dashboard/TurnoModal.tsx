import type { Turno, Usuario, Lugar, Exhibidor } from '../../types';
import { useState } from 'react';
import PlaceMapModal from '../PlaceMapModal';
import ParticipacionMensualDisplay from '../ParticipacionMensualDisplay';
import { confirmDelete } from '../../config/sweetalert';
import { useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { apiService } from '../../services/api';

/**
 * Componente modal para gestionar turnos
 * 
 * Funcionalidades implementadas:
 * - Asignación automática de usuarios considerando relaciones "siempreCon"
 * - Los usuarios con campo "siempreCon" ocupan 2 plazas al ser asignados
 * - Sistema de priorización optimizado:
 *   * PRIORIDAD PRINCIPAL: Participación mensual más baja
 *   * REQUISITOS OBLIGATORIOS: Al menos un usuario masculino y un usuario con coche (si hay disponibles)
 *   * Los requisitos se cumplen como mínimo necesario, manteniendo la prioridad de participación
 * - La asignación manual también maneja estas relaciones (implementado en DashboardOverview)
 * - Visualización clara de usuarios con relaciones en el panel lateral
 * - Invalidación automática de caché de participación mensual al asignar/quitar usuarios
 * 
 * NOTA: Las funciones handleAsignarUsuario y handleLiberarTurno (pasadas como props)
 * también deberían invalidar la caché de participación mensual para mantener
 * los contadores actualizados en tiempo real.
 * 
 * MANEJO DE ERRORES DEL BACKEND:
 * - Se capturan errores específicos del backend (400, 409) para mostrar mensajes claros
 * - Se maneja el caso de usuarios ya asignados a otros turnos en la misma fecha
 * - Se muestra información al usuario sobre por qué algunos usuarios pueden no estar disponibles
 * 
 * FILTRADO AUTOMÁTICO DE USUARIOS:
 * - Se calculan y filtran automáticamente usuarios ocupados en otros turnos del mismo día
 * - Se evitan peticiones que fallarían en el backend
 * - Se seleccionan alternativas que cumplan las normas cuando sea posible
 * - REQUIERE: Prop 'turnosDelDia' con todos los turnos de la fecha para validación
 */

interface TurnoModalProps {
  showTurnoModal: boolean;
  selectedTurno: Turno | null;
  setShowTurnoModal: (show: boolean) => void;
  _user: Usuario | null;
  loadingUsuarios: boolean;
  usuariosDisponibles: Usuario[];
  turnosDelDia: Turno[]; // Nuevo: turnos del mismo día para validación
  ocuparTurnoMutation: any;
  liberarTurnoMutation: any;
  asignarUsuarioMutation: any;
  handleClickPuestoVacio: (turno: Turno) => Promise<void>;
  handleLiberarTurno: (turno: Turno, usuarioId?: number) => Promise<void>;
  handleAsignarUsuario: (turno: Turno, usuarioId: number) => Promise<void>;
  formatHora: (hora: string) => string;
}

export default function TurnoModal({
  showTurnoModal,
  selectedTurno,
  setShowTurnoModal,
  _user,
  loadingUsuarios,
  usuariosDisponibles,
  turnosDelDia,
  ocuparTurnoMutation,
  liberarTurnoMutation,
  asignarUsuarioMutation,
  handleClickPuestoVacio,
  handleLiberarTurno,
  handleAsignarUsuario,
  formatHora
}: TurnoModalProps) {
  if (!showTurnoModal || !selectedTurno) return null;

  // Hook para invalidar queries
  const queryClient = useQueryClient();

  // Estado para controlar si la información del lugar está desplegada
  const [lugarDesplegado, setLugarDesplegado] = useState(false);
  
  // Estado para controlar si los requisitos están desplegados
  const [requisitosDesplegados, setRequisitosDesplegados] = useState(false);

  // Estado para controlar el modal del mapa
  const [showMapModal, setShowMapModal] = useState(false);

  // Estado para el modo de edición
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fecha: '',
    horaInicio: '',
    horaFin: '',
    lugarId: 0
  });

  // Estado para los datos necesarios para la edición
  const [lugares, setLugares] = useState<Lugar[]>([]);
  // @ts-ignore
  const [exhibidores, setExhibidores] = useState<Exhibidor[]>([]);
  // @ts-ignore
  const [selectedLugar, setSelectedLugar] = useState<Lugar | null>(null);

  // Función para verificar si hay usuario con cargo "Grupo"
  const tieneUsuarioGrupo = () => {
    const usuarios = selectedTurno.usuarios || [];
    return usuarios.some(u => u && (u.rol === 'grupo' || u.cargo === 'Grupo'));
  };

  // Función para calcular los requisitos del turno
  const calcularRequisitosTurno = () => {
    const usuarios = selectedTurno.usuarios || [];
    const capacidad = selectedTurno.lugar?.capacidad || 0;
    
    // Si hay un usuario con cargo "Grupo", todos los requisitos están cumplidos
    if (tieneUsuarioGrupo()) {
      return {
        completo: true,
        tieneCoche: true,
        tieneMasculino: true
      };
    }
    
    return {
      completo: capacidad > 0 ? usuarios.length >= capacidad : usuarios.length > 0,
      tieneCoche: usuarios.some(u => u.tieneCoche),
      tieneMasculino: usuarios.some(u => u.sexo === 'M')
    };
  };

  // Función helper para extraer mes y año de la fecha del turno
  const getMesYAñoDelTurno = () => {
    const fechaTurno = new Date(selectedTurno.fecha);
    return {
      mes: fechaTurno.getMonth(),
      año: fechaTurno.getFullYear()
    };
  };

  // Función para cargar lugares y exhibidores
  const cargarDatosParaEdicion = async () => {
    try {
      const [lugaresResponse, exhibidoresResponse] = await Promise.all([
        apiService.getLugares(),
        apiService.getExhibidores()
      ]);

      if (lugaresResponse.success && lugaresResponse.data) {
        setLugares(lugaresResponse.data);
      }

      if (exhibidoresResponse.success && exhibidoresResponse.data) {
        setExhibidores(exhibidoresResponse.data);
      }
    } catch (error) {
      console.error('Error cargando datos para edición:', error);
    }
  };

  // Función para iniciar la edición
  const handleIniciarEdicion = () => {
    // Separar el rango de horas
    const [horaInicio, horaFin] = selectedTurno.hora.includes('-') 
      ? selectedTurno.hora.split('-') 
      : [selectedTurno.hora, selectedTurno.hora];
    
    setEditFormData({
      fecha: selectedTurno.fecha,
      horaInicio: horaInicio,
      horaFin: horaFin,
      lugarId: selectedTurno.lugarId
    });

    // Cargar datos necesarios
    cargarDatosParaEdicion();
    
    // Establecer el lugar seleccionado
    if (selectedTurno.lugar) {
      setSelectedLugar(selectedTurno.lugar);
    }
    
    setIsEditing(true);
  };

  // Función para cancelar la edición
  const handleCancelarEdicion = () => {
    setIsEditing(false);
    setEditFormData({
      fecha: '',
      horaInicio: '',
      horaFin: '',
      lugarId: 0
    });
    setSelectedLugar(null);
  };

  // Función para guardar los cambios
  const handleGuardarCambios = async () => {
    try {
      // Validar que la hora de fin sea mayor que la de inicio
      if (editFormData.horaFin <= editFormData.horaInicio) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'La hora de fin debe ser mayor que la hora de inicio'
        });
        return;
      }

      // Crear el rango de horas
      const horaRango = `${editFormData.horaInicio}-${editFormData.horaFin}`;

      // Preparar los datos para la actualización
      const datosActualizacion = {
        fecha: editFormData.fecha,
        hora: horaRango,
        lugarId: editFormData.lugarId,
        exhibidorIds: selectedTurno.exhibidores ? selectedTurno.exhibidores.map(e => e.id) : [],
        usuarioIds: selectedTurno.usuarios ? selectedTurno.usuarios.map(u => u.id) : [],
        estado: selectedTurno.estado as 'libre' | 'ocupado'
      };

      // Llamar a la API para actualizar el turno
      const response = await apiService.updateTurno(selectedTurno.id, datosActualizacion);

      if (response.success) {
        // Invalidar queries para actualizar la UI
        queryClient.invalidateQueries({ queryKey: ['turnos'] });
        
        // Mostrar mensaje de éxito
        Swal.fire({
          icon: 'success',
          title: 'Turno actualizado',
          text: 'El turno se ha actualizado exitosamente',
          timer: 2000,
          showConfirmButton: false
        });

        // Salir del modo de edición
        setIsEditing(false);
      } else {
        throw new Error(response.message || 'Error al actualizar el turno');
      }
    } catch (error: any) {
      console.error('Error al actualizar turno:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Error al actualizar el turno';
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage
      });
    }
  };

     // Función para obtener usuarios que ya están asignados a otros turnos en la misma fecha
   const obtenerUsuariosOcupadosEnFecha = (fecha: string): number[] => {
     try {
       // Validar que turnosDelDia esté disponible
       if (!turnosDelDia || !Array.isArray(turnosDelDia)) {
         console.warn('turnosDelDia no está disponible o no es un array, retornando array vacío');
         return [];
       }
       
       // Usar los turnos del día pasados como prop
       const turnosFiltrados = turnosDelDia.filter((turno: Turno) => 
         turno.fecha === fecha && turno.id !== selectedTurno?.id
       );
       console.log('Turnos filtrados para la fecha:', fecha, turnosFiltrados);
       
       // Extraer todos los IDs de usuarios asignados en esos turnos
       const usuariosOcupados: number[] = [];
       turnosFiltrados.forEach((turno: Turno) => {
         if (turno.usuarios) {
           turno.usuarios.forEach((usuario: Usuario) => {
             if (!usuariosOcupados.includes(usuario.id)) {
               usuariosOcupados.push(usuario.id);
             }
           });
         }
       });
       
       console.log('Usuarios ocupados en fecha:', fecha, usuariosOcupados);
       return usuariosOcupados;
     } catch (error) {
       console.error('Error al obtener usuarios ocupados en fecha:', error);
       return [];
     }
   };


   // Función para asignación automática de usuarios
   const handleAsignacionAutomatica = async (turno: Turno): Promise<void> => {
     if (!turno.lugar?.capacidad) return;
     
     const usuariosAsignados = turno.usuarios || [];
     const capacidad = turno.lugar.capacidad;
     const usuariosNecesarios = capacidad - usuariosAsignados.length;
     
     if (usuariosNecesarios <= 0) return;
     
           // Obtener usuarios que ya están ocupados en otros turnos del mismo día
      const usuariosOcupadosEnFecha = obtenerUsuariosOcupadosEnFecha(turno.fecha);
     
     // Filtrar usuarios disponibles que:
     // 1. No estén ya asignados a este turno
     // 2. No estén ocupados en otros turnos del mismo día
     const usuariosDisponiblesParaAsignar = usuariosDisponibles.filter(
       usuario => 
         !usuariosAsignados.some(u => u.id === usuario.id) &&
         !usuariosOcupadosEnFecha.includes(usuario.id)
     );
    
    // Función para obtener usuarios relacionados que deben asignarse juntos
    const obtenerUsuariosRelacionados = (usuario: Usuario): Usuario[] => {
      const usuariosRelacionados: Usuario[] = [];
      
      // Si el usuario tiene un "siempreCon", agregar ese usuario también
      if (usuario.siempreCon) {
        const usuarioRelacionado = usuariosDisponiblesParaAsignar.find(u => u.id === usuario.siempreCon);
        if (usuarioRelacionado && !usuariosAsignados.some(u => u.id === usuarioRelacionado.id)) {
          usuariosRelacionados.push(usuarioRelacionado);
        }
      }
      
      // Si el usuario es el "siempreCon" de otro usuario que ya está en la lista, no agregarlo
      // para evitar duplicados
      const esSiempreConDeOtro = usuariosDisponiblesParaAsignar.some(u => u.siempreCon === usuario.id);
      if (esSiempreConDeOtro) {
        return usuariosRelacionados; // Solo retornar el usuario actual
      }
      
      return [usuario, ...usuariosRelacionados];
    };

    // Función para obtener usuarios que NO pueden estar juntos (nuncaCon)
    const obtenerUsuariosExcluidos = (usuario: Usuario): number[] => {
      const usuariosExcluidos: number[] = [];
      
      // Si el usuario tiene un "nuncaCon", excluir ese usuario
      if (usuario.nuncaCon) {
        usuariosExcluidos.push(usuario.nuncaCon);
      }
      
      // Si el usuario es el "nuncaCon" de otro usuario, excluir ese otro usuario
      const esNuncaConDeOtro = usuariosDisponiblesParaAsignar.find(u => u.nuncaCon === usuario.id);
      if (esNuncaConDeOtro) {
        usuariosExcluidos.push(esNuncaConDeOtro.id);
      }
      
      return usuariosExcluidos;
    };
    
    // Crear lista de usuarios considerando las relaciones "siempreCon"
    const usuariosConRelaciones: Usuario[] = [];
    const usuariosProcesados = new Set<number>();
    
    for (const usuario of usuariosDisponiblesParaAsignar) {
      if (usuariosProcesados.has(usuario.id)) continue;
      
      const usuariosRelacionados = obtenerUsuariosRelacionados(usuario);
      usuariosRelacionados.forEach(u => usuariosProcesados.add(u.id));
      usuariosConRelaciones.push(...usuariosRelacionados);
    }
    
    // Verificar requisitos existentes en el turno
    const yaTieneMasculino = usuariosAsignados.some(u => u.sexo === 'M');
    const yaTieneCoche = usuariosAsignados.some(u => u.tieneCoche);
    
    // Verificar si hay usuarios disponibles con coche
    const hayUsuariosConCocheDisponibles = usuariosConRelaciones.some(u => u.tieneCoche);
    
         // Ordenar usuarios por prioridad principal: participación mensual más baja, y secundaria: prioridad del cargo
     // Sistema de desempate: 1) Participación mensual, 2) Prioridad del cargo, 3) Hash determinístico del ID
     const usuariosOrdenados = [...usuariosConRelaciones].sort((a, b) => {
       const participacionA = a.participacionMensual || 0;
       const participacionB = b.participacionMensual || 0;
       
       // Si la participación es igual, ordenar por prioridad del cargo
       if (participacionA === participacionB) {
         const prioridadA = a.cargoInfo?.prioridad || 999;
         const prioridadB = b.cargoInfo?.prioridad || 999;
         
         // Si también empatan en prioridad del cargo, desempatar de forma determinística
         if (prioridadA === prioridadB) {
           // Usar una función hash simple basada en los IDs para desempatar
           // Esto asegura que el orden sea consistente y predecible
           // Fórmula: (ID * 9301 + 49297) % 233280 (números primos para mejor distribución)
           const hashA = (a.id * 9301 + 49297) % 233280;
           const hashB = (b.id * 9301 + 49297) % 233280;
           return hashA - hashB;
         }
         
         return prioridadA - prioridadB; // Menor número = mayor prioridad
       }
       
       return participacionA - participacionB; // Orden ascendente (menor participación primero)
     });
    
    // Limitar a los usuarios necesarios, pero considerar que algunos usuarios pueden ocupar 2 plazas
    let usuariosAAsignar: Usuario[] = [];
    let plazasOcupadas = 0;
    let usuariosExcluidosAcumulados = new Set<number>();
    
    for (const usuario of usuariosOrdenados) {
      if (plazasOcupadas >= usuariosNecesarios) break;
      
      // Verificar si este usuario está excluido por relaciones "nuncaCon"
      if (usuariosExcluidosAcumulados.has(usuario.id)) {
        continue; // Saltar este usuario si está excluido
      }
      
      // Si este usuario tiene un "siempreCon", ocupará 2 plazas
      const plazasQueOcupa = usuario.siempreCon ? 2 : 1;
      
      if (plazasOcupadas + plazasQueOcupa <= usuariosNecesarios) {
        // Agregar el usuario y sus exclusiones "nuncaCon" a la lista de excluidos
        const exclusionesDelUsuario = obtenerUsuariosExcluidos(usuario);
        exclusionesDelUsuario.forEach(id => usuariosExcluidosAcumulados.add(id));
        
        usuariosAAsignar.push(usuario);
        plazasOcupadas += plazasQueOcupa;
      }
    }
    
         // Verificar que se cumplan los requisitos después de la asignación
     if (usuariosAAsignar.length > 0) {
       // Verificar requisitos actuales después de la asignación
       let tieneMasculino = usuariosAAsignar.some(u => u.sexo === 'M') || yaTieneMasculino;
       let tieneCoche = usuariosAAsignar.some(u => u.tieneCoche) || yaTieneCoche;
       
       // Si no se cumplen los requisitos, buscar reemplazos manteniendo la prioridad de participación
       if (!tieneMasculino || (!tieneCoche && hayUsuariosConCocheDisponibles)) {
         // Crear una lista de usuarios disponibles para reemplazo, ordenados por participación y prioridad del cargo
         // Sistema de desempate: 1) Participación mensual, 2) Prioridad del cargo, 3) Hash determinístico del ID
         const usuariosDisponiblesParaReemplazo = usuariosConRelaciones
           .filter(u => !usuariosAAsignar.some(ua => ua.id === u.id))
           .sort((a, b) => {
             const participacionA = a.participacionMensual || 0;
             const participacionB = b.participacionMensual || 0;
             
             // Si la participación es igual, ordenar por prioridad del cargo
             if (participacionA === participacionB) {
               const prioridadA = a.cargoInfo?.prioridad || 999;
               const prioridadB = b.cargoInfo?.prioridad || 999;
               
               // Si también empatan en prioridad del cargo, desempatar de forma determinística
               if (prioridadA === prioridadB) {
                 // Usar una función hash simple basada en los IDs para desempatar
                 // Esto asegura que el orden sea consistente y predecible
                 // Fórmula: (ID * 9301 + 49297) % 233280 (números primos para mejor distribución)
                 const hashA = (a.id * 9301 + 49297) % 233280;
                 const hashB = (b.id * 9301 + 49297) % 233280;
                 return hashA - hashB;
               }
               
               return prioridadA - prioridadB; // Menor número = mayor prioridad
             }
             
             return participacionA - participacionB;
           });
         
         // Intentar reemplazar usuarios uno por uno, empezando por el último asignado
         for (let i = usuariosAAsignar.length - 1; i >= 0; i--) {
           const usuarioActual = usuariosAAsignar[i];
           const plazasQueOcupa = usuarioActual.siempreCon ? 2 : 1;
           
           // Buscar un reemplazo que cumpla los requisitos faltantes
           const reemplazo = usuariosDisponiblesParaReemplazo.find(u => {
             const plazasReemplazo = u.siempreCon ? 2 : 1;
             
             // Debe ocupar el mismo número de plazas
             if (plazasReemplazo !== plazasQueOcupa) return false;
             
             // Debe cumplir al menos uno de los requisitos faltantes
             if (!tieneMasculino && u.sexo === 'M') return true;
             if (!tieneCoche && hayUsuariosConCocheDisponibles && u.tieneCoche) return true;
             
             return false;
           });
           
           if (reemplazo) {
             // Aplicar el reemplazo
             usuariosAAsignar[i] = reemplazo;
             
             // Actualizar el estado de los requisitos
             tieneMasculino = usuariosAAsignar.some(u => u.sexo === 'M') || yaTieneMasculino;
             tieneCoche = usuariosAAsignar.some(u => u.tieneCoche) || yaTieneCoche;
             
             // Remover el reemplazo de la lista de disponibles
             const indexReemplazo = usuariosDisponiblesParaReemplazo.findIndex(u => u.id === reemplazo.id);
             if (indexReemplazo !== -1) {
               usuariosDisponiblesParaReemplazo.splice(indexReemplazo, 1);
             }
             
             // Si ya se cumplen todos los requisitos, salir del bucle
             if (tieneMasculino && (tieneCoche || !hayUsuariosConCocheDisponibles)) {
               break;
             }
           }
         }
       }
     }
    
         if (usuariosAAsignar.length === 0) {
       const usuariosOcupadosEnOtrosTurnos = usuariosOcupadosEnFecha.length;
       const usuariosYaAsignadosEnEsteTurno = usuariosAsignados.length;
       
       let mensaje = 'No se encontraron usuarios disponibles para completar el turno.';
       
       if (usuariosOcupadosEnOtrosTurnos > 0) {
         mensaje += `\n\n• ${usuariosOcupadosEnOtrosTurnos} usuarios están ocupados en otros turnos de esta fecha`;
       }
       
       if (usuariosYaAsignadosEnEsteTurno > 0) {
         mensaje += `\n• ${usuariosYaAsignadosEnEsteTurno} usuarios ya están asignados a este turno`;
       }
       
       mensaje += '\n\nEl sistema ha filtrado automáticamente los usuarios no disponibles para evitar errores.';
       
       Swal.fire({
         icon: 'warning',
         title: 'No hay usuarios disponibles',
         text: mensaje,
         confirmButtonText: 'Entendido'
       });
       return;
     }
     
    
     // Función interna para mostrar selección de usuarios
     const mostrarSeleccionUsuarios = async (usuariosAAsignar: Usuario[], plazasOcupadas: number, usuariosYaMostrados: Set<number> = new Set()) => {
       // Crear mensaje de confirmación simplificado con HTML para mejor formato
       const usuariosLista = usuariosAAsignar.map(usuario => {
         let info = `• ${usuario.nombre} (${usuario.cargo})`;
         if (usuario.siempreCon) {
           const usuarioRelacionado = usuariosDisponiblesParaAsignar.find(u => u.id === usuario.siempreCon);
           if (usuarioRelacionado) {
             info += ` + ${usuarioRelacionado.nombre}`;
           }
         }
         return info;
       }).join('<br>');
       
       // Agregar información sobre requisitos de forma más clara
       const requisitosInfo = [];
       
       // Verificar si el turno está completo
       const turnoCompleto = plazasOcupadas >= (turno.lugar?.capacidad || 0);
       if (turnoCompleto) {
         requisitosInfo.push('✅ Turno completo');
       }
       
       const requisitosFinales = {
         tieneMasculino: usuariosAAsignar.some(u => u.sexo === 'M') || yaTieneMasculino,
         tieneCoche: usuariosAAsignar.some(u => u.tieneCoche) || yaTieneCoche,
         hayUsuariosConCocheDisponibles: hayUsuariosConCocheDisponibles
       };
       
       if (requisitosFinales.tieneMasculino) requisitosInfo.push('👨 Usuario masculino');
       if (requisitosFinales.tieneCoche) requisitosInfo.push('🚗 Usuario con coche');
       
       // Detectar si está en modo oscuro para ajustar colores
       const isDarkMode = document.documentElement.classList.contains('dark');
       
       const textColor = isDarkMode ? '#e5e7eb' : '#374151';
       const titleColor = isDarkMode ? '#f9fafb' : '#111827';
       const listColor = isDarkMode ? '#9ca3af' : '#4b5563';
       const bgColor = isDarkMode ? '#1e3a8a' : '#eff6ff';
       const borderColor = isDarkMode ? '#3b82f6' : '#dbeafe';
       const accentColor = isDarkMode ? '#60a5fa' : '#1e40af';
       
       let mensaje = `<div style="text-align: left; color: ${textColor};">
         <p style="margin-bottom: 15px; font-weight: 600; color: ${titleColor};">Se van a asignar <strong>${usuariosAAsignar.length}</strong> usuarios al turno:</p>
         <div style="margin-bottom: 15px; padding-left: 10px; color: ${listColor};">
           ${usuariosLista}
         </div>`;
       
       if (requisitosInfo.length > 0) {
         mensaje += `<div style="margin-bottom: 15px; padding: 12px; background-color: ${bgColor}; border: 1px solid ${borderColor}; border-left: 4px solid #3b82f6; border-radius: 6px;">
           <p style="margin: 0 0 8px 0; font-weight: 600; color: ${accentColor}; font-size: 14px;">✅ Requisitos cumplidos:</p>
           <ul style="margin: 0; padding-left: 18px; color: ${textColor};">
             ${requisitosInfo.map(req => `<li style="margin: 3px 0; font-size: 14px;">${req}</li>`).join('')}
           </ul>
         </div>`;
       }
       
       mensaje += `<p style="margin-bottom: 0; font-weight: 600; color: ${titleColor};">¿Qué prefieres hacer?</p></div>`;
       
       // Mostrar SweetAlert de confirmación con HTML y botón adicional
       const result = await Swal.fire({
         title: 'Confirmar Asignación Automática',
         html: mensaje,
         icon: 'question',
         showCancelButton: true,
         showDenyButton: true,
         confirmButtonText: 'Sí, asignar estos usuarios',
         denyButtonText: 'Elegir otros usuarios',
         cancelButtonText: 'Cancelar',
         confirmButtonColor: '#3b82f6',
         denyButtonColor: '#10b981',
         cancelButtonColor: '#6b7280',
         customClass: {
           popup: isDarkMode ? 'swal2-dark' : '',
           title: isDarkMode ? 'swal2-dark' : '',
           htmlContainer: isDarkMode ? 'swal2-dark' : '',
           confirmButton: isDarkMode ? 'swal2-dark' : '',
           denyButton: isDarkMode ? 'swal2-dark' : '',
           cancelButton: isDarkMode ? 'swal2-dark' : ''
         }
       });
       
       // Si el usuario elige otros usuarios, generar una nueva selección automática
       if (result.isDenied) {
         // Agregar los usuarios actuales a la lista de usuarios ya mostrados
         usuariosAAsignar.forEach(usuario => {
           usuariosYaMostrados.add(usuario.id);
           // También agregar usuarios relacionados si existen
           if (usuario.siempreCon) {
             usuariosYaMostrados.add(usuario.siempreCon);
           }
         });
         
         // Filtrar usuarios disponibles excluyendo todos los ya mostrados
         const usuariosDisponiblesRestantes = usuariosConRelaciones.filter(
           usuario => !usuariosYaMostrados.has(usuario.id)
         );
         
         if (usuariosDisponiblesRestantes.length === 0) {
           Swal.fire({
             icon: 'info',
             title: 'No hay más opciones',
             text: 'No hay más usuarios disponibles para asignar. Se mostrarán los usuarios originales.',
             confirmButtonText: 'Entendido'
           });
           // Mostrar la selección original
           return handleAsignacionAutomatica(turno);
         }
         
         // Generar nueva selección con usuarios diferentes
         const usuariosOrdenadosRestantes = [...usuariosDisponiblesRestantes].sort((a, b) => {
           const participacionA = a.participacionMensual || 0;
           const participacionB = b.participacionMensual || 0;
           
           if (participacionA === participacionB) {
             const prioridadA = a.cargoInfo?.prioridad || 999;
             const prioridadB = b.cargoInfo?.prioridad || 999;
             
             if (prioridadA === prioridadB) {
               const hashA = (a.id * 9301 + 49297) % 233280;
               const hashB = (b.id * 9301 + 49297) % 233280;
               return hashA - hashB;
             }
             
             return prioridadA - prioridadB;
           }
           
           return participacionA - participacionB;
         });
         
         // Seleccionar usuarios alternativos
         let usuariosAlternativos: Usuario[] = [];
         let plazasAlternativas = 0;
         let usuariosExcluidosAcumulados = new Set<number>();
         
         for (const usuario of usuariosOrdenadosRestantes) {
           if (plazasAlternativas >= usuariosNecesarios) break;
           
           if (usuariosExcluidosAcumulados.has(usuario.id)) {
             continue;
           }
           
           const plazasQueOcupa = usuario.siempreCon ? 2 : 1;
           
           if (plazasAlternativas + plazasQueOcupa <= usuariosNecesarios) {
             const exclusionesDelUsuario = obtenerUsuariosExcluidos(usuario);
             exclusionesDelUsuario.forEach((id: number) => usuariosExcluidosAcumulados.add(id));
             
             usuariosAlternativos.push(usuario);
             plazasAlternativas += plazasQueOcupa;
           }
         }
         
         if (usuariosAlternativos.length === 0) {
           Swal.fire({
             icon: 'warning',
             title: 'No hay usuarios disponibles',
             text: 'No se encontraron usuarios alternativos para completar el turno.',
             confirmButtonText: 'Entendido'
           });
           return;
         }
         
         // Mostrar la nueva selección recursivamente, pasando el Set actualizado
         return mostrarSeleccionUsuarios(usuariosAlternativos, plazasAlternativas, usuariosYaMostrados);
       }
       
       // Si el usuario confirma, proceder con la asignación
       if (result.isConfirmed) {
         try {
           // Importar la API directamente para evitar confirmaciones individuales
           const { default: api } = await import('../../services/api');
           
           // Asignar usuarios uno por uno hasta completar el turno
           for (const usuario of usuariosAAsignar) {
             try {
               // Asignar el usuario principal
               await api.asignarUsuarioATurno(turno.id, usuario.id);
               
               // Si tiene un "siempreCon", asignar también al usuario relacionado
               if (usuario.siempreCon) {
                 const usuarioRelacionado = usuariosDisponiblesParaAsignar.find(u => u.id === usuario.siempreCon);
                 if (usuarioRelacionado) {
                   await api.asignarUsuarioATurno(turno.id, usuarioRelacionado.id);
                 }
               }
               
               // Pequeña pausa para evitar sobrecarga
               await new Promise(resolve => setTimeout(resolve, 100));
             } catch (error) {
               console.error('Error al asignar usuario automáticamente:', error);
               throw error; // Re-lanzar el error para manejarlo en el catch exterior
             }
           }
           
           // Invalidar la caché de turnos y participación mensual para forzar una recarga de datos
           queryClient.invalidateQueries(['turnos']);
           
           // Invalidar la caché de participación mensual para todos los usuarios asignados
           const todosLosUsuariosIds = usuariosAAsignar.map(u => u.id);
           if (usuariosAAsignar.some(u => u.siempreCon)) {
             // Si hay usuarios con "siempreCon", agregar también esos IDs
             usuariosAAsignar.forEach(u => {
               if (u.siempreCon) {
                 todosLosUsuariosIds.push(u.siempreCon);
               }
             });
           }
           
           // Invalidar queries individuales de participación mensual
           todosLosUsuariosIds.forEach(userId => {
             queryClient.invalidateQueries(['participacionMensualActual', userId]);
           });
          
           // Mostrar mensaje de éxito con información de requisitos
           Swal.fire({
             icon: 'success',
             title: 'Turno completado exitosamente',
             html: `
               <div class="text-left">
                 <p class="mb-3">Se han asignado <strong>${usuariosAAsignar.length}</strong> usuarios al turno (ocupando <strong>${plazasOcupadas}</strong> plazas)</p>
                 <div class="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-sm">
                   <p><strong>Requisitos cumplidos:</strong></p>
                   <ul class="list-disc list-inside mt-2">
                     <li>Usuario masculino: ${requisitosFinales.tieneMasculino ? '✅ Cumplido' : '❌ Pendiente'}</li>
                     <li>Usuario con coche: ${requisitosFinales.tieneCoche ? '✅ Cumplido' : requisitosFinales.hayUsuariosConCocheDisponibles ? '❌ Pendiente' : '⚠️ No hay usuarios con coche disponibles'}</li>
                   </ul>
                 </div>
               </div>
             `,
             confirmButtonText: 'Perfecto'
           });
         } catch (error) {
           console.error('Error al completar el turno automáticamente:', error);
           
           // Manejar errores específicos del backend
           let mensajeError = 'Ha ocurrido un error al intentar asignar usuarios automáticamente';
           
           if (error && typeof error === 'object' && 'response' in error) {
             const response = (error as any).response;
             if (response?.data?.message) {
               mensajeError = response.data.message;
             } else if (response?.status === 400) {
               mensajeError = 'Uno o más usuarios ya están asignados a otros turnos en esta fecha';
             } else if (response?.status === 409) {
               mensajeError = 'Conflicto: Los usuarios seleccionados no pueden ser asignados a este turno';
             }
           }
           
           // Mostrar mensaje de error
           Swal.fire({
             icon: 'error',
             title: 'Error al completar el turno',
             text: mensajeError,
             confirmButtonText: 'Entendido'
           });
         }
       }
     };
     
     // Mostrar la selección inicial con un Set vacío para usuarios ya mostrados
     return mostrarSeleccionUsuarios(usuariosAAsignar, plazasOcupadas, new Set());
  };

  // Función para vaciar el turno (eliminar todos los usuarios)
  const handleVaciarTurno = async (turno: Turno) => {
    const usuariosAsignados = turno.usuarios || [];
    
    if (usuariosAsignados.length === 0) return;
    
    // Crear mensaje de confirmación
    const mensaje = `Se van a eliminar los siguientes usuarios del turno:\n\n${usuariosAsignados.map(usuario => {
      const prioridadCargo = usuario.cargoInfo?.prioridad ? ` - Prioridad: ${usuario.cargoInfo.prioridad}` : '';
      return `• ${usuario.nombre} (${usuario.cargo})${prioridadCargo}`;
    }).join('\n')}\n\n¿Estás seguro de que quieres vaciar completamente el turno?`;
    
    // Mostrar SweetAlert de confirmación
    const result = await confirmDelete(
      'Vaciar Turno',
      mensaje
    );
    
    // Si el usuario confirma, proceder con la eliminación
    if (result.isConfirmed) {
      try {
        // Importar la API directamente para evitar confirmaciones individuales
        const { default: api } = await import('../../services/api');
        
        // Eliminar todos los usuarios de una vez sin confirmaciones individuales
        for (const usuario of usuariosAsignados) {
          await api.liberarTurno(turno.id, usuario.id);
        }
        
                 // Invalidar la caché de turnos y participación mensual para forzar una recarga de datos
         queryClient.invalidateQueries(['turnos']);
         
         // Invalidar la caché de participación mensual para todos los usuarios removidos
         const usuariosRemovidosIds = usuariosAsignados.map(u => u.id);
         usuariosRemovidosIds.forEach(userId => {
           queryClient.invalidateQueries(['participacionMensualActual', userId]);
         });
        
        // Mostrar mensaje de éxito
        Swal.fire({
          icon: 'success',
          title: 'Turno vaciado exitosamente',
          text: 'Se han eliminado todos los usuarios del turno',
          confirmButtonText: 'Perfecto'
        });
      } catch (error) {
        console.error('Error al vaciar el turno:', error);
        
        // Mostrar mensaje de error
        Swal.fire({
          icon: 'error',
          title: 'Error al vaciar el turno',
          text: 'Ha ocurrido un error al intentar vaciar el turno',
          confirmButtonText: 'Entendido'
        });
      }
    }
  };

  const requisitos = calcularRequisitosTurno();

  return (
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
          {/* Título y botones de la esquina superior */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Detalles del Turno #{selectedTurno.id}
              {isEditing && (
                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editando
                </span>
              )}
            </h3>
            <div className="flex items-center space-x-2">
              {/* Botones de edición flotantes */}
              {(_user?.rol === 'admin' || _user?.rol === 'superAdmin') && (
                <>
                  {!isEditing ? (
                    <button
                      onClick={handleIniciarEdicion}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                      title="Editar turno"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleCancelarEdicion}
                        className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-md transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleGuardarCambios}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Guardar
                      </button>
                    </>
                  )}
                </>
              )}
              {/* Botón cerrar */}
              <button
                onClick={() => setShowTurnoModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Información del turno */}
          <div>
            {!isEditing ? (
              // Vista normal (solo lectura)
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                  <p className="text-gray-600 dark:text-gray-400">Exhibidores:</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedTurno.exhibidores && selectedTurno.exhibidores.length > 0 
                      ? selectedTurno.exhibidores.map(e => e.nombre).join(', ')
                      : 'Sin exhibidores'
                    }
                  </p>
                </div>
              </div>
            ) : (
              // Vista de edición
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Fecha
                      </label>
                      <input
                        type="date"
                        value={editFormData.fecha}
                        onChange={(e) => setEditFormData({...editFormData, fecha: e.target.value})}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Hora Inicio
                      </label>
                      <input
                        type="time"
                        value={editFormData.horaInicio}
                        onChange={(e) => setEditFormData({...editFormData, horaInicio: e.target.value})}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Hora Fin
                      </label>
                      <input
                        type="time"
                        value={editFormData.horaFin}
                        onChange={(e) => setEditFormData({...editFormData, horaFin: e.target.value})}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Lugar
                      </label>
                      <select
                        value={editFormData.lugarId || ''}
                        onChange={(e) => {
                          const lugarId = Number(e.target.value);
                          setEditFormData({...editFormData, lugarId});
                          const lugar = lugares.find(l => l.id === lugarId);
                          setSelectedLugar(lugar || null);
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      >
                        <option value="">Seleccionar...</option>
                        {lugares.map((lugar: Lugar) => (
                          <option key={lugar.id} value={lugar.id}>
                            {lugar.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contenido del modal */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Layout principal con dos columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Columna izquierda: Información del turno y requisitos */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Información del lugar */}
              {selectedTurno.lugar && (
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Información del Lugar
                    </h4>
                    <button
                      onClick={() => setLugarDesplegado(!lugarDesplegado)}
                      className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      {lugarDesplegado ? 'Ocultar' : 'Mostrar'}
                      <svg 
                        className={`w-4 h-4 ml-1 transition-transform duration-200 ${lugarDesplegado ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  
                  {lugarDesplegado && (
                    <div className="space-y-4">
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
                      
                      {/* Botón para ver el mapa */}
                      {selectedTurno.lugar.latitud && selectedTurno.lugar.longitud && (
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                          <button
                            onClick={() => setShowMapModal(true)}
                            className="flex items-center justify-center w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                            </svg>
                            Ver en el Mapa
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}



              {/* Requisitos del Turno */}
              <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-base font-semibold text-blue-900 dark:text-blue-100 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Requisitos del Turno
                  </h4>
                  <button
                    onClick={() => setRequisitosDesplegados(!requisitosDesplegados)}
                    className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                  >
                    {requisitosDesplegados ? 'Ocultar' : 'Mostrar'}
                    <svg 
                      className={`w-4 h-4 ml-1 transition-transform duration-200 ${requisitosDesplegados ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                
                {/* Resumen compacto cuando está plegado */}
                {!requisitosDesplegados && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                      {[requisitos.completo, requisitos.tieneCoche, requisitos.tieneMasculino].filter(Boolean).length}/3 requisitos cumplidos
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      requisitos.completo && requisitos.tieneCoche && requisitos.tieneMasculino
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {requisitos.completo && requisitos.tieneCoche && requisitos.tieneMasculino
                        ? '✅ Óptimo'
                        : '⚠️ Pendiente'
                      }
                    </span>
                  </div>
                )}
                
                {/* Detalles completos cuando está desplegado */}
                {requisitosDesplegados && (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      {/* Requisito 1: Turno Completo */}
                      <div className={`p-2 rounded border transition-all duration-300 ${
                        requisitos.completo 
                          ? 'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-600' 
                          : 'bg-yellow-100 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-600'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-900 dark:text-white">Ocupación</span>
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                            requisitos.completo 
                              ? 'bg-green-500 text-white' 
                              : 'bg-yellow-500 text-white'
                          }`}>
                            {requisitos.completo ? '✓' : '!'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {requisitos.completo 
                            ? 'OK' 
                            : `${Math.max(0, (selectedTurno.lugar?.capacidad || 1) - (selectedTurno.usuarios?.length || 0))} faltan`
                          }
                        </p>
                      </div>

                      {/* Requisito 2: Al menos un coche */}
                      <div className={`p-2 rounded border transition-all duration-300 ${
                        requisitos.tieneCoche 
                          ? 'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-600' 
                          : 'bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-600'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-900 dark:text-white">Coche</span>
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                            requisitos.tieneCoche 
                              ? 'bg-green-500 text-white' 
                              : 'bg-red-500 text-white'
                          }`}>
                            {requisitos.tieneCoche ? '✓' : '✗'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {requisitos.tieneCoche ? 'OK' : 'Falta'}
                        </p>
                      </div>

                      {/* Requisito 3: Al menos un masculino */}
                      <div className={`p-2 rounded border transition-all duration-300 ${
                        requisitos.tieneMasculino 
                          ? 'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-600' 
                          : 'bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-600'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-900 dark:text-white">Masculino</span>
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                            requisitos.tieneMasculino 
                              ? 'bg-green-500 text-white' 
                              : 'bg-red-500 text-white'
                          }`}>
                            {requisitos.tieneMasculino ? '✓' : '✗'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {requisitos.tieneMasculino ? 'OK' : 'Falta'}
                        </p>
                      </div>
                    </div>

                    {/* Resumen del estado - más compacto */}
                    <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-900 dark:text-white">Estado:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          requisitos.completo && requisitos.tieneCoche && requisitos.tieneMasculino
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {requisitos.completo && requisitos.tieneCoche && requisitos.tieneMasculino
                            ? '✅ Óptimo'
                            : '⚠️ Pendiente'
                          }
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Usuarios asignados y puestos disponibles */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Ocupación del Turno ({selectedTurno.usuarios?.length || 0}/{selectedTurno.lugar?.capacidad || '∞'})
                </h4>
                
                {/* Indicador especial para rol "grupo" */}
                {selectedTurno.usuarios && selectedTurno.usuarios.some(u => u.rol === 'grupo') && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-2 border-purple-300 dark:border-purple-600 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9ZM19 21H5V3H13V9H19V21Z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-purple-800 dark:text-purple-200">
                          🎯 Turno Completado por Rol "Grupo"
                        </p>
                        <p className="text-sm text-purple-700 dark:text-purple-300">
                          Este turno fue completado automáticamente por un usuario con rol "grupo". 
                          Se crearon usuarios temporales para cumplir todos los requisitos.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Grid de usuarios y puestos vacíos */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {/* Si hay un usuario con cargo "Grupo", mostrar solo el rectángulo del grupo */}
                  {tieneUsuarioGrupo() ? (
                    // Rectángulo único del grupo ocupando todo el turno
                    <div className="col-span-full">
                      <div className="p-6 bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-800/30 dark:to-purple-700/30 border-2 border-purple-400 dark:border-purple-500 rounded-lg text-center">
                        <div className="flex items-center justify-center space-x-4 mb-4">
                          <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9ZM19 21H5V3H13V9H19V21Z"/>
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                              🎯 Grupo Asignado
                            </h3>
                            <p className="text-lg text-purple-700 dark:text-purple-300">
                              Este turno está completamente ocupado por un grupo
                            </p>
                          </div>
                        </div>
                        
                        {/* Información del grupo */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-purple-50 dark:bg-purple-800/20 p-3 rounded-lg">
                            <span className="font-semibold text-purple-800 dark:text-purple-200">Capacidad:</span>
                            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{selectedTurno.lugar?.capacidad || 0} plazas</p>
                          </div>
                          <div className="bg-purple-50 dark:bg-purple-800/20 p-3 rounded-lg">
                            <span className="font-semibold text-purple-800 dark:text-purple-200">Estado:</span>
                            <p className="text-lg font-bold text-green-600 dark:text-green-400">Completo</p>
                          </div>
                          <div className="bg-purple-50 dark:bg-purple-800/20 p-3 rounded-lg">
                            <span className="font-semibold text-purple-800 dark:text-purple-200">Requisitos:</span>
                            <p className="text-lg font-bold text-green-600 dark:text-green-400">Cumplidos</p>
                          </div>
                        </div>
                        
                        {/* Usuario grupo destacado */}
                        {selectedTurno.usuarios?.filter(u => u.cargo === 'Grupo').map((usuario) => (
                          <div key={usuario.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-purple-300 dark:border-purple-600">
                            <div className="flex items-center justify-center space-x-3">
                              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-xl font-bold text-white">
                                  {usuario.nombre.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="text-center">
                                <p className="font-semibold text-purple-900 dark:text-purple-100 text-lg">
                                  {usuario.nombre}
                                </p>
                                <p className="text-purple-700 dark:text-purple-300">
                                  {usuario.cargo}
                                </p>
                                <div className="flex items-center justify-center space-x-2 mt-2">
                                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                                    🎯 Rol Grupo
                                  </span>
                                  {usuario.tieneCoche && (
                                    <span className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs rounded-full">
                                      🚗 Con Coche
                                    </span>
                                  )}
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    usuario.sexo === 'M' 
                                      ? 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                                      : usuario.sexo === 'F'
                                      ? 'bg-pink-100 dark:bg-pink-800 text-pink-800 dark:text-pink-200'
                                      : 'bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200'
                                  }`}>
                                    {usuario.sexo === 'M' ? '👨 Masculino' : usuario.sexo === 'F' ? '👩 Femenino' : '👤 Otro'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Botón de remover (solo para admins o para removerte a ti mismo) */}
                            {(_user?.rol === 'admin' || _user?.rol === 'superAdmin' || usuario.id === _user?.id) && (
                              <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-600">
                                <button
                                  onClick={() => handleLiberarTurno(selectedTurno, usuario.id)}
                                  disabled={liberarTurnoMutation.isPending}
                                  className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-md transition-colors flex items-center justify-center"
                                  title={usuario.id === _user?.id ? "Removerte a ti mismo" : "Remover grupo del turno"}
                                >
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  {liberarTurnoMutation.isPending ? 'Removiendo...' : 'Remover Grupo del Turno'}
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // Vista normal: usuarios individuales y puestos vacíos
                    <>
                      {/* Usuarios ya asignados */}
                      {selectedTurno.usuarios && selectedTurno.usuarios.map((usuario) => (
                        <div key={usuario.id} className="relative group">
                          <div className={`p-3 border-2 rounded-lg text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105 ${
                            // Estilo especial para usuarios con cargo "Grupo"
                            usuario.cargo === 'Grupo' 
                              ? 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-300 dark:border-purple-600'
                              : 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-300 dark:border-blue-600'
                          }`}>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                              usuario.cargo === 'Grupo'
                                ? 'bg-gradient-to-br from-purple-200 to-purple-300 dark:from-purple-700 dark:to-purple-600'
                              : 'bg-gradient-to-br from-blue-200 to-blue-300 dark:from-blue-700 dark:to-blue-600'
                            }`}>
                              <span className={`text-lg font-bold ${
                                usuario.cargo === 'Grupo'
                                  ? 'text-purple-700 dark:text-purple-300'
                                : 'text-blue-700 dark:text-blue-300'
                              }`}>
                                {usuario.nombre.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            
                            {/* Badge especial para cargo "Grupo" */}
                            {usuario.cargo === 'Grupo' && (
                              <div className="absolute -top-2 -left-2 w-6 h-6 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center shadow-lg">
                                🎯
                              </div>
                            )}
                            
                            <p 
                              className={`font-medium text-sm truncate ${
                                usuario.cargo === 'Grupo'
                                  ? 'text-purple-900 dark:text-purple-100'
                                : 'text-blue-900 dark:text-blue-100'
                              }`}
                              ref={(el) => {
                                if (el) {
                                  el.title = el.scrollWidth > el.clientWidth ? usuario.nombre : '';
                                }
                              }}
                            >
                              {usuario.nombre}
                            </p>
                            
                            <p 
                              className={`text-xs truncate ${
                                usuario.cargo === 'Grupo'
                                  ? 'text-purple-700 dark:text-purple-300'
                                : 'text-blue-700 dark:text-blue-300'
                              }`}
                              ref={(el) => {
                                if (el) {
                                  el.title = el.scrollWidth > el.clientWidth ? usuario.cargo : '';
                                }
                              }}
                            >
                              {usuario.cargo}
                            </p>
                            
                            {/* Indicador de coche - Badge en esquina superior derecha */}
                            <div className="absolute top-2 right-2">
                              {usuario.tieneCoche ? (
                                <div className="w-5 h-5 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-600 rounded-full flex items-center justify-center shadow-sm">
                                  <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                                  </svg>
                                </div>
                              ) : (
                                <div className="w-5 h-5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded-full flex items-center justify-center shadow-sm">
                                  <svg className="w-3 h-3 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                                    <path d="M2 2l20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </div>
                              )}
                            </div>
                            
                            {/* Indicador de sexo - Badge en esquina inferior izquierda */}
                            <div className="absolute bottom-2 left-2">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center shadow-sm ${
                                usuario.sexo === 'M' 
                                  ? 'bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-600'
                                  : usuario.sexo === 'F'
                                  ? 'bg-pink-100 dark:bg-pink-900 border border-pink-300 dark:border-pink-600'
                                  : 'bg-purple-100 dark:bg-purple-900 border border-purple-300 dark:border-purple-600'
                              }`}>
                                <span className={`text-xs font-bold ${
                                  usuario.sexo === 'M' 
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : usuario.sexo === 'F'
                                    ? 'text-pink-600 dark:text-pink-400'
                                    : 'text-purple-600 dark:text-purple-400'
                                }`}>
                                  {usuario.sexo}
                                </span>
                              </div>
                            </div>
                            
                            <ParticipacionMensualDisplay
                              userId={usuario.id}
                              participacionMensual={usuario.participacionMensual}
                              className={`${
                                usuario.cargo === 'Grupo'
                                  ? 'text-purple-600 dark:text-purple-400'
                                : 'text-blue-600 dark:text-blue-400'
                              }`}
                              mes={getMesYAñoDelTurno().mes}
                              año={getMesYAñoDelTurno().año}
                            />
                            
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
                      {selectedTurno.lugar?.capacidad && 
                       Array.from({ length: Math.max(0, selectedTurno.lugar.capacidad - (selectedTurno.usuarios?.length || 0)) }, (_, index) => (
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
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Columna derecha: Panel lateral con información adicional y acciones */}
            <div className="space-y-6">
              
              {/* Asignar usuarios (solo para admins) */}
              {(_user?.rol === 'admin' || _user?.rol === 'superAdmin') && (
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                  <h4 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Asignar Usuario
                  </h4>
                  
                                     {loadingUsuarios ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Cargando usuarios...</p>
                    </div>
                  ) : (
                    <>
                      
                      
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {usuariosDisponibles
                          .filter(usuario => !selectedTurno.usuarios?.some(u => u.id === usuario.id))
                          .map((usuario) => {
                            // Buscar si este usuario tiene un "siempreCon"
                            const tieneSiempreCon = usuario.siempreCon;
                            const usuarioRelacionado = tieneSiempreCon ? usuariosDisponibles.find(u => u.id === usuario.siempreCon) : null;
                            
                            return (
                              <div key={usuario.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 border border-green-200 dark:border-green-600 rounded-lg min-w-0">
                                <div className="flex items-center space-x-2 min-w-0 flex-1">
                                  {/* Indicador de coche en lugar del círculo con inicial */}
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    usuario.tieneCoche 
                                      ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-300 dark:border-blue-600' 
                                      : 'bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-500'
                                  }`}>
                                    {usuario.tieneCoche ? (
                                      <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                                      </svg>
                                    ) : (
                                      <svg className="w-3 h-3 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                                        <path d="M2 2l20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p 
                                      className="text-xs font-medium text-gray-900 dark:text-white truncate" 
                                      ref={(el) => {
                                        if (el) {
                                          el.title = el.scrollWidth > el.clientWidth ? usuario.nombre : '';
                                        }
                                      }}
                                    >
                                      {usuario.nombre}
                                    </p>
                                    <p 
                                      className="text-xs text-gray-500 dark:text-gray-400 truncate"
                                      ref={(el) => {
                                        if (el) {
                                          el.title = el.scrollWidth > el.clientWidth ? usuario.cargo : '';
                                        }
                                      }}
                                    >
                                      {usuario.cargo}
                                    </p>
                                    <ParticipacionMensualDisplay
                                      userId={usuario.id}
                                      participacionMensual={usuario.participacionMensual}
                                      className="text-green-600 dark:text-green-400"
                                      mes={getMesYAñoDelTurno().mes}
                                      año={getMesYAñoDelTurno().año}
                                    />
                                    {/* Mostrar información de relación si existe */}
                                    {tieneSiempreCon && usuarioRelacionado && (
                                      <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                                        Siempre con: {usuarioRelacionado.nombre}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    handleAsignarUsuario(selectedTurno, usuario.id);
                                  }}
                                  disabled={asignarUsuarioMutation.isPending}
                                  className="px-2 py-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs rounded-md transition-colors flex-shrink-0 ml-2"
                                >
                                  {asignarUsuarioMutation.isPending ? '...' : 'Asignar'}
                                </button>
                              </div>
                            );
                          })}
                        {usuariosDisponibles.filter(usuario => !selectedTurno.usuarios?.some(u => u.id === usuario.id)).length === 0 && (
                          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                            <p className="text-xs">No hay usuarios disponibles</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer del modal */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          {/* Botones de acción */}
          <div className="flex justify-between items-center">
            {/* Lado izquierdo: Botón de vaciar turno (solo si hay usuarios asignados) */}
            <div className="flex-1">
              {selectedTurno.usuarios && selectedTurno.usuarios.length > 0 && (
                <button
                  onClick={() => handleVaciarTurno(selectedTurno)}
                  disabled={liberarTurnoMutation.isPending}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-md transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {liberarTurnoMutation.isPending ? 'Vaciando...' : 'Vaciar Turno'}
                </button>
              )}
            </div>
            
            {/* Lado derecho: Botón de asignación automática */}
            <div className="flex justify-end">
              {selectedTurno.lugar?.capacidad && (selectedTurno.usuarios?.length || 0) < selectedTurno.lugar.capacidad && (
                <button
                  onClick={() => handleAsignacionAutomatica(selectedTurno)}
                  disabled={asignarUsuarioMutation.isPending}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-md transition-colors flex items-center"
                  title="La asignación automática considera las relaciones 'siempreCon' de los usuarios"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {asignarUsuarioMutation.isPending ? 'Asignando...' : 'Completar Turno Automáticamente'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal del mapa del lugar */}
      {showMapModal && selectedTurno.lugar && (
        <PlaceMapModal
          isOpen={showMapModal}
          onClose={() => setShowMapModal(false)}
          lugar={selectedTurno.lugar}
        />
      )}
    </div>
  );
}
