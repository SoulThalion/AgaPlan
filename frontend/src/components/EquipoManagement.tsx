import React, { useState, useEffect } from 'react';
import { useEquipo } from '../contexts/EquipoContext';
import { useAuth } from '../contexts/AuthContext';
import type { Equipo, EquipoCreationRequest, Usuario } from '../types';
import Swal from 'sweetalert2';
import apiService from '../services/api';

const EquipoManagement: React.FC = () => {
  const { equipos, equiposStats, currentEquipo, setCurrentEquipo, refreshEquipos, refreshStats, isLoading, error } = useEquipo();
  const { token, isSuperAdmin } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEquipo, setSelectedEquipo] = useState<Equipo | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [formData, setFormData] = useState<EquipoCreationRequest>({
    nombre: '',
    descripcion: ''
  });

  // Cargar usuarios para asignación
  useEffect(() => {
    const fetchUsuarios = async () => {
      if (!token) return;

      try {
        const response = await apiService.getUsuarios();
        if (response.success) {
          setUsuarios(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching usuarios:', error);
      }
    };

    if (showAssignModal) {
      fetchUsuarios();
    }
  }, [token, showAssignModal]);

  // Verificar permisos
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Acceso Denegado
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Solo los super administradores pueden acceder a la gestión de equipos.
          </p>
        </div>
      </div>
    );
  }

  const handleCreateEquipo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const response = await apiService.createEquipo(formData);

      if (response.success) {
        await Swal.fire({
          title: 'Éxito',
          text: 'Equipo creado correctamente',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        setShowCreateModal(false);
        setFormData({ nombre: '', descripcion: '' });
        await refreshEquipos();
        await refreshStats();
      } else {
        throw new Error(response.message || 'Error al crear equipo');
      }
    } catch (error) {
      console.error('Error creating equipo:', error);
      await Swal.fire({
        title: 'Error',
        text: error instanceof Error ? error.message : 'Error al crear equipo',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleUpdateEquipo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedEquipo) return;

    try {
      const response = await apiService.updateEquipo(selectedEquipo.id, formData);

      if (response.success) {
        await Swal.fire({
          title: 'Éxito',
          text: 'Equipo actualizado correctamente',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        setShowEditModal(false);
        setSelectedEquipo(null);
        setFormData({ nombre: '', descripcion: '' });
        await refreshEquipos();
        await refreshStats();
      } else {
        throw new Error(response.message || 'Error al actualizar equipo');
      }
    } catch (error) {
      console.error('Error updating equipo:', error);
      await Swal.fire({
        title: 'Error',
        text: error instanceof Error ? error.message : 'Error al actualizar equipo',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleDeleteEquipo = async (equipo: Equipo) => {
    if (!token) return;

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar el equipo "${equipo.nombre}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await apiService.deleteEquipo(equipo.id);

        if (response.success) {
          await Swal.fire({
            title: 'Éxito',
            text: 'Equipo eliminado correctamente',
            icon: 'success',
            confirmButtonText: 'OK'
          });
          await refreshEquipos();
          await refreshStats();
        } else {
          throw new Error(response.message || 'Error al eliminar equipo');
        }
      } catch (error) {
        console.error('Error deleting equipo:', error);
        await Swal.fire({
          title: 'Error',
          text: error instanceof Error ? error.message : 'Error al eliminar equipo',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  const handleAssignUser = async (usuarioId: number, equipoId: number) => {
    if (!token) return;

    try {
      const response = await apiService.assignUserToEquipo(usuarioId, equipoId);

      if (response.success) {
        await Swal.fire({
          title: 'Éxito',
          text: response.message || 'Usuario asignado correctamente',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        setShowAssignModal(false);
        await refreshEquipos();
        await refreshStats();
      } else {
        throw new Error(response.message || 'Error al asignar usuario');
      }
    } catch (error) {
      console.error('Error assigning user:', error);
      await Swal.fire({
        title: 'Error',
        text: error instanceof Error ? error.message : 'Error al asignar usuario',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const openEditModal = (equipo: Equipo) => {
    setSelectedEquipo(equipo);
    setFormData({
      nombre: equipo.nombre,
      descripcion: equipo.descripcion || ''
    });
    setShowEditModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando equipos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={refreshEquipos}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Gestión de Equipos
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Administra los equipos y asigna usuarios
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAssignModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Asignar Usuario
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Crear Equipo
              </button>
            </div>
          </div>
        </div>

        {/* Equipo Actual */}
        {currentEquipo && (
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Equipo Actual
            </h2>
            <p className="text-blue-700 dark:text-blue-300">
              {currentEquipo.nombre}
              {currentEquipo.descripcion && ` - ${currentEquipo.descripcion}`}
            </p>
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {equiposStats.map((stats) => (
            <div key={stats.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stats.nombre}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalUsuarios}
                  </p>
                </div>
                <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                  <p>Admins: {stats.admins}</p>
                  <p>Voluntarios: {stats.voluntarios}</p>
                  <p>Grupos: {stats.grupos}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lista de Equipos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Equipos ({equipos.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Usuarios
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {equipos.map((equipo) => (
                  <tr key={equipo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {equipo.nombre}
                          </div>
                          {currentEquipo?.id === equipo.id && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              Actual
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {equipo.descripcion || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        equipo.activo 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {equipo.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {equipo.usuarios?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setCurrentEquipo(equipo)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Seleccionar
                        </button>
                        <button
                          onClick={() => openEditModal(equipo)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          Editar
                        </button>
                        {equipo.id !== 1 && (
                          <button
                            onClick={() => handleDeleteEquipo(equipo)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Crear Equipo */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Crear Nuevo Equipo
              </h2>
              <form onSubmit={handleCreateEquipo}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Nombre del equipo"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    rows={3}
                    placeholder="Descripción del equipo (opcional)"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Crear
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Editar Equipo */}
        {showEditModal && selectedEquipo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Editar Equipo
              </h2>
              <form onSubmit={handleUpdateEquipo}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Nombre del equipo"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    rows={3}
                    placeholder="Descripción del equipo (opcional)"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Actualizar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Asignar Usuario */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-2xl">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Asignar Usuario a Equipo
              </h2>
              <div className="space-y-4">
                {usuarios.map((usuario) => (
                  <div key={usuario.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{usuario.nombre}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {usuario.email} • {usuario.rol}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select
                        onChange={(e) => {
                          const equipoId = parseInt(e.target.value);
                          if (equipoId !== usuario.equipoId) {
                            handleAssignUser(usuario.id, equipoId);
                          }
                        }}
                        defaultValue={usuario.equipoId}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        {equipos.map((equipo) => (
                          <option key={equipo.id} value={equipo.id}>
                            {equipo.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipoManagement;
