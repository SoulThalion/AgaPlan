import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { Turno, Lugar, Usuario, Exhibidor, TurnoCreationRequest, TurnoRecurrenteRequest } from '../types';
import Swal from 'sweetalert2';

const ShiftManagement: React.FC = () => {
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

  const queryClient = useQueryClient();

  // Obtener datos necesarios
  const { data: turnos, isLoading: turnosLoading, error: turnosError } = useQuery({
    queryKey: ['turnos'],
    queryFn: () => apiService.getTurnos()
  });

  const { data: lugares, isLoading: lugaresLoading } = useQuery({
    queryKey: ['lugares'],
    queryFn: () => apiService.getLugares()
  });

  const { data: usuarios, isLoading: usuariosLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => apiService.getUsuarios()
  });

  const { data: exhibidores } = useQuery({
    queryKey: ['exhibidores'],
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.lugarId === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Debes seleccionar un lugar'
      });
      return;
    }
    
    if (formData.exhibidorIds.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Debes seleccionar al menos un exhibidor'
      });
      return;
    }
    
    // Validar que no se exceda el límite de exhibidores del lugar
    if (selectedLugar && selectedLugar.exhibidores && formData.exhibidorIds.length > selectedLugar.exhibidores) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `No puedes seleccionar más de ${selectedLugar.exhibidores} exhibidores para este lugar`
      });
      return;
    }

    // Validar que la hora de fin sea mayor que la de inicio
    if (formData.horaFin <= formData.horaInicio) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'La hora de fin debe ser mayor que la hora de inicio'
      });
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

  const handleDeleteAll = () => {
    if (!turnos?.data || turnos.data.length === 0) return;

    Swal.fire({
      title: '¿Eliminar TODOS los turnos?',
      text: `Se eliminarán ${turnos.data.length} turnos. Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar todos',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && turnos?.data) {
        const allIds = turnos.data.map(turno => turno.id);
        deleteMultipleTurnosMutation.mutate(allIds);
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-poppins text-neutral-text dark:text-white">
          Gestión de Turnos
        </h2>
        <div className="flex space-x-3">
          {selectedTurnos.length > 0 && (
            <button
              onClick={handleDeleteMultiple}
              disabled={deleteMultipleTurnosMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white font-medium font-poppins py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              {deleteMultipleTurnosMutation.isPending ? 'Eliminando...' : `Eliminar ${selectedTurnos.length} seleccionados`}
            </button>
          )}
          {turnos?.data && turnos.data.length > 0 && (
            <button
              onClick={handleDeleteAll}
              disabled={deleteMultipleTurnosMutation.isPending}
              className="bg-red-800 hover:bg-red-900 text-white font-medium font-poppins py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              {deleteMultipleTurnosMutation.isPending ? 'Eliminando...' : 'Eliminar Todos'}
            </button>
          )}
          <button
            onClick={openCreateModal}
            className="bg-primary hover:bg-primary-dark text-white font-medium font-poppins py-2 px-4 rounded-lg transition-colors duration-200"
          >
            + Nuevo Turno
          </button>
        </div>
      </div>

      {/* Lista de turnos */}
      <div className="bg-white dark:bg-neutral-dark rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-light dark:border-neutral">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold font-poppins text-neutral-text dark:text-white">
              Turnos Programados
            </h3>
            {turnos?.data && turnos.data.length > 0 && (
              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-2 text-sm text-neutral-text dark:text-white">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-neutral-light dark:border-neutral text-primary focus:ring-primary"
                  />
                  <span>Seleccionar todos</span>
                </label>
                {selectedTurnos.length > 0 && (
                  <span className="text-sm text-neutral-text/70 dark:text-white/70">
                    {selectedTurnos.length} de {turnos.data.length} seleccionados
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        
        {turnos?.data && turnos.data.length > 0 ? (
          <div className="divide-y divide-neutral-light dark:divide-neutral">
            {turnos.data.map((turno: Turno) => (
              <div key={turno.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      turno.estado === 'ocupado' ? 'bg-success' : 
                      turno.estado === 'libre' ? 'bg-warning' : 'bg-neutral-text/30'
                    }`}></div>
                    <input
                      type="checkbox"
                      checked={selectedTurnos.includes(turno.id)}
                      onChange={(e) => handleTurnoSelection(turno.id, e.target.checked)}
                      className="rounded border-neutral-light dark:border-neutral text-primary focus:ring-primary"
                    />
                  </div>
                  
                  <div>
                    <div className="font-medium font-poppins text-neutral-text dark:text-white">
                      {getLugarNombre(turno.lugarId)} - {turno.exhibidores && turno.exhibidores.length > 0 ? turno.exhibidores.map(e => e.nombre).join(', ') : 'Sin exhibidores'}
                    </div>
                    <div className="text-sm text-neutral-text/70 dark:text-white/70">
                      {formatFecha(turno.fecha)} - {formatHora(turno.hora)}
                    </div>
                    <div className="text-xs text-neutral-text/50 dark:text-white/50">
                      {turno.usuarios && turno.usuarios.length > 0 ? turno.usuarios.map(u => u.nombre).join(', ') : 'Disponible'}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(turno)}
                    className="text-primary hover:text-primary-dark font-medium font-poppins text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(turno.id)}
                    className="text-red-600 hover:text-red-900 font-medium font-poppins text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-8 text-center text-neutral-text/70 dark:text-white/70">
            No hay turnos configurados. Crea uno nuevo para empezar.
          </div>
        )}
      </div>

      {/* Modal para crear/editar turno */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-dark rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium font-poppins text-neutral-text dark:text-white mb-4">
              {editingShift ? 'Editar Turno' : 'Nuevo Turno'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {editingShift && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Nota:</strong> Al editar un turno, puedes convertirlo en recurrente. 
                    Si seleccionas "Turno recurrente semanal", se eliminará el turno actual y se crearán nuevos turnos semanales.
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium font-poppins text-neutral-text dark:text-white mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  name="fecha"
                  value={formData.fecha}
                  onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-light dark:border-neutral rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-neutral dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium font-poppins text-neutral-text dark:text-white mb-1">
                  Hora Inicio
                </label>
                <input
                  type="time"
                  name="horaInicio"
                  value={formData.horaInicio}
                  onChange={(e) => setFormData({...formData, horaInicio: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-light dark:border-neutral rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-neutral dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium font-poppins text-neutral-text dark:text-white mb-1">
                  Hora Fin
                </label>
                <input
                  type="time"
                  name="horaFin"
                  value={formData.horaFin}
                  onChange={(e) => setFormData({...formData, horaFin: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-light dark:border-neutral rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-neutral dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium font-poppins text-neutral-text dark:text-white mb-1">
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
                  }}
                  className="w-full px-3 py-2 border border-neutral-light dark:border-neutral rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-neutral dark:text-white"
                  required
                >
                  <option value="">Selecciona un lugar</option>
                  {lugares?.data?.map((lugar: Lugar) => (
                    <option key={lugar.id} value={lugar.id}>
                      {lugar.nombre} - {lugar.direccion}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium font-poppins text-neutral-text dark:text-white mb-1">
                  Exhibidores
                </label>
                <div className="max-h-32 overflow-y-auto border border-neutral-light dark:border-neutral rounded-lg p-2 dark:bg-neutral">
                  {exhibidores?.data?.map((exhibidor: Exhibidor) => {
                    const isChecked = formData.exhibidorIds.includes(exhibidor.id);
                    const isDisabled = Boolean(selectedLugar && selectedLugar.exhibidores && 
                      !isChecked && formData.exhibidorIds.length >= selectedLugar.exhibidores);
                    
                    return (
                      <label key={exhibidor.id} className={`flex items-center space-x-2 py-1 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleExhibidorChange(exhibidor.id, e.target.checked)}
                          disabled={isDisabled}
                          className="rounded border-neutral-light dark:border-neutral text-primary focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className={`text-sm ${isDisabled ? 'text-neutral-text/50 dark:text-white/50' : 'text-neutral-text dark:text-white'}`}>
                          {exhibidor.nombre}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {selectedLugar && selectedLugar.exhibidores && (
                  <div className="text-xs text-neutral-text/70 dark:text-white/70 mt-1">
                    <p>Este lugar puede tener hasta {selectedLugar.exhibidores} exhibidores</p>
                    <p className={`mt-1 ${formData.exhibidorIds.length >= selectedLugar.exhibidores ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      Seleccionados: {formData.exhibidorIds.length} / {selectedLugar.exhibidores}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium font-poppins text-neutral-text dark:text-white mb-1">
                  Usuarios (opcional)
                </label>
                <div className="max-h-32 overflow-y-auto border border-neutral-light dark:border-neutral rounded-lg p-2 dark:bg-neutral">
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
                          className="rounded border-neutral-light dark:border-neutral text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-neutral-text dark:text-white">
                          {usuario.nombre} - {usuario.cargo}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium font-poppins text-neutral-text dark:text-white mb-1">
                  Tipo de Turno
                </label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="tipoTurno"
                      checked={!formData.esRecurrente}
                      onChange={() => setFormData({...formData, esRecurrente: false})}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-neutral-text dark:text-white">Turno puntual</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="tipoTurno"
                      checked={formData.esRecurrente}
                      onChange={() => setFormData({...formData, esRecurrente: true})}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-neutral-text dark:text-white">Turno recurrente semanal</span>
                  </label>
                </div>
              </div>

              {formData.esRecurrente && (
                <div>
                  <label className="block text-sm font-medium font-poppins text-neutral-text dark:text-white mb-1">
                    Número de semanas
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="52"
                    value={formData.semanas}
                    onChange={(e) => setFormData({...formData, semanas: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-neutral-light dark:border-neutral rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-neutral dark:text-white"
                    placeholder="4"
                  />
                  <p className="text-xs text-neutral-text/70 dark:text-white/70 mt-1">
                    Se creará un turno cada semana durante {formData.semanas} semanas
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-neutral-text dark:text-white font-medium font-poppins rounded-lg border border-neutral-light dark:border-neutral hover:bg-neutral-light dark:hover:bg-neutral transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createShiftMutation.isPending || updateShiftMutation.isPending || createRecurrenteMutation.isPending || deleteShiftMutation.isPending || deleteMultipleTurnosMutation.isPending}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-medium font-poppins rounded-lg transition-colors duration-200 disabled:opacity-50"
                >
                  {createShiftMutation.isPending || updateShiftMutation.isPending || createRecurrenteMutation.isPending || deleteShiftMutation.isPending || deleteMultipleTurnosMutation.isPending
                    ? 'Guardando...' 
                    : editingShift 
                      ? (formData.esRecurrente ? 'Convertir a Recurrente' : 'Actualizar Turno')
                      : 'Guardar'
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
