import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { Lugar } from '../types';
import Swal from 'sweetalert2';
import GoogleMapsInput from './GoogleMapsInput';
import PlaceMapModal from './PlaceMapModal';

const PlaceManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Lugar | null>(null);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [selectedPlaceForMap, setSelectedPlaceForMap] = useState<Lugar | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    descripcion: '',
    capacidad: '',
    exhibidores: '',
    latitud: undefined as number | undefined,
    longitud: undefined as number | undefined,
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
      capacidad: '',
      exhibidores: '',
      latitud: undefined,
      longitud: undefined,
      activo: true
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const placeData = {
      nombre: formData.nombre,
      direccion: formData.direccion,
      descripcion: formData.descripcion || undefined,
      capacidad: formData.capacidad ? parseInt(formData.capacidad) : undefined,
      exhibidores: formData.exhibidores ? parseInt(formData.exhibidores) : undefined,
      latitud: formData.latitud,
      longitud: formData.longitud,
      activo: formData.activo
    };

    if (editingPlace?.id) {
      updatePlaceMutation.mutate({
        id: editingPlace.id,
        data: placeData
      });
    } else {
      createPlaceMutation.mutate(placeData);
    }
  };

  const handleEdit = (lugar: Lugar) => {
    setFormData({
      nombre: lugar.nombre,
      direccion: lugar.direccion,
      descripcion: lugar.descripcion || '',
      capacidad: lugar.capacidad?.toString() || '',
      exhibidores: lugar.exhibidores?.toString() || '',
      latitud: lugar.latitud,
      longitud: lugar.longitud,
      activo: lugar.activo ?? true
    });
    setEditingPlace(lugar);
    setIsModalOpen(true);
  };

  const handleAddressChange = (data: { direccion: string; latitud: number; longitud: number }) => {
    setFormData(prev => ({
      ...prev,
      direccion: data.direccion,
      latitud: data.latitud,
      longitud: data.longitud
    }));
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

  const openMapModal = (lugar: Lugar) => {
    setSelectedPlaceForMap(lugar);
    setMapModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestión de Lugares
        </h2>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          + Nuevo Lugar
        </button>
      </div>

      {/* Grid de lugares */}
      {lugares?.data && lugares.data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lugares.data.map((lugar: Lugar) => (
            <div key={lugar.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
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
                  <div className="flex items-center text-sm text-gray-900 dark:text-white">
                     <button
                       onClick={() => openMapModal(lugar)}
                       className="mr-2 hover:scale-110 transition-transform duration-200 cursor-pointer"
                       title="Ver en mapa"
                     >
                       📍
                     </button>
                     <span className="font-medium">{lugar.direccion}</span>
                   </div>
                  
                  {lugar.descripcion && (
                    <div className="text-sm text-gray-500 dark:text-gray-300">
                      {lugar.descripcion}
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-900 dark:text-white">
                    <span className="mr-2">👥</span>
                    <span className="font-medium">Voluntarios: {lugar.capacidad} personas</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-900 dark:text-white">
                    <span className="mr-2">🎯</span>
                    <span className="font-medium">Exhibidores: {lugar.exhibidores}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(lugar)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(lugar.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm"
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
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No hay lugares registrados
          </h3>
          <p className="text-gray-500 dark:text-gray-300 mb-6">
            Comienza creando tu primer lugar para organizar los turnos
          </p>
          <button
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors text-lg"
          >
            + Crear Primer Lugar
          </button>
        </div>
      )}

      {/* Modal para crear/editar lugar */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal con título y botón de cerrar */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {editingPlace ? 'Editar Lugar' : 'Nuevo Lugar'}
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
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              {/* Campo de dirección con Google Maps */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dirección
                </label>
                <GoogleMapsInput
                  value={formData.direccion}
                  onChange={handleAddressChange}
                  placeholder="Buscar dirección o hacer clic en el mapa"
                  required
                />
              </div>

              {/* Mostrar coordenadas si están disponibles */}
              {(formData.latitud || formData.longitud) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Latitud
                    </label>
                    <input
                      type="number"
                      value={formData.latitud || ''}
                      onChange={(e) => setFormData({...formData, latitud: parseFloat(e.target.value) || undefined})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      step="0.00000001"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Longitud
                    </label>
                    <input
                      type="number"
                      value={formData.longitud || ''}
                      onChange={(e) => setFormData({...formData, longitud: parseFloat(e.target.value) || undefined})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      step="0.00000001"
                      readOnly
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cantidad de voluntarios
                </label>
                <input
                  type="number"
                  name="capacidad"
                  value={formData.capacidad}
                  onChange={(e) => setFormData({...formData, capacidad: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cantidad de Exhibidores
                </label>
                <input
                  type="number"
                  name="exhibidores"
                  value={formData.exhibidores}
                  onChange={(e) => setFormData({...formData, exhibidores: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
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
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900 dark:text-white">
                  Lugar activo
                </label>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createPlaceMutation.isPending || updatePlaceMutation.isPending}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {createPlaceMutation.isPending || updatePlaceMutation.isPending ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
                 </div>
       )}

       {/* Modal del mapa */}
       {selectedPlaceForMap && (
         <PlaceMapModal
           lugar={selectedPlaceForMap}
           isOpen={mapModalOpen}
           onClose={() => {
             setMapModalOpen(false);
             setSelectedPlaceForMap(null);
           }}
         />
       )}
     </div>
   );
 };

export default PlaceManagement;
