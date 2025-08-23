import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { Usuario } from '../types';
import Swal from 'sweetalert2';
import DisponibilidadModal from './DisponibilidadModal';
import ParticipacionMensualDisplay from './ParticipacionMensualDisplay';

const UserManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [isDisponibilidadModalOpen, setIsDisponibilidadModalOpen] = useState(false);
  const [selectedUserForDisponibilidad, setSelectedUserForDisponibilidad] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    contraseña: '',
    sexo: 'M' as 'M' | 'F' | 'O',
    cargo: '',
    cargoId: undefined as number | undefined,
    rol: 'voluntario' as 'voluntario' | 'admin' | 'superAdmin' | 'grupo',
    participacionMensual: undefined as number | null | undefined,
    tieneCoche: false,
    siempreCon: undefined as number | undefined,
    nuncaCon: undefined as number | undefined
  });

  const queryClient = useQueryClient();

  // Obtener usuarios
  const { data: usuarios, isLoading, error } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => apiService.getUsuarios()
  });

  // Obtener cargos
  const { data: cargos } = useQuery({
    queryKey: ['cargos'],
    queryFn: () => apiService.getCargos(),
  });

  // Mutaciones
  const createUserMutation = useMutation({
    mutationFn: (data: Partial<Usuario>) => apiService.createUsuario(data),
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
    mutationFn: (id: number) => apiService.deleteUsuario(id),
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
      cargoId: undefined,
      rol: 'voluntario',
      participacionMensual: null,
      tieneCoche: false,
      siempreCon: undefined,
      nuncaCon: undefined
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Si es rol "grupo", solo se requiere el nombre
    if (formData.rol === 'grupo') {
      if (!formData.nombre.trim()) {
        Swal.fire({
          icon: 'warning',
          title: 'Campo requerido',
          text: 'El nombre es obligatorio para usuarios con rol "grupo".',
          confirmButtonText: 'Entendido'
        });
        return;
      }
      
      // Para usuarios con rol "grupo", asignar valores por defecto
      const userData = {
        nombre: formData.nombre.trim(),
        rol: 'grupo' as const,
        sexo: 'M' as const, // Valor por defecto
        cargo: 'Grupo',
        email: undefined,
        contraseña: undefined,
        participacionMensual: undefined,
        tieneCoche: false,
        siempreCon: undefined,
        nuncaCon: undefined
      };
      
      if (editingUser) {
        updateUserMutation.mutate({
          id: editingUser.id,
          data: userData
        });
      } else {
        createUserMutation.mutate(userData);
      }
      return;
    }
    
    // Para otros roles, validaciones normales
    // Validación: si se proporciona contraseña, también debe proporcionarse email
    if (formData.contraseña && !formData.email) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Si proporcionas una contraseña, también debes proporcionar un email para que el usuario pueda acceder a la aplicación.',
        confirmButtonText: 'Entendido'
      });
      return;
    }
    
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
      cargoId: user.cargoId,
      rol: user.rol,
      participacionMensual: user.participacionMensual,
      tieneCoche: user.tieneCoche || false,
      siempreCon: user.siempreCon,
      nuncaCon: user.nuncaCon
    });
    setIsModalOpen(true);
  };

  const handleDisponibilidad = (user: Usuario) => {
    setSelectedUserForDisponibilidad(user);
    setIsDisponibilidadModalOpen(true);
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

  // Función para replicar disponibilidades de usuarios
  const handleReplicarDisponibilidades = async () => {
    try {
      // Determinar qué mes usar como base
      const fechaActual = new Date();
      const mesActual = fechaActual.getMonth();
      const añoActual = fechaActual.getFullYear();
      
      // Obtener disponibilidades del mes actual o del mes pasado si no hay en el actual
      let mesBase = mesActual;
      let añoBase = añoActual;
      
      // Intentar obtener disponibilidades del mes actual
      let disponibilidadesBase: any[] = [];
      let mesBaseString = `${añoBase}-${(mesBase + 1).toString().padStart(2, '0')}`;
      
      // Obtener todas las configuraciones de disponibilidad del mes actual
      for (const usuario of usuarios?.data || []) {
        try {
          const response = await apiService.getUserDisponibilidadConfig(usuario.id, mesBaseString);
          if (response?.data && response.data.length > 0) {
            disponibilidadesBase.push(...response.data.map((disp: any) => ({ ...disp, usuarioId: usuario.id })));
          }
        } catch (error) {
          console.log(`No hay disponibilidades para usuario ${usuario.id} en ${mesBaseString}`);
        }
      }

      // Si no hay disponibilidades en el mes actual, usar el mes pasado
      if (disponibilidadesBase.length === 0) {
        mesBase = mesActual === 0 ? 11 : mesActual - 1;
        añoBase = mesActual === 0 ? añoActual - 1 : añoActual;
        mesBaseString = `${añoBase}-${(mesBase + 1).toString().padStart(2, '0')}`;
        
        // Obtener disponibilidades del mes pasado
        for (const usuario of usuarios?.data || []) {
          try {
            const response = await apiService.getUserDisponibilidadConfig(usuario.id, mesBaseString);
            if (response?.data && response.data.length > 0) {
              disponibilidadesBase.push(...response.data.map((disp: any) => ({ ...disp, usuarioId: usuario.id })));
            }
          } catch (error) {
            console.log(`No hay disponibilidades para usuario ${usuario.id} en ${mesBaseString}`);
          }
        }
      }

      if (disponibilidadesBase.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'No hay disponibilidades para replicar',
          text: 'No se encontraron configuraciones de disponibilidad en el mes actual ni en el mes pasado.',
          confirmButtonText: 'Entendido'
        });
        return;
      }

      // Filtrar disponibilidades (excluir fechas concretas y no disponibles)
      const disponibilidadesReplicables = disponibilidadesBase.filter(disp => 
        disp.tipo_disponibilidad !== 'fechaConcreta' && 
        disp.tipo_disponibilidad !== 'noDisponibleFecha'
      );

      if (disponibilidadesReplicables.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'No hay disponibilidades replicables',
          text: 'Solo se encontraron configuraciones de fechas concretas que no se pueden replicar.',
          confirmButtonText: 'Entendido'
        });
        return;
      }

      // Calcular el mes objetivo (siguiente mes)
      const mesObjetivo = mesActual === 11 ? 0 : mesActual + 1;
      const añoObjetivo = mesActual === 11 ? añoActual + 1 : añoActual;
      const mesObjetivoString = `${añoObjetivo}-${(mesObjetivo + 1).toString().padStart(2, '0')}`;

      // Mostrar confirmación con detalles
      const mesBaseNombre = new Date(añoBase, mesBase).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      const mesDestinoNombre = new Date(añoObjetivo, mesObjetivo).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

      const result = await Swal.fire({
        icon: 'question',
        title: 'Replicar Disponibilidades de Usuarios',
        html: `
          <div class="text-left">
            <p class="mb-3">Se van a replicar <strong>${disponibilidadesReplicables.length}</strong> configuraciones de disponibilidad del mes de <strong>${mesBaseNombre}</strong> al mes de <strong>${mesDestinoNombre}</strong>.</p>
            <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm">
              <p><strong>Detalles de la replicación:</strong></p>
              <ul class="list-disc list-inside mt-2">
                <li>Se replicarán: todas las tardes, todas las mañanas, días de la semana</li>
                <li><strong>NO se replicarán:</strong> fechas concretas ni fechas no disponibles</li>
                <li>Se mantendrán los mismos horarios y configuraciones</li>
                <li>Se ajustarán al mes siguiente</li>
              </ul>
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Sí, replicar disponibilidades',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#6b7280'
      });

      if (!result.isConfirmed) return;

      // Mostrar progreso
      let configuracionesCreadas = 0;
      let configuracionesConError = 0;
      const errores: string[] = [];

      // Mostrar progreso con promesa que NO se resuelve hasta completar la replicación
      Swal.fire({
        title: 'Replicando disponibilidades...',
        html: `
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Procesando ${disponibilidadesReplicables.length} configuraciones...</p>
            <div class="mt-3">
              <div class="bg-gray-200 rounded-full h-2">
                <div id="progress-bar" class="bg-blue-600 h-2 rounded-full" style="width: 0%"></div>
              </div>
              <p id="progress-text" class="text-sm mt-2">0 de ${disponibilidadesReplicables.length} configuraciones procesadas</p>
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
        // Replicar cada configuración
        for (let i = 0; i < disponibilidadesReplicables.length; i++) {
          const disp = disponibilidadesReplicables[i];
          try {
            console.log(`Procesando configuración ${i + 1}/${disponibilidadesReplicables.length}: ${disp.tipo_disponibilidad} para usuario ${disp.usuarioId}`);
            
            // Crear la nueva configuración para el mes siguiente
            await apiService.createUserDisponibilidadConfig({
              usuarioId: disp.usuarioId,
              mes: mesObjetivoString,
              tipo_disponibilidad: disp.tipo_disponibilidad,
              configuracion: disp.configuracion
            });

            configuracionesCreadas++;
            
            // Actualizar progreso en el SweetAlert
            const progressPercent = Math.round(((i + 1) / disponibilidadesReplicables.length) * 100);
            const progressBar = document.getElementById('progress-bar');
            const progressText = document.getElementById('progress-text');
            if (progressBar) progressBar.style.width = `${progressPercent}%`;
            if (progressText) progressText.textContent = `${i + 1} de ${disponibilidadesReplicables.length} configuraciones procesadas`;
            
            // Pequeña pausa para evitar sobrecarga y permitir que se vea el progreso
            await new Promise(resolve => setTimeout(resolve, 200));
            
          } catch (error: any) {
            console.error(`Error al crear configuración ${disp.tipo_disponibilidad} para usuario ${disp.usuarioId}:`, error);
            configuracionesConError++;
            errores.push(`Usuario ${disp.usuarioId} - ${disp.tipo_disponibilidad}: ${error.response?.data?.message || 'Error desconocido'}`);
            
            // Actualizar progreso incluso si hay error
            const progressPercent = Math.round(((i + 1) / disponibilidadesReplicables.length) * 100);
            const progressBar = document.getElementById('progress-bar');
            const progressText = document.getElementById('progress-text');
            if (progressBar) progressBar.style.width = `${progressPercent}%`;
            if (progressText) progressText.textContent = `${i + 1} de ${disponibilidadesReplicables.length} configuraciones procesadas (${configuracionesConError} errores)`;
          }
        }
      })();

      // Esperar a que termine la replicación y luego cerrar el progreso
      await replicationPromise;
      Swal.close();

      // Mostrar resultado
      if (configuracionesConError === 0) {
        await Swal.fire({
          icon: 'success',
          title: 'Disponibilidades replicadas exitosamente',
          html: `
            <div class="text-center">
              <p class="mb-3">Se han replicado <strong>${configuracionesCreadas}</strong> configuraciones de disponibilidad del mes de <strong>${mesBaseNombre}</strong> al mes de <strong>${mesDestinoNombre}</strong>.</p>
              <div class="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-sm">
                <p><strong>Resumen:</strong></p>
                <ul class="list-disc list-inside mt-2">
                  <li>✅ Configuraciones creadas: ${configuracionesCreadas}</li>
                  <li>✅ Todas las tardes replicadas</li>
                  <li>✅ Todas las mañanas replicadas</li>
                  <li>✅ Días de la semana replicados</li>
                  <li>✅ Fechas concretas excluidas (no replicables)</li>
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
                 <p class="mb-3">Se replicaron <strong>${configuracionesCreadas}</strong> configuraciones, pero <strong>${configuracionesConError}</strong> fallaron.</p>
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

    } catch (error) {
      console.error('Error al replicar disponibilidades:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al replicar disponibilidades',
        text: 'Ha ocurrido un error inesperado al intentar replicar las disponibilidades.',
        confirmButtonText: 'Entendido'
      });
    }
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
        <div className="flex space-x-3">
          <button
            onClick={handleReplicarDisponibilidades}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium font-poppins py-2 px-4 rounded-lg transition-colors duration-200"
            title="Replicar disponibilidades del mes actual al siguiente mes"
          >
            📅 Replicar Disponibilidades
          </button>
          <button
            onClick={openCreateModal}
            className="bg-primary hover:bg-primary-dark text-white font-medium font-poppins py-2 px-4 rounded-lg transition-colors duration-200"
          >
            + Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Vista de escritorio - Tabla */}
      <div className="hidden lg:block bg-white dark:bg-neutral-dark rounded-lg shadow overflow-hidden">
        <div className="relative">
          <div className="overflow-x-auto custom-scrollbar" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgb(156 163 175) transparent'
          }}>
            <table className="min-w-full divide-y divide-neutral-light dark:divide-neutral" style={{ minWidth: '1200px' }}>
              <thead className="bg-neutral-light dark:bg-neutral sticky top-0 z-10">
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-medium font-poppins text-neutral-text dark:text-white uppercase tracking-wider min-w-[180px]">
                    Usuario
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium font-poppins text-neutral-text dark:text-white uppercase tracking-wider min-w-[120px]">
                    Cargo
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium font-poppins text-neutral-text dark:text-white uppercase tracking-wider min-w-[100px]">
                    Rol
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium font-poppins text-neutral-text dark:text-white uppercase tracking-wider min-w-[100px]">
                    Participación
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium font-poppins text-neutral-text dark:text-white uppercase tracking-wider min-w-[80px]">
                    Coche
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium font-poppins text-neutral-text dark:text-white uppercase tracking-wider min-w-[120px]">
                    Siempre Con
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium font-poppins text-neutral-text dark:text-white uppercase tracking-wider min-w-[120px]">
                    Nunca Con
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium font-poppins text-neutral-text dark:text-white uppercase tracking-wider min-w-[120px]">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-neutral-dark divide-y divide-neutral-light dark:divide-neutral">
                {usuarios?.data && usuarios.data.length > 0 ? (
                  usuarios.data.map((user: Usuario) => (
                    <tr key={user.id} className="hover:bg-neutral-light/50 dark:hover:bg-neutral/50">
                      <td className="px-2 py-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2.5 h-2.5 rounded-full ${
                            user.rol === 'admin' || user.rol === 'superAdmin' ? 'bg-success' : 'bg-primary'
                          }`}></div>
                          
                          <div className="min-w-0 flex-1">
                            <div className="font-medium font-poppins text-neutral-text dark:text-white truncate text-sm">
                              {user.nombre}
                            </div>
                            <div className="text-xs text-neutral-text/70 dark:text-white/70 truncate">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-sm text-neutral-text dark:text-white">
                        {user.cargo || '-'}
                      </td>
                      <td className="px-2 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.rol === 'superAdmin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                          user.rol === 'admin' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {user.rol}
                        </span>
                      </td>
                                             <td className="px-2 py-3 text-sm text-neutral-text dark:text-white">
                         <ParticipacionMensualDisplay
                           userId={user.id}
                           participacionMensual={user.participacionMensual}
                         />
                       </td>
                      <td className="px-2 py-3 text-sm text-neutral-text dark:text-white">
                        {user.tieneCoche ? 'Sí' : 'No'}
                      </td>
                      <td className="px-2 py-3 text-sm text-neutral-text dark:text-white">
                        {user.siempreConUsuario ? user.siempreConUsuario.nombre : '-'}
                      </td>
                      <td className="px-2 py-3 text-sm text-neutral-text dark:text-white">
                        {user.nuncaConUsuario ? user.nuncaConUsuario.nombre : '-'}
                      </td>
                      <td className="px-2 py-3 text-sm font-medium">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-primary hover:text-primary-dark p-1 rounded hover:bg-primary/10 transition-colors"
                            title="Editar usuario"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDisponibilidad(user)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            title="Gestionar disponibilidad"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Eliminar usuario"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-2 py-6 text-center text-neutral-text/70 dark:text-white/70">
                      No hay usuarios registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Vista móvil/tablet - Tarjetas */}
      <div className="lg:hidden space-y-4">
        {usuarios?.data && usuarios.data.length > 0 ? (
          usuarios.data.map((user: Usuario) => (
            <div key={user.id} className="bg-white dark:bg-neutral-dark rounded-lg shadow p-4">
              {/* Header de la tarjeta */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    user.rol === 'admin' || user.rol === 'superAdmin' ? 'bg-success' : 'bg-primary'
                  }`}></div>
                  <div>
                    <h3 className="font-medium font-poppins text-neutral-text dark:text-white">
                      {user.nombre}
                    </h3>
                    <p className="text-sm text-neutral-text/70 dark:text-white/70">
                      {user.email}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.rol === 'superAdmin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                  user.rol === 'admin' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {user.rol}
                </span>
              </div>

              {/* Información del usuario */}
              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div>
                  <span className="text-neutral-text/60 dark:text-white/60">Cargo:</span>
                  <p className="text-neutral-text dark:text-white font-medium">{user.cargo || '-'}</p>
                </div>
                <div>
                                     <span className="text-neutral-text/60 dark:text-white/60">Participación:</span>
                   <div className="text-neutral-text dark:text-white font-medium">
                     <ParticipacionMensualDisplay
                       userId={user.id}
                       participacionMensual={user.participacionMensual}
                     />
                   </div>
                </div>
                <div>
                  <span className="text-neutral-text/60 dark:text-white/60">Tiene Coche:</span>
                  <p className="text-neutral-text dark:text-white font-medium">
                    {user.tieneCoche ? 'Sí' : 'No'}
                  </p>
                </div>
                <div>
                  <span className="text-neutral-text/60 dark:text-white/60">Siempre Con:</span>
                  <p className="text-neutral-text dark:text-white font-medium">
                    {user.siempreConUsuario ? user.siempreConUsuario.nombre : '-'}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-neutral-text/60 dark:text-white/60">Nunca Con:</span>
                  <p className="text-neutral-text dark:text-white font-medium">
                    {user.nuncaConUsuario ? user.nuncaConUsuario.nombre : '-'}
                  </p>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex space-x-2 pt-3 border-t border-neutral-light dark:border-neutral">
                <button
                  onClick={() => handleEdit(user)}
                  className="flex-1 text-primary hover:text-primary-dark font-medium font-poppins text-sm py-2 px-3 rounded-lg border border-primary hover:bg-primary/10 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDisponibilidad(user)}
                  className="flex-1 text-blue-600 hover:text-blue-900 font-medium font-poppins text-sm py-2 px-3 rounded-lg border border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  Disponibilidad
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="flex-1 text-red-600 hover:text-red-900 font-medium font-poppins text-sm py-2 px-3 rounded-lg border border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-neutral-dark rounded-lg shadow p-8 text-center">
            <p className="text-neutral-text/70 dark:text-white/70">
              No hay usuarios registrados.
            </p>
          </div>
        )}
      </div>

      {/* Modal para crear/editar usuario */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-dark rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium font-poppins text-neutral-text dark:text-white mb-4">
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h3>
            
                         {/* Nota informativa */}
             <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
               <div className="flex items-start">
                 <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
                 <div className="text-sm text-blue-800 dark:text-blue-200">
                   <p className="font-medium mb-1">Información importante:</p>
                   <ul className="list-disc list-inside space-y-1 text-xs">
                     {formData.rol === 'grupo' ? (
                       <>
                         <li><strong>Rol Grupo:</strong> Solo se requiere el nombre del usuario</li>
                         <li><strong>Usuarios de grupo:</strong> No tendrán acceso a la aplicación, solo se registrarán en el sistema</li>
                       </>
                     ) : (
                       <>
                         <li><strong>Sin email ni contraseña:</strong> El usuario será registrado pero NO tendrá acceso a la aplicación</li>
                         <li><strong>Con email y contraseña:</strong> El usuario podrá acceder a la aplicación normalmente</li>
                         <li><strong>Con email sin contraseña:</strong> El usuario será registrado pero NO podrá acceder a la aplicación</li>
                         <li><strong>Campos obligatorios:</strong> Nombre, Cargo y Rol siempre son requeridos</li>
                       </>
                     )}
                   </ul>
                 </div>
               </div>
             </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo Nombre - Siempre visible */}
              <div>
                <label className="block text-sm font-medium font-poppins text-neutral-text dark:text-white mb-1">
                  Nombre <span className="text-red-500">*</span>
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

              {/* Campo Rol - Siempre visible */}
              <div>
                <label className="block text-sm font-medium font-poppins text-neutral-text dark:text-white mb-1">
                  Rol <span className="text-red-500">*</span>
                </label>
                <select
                  name="rol"
                  value={formData.rol}
                  onChange={(e) => setFormData({...formData, rol: e.target.value as 'voluntario' | 'admin' | 'superAdmin' | 'grupo'})}
                  className="w-full px-3 py-2 border border-neutral-light dark:border-neutral rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-neutral dark:text-white"
                  required
                >
                  <option value="voluntario">Voluntario</option>
                  <option value="grupo">Grupo</option>
                  <option value="admin">Administrador</option>
                  <option value="superAdmin">Super Administrador</option>
                </select>
              </div>

              {/* Resto de campos - Solo visibles si NO es rol grupo */}
              {formData.rol !== 'grupo' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Columna Izquierda */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium font-poppins text-neutral-text dark:text-white mb-1">
                        Email <span className="text-xs text-gray-500">(opcional)</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-3 py-2 border border-neutral-light dark:border-neutral rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-neutral dark:text-white"
                        placeholder="Dejar vacío si no tendrá acceso a la app"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Sin email = sin acceso a la aplicación
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium font-poppins text-neutral-text dark:text-white mb-1">
                        Contraseña <span className="text-xs text-gray-500">(opcional)</span>
                      </label>
                      <input
                        type="password"
                        name="contraseña"
                        value={formData.contraseña}
                        onChange={(e) => setFormData({...formData, contraseña: e.target.value})}
                        className="w-full px-3 py-2 border border-neutral-light dark:border-neutral rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-neutral dark:text-white"
                        placeholder={editingUser ? "Dejar vacía para mantener la contraseña actual" : "Dejar vacía si no tendrá acceso a la app"}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {editingUser 
                          ? "Dejar vacía para mantener la contraseña actual"
                          : "Sin contraseña = sin acceso a la aplicación"
                        }
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium font-poppins text-neutral-text dark:text-white mb-1">
                        Sexo <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="sexo"
                        value={formData.sexo}
                        onChange={(e) => setFormData({...formData, sexo: e.target.value as 'M' | 'F' | 'O'})}
                        className="w-full px-3 py-2 border border-neutral-light dark:border-neutral rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-neutral dark:text-white"
                        required
                      >
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium font-poppins text-neutral-text dark:text-white mb-1">
                        Cargo <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="cargo"
                        value={formData.cargoId ? cargos?.data?.find(c => c.id === formData.cargoId)?.nombre || '' : formData.cargo}
                        onChange={(e) => {
                          const selectedCargo = cargos?.data?.find(c => c.nombre === e.target.value);
                          setFormData({
                            ...formData, 
                            cargo: e.target.value,
                            cargoId: selectedCargo?.id
                          });
                        }}
                        className="w-full px-3 py-2 border border-neutral-light dark:border-neutral rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-neutral dark:text-white"
                        required
                      >
                        <option value="">Seleccionar Cargo</option>
                        {cargos?.data?.map((cargo) => (
                          <option key={cargo.id} value={cargo.nombre}>
                            {cargo.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Columna Derecha */}
                  <div className="space-y-4">
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

                    <div>
                      <label className="block text-sm font-medium font-poppins text-neutral-text dark:text-white mb-1">
                        Tiene Coche
                      </label>
                      <select
                        name="tieneCoche"
                        value={formData.tieneCoche ? 'true' : 'false'}
                        onChange={(e) => setFormData({...formData, tieneCoche: e.target.value === 'true'})}
                        className="w-full px-3 py-2 border border-neutral-light dark:border-neutral rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-neutral dark:text-white"
                      >
                        <option value="false">No</option>
                        <option value="true">Sí</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium font-poppins text-neutral-text dark:text-white mb-1">
                        Siempre Con (opcional)
                      </label>
                      <select
                        name="siempreCon"
                        value={formData.siempreCon || ''}
                        onChange={(e) => setFormData({...formData, siempreCon: e.target.value ? parseInt(e.target.value) : undefined})}
                        className="w-full px-3 py-2 border border-neutral-light dark:border-neutral rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-neutral dark:text-white"
                      >
                        <option value="">Sin usuario específico</option>
                        {usuarios?.data && usuarios.data
                          .filter((user: Usuario) => !editingUser || user.id !== editingUser.id)
                          .map((user: Usuario) => (
                            <option key={user.id} value={user.id}>
                              {user.nombre} ({user.email})
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium font-poppins text-neutral-text dark:text-white mb-1">
                        Nunca Con (opcional)
                      </label>
                      <select
                        name="nuncaCon"
                        value={formData.nuncaCon || ''}
                        onChange={(e) => setFormData({...formData, nuncaCon: e.target.value ? parseInt(e.target.value) : undefined})}
                        className="w-full px-3 py-2 border border-neutral-light dark:border-neutral rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-neutral dark:text-white"
                      >
                        <option value="">Sin usuario específico</option>
                        {usuarios?.data && usuarios.data
                          .filter((user: Usuario) => !editingUser || user.id !== editingUser.id)
                          .map((user: Usuario) => (
                            <option key={user.id} value={user.id}>
                              {user.nombre} ({user.email})
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-light dark:border-neutral">
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

      {/* Modal de Disponibilidad */}
      <DisponibilidadModal
        isOpen={isDisponibilidadModalOpen}
        onClose={() => setIsDisponibilidadModalOpen(false)}
        user={selectedUserForDisponibilidad}
      />
    </div>
  );
};

export default UserManagement;
