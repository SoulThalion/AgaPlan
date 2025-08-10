import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { Disponibilidad } from '../types';
import Swal from 'sweetalert2';

const AvailabilityManagement: React.FC = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAvailability, setEditingAvailability] = useState<Disponibilidad | null>(null);
  const [formData, setFormData] = useState({
    diaSemana: 1,
    horaInicio: '09:00',
    horaFin: '17:00',
    activo: true
  });

  const queryClient = useQueryClient();

  // Obtener disponibilidades del usuario actual
  const { data: disponibilidades, isLoading, error } = useQuery({
    queryKey: ['disponibilidades', user?.id],
    queryFn: () => apiService.getDisponibilidadesByUsuario(user?.id || 0),
    enabled: !!user?.id
  });

  // Mutaciones
  const createAvailabilityMutation = useMutation({
    mutationFn: (data: Partial<Disponibilidad>) => apiService.createDisponibilidad(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disponibilidades', user?.id] });
      setIsModalOpen(false);
      resetForm();
      Swal.fire({
        icon: 'success',
        title: 'Disponibilidad creada',
        text: 'La disponibilidad se ha creado exitosamente',
        timer: 2000,
        showConfirmButton: false
      });
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Error al crear disponibilidad'
      });
    }
  });

  const updateAvailabilityMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Disponibilidad> }) =>
      apiService.updateDisponibilidad(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disponibilidades', user?.id] });
      setIsModalOpen(false);
      setEditingAvailability(null);
      resetForm();
      Swal.fire({
        icon: 'success',
        title: 'Disponibilidad actualizada',
        text: 'La disponibilidad se ha actualizado exitosamente',
        timer: 2000,
        showConfirmButton: false
      });
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Error al actualizar disponibilidad'
      });
    }
  });

  const deleteAvailabilityMutation = useMutation({
    mutationFn: (id: number) => apiService.deleteDisponibilidad(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disponibilidades', user?.id] });
      Swal.fire({
        icon: 'success',
        title: 'Disponibilidad eliminada',
        text: 'La disponibilidad se ha eliminado exitosamente',
        timer: 2000,
        showConfirmButton: false
      });
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Error al eliminar disponibilidad'
      });
    }
  });

  const resetForm = () => {
    setFormData({
      diaSemana: 1,
      horaInicio: '09:00',
      horaFin: '17:00',
      activo: true
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAvailability) {
      updateAvailabilityMutation.mutate({
        id: editingAvailability.id,
        data: formData
      });
    } else {
      createAvailabilityMutation.mutate({
        ...formData,
        usuarioId: user?.id || 0
      });
    }
  };

  const handleEdit = (availability: Disponibilidad) => {
    setEditingAvailability(availability);
    setFormData({
      diaSemana: availability.diaSemana,
      horaInicio: availability.horaInicio,
      horaFin: availability.horaFin,
      activo: availability.activo
    });
    setIsModalOpen(true);
  };

  const handleDelete = (availabilityId: number) => {
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
        deleteAvailabilityMutation.mutate(availabilityId);
      }
    });
  };

  const openCreateModal = () => {
    setEditingAvailability(null);
    resetForm();
    setIsModalOpen(true);
  };

  const getDiaSemanaLabel = (dia: number) => {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return dias[dia];
  };

  const getDiaSemanaShort = (dia: number) => {
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return dias[dia];
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        Error al cargar disponibilidades: {(error as any)?.message || 'Error desconocido'}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-poppins text-neutral-text dark:text-white">
          Mi Disponibilidad Semanal
        </h2>
        <button
          onClick={openCreateModal}
          className="bg-primary hover:bg-primary-dark text-white font-medium font-poppins py-2 px-4 rounded-lg transition-colors duration-200"
        >
          + Nueva Disponibilidad
        </button>
      </div>

      {/* Vista semanal */}
      <div className="grid grid-cols-7 gap-4 mb-6">
        {Array.from({ length: 7 }, (_, index) => {
          const disponibilidad = disponibilidades?.data?.find((d: Disponibilidad) => d.diaSemana === index);
          return (
            <div key={index} className="text-center">
              <div className="text-sm font-medium font-poppins text-neutral-text dark:text-white mb-2">
                {getDiaSemanaShort(index)}
              </div>
              <div className={`p-3 rounded-lg border-2 ${
                disponibilidad && disponibilidad.activo
                  ? 'border-success bg-success/10'
                  : 'border-neutral-light dark:border-neutral bg-neutral-light/10 dark:bg-neutral/10'
              }`}>
                {disponibilidad && disponibilidad.activo ? (
                  <div className="text-xs text-success font-medium font-poppins">
                    <div>{disponibilidad.horaInicio}</div>
                    <div>-</div>
                    <div>{disponibilidad.horaFin}</div>
                  </div>
                ) : (
                  <div className="text-xs text-neutral-text/50 dark:text-white/50 font-medium font-poppins">
                    No disponible
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lista de disponibilidades */}
      <div className="bg-white dark:bg-neutral-dark rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-light dark:border-neutral">
          <h3 className="text-lg font-semibold font-poppins text-neutral-text dark:text-white">
            Detalles de Disponibilidad
          </h3>
        </div>
        
        {disponibilidades?.data && disponibilidades.data.length > 0 ? (
          <div className="divide-y divide-neutral-light dark:divide-neutral">
            {disponibilidades.data.map((disponibilidad: Disponibilidad) => (
              <div key={disponibilidad.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    disponibilidad.activo ? 'bg-success' : 'bg-neutral-text/30'
                  }`}></div>
                  
                  <div>
                    <div className="font-medium font-poppins text-neutral-text dark:text-white">
                      {getDiaSemanaLabel(disponibilidad.diaSemana)}
                    </div>
                    <div className="text-sm text-neutral-text/70 dark:text-white/70">
                      {disponibilidad.horaInicio} - {disponibilidad.horaFin}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(disponibilidad)}
                    className="text-primary hover:text-primary-dark font-medium font-poppins text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(disponibilidad.id)}
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
            No tienes disponibilidades configuradas. Crea una nueva para empezar.
          </div>
        )}
      </div>

      {/* Modal para crear/editar disponibilidad */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-dark rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium font-poppins text-neutral-text dark:text-white mb-4">
              {editingAvailability ? 'Editar Disponibilidad' : 'Nueva Disponibilidad'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium font-poppins text-neutral-text dark:text-white mb-1">
                  Día de la semana
                </label>
                <select
                  name="diaSemana"
                  value={formData.diaSemana}
                  onChange={(e) => setFormData({...formData, diaSemana: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-neutral-light dark:border-neutral rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-neutral dark:text-white"
                >
                  <option value={0}>Domingo</option>
                  <option value={1}>Lunes</option>
                  <option value={2}>Martes</option>
                  <option value={3}>Miércoles</option>
                  <option value={4}>Jueves</option>
                  <option value={5}>Viernes</option>
                  <option value={6}>Sábado</option>
                </select>
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

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                  className="h-4 w-4 text-primary focus:ring-primary border-neutral-light dark:border-neutral rounded"
                />
                <label className="ml-2 block text-sm font-poppins text-neutral-text dark:text-white">
                  Disponibilidad activa
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
                  disabled={createAvailabilityMutation.isPending || updateAvailabilityMutation.isPending}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-medium font-poppins rounded-lg transition-colors duration-200 disabled:opacity-50"
                >
                  {createAvailabilityMutation.isPending || updateAvailabilityMutation.isPending ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityManagement;
