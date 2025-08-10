import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { Usuario } from '../types';
import Swal from 'sweetalert2';

const UserManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    contraseña: '',
    sexo: 'M' as 'M' | 'F' | 'O',
    cargo: '',
    rol: 'voluntario' as 'voluntario' | 'admin' | 'superAdmin',
    participacionMensual: undefined as number | undefined
  });

  const queryClient = useQueryClient();

  // Obtener usuarios
  const { data: usuarios, isLoading, error } = useQuery({
    queryKey: ['usuarios'],
    queryFn: apiService.getUsuarios
  });

  // Mutaciones
  const createUserMutation = useMutation({
    mutationFn: apiService.createUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      setIsModalOpen(false);
      resetForm();
      Swal.fire({
        icon: 'success',
        title: 'Usuario creado',
        text: 'El usuario se ha creado exitosamente',
        timer: 2000,
        showConfirmButton: false
      });
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Error al crear usuario'
      });
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Usuario> }) =>
      apiService.updateUsuario(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      setIsModalOpen(false);
      setEditingUser(null);
      resetForm();
      Swal.fire({
        icon: 'success',
        title: 'Usuario actualizado',
        text: 'El usuario se ha actualizado exitosamente',
        timer: 2000,
        showConfirmButton: false
      });
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Error al actualizar usuario'
      });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: apiService.deleteUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      Swal.fire({
        icon: 'success',
        title: 'Usuario eliminado',
        text: 'El usuario se ha eliminado exitosamente',
        timer: 2000,
        showConfirmButton: false
      });
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Error al eliminar usuario'
      });
    }
  });

  const resetForm = () => {
    setFormData({
      nombre: '',
      email: '',
      contraseña: '',
      sexo: 'M',
      cargo: '',
      rol: 'voluntario',
      participacionMensual: undefined
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      updateUserMutation.mutate({
        id: editingUser.id,
        data: formData
      });
    } else {
      createUserMutation.mutate(formData);
    }
  };

  const handleEdit = (user: Usuario) => {
    setEditingUser(user);
    setFormData({
      nombre: user.nombre,
      email: user.email,
      contraseña: '',
      sexo: user.sexo,
      cargo: user.cargo,
      rol: user.rol,
      participacionMensual: user.participacionMensual
    });
    setIsModalOpen(true);
  };

  const handleDelete = (userId: number) => {
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
        deleteUserMutation.mutate(userId);
      }
    });
  };

  const openCreateModal = () => {
    setEditingUser(null);
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
        Error al cargar usuarios: {(error as any)?.message || 'Error desconocido'}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold font-poppins text-neutral-text dark:text-white">
          Gestión de Usuarios
        </h2>
        <button
          onClick={openCreateModal}
          className="bg-primary hover:bg-primary-dark text-white font-medium font-poppins py-2 px-4 rounded-lg transition-colors duration-200"
        >
          + Nuevo Usuario
        </button>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white dark:bg-neutral-dark rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-neutral-light dark:divide-neutral">
          <thead className="bg-neutral-light dark:bg-neutral">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium font-poppins text-neutral-text dark:text-white uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium font-poppins text-neutral-text dark:text-white uppercase tracking-wider">
                Cargo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium font-poppins text-neutral-text dark:text-white uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium font-poppins text-neutral-text dark:text-white uppercase tracking-wider">
                Participación Mensual
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium font-poppins text-neutral-text dark:text-white uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-neutral-dark divide-y divide-neutral-light dark:divide-neutral">
            {usuarios?.data && usuarios.data.length > 0 ? (
              <div className="divide-y divide-neutral-light dark:divide-neutral">
                {usuarios.data.map((user: Usuario) => (
                  <div key={user.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        user.rol === 'admin' || user.rol === 'superAdmin' ? 'bg-success' : 'bg-primary'
                      }`}></div>
                      
                      <div>
                        <div className="font-medium font-poppins text-neutral-text dark:text-white">
                          {user.nombre}
                        </div>
                        <div className="text-sm text-neutral-text/70 dark:text-white/70">
                          {user.email} • {user.cargo}
                        </div>
                        <div className="text-xs text-neutral-text/50 dark:text-white/50">
                          Rol: {user.rol}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-primary hover:text-primary-dark font-medium font-poppins text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
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
                No hay usuarios registrados.
              </div>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para crear/editar usuario */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-dark rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium font-poppins text-neutral-text dark:text-white mb-4">
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
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
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-light dark:border-neutral rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-neutral dark:text-white"
                  required
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium font-poppins text-neutral-text dark:text-white mb-1">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    name="contraseña"
                    value={formData.contraseña}
                    onChange={(e) => setFormData({...formData, contraseña: e.target.value})}
                    className="w-full px-3 py-2 border border-neutral-light dark:border-neutral rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-neutral dark:text-white"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium font-poppins text-neutral-text dark:text-white mb-1">
                  Sexo
                </label>
                <select
                  name="sexo"
                  value={formData.sexo}
                  onChange={(e) => setFormData({...formData, sexo: e.target.value as 'M' | 'F' | 'O'})}
                  className="w-full px-3 py-2 border border-neutral-light dark:border-neutral rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-neutral dark:text-white"
                >
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="O">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium font-poppins text-neutral-text dark:text-white mb-1">
                  Cargo
                </label>
                <input
                  type="text"
                  name="cargo"
                  value={formData.cargo}
                  onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-light dark:border-neutral rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-neutral dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium font-poppins text-neutral-text dark:text-white mb-1">
                  Rol
                </label>
                <select
                  name="rol"
                  value={formData.rol}
                  onChange={(e) => setFormData({...formData, rol: e.target.value as 'voluntario' | 'admin' | 'superAdmin'})}
                  className="w-full px-3 py-2 border border-neutral-light dark:border-neutral rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-neutral dark:text-white"
                  required
                >
                  <option value="voluntario">Voluntario</option>
                  <option value="admin">Administrador</option>
                                                <option value="superAdmin">Super Administrador</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium font-poppins text-neutral-text dark:text-white mb-1">
                  Participación Mensual (opcional)
                </label>
                <input
                  type="number"
                  name="participacionMensual"
                  value={formData.participacionMensual || ''}
                  onChange={(e) => setFormData({...formData, participacionMensual: e.target.value ? parseInt(e.target.value) : undefined})}
                  className="w-full px-3 py-2 border border-neutral-light dark:border-neutral rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-neutral dark:text-white"
                  min="0"
                  placeholder="Número de veces al mes"
                />
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
                  disabled={createUserMutation.isPending || updateUserMutation.isPending}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-medium font-poppins rounded-lg transition-colors duration-200 disabled:opacity-50"
                >
                  {createUserMutation.isPending || updateUserMutation.isPending ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
