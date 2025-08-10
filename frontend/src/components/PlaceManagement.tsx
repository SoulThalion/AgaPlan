import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { Lugar } from '../types';
import Swal from 'sweetalert2';

const PlaceManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Lugar | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    descripcion: '' as string | undefined,
    capacidad: 0,
    activo: true
  });

  const queryClient = useQueryClient();

  // Obtener lugares
  const { data: lugares, isLoading, error } = useQuery({
    queryKey: ['lugares'],
    queryFn: () => apiService.getLugares()
  });

  // Mutaciones
  const createPlaceMutation = useMutation({
    mutationFn: (data: Partial<Lugar>) => apiService.createLugar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lugares'] });
      setIsModalOpen(false);
      resetForm();
      Swal.fire({
        icon: 'success',
        title: 'Lugar creado',
        text: 'El lugar se ha creado exitosamente',
        timer: 2000,
        showConfirmButton: false
      });
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Error al crear lugar'
      });
    }
  });

  const updatePlaceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Lugar> }) =>
      apiService.updateLugar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lugares'] });
      setIsModalOpen(false);
      setEditingPlace(null);
      resetForm();
      Swal.fire({
        icon: 'success',
        title: 'Lugar actualizado',
        text: 'El lugar se ha actualizado exitosamente',
        timer: 2000,
        showConfirmButton: false
      });
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Error al actualizar lugar'
      });
    }
  });

  const deletePlaceMutation = useMutation({
    mutationFn: (id: number) => apiService.deleteLugar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lugares'] });
      Swal.fire({
        icon: 'success',
        title: 'Lugar eliminado',
        text: 'El lugar se ha eliminado exitosamente',
        timer: 2000,
        showConfirmButton: false
      });
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Error al eliminar lugar'
      });
    }
  });

  const resetForm = () => {
    setFormData({
      nombre: '',
      direccion: '',
      descripcion: '',
      capacidad: 0,
      activo: true
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPlace) {
      updatePlaceMutation.mutate({
        id: editingPlace.id,
        data: formData
      });
    } else {
      createPlaceMutation.mutate(formData);
    }
  };

  const handleEdit = (place: Lugar) => {
    setEditingPlace(place);
    setFormData({
      nombre: place.nombre,
      direccion: place.direccion,
      descripcion: place.descripcion || '',
      capacidad: place.capacidad || 0,
      activo: place.activo ?? true
    });
    setIsModalOpen(true);
  };

  const handleDelete = (placeId: number) => {
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
        deletePlaceMutation.mutate(placeId);
      }
    });
  };

  const openCreateModal = () => {
    setEditingPlace(null);
    resetForm();
    setIsModalOpen(true);
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
        Error al cargar lugares: {(error as any)?.message || 'Error desconocido'}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-poppins text-neutral-text dark:text-white">
          Gestión de Lugares
        </h2>
        <button
          onClick={openCreateModal}
          className="bg-primary hover:bg-primary-dark text-white font-medium font-poppins py-2 px-4 rounded-lg transition-colors duration-200"
        >
          + Nuevo Lugar
        </button>
      </div>

      {/* Grid de lugares */}
      {lugares?.data && lugares.data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lugares.data.map((lugar: Lugar) => (
            <div key={lugar.id} className="bg-white dark:bg-neutral-dark rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold font-poppins text-neutral-text dark:text-white">
                    {lugar.nombre}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    lugar.activo 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {lugar.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-neutral-text dark:text-white">
                    <span className="mr-2">📍</span>
                    <span className="font-medium font-poppins">{lugar.direccion}</span>
                  </div>
                  
                  {lugar.descripcion && (
                    <div className="text-sm text-neutral-text/70 dark:text-white/70">
                      {lugar.descripcion}
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-neutral-text dark:text-white">
                    <span className="mr-2">👥</span>
                    <span className="font-medium font-poppins">Capacidad: {lugar.capacidad} personas</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(lugar)}
                    className="flex-1 bg-primary hover:bg-primary-dark text-white font-medium font-poppins py-2 px-3 rounded-lg transition-colors duration-200 text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(lugar.id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium font-poppins py-2 px-3 rounded-lg transition-colors duration-200 text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏢</div>
          <h3 className="text-xl font-semibold font-poppins text-neutral-text dark:text-white mb-2">
            No hay lugares registrados
          </h3>
          <p className="text-neutral-text/70 dark:text-white/70 mb-6">
            Comienza creando tu primer lugar para organizar los turnos
          </p>
          <button
            onClick={openCreateModal}
            className="bg-primary hover:bg-primary-dark text-white font-medium font-poppins py-3 px-6 rounded-lg transition-colors duration-200 text-lg"
          >
            + Crear Primer Lugar
          </button>
        </div>
      )}

      {/* Modal para crear/editar lugar */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-dark rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium font-poppins text-neutral-text dark:text-white mb-4">
              {editingPlace ? 'Editar Lugar' : 'Nuevo Lugar'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium font-poppins text-neutral-text dark:text-white mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-light dark:border-neutral rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-neutral dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium font-poppins text-neutral-text dark:text-white mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-light dark:border-neutral rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-neutral dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium font-poppins text-neutral-text dark:text-white mb-1">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-light dark:border-neutral rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-neutral dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium font-poppins text-neutral-text dark:text-white mb-1">
                  Capacidad
                </label>
                <input
                  type="number"
                  name="capacidad"
                  value={formData.capacidad}
                  onChange={(e) => setFormData({...formData, capacidad: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-neutral-light dark:border-neutral rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-neutral dark:text-white"
                  min="1"
                  required
                />
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
                  Lugar activo
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
                  disabled={createPlaceMutation.isPending || updatePlaceMutation.isPending}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-medium font-poppins rounded-lg transition-colors duration-200 disabled:opacity-50"
                >
                  {createPlaceMutation.isPending || updatePlaceMutation.isPending ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceManagement;
