import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { Exhibidor } from '../types';
import Swal from 'sweetalert2';

const ExhibidorManagement: React.FC = () => {
  const [exhibidores, setExhibidores] = useState<Exhibidor[]>([]);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadExhibidores();
  }, []);

  const loadExhibidores = async () => {
    try {
      setLoading(true);
      const response = await apiService.getExhibidores();
      if (response.success && response.data) {
        setExhibidores(response.data);
      }
    } catch (error) {
      console.error('Error al cargar exhibidores:', error);
      Swal.fire('Error', 'No se pudieron cargar los exhibidores', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '', descripcion: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      Swal.fire('Error', 'El nombre es requerido', 'error');
      return;
    }

    try {
      setLoading(true);
      
      if (editingId) {
        // Actualizar
        const response = await apiService.updateExhibidor(editingId, formData);
        if (response.success) {
          Swal.fire('Éxito', 'Exhibidor actualizado correctamente', 'success');
          resetForm();
          loadExhibidores();
        }
      } else {
        // Crear
        const response = await apiService.createExhibidor(formData);
        if (response.success) {
          Swal.fire('Éxito', 'Exhibidor creado correctamente', 'success');
          resetForm();
          loadExhibidores();
        }
      }
    } catch (error: any) {
      console.error('Error al guardar exhibidor:', error);
      const message = error.response?.data?.message || 'Error al guardar el exhibidor';
      Swal.fire('Error', message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (exhibidor: Exhibidor) => {
    setFormData({
      nombre: exhibidor.nombre,
      descripcion: exhibidor.descripcion || '',
    });
    setEditingId(exhibidor.id);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const response = await apiService.deleteExhibidor(id);
        if (response.success) {
          Swal.fire('Eliminado', 'Exhibidor eliminado correctamente', 'success');
          loadExhibidores();
        }
      } catch (error: any) {
        console.error('Error al eliminar exhibidor:', error);
        const message = error.response?.data?.message || 'Error al eliminar el exhibidor';
        Swal.fire('Error', message, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Gestión de Exhibidores</h2>
      
      {/* Formulario */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">
          {editingId ? 'Editar Exhibidor' : 'Crear Nuevo Exhibidor'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Exhibidor Principal, Exhibidor Secundario"
              required
            />
          </div>
          
          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descripción opcional del exhibidor"
              rows={3}
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : (editingId ? 'Actualizar' : 'Crear')}
            </button>
            
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* Lista de Exhibidores */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Exhibidores Existentes</h3>
        </div>
        
        {loading ? (
          <div className="p-6 text-center text-gray-500">Cargando...</div>
        ) : exhibidores.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No hay exhibidores registrados</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {exhibidores.map((exhibidor) => (
                  <tr key={exhibidor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {exhibidor.nombre}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {exhibidor.descripcion || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        exhibidor.activo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {exhibidor.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(exhibidor)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(exhibidor.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExhibidorManagement;
