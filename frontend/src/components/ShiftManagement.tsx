import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { Turno } from '../types';
import Swal from 'sweetalert2';

const ShiftManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Turno | null>(null);
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    horaInicio: '09:00',
    horaFin: '17:00',
    lugarId: 0,
    usuarioId: undefined as number | undefined
  });

  const queryClient = useQueryClient();

  // Obtener datos necesarios
  const { data: turnos, isLoading: turnosLoading, error: turnosError } = useQuery({
    queryKey: ['turnos'],
    queryFn: apiService.getTurnos
  });

  const { data: lugares, isLoading: lugaresLoading } = useQuery({
    queryKey: ['lugares'],
    queryFn: apiService.getLugares
  });

  const { data: usuarios, isLoading: usuariosLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn: apiService.getUsuarios
  });

  // Mutaciones
  const createShiftMutation = useMutation({
    mutationFn: apiService.createTurno,
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

  const updateShiftMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Turno> }) =>
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
    mutationFn: apiService.deleteTurno,
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

  const resetForm = () => {
    setFormData({
      fecha: new Date().toISOString().split('T')[0],
      horaInicio: '09:00',
      horaFin: '17:00',
      lugarId: lugares?.data?.[0]?.id || 0,
      usuarioId: undefined
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      fecha: formData.fecha,
      estado: 'disponible' as const
    };
    
    if (editingShift) {
      updateShiftMutation.mutate({
        id: editingShift.id,
        data: submitData
      });
    } else {
      createShiftMutation.mutate(submitData);
    }
  };

  const handleEdit = (shift: Turno) => {
    setEditingShift(shift);
    setFormData({
      fecha: shift.fecha,
      horaInicio: shift.horaInicio,
      horaFin: shift.horaFin,
      lugarId: shift.lugarId,
      usuarioId: shift.usuarioId
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
    resetForm();
    setIsModalOpen(true);
  };

  const getLugarNombre = (lugarId: number) => {
    return lugares?.data?.find((l: any) => l.id === lugarId)?.nombre || 'Lugar no encontrado';
  };

  const getUsuarioNombre = (usuarioId: number | undefined) => {
    if (!usuarioId) return 'Disponible';
    return usuarios?.data?.find((u: any) => u.id === usuarioId)?.nombre || 'Usuario no encontrado';
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
        <button
          onClick={openCreateModal}
          className="bg-primary hover:bg-primary-dark text-white font-medium font-poppins py-2 px-4 rounded-lg transition-colors duration-200"
        >
          + Nuevo Turno
        </button>
      </div>

      {/* Lista de turnos */}
      <div className="bg-white dark:bg-neutral-dark rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-light dark:border-neutral">
          <h3 className="text-lg font-semibold font-poppins text-neutral-text dark:text-white">
            Turnos Programados
          </h3>
        </div>
        
        {turnos?.data && turnos.data.length > 0 ? (
          <div className="divide-y divide-neutral-light dark:divide-neutral">
            {turnos.data.map((turno: Turno) => (
              <div key={turno.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    turno.estado === 'asignado' ? 'bg-success' : 
                    turno.estado === 'disponible' ? 'bg-warning' : 'bg-neutral-text/30'
                  }`}></div>
                  
                  <div>
                    <div className="font-medium font-poppins text-neutral-text dark:text-white">
                      {getLugarNombre(turno.lugarId)}
                    </div>
                    <div className="text-sm text-neutral-text/70 dark:text-white/70">
                      {formatFecha(turno.fecha)} - {turno.horaInicio} a {turno.horaFin}
                    </div>
                    <div className="text-xs text-neutral-text/50 dark:text-white/50">
                      {getUsuarioNombre(turno.usuarioId)}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium font-poppins text-neutral-text dark:text-white mb-1">
                    Hora de inicio
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
                    Hora de fin
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
              </div>

              <div>
                <label className="block text-sm font-medium font-poppins text-neutral-text dark:text-white mb-1">
                  Lugar
                </label>
                <select
                  name="lugarId"
                  value={formData.lugarId}
                  onChange={(e) => setFormData({...formData, lugarId: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-neutral-light dark:border-neutral rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-neutral dark:text-white"
                  required
                >
                  <option value="">Seleccionar lugar</option>
                  {lugares?.data?.map((lugar: any) => (
                    <option key={lugar.id} value={lugar.id}>
                      {lugar.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium font-poppins text-neutral-text dark:text-white mb-1">
                  Usuario (opcional)
                </label>
                <select
                  name="usuarioId"
                  value={formData.usuarioId || ''}
                  onChange={(e) => setFormData({...formData, usuarioId: e.target.value ? Number(e.target.value) : undefined})}
                  className="w-full px-3 py-2 border border-neutral-light dark:border-neutral rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-neutral dark:text-white"
                >
                  <option value="">Sin asignar</option>
                  {usuarios?.data?.map((usuario: any) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="estado"
                  checked={formData.usuarioId !== undefined}
                  onChange={(e) => setFormData({...formData, usuarioId: e.target.checked ? undefined : undefined})}
                  className="h-4 w-4 text-primary focus:ring-primary border-neutral-light dark:border-neutral rounded"
                  disabled
                />
                <label className="ml-2 block text-sm font-poppins text-neutral-text dark:text-white">
                  Turno asignado
                </label>
              </div>

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
                  disabled={createShiftMutation.isPending || updateShiftMutation.isPending}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-medium font-poppins rounded-lg transition-colors duration-200 disabled:opacity-50"
                >
                  {createShiftMutation.isPending || updateShiftMutation.isPending ? 'Guardando...' : 'Guardar'}
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
