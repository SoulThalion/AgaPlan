import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { Turno, Lugar, Usuario, Exhibidor, TurnoCreationRequest, TurnoRecurrenteRequest } from '../types';
import Swal from 'sweetalert2';
import DatePicker from './DatePicker';
import TimeRangePicker from './TimeRangePicker';
import { useEquipo } from '../contexts/EquipoContext';

const ShiftManagement: React.FC = () => {
  const { currentEquipoId } = useEquipo();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Turno | null>(null);
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    horaInicio: '09:00',
    horaFin: '10:00',
    lugarId: 0,
    exhibidorIds: [] as number[],
    usuarioIds: [] as number[], // Cambiado de usuarioId a usuarioIds
    esRecurrente: false,
    semanas: 4
  });
  const [selectedLugar, setSelectedLugar] = useState<Lugar | null>(null);
  const [selectedTurnos, setSelectedTurnos] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const queryClient = useQueryClient();

  // Obtener datos necesarios
  const { data: turnos, isLoading: turnosLoading, error: turnosError } = useQuery({
    queryKey: ['turnos', currentEquipoId],
    queryFn: () => apiService.getTurnos()
  });

  const { data: lugares, isLoading: lugaresLoading } = useQuery({
    queryKey: ['lugares', currentEquipoId],
    queryFn: () => apiService.getLugares()
  });

  const { data: usuarios, isLoading: usuariosLoading } = useQuery({
    queryKey: ['usuarios', currentEquipoId],
    queryFn: () => apiService.getUsuarios()
  });

  const { data: exhibidores } = useQuery({
    queryKey: ['exhibidores', currentEquipoId],
    queryFn: () => apiService.getExhibidores()
  });

  // Actualizar exhibidores disponibles cuando cambie el lugar
  useEffect(() => {
    if (formData.lugarId && lugares?.data) {
      const lugar = lugares.data.find((l: Lugar) => l.id === formData.lugarId);
      setSelectedLugar(lugar || null);
      
      // Resetear exhibidores si no existen en la lista de exhibidores disponibles
      if (exhibidores?.data && formData.exhibidorIds.length > 0) {
        const validExhibidorIds = formData.exhibidorIds.filter(id => 
          exhibidores.data!.find((e: Exhibidor) => e.id === id)
        );
        if (validExhibidorIds.length !== formData.exhibidorIds.length) {
          setFormData(prev => ({ ...prev, exhibidorIds: validExhibidorIds }));
        }
      }
    }
  }, [formData.lugarId, lugares?.data, exhibidores?.data]);

  // Mutaciones
  const createShiftMutation = useMutation({
    mutationFn: (data: TurnoCreationRequest) => apiService.createTurno(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
      setIsModalOpen(false);
      resetForm();
      Swal.fire({
        icon: 'success',
        title: 'Turno creado',
        text: 'El turno se ha creado exitosamente',
        timer: 2000,
        showConfirmButton: false
      });
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Error al crear turno'
      });
    }
  });

  const createRecurrenteMutation = useMutation({
    mutationFn: (data: TurnoRecurrenteRequest) => apiService.createTurnosRecurrentes(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
      setIsModalOpen(false);
      resetForm();
      Swal.fire({
        icon: 'success',
        title: 'Turnos recurrentes creados',
        text: response.message || 'Los turnos recurrentes se han creado exitosamente',
        timer: 3000,
        showConfirmButton: false
      });
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Error al crear turnos recurrentes'
      });
    }
  });

  // Función para replicar turnos del mes actual al siguiente mes
  const handleReplicarMes = async () => {
    if (!turnos?.data || turnos.data.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No hay turnos para replicar',
        text: 'No hay turnos configurados en el sistema para poder replicar.',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    try {
      // Determinar qué mes usar como base
      const fechaActual = new Date();
      const mesActual = fechaActual.getMonth();
      const añoActual = fechaActual.getFullYear();
      
      // Obtener turnos del mes actual o del mes pasado si no hay turnos en el actual
      let turnosBase = turnos.data.filter(turno => {
        const [añoTurno, mesTurno] = turno.fecha.split('-').map(Number);
        return mesTurno - 1 === mesActual && añoTurno === añoActual; // mes - 1 porque los meses van de 0-11
      });

      // Si no hay turnos en el mes actual, usar el mes pasado
      if (turnosBase.length === 0) {
        const mesPasado = mesActual === 0 ? 11 : mesActual - 1;
        const añoPasado = mesActual === 0 ? añoActual - 1 : añoActual;
        
        turnosBase = turnos.data.filter(turno => {
          const [añoTurno, mesTurno] = turno.fecha.split('-').map(Number);
          return mesTurno - 1 === mesPasado && añoTurno === añoPasado; // mes - 1 porque los meses van de 0-11
        });
      }

      if (turnosBase.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'No hay turnos para replicar',
          text: 'No se encontraron turnos en el mes actual ni en el mes pasado para poder replicar.',
          confirmButtonText: 'Entendido'
        });
        return;
      }

      // Calcular el mes objetivo (siguiente mes)
      const mesObjetivo = mesActual === 11 ? 0 : mesActual + 1;
      const añoObjetivo = mesActual === 11 ? añoActual + 1 : añoActual;

      // Mostrar confirmación con detalles
      const mesBase = turnosBase[0] ? (() => {
        const [añoBase, mesBase] = turnosBase[0].fecha.split('-').map(Number);
        return new Date(añoBase, mesBase - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      })() : '';
      const mesDestino = new Date(añoObjetivo, mesObjetivo).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

      const result = await Swal.fire({
        icon: 'question',
        title: 'Replicar Turnos del Mes',
        html: `
          <div class="text-left">
            <p class="mb-3">Se van a replicar <strong>${turnosBase.length}</strong> turnos del mes de <strong>${mesBase}</strong> al mes de <strong>${mesDestino}</strong>.</p>
            <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm">
              <p><strong>Detalles de la replicación:</strong></p>
              <ul class="list-disc list-inside mt-2">
                <li>Se mantendrán los mismos días de la semana</li>
                <li>Se mantendrán los mismos horarios y lugares</li>
                <li>Se mantendrán los mismos exhibidores</li>
                <li><strong>Los usuarios asignados se dejarán vacíos</strong></li>
                <li>Se ajustarán las fechas al mes siguiente</li>
              </ul>
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Sí, replicar turnos',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#6b7280'
      });

      if (!result.isConfirmed) return;

      // Mostrar progreso e inicializar variables
      let turnosCreados = 0;
      let turnosConError = 0;
      const errores: string[] = [];

      // Mostrar progreso con promesa que NO se resuelve hasta completar la replicación
      Swal.fire({
        title: 'Replicando turnos...',
        html: `
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Procesando ${turnosBase.length} turnos...</p>
            <div class="mt-3">
              <div class="bg-gray-200 rounded-full h-2">
                <div id="progress-bar" class="bg-blue-600 h-2 rounded-full" style="width: 0%"></div>
              </div>
              <p id="progress-text" class="text-sm mt-2">0 de ${turnosBase.length} turnos procesados</p>
            </div>
          </div>
        `,
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
          // Deshabilitar el botón de cerrar
          Swal.getCloseButton()?.style.setProperty('display', 'none');
        }
      });

      // Ejecutar replicación en paralelo con el progreso
      const replicationPromise = (async () => {
        // Replicar cada turno
        for (let i = 0; i < turnosBase.length; i++) {
          const turno = turnosBase[i];
          try {
            console.log(`Procesando turno ${i + 1}/${turnosBase.length}: ${turno.id}`);
            
            // Parsear la fecha correctamente para evitar problemas de zona horaria
            const [añoOriginal, mesOriginal, diaOriginal] = turno.fecha.split('-').map(Number);
            const fechaOriginal = new Date(añoOriginal, mesOriginal - 1, diaOriginal); // mes - 1 porque los meses van de 0-11
            const diaSemana = fechaOriginal.getDay(); // 0 = domingo, 1 = lunes, etc.
            
            console.log(`Turno original: ${fechaOriginal.toDateString()} - Día: ${diaSemana} (${['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][diaSemana]}) - Día ${diaOriginal} del mes`);
            
            // Calcular la fecha del siguiente mes de manera simple
            // Encontrar el primer día de la semana que coincida en el mes objetivo
            let fechaObjetivo = new Date(añoObjetivo, mesObjetivo, 1);
            
            // Avanzar hasta encontrar el primer día de la semana que coincida
            while (fechaObjetivo.getDay() !== diaSemana) {
              fechaObjetivo.setDate(fechaObjetivo.getDate() + 1);
            }
            
            // Ahora necesitamos calcular en qué semana del mes está el turno original
            // para replicarlo en la misma semana del mes siguiente
            const primerDiaDelMesOriginal = new Date(añoOriginal, mesOriginal - 1, 1);
            const primerDiaSemanaOriginal = primerDiaDelMesOriginal.getDay();
            
            // Calcular en qué semana del mes está el turno original
            let semanaDelMes = 1;
            let fechaTemporal = new Date(primerDiaDelMesOriginal);
            
            // Si el primer día del mes no es el día de la semana que buscamos, 
            // avanzar hasta encontrar la primera ocurrencia
            if (primerDiaSemanaOriginal !== diaSemana) {
              while (fechaTemporal.getDay() !== diaSemana) {
                fechaTemporal.setDate(fechaTemporal.getDate() + 1);
              }
            }
            
            // Ahora avanzar semana por semana hasta encontrar la fecha del turno original
            while (fechaTemporal.getTime() < fechaOriginal.getTime()) {
              fechaTemporal.setDate(fechaTemporal.getDate() + 7);
              semanaDelMes++;
            }
            
            // Si hemos pasado la fecha, retroceder una semana
            if (fechaTemporal.getTime() > fechaOriginal.getTime()) {
              fechaTemporal.setDate(fechaTemporal.getDate() - 7);
              semanaDelMes--;
            }
            
            console.log(`Turno original está en la semana ${semanaDelMes} del mes`);
            
            // Aplicar el mismo desplazamiento al mes objetivo
            if (semanaDelMes > 1) {
              fechaObjetivo.setDate(fechaObjetivo.getDate() + ((semanaDelMes - 1) * 7));
            }
            
            // Ajuste: sumar 1 día para corregir el desplazamiento de un día antes
            fechaObjetivo.setDate(fechaObjetivo.getDate() + 1);
            
            console.log(`Fecha objetivo calculada: ${fechaObjetivo.toDateString()} - Día: ${fechaObjetivo.getDay()} (${['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][fechaObjetivo.getDay()]})`);

            // Crear el nuevo turno
            const nuevoTurno: TurnoCreationRequest = {
              fecha: fechaObjetivo.toISOString().split('T')[0],
              hora: turno.hora,
              lugarId: turno.lugarId,
              exhibidorIds: turno.exhibidores ? turno.exhibidores.map(e => e.id) : [],
              usuarioIds: [] // Sin usuarios asignados
            };

            console.log(`Creando turno para fecha: ${nuevoTurno.fecha}`);
            const response = await apiService.createTurno(nuevoTurno);
            console.log(`Turno creado exitosamente:`, response);
            turnosCreados++;
            
            // Actualizar progreso en el SweetAlert
            const progressPercent = Math.round(((i + 1) / turnosBase.length) * 100);
            const progressBar = document.getElementById('progress-bar');
            const progressText = document.getElementById('progress-text');
            if (progressBar) progressBar.style.width = `${progressPercent}%`;
            if (progressText) progressText.textContent = `${i + 1} de ${turnosBase.length} turnos procesados`;
            
            // Pequeña pausa para evitar sobrecarga y permitir que se vea el progreso
            await new Promise(resolve => setTimeout(resolve, 200));
            
          } catch (error: any) {
            console.error(`Error al crear turno ${turno.id}:`, error);
            turnosConError++;
            errores.push(`Turno ${turno.id}: ${error.response?.data?.message || 'Error desconocido'}`);
            
            // Actualizar progreso incluso si hay error
            const progressPercent = Math.round(((i + 1) / turnosBase.length) * 100);
            const progressBar = document.getElementById('progress-bar');
            const progressText = document.getElementById('progress-text');
            if (progressBar) progressBar.style.width = `${progressPercent}%`;
            if (progressText) progressText.textContent = `${i + 1} de ${turnosBase.length} turnos procesados (${turnosConError} errores)`;
          }
        }
      })();

      // Esperar a que termine la replicación y luego cerrar el progreso
      await replicationPromise;
      Swal.close();

      // Mostrar resultado
      if (turnosConError === 0) {
        await Swal.fire({
          icon: 'success',
          title: 'Turnos replicados exitosamente',
          html: `
            <div class="text-center">
              <p class="mb-3">Se han replicado <strong>${turnosCreados}</strong> turnos del mes de <strong>${mesBase}</strong> al mes de <strong>${mesDestino}</strong>.</p>
              <div class="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-sm">
                <p><strong>Resumen:</strong></p>
                <ul class="list-disc list-inside mt-2">
                  <li>✅ Turnos creados: ${turnosCreados}</li>
                  <li>✅ Usuarios dejados vacíos</li>
                  <li>✅ Días de la semana mantenidos</li>
                  <li>✅ Horarios y lugares preservados</li>
                </ul>
              </div>
            </div>
          `,
          confirmButtonText: 'Perfecto'
        });
      } else {
        await Swal.fire({
          icon: 'warning',
          title: 'Replicación parcial',
          html: `
            <div class="text-center">
              <p class="mb-3">Se replicaron <strong>${turnosCreados}</strong> turnos, pero <strong>${turnosConError}</strong> fallaron.</p>
              <div class="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-sm">
                <p><strong>Errores encontrados:</strong></p>
                <ul class="list-disc list-inside mt-2 text-xs">
                  ${errores.slice(0, 5).map(e => `<li>${e}</li>`).join('')}
                  ${errores.length > 5 ? `<li>... y ${errores.length - 5} errores más</li>` : ''}
                </ul>
              </div>
            </div>
          `,
          confirmButtonText: 'Entendido'
        });
      }

      // Invalidar queries para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ['turnos'] });

    } catch (error) {
      console.error('Error al replicar turnos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al replicar turnos',
        text: 'Ha ocurrido un error inesperado al intentar replicar los turnos.',
        confirmButtonText: 'Entendido'
      });
    }
  };

  const updateShiftMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TurnoCreationRequest }) =>
      apiService.updateTurno(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
      setIsModalOpen(false);
      setEditingShift(null);
      resetForm();
      Swal.fire({
        icon: 'success',
        title: 'Turno actualizado',
        text: 'El turno se ha actualizado exitosamente',
        timer: 2000,
        showConfirmButton: false
      });
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Error al actualizar turno'
      });
    }
  });

  const deleteShiftMutation = useMutation({
    mutationFn: (id: number) => apiService.deleteTurno(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
      Swal.fire({
        icon: 'success',
        title: 'Turno eliminado',
        text: 'El turno se ha eliminado exitosamente',
        timer: 2000,
        showConfirmButton: false
      });
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Error al eliminar turno'
      });
    }
  });

  const deleteMultipleTurnosMutation = useMutation({
    mutationFn: (ids: number[]) => Promise.all(ids.map(id => apiService.deleteTurno(id))),
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
      setSelectedTurnos([]);
      setSelectAll(false);
      Swal.fire({
        icon: 'success',
        title: 'Turnos eliminados',
        text: `Se han eliminado ${ids.length} turnos exitosamente`,
        timer: 3000,
        showConfirmButton: false
      });
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Error al eliminar turnos'
      });
    }
  });

  const resetForm = () => {
    setFormData({
      fecha: new Date().toISOString().split('T')[0],
      horaInicio: '09:00',
      horaFin: '10:00',
      lugarId: 0,
      exhibidorIds: [],
      usuarioIds: [],
      esRecurrente: false,
      semanas: 4
    });
    setEditingShift(null);
    setSelectedTurnos([]);
    setSelectAll(false);
    setValidationErrors({});
    setShowValidationErrors(false);
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (formData.lugarId === 0) {
      errors.lugarId = 'Debes seleccionar un lugar';
    }
    
    if (formData.exhibidorIds.length === 0) {
      errors.exhibidorIds = 'Debes seleccionar al menos un exhibidor';
    }
    
    // Validar que no se exceda el límite de exhibidores del lugar
    if (selectedLugar && selectedLugar.exhibidores && formData.exhibidorIds.length > selectedLugar.exhibidores) {
      errors.exhibidorIds = `No puedes seleccionar más de ${selectedLugar.exhibidores} exhibidores para este lugar`;
    }

    // Validar que la hora de fin sea mayor que la de inicio
    if (formData.horaFin <= formData.horaInicio) {
      errors.horaFin = 'La hora de fin debe ser mayor que la hora de inicio';
    }

    return errors;
  };

  const clearFieldError = (fieldName: string) => {
    if (showValidationErrors && validationErrors[fieldName]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleSubmit = () => {
    // Activar validaciones al hacer clic en el botón
    setShowValidationErrors(true);
    
    // Validar el formulario
    const errors = validateForm();
    setValidationErrors(errors);
    
    // Si hay errores, no continuar
    if (Object.keys(errors).length > 0) {
      return;
    }

    // Crear el rango de horas
    const horaRango = `${formData.horaInicio}-${formData.horaFin}`;
    
    if (editingShift) {
      // Para editar, usar el método de turnos recurrentes si se selecciona recurrente
      if (formData.esRecurrente) {
        // Si se convierte en recurrente, mostrar confirmación
        Swal.fire({
          title: '¿Convertir a turno recurrente?',
          text: `Se eliminará el turno actual y se crearán ${formData.semanas} turnos semanales. ¿Estás seguro?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, convertir',
          cancelButtonText: 'Cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            // Si se confirma, proceder con la conversión
            const submitData = {
              fechaInicio: formData.fecha,
              hora: horaRango,
              lugarId: formData.lugarId,
              exhibidorIds: formData.exhibidorIds,
              usuarioIds: formData.usuarioIds,
              estado: 'libre' as const,
              esRecurrente: true,
              semanas: formData.semanas
            };
            
            // Primero eliminar el turno existente
            deleteShiftMutation.mutate(editingShift.id, {
              onSuccess: () => {
                // Luego crear los turnos recurrentes
                createRecurrenteMutation.mutate(submitData);
              }
            });
          }
        });
      } else {
        // Si se mantiene como turno puntual, usar el método normal
        const submitData = {
          fecha: formData.fecha,
          hora: horaRango,
          lugarId: formData.lugarId,
          exhibidorIds: formData.exhibidorIds,
          usuarioIds: formData.usuarioIds,
          estado: 'libre' as const
        };
        
        updateShiftMutation.mutate({
          id: editingShift.id,
          data: submitData
        });
      }
    } else {
      // Para crear, usar el método de turnos recurrentes
      const submitData = {
        fechaInicio: formData.fecha,
        hora: horaRango,
        lugarId: formData.lugarId,
        exhibidorIds: formData.exhibidorIds,
        usuarioIds: formData.usuarioIds,
        estado: 'libre' as const,
        esRecurrente: formData.esRecurrente,
        semanas: formData.esRecurrente ? formData.semanas : 1
      };
      
      if (formData.esRecurrente) {
        createRecurrenteMutation.mutate(submitData);
      } else {
        // Convertir a formato normal para turno único
        const turnoNormal = {
          fecha: formData.fecha,
          hora: horaRango,
          lugarId: formData.lugarId,
          exhibidorIds: formData.exhibidorIds,
          usuarioIds: formData.usuarioIds,
          estado: 'libre' as const
        };
        createShiftMutation.mutate(turnoNormal);
      }
    }
  };

  const handleEdit = (shift: Turno) => {
    setEditingShift(shift);
    
    // Extraer los exhibidorIds del turno
    const exhibidorIds = shift.exhibidores ? shift.exhibidores.map(e => e.id) : [];
    
    // Para turnos existentes, separar el rango de horas
    const [horaInicio, horaFin] = shift.hora.includes('-') ? shift.hora.split('-') : [shift.hora, shift.hora];
    
    setFormData({
      fecha: shift.fecha,
      horaInicio: horaInicio,
      horaFin: horaFin,
      lugarId: shift.lugarId,
      exhibidorIds: exhibidorIds,
      usuarioIds: shift.usuarios ? shift.usuarios.map(u => u.id) : [],
      esRecurrente: false, // Al editar, por defecto es un turno puntual
      semanas: 4
    });
    setValidationErrors({});
    setShowValidationErrors(false);
    setIsModalOpen(true);
  };

  const handleDelete = (shiftId: number) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteShiftMutation.mutate(shiftId);
      }
    });
  };

  const openCreateModal = () => {
    setEditingShift(null);
    setFormData({
      fecha: new Date().toISOString().split('T')[0],
      horaInicio: '09:00',
      horaFin: '10:00',
      lugarId: 0,
      exhibidorIds: [],
      usuarioIds: [],
      esRecurrente: false,
      semanas: 4
    });
    setSelectedLugar(null);
    setSelectedTurnos([]);
    setSelectAll(false);
    setValidationErrors({});
    setShowValidationErrors(false);
    setIsModalOpen(true);
  };

  const getLugarNombre = (lugarId: number) => {
    return lugares?.data?.find((l: Lugar) => l.id === lugarId)?.nombre || 'Lugar no encontrado';
  };



  const formatFecha = (fecha: string | Date) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatHora = (hora: string) => {
    if (hora.includes('-')) {
      const [horaInicio, horaFin] = hora.split('-');
      return `${horaInicio} - ${horaFin}`;
    }
    return hora;
  };

  const handleExhibidorChange = (exhibidorId: number, checked: boolean) => {
    if (checked) {
      // Verificar que no se exceda el límite de exhibidores del lugar
      if (selectedLugar && selectedLugar.exhibidores) {
        const maxExhibidores = selectedLugar.exhibidores;
        if (formData.exhibidorIds.length >= maxExhibidores) {
          Swal.fire({
            icon: 'warning',
            title: 'Límite de exhibidores alcanzado',
            text: `Este lugar solo permite un máximo de ${maxExhibidores} exhibidores`,
            timer: 3000,
            showConfirmButton: false
          });
          return;
        }
      }
      
      setFormData(prev => ({
        ...prev,
        exhibidorIds: [...prev.exhibidorIds, exhibidorId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        exhibidorIds: prev.exhibidorIds.filter(id => id !== exhibidorId)
      }));
    }
  };

  const handleTurnoSelection = (turnoId: number, checked: boolean) => {
    if (checked) {
      setSelectedTurnos(prev => [...prev, turnoId]);
    } else {
      setSelectedTurnos(prev => prev.filter(id => id !== turnoId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && turnos?.data) {
      const allIds = turnos.data.map(turno => turno.id);
      setSelectedTurnos(allIds);
      setSelectAll(true);
    } else {
      setSelectedTurnos([]);
      setSelectAll(false);
    }
  };

  const handleDeleteMultiple = () => {
    if (selectedTurnos.length === 0) return;

    Swal.fire({
      title: '¿Eliminar turnos seleccionados?',
      text: `Se eliminarán ${selectedTurnos.length} turnos. Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMultipleTurnosMutation.mutate(selectedTurnos);
      }
    });
  };



  const isLoading = turnosLoading || lugaresLoading || usuariosLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (turnosError) {
    return (
      <div className="text-center text-red-500">
        Error al cargar turnos: {(turnosError as any)?.message || 'Error desconocido'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Turnos</h2>
        <div className="flex items-center space-x-3">
          {selectedTurnos.length > 0 && (
            <>
              <button
                onClick={handleDeleteMultiple}
                disabled={deleteMultipleTurnosMutation.isPending}
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {deleteMultipleTurnosMutation.isPending ? 'Eliminando...' : `Eliminar ${selectedTurnos.length} Seleccionados`}
              </button>

            </>
          )}
          <button
            onClick={handleReplicarMes}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            title="Replicar turnos del mes actual al siguiente mes"
          >
            📅 Replicar Mes
          </button>
          <button
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            + Nuevo Turno
          </button>
        </div>
      </div>

      {/* Lista de turnos */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Turnos Programados
            </h3>
            {turnos?.data && turnos.data.length > 0 && (
              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Seleccionar todos</span>
                </label>
                {selectedTurnos.length > 0 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedTurnos.length} de {turnos.data.length} seleccionados
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        
        {turnos?.data && turnos.data.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {turnos.data.map((turno: Turno) => (
              <div key={turno.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      turno.estado === 'ocupado' ? 'bg-green-500' : 
                      turno.estado === 'libre' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}></div>
                    <input
                      type="checkbox"
                      checked={selectedTurnos.includes(turno.id)}
                      onChange={(e) => handleTurnoSelection(turno.id, e.target.checked)}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {getLugarNombre(turno.lugarId)} - {turno.exhibidores && turno.exhibidores.length > 0 ? turno.exhibidores.map(e => e.nombre).join(', ') : 'Sin exhibidores'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-300">
                      {formatFecha(turno.fecha)} - {formatHora(turno.hora)}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-400">
                      {turno.usuarios && turno.usuarios.length > 0 ? turno.usuarios.map(u => u.nombre).join(', ') : 'Disponible'}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(turno)}
                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(turno.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-300">
            No hay turnos configurados. Crea uno nuevo para empezar.
          </div>
        )}
      </div>

      {/* Modal para crear/editar turno */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal con título y botón de cerrar */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {editingShift ? 'Editar Turno' : 'Nuevo Turno'}
              </h3>
              {/* Botón X para cerrar */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white transition-colors p-1"
                title="Cerrar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form className="space-y-4">
              {editingShift && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Nota:</strong> Al editar un turno, puedes convertirlo en recurrente. 
                    Si seleccionas "Turno recurrente semanal", se eliminará el turno actual y se crearán nuevos turnos semanales.
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fecha
                </label>
                <DatePicker
                  value={formData.fecha}
                  onChange={(date) => setFormData({...formData, fecha: date})}
                  placeholder="Seleccionar fecha"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Horario
                </label>
                <TimeRangePicker
                  startTime={formData.horaInicio}
                  endTime={formData.horaFin}
                  onStartTimeChange={(time) => {
                    setFormData({...formData, horaInicio: time});
                    clearFieldError('horaFin');
                  }}
                  onEndTimeChange={(time) => {
                    setFormData({...formData, horaFin: time});
                    clearFieldError('horaFin');
                  }}
                  placeholder="Seleccionar horario"
                />
                {showValidationErrors && validationErrors.horaFin && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {validationErrors.horaFin}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Lugar
                </label>
                <select
                  name="lugarId"
                  value={formData.lugarId || ''}
                  onChange={(e) => {
                    const lugarId = Number(e.target.value);
                    setFormData({...formData, lugarId});
                    const lugar = lugares?.data?.find(l => l.id === lugarId);
                    setSelectedLugar(lugar || null);
                    clearFieldError('lugarId');
                  }}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                    showValidationErrors && validationErrors.lugarId 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <option value="">Selecciona un lugar</option>
                  {lugares?.data?.map((lugar: Lugar) => (
                    <option key={lugar.id} value={lugar.id}>
                      {lugar.nombre} - {lugar.direccion}
                    </option>
                  ))}
                </select>
                {showValidationErrors && validationErrors.lugarId && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {validationErrors.lugarId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Exhibidores
                </label>
                <div className={`max-h-32 overflow-y-auto border rounded-md p-2 dark:bg-gray-700 ${
                  showValidationErrors && validationErrors.exhibidorIds 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {exhibidores?.data?.map((exhibidor: Exhibidor) => {
                    const isChecked = formData.exhibidorIds.includes(exhibidor.id);
                    const isDisabled = Boolean(selectedLugar && selectedLugar.exhibidores && 
                      !isChecked && formData.exhibidorIds.length >= selectedLugar.exhibidores);
                    
                    return (
                      <label key={exhibidor.id} className={`flex items-center space-x-2 py-1 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            handleExhibidorChange(exhibidor.id, e.target.checked);
                            clearFieldError('exhibidorIds');
                          }}
                          disabled={isDisabled}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className={`text-sm ${isDisabled ? 'text-gray-400 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                          {exhibidor.nombre}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {showValidationErrors && validationErrors.exhibidorIds && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {validationErrors.exhibidorIds}
                  </p>
                )}
                {selectedLugar && selectedLugar.exhibidores && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <p>Este lugar puede tener hasta {selectedLugar.exhibidores} exhibidores</p>
                    <p className={`mt-1 ${formData.exhibidorIds.length >= selectedLugar.exhibidores ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      Seleccionados: {formData.exhibidorIds.length} / {selectedLugar.exhibidores}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Usuarios (opcional)
                </label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-2 dark:bg-gray-700">
                  {usuarios?.data?.map((usuario: Usuario) => {
                    const isChecked = formData.usuarioIds.includes(usuario.id);
                    return (
                      <label key={usuario.id} className="flex items-center space-x-2 py-1">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const newUsuarioIds = [...formData.usuarioIds];
                            if (e.target.checked) {
                              newUsuarioIds.push(usuario.id);
                            } else {
                              newUsuarioIds.splice(newUsuarioIds.indexOf(usuario.id), 1);
                            }
                            setFormData(prev => ({ ...prev, usuarioIds: newUsuarioIds }));
                          }}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {usuario.nombre} - {usuario.cargo}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo de Turno
                </label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="tipoTurno"
                      checked={!formData.esRecurrente}
                      onChange={() => setFormData({...formData, esRecurrente: false})}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-900 dark:text-white">Turno puntual</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="tipoTurno"
                      checked={formData.esRecurrente}
                      onChange={() => setFormData({...formData, esRecurrente: true})}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-900 dark:text-white">Turno recurrente semanal</span>
                  </label>
                </div>
              </div>

              {formData.esRecurrente && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Número de semanas
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="52"
                    value={formData.semanas}
                    onChange={(e) => setFormData({...formData, semanas: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="4"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Se creará un turno cada semana durante {formData.semanas} semanas
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={createShiftMutation.isPending || updateShiftMutation.isPending || createRecurrenteMutation.isPending || deleteShiftMutation.isPending || deleteMultipleTurnosMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {createShiftMutation.isPending || updateShiftMutation.isPending || createRecurrenteMutation.isPending || deleteShiftMutation.isPending || deleteMultipleTurnosMutation.isPending
                    ? 'Guardando...' 
                    : editingShift 
                      ? (formData.esRecurrente ? 'Convertir a Recurrente' : 'Actualizar Turno')
                      : 'Crear Turno'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftManagement;
