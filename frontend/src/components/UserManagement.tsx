import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { Usuario } from '../types';
import Swal from 'sweetalert2';
import DisponibilidadModal from './DisponibilidadModal';
import ParticipacionMensualDisplay from './ParticipacionMensualDisplay';
import { useAuth } from '../contexts/AuthContext';
import { useEquipo } from '../contexts/EquipoContext';

const UserManagement: React.FC = (): JSX.Element => {
  const { user: currentUser } = useAuth();
  const { equipos, currentEquipo, currentEquipoId } = useEquipo();
  console.log('Current user role:', currentUser?.rol);
  console.log('LocalStorage user:', localStorage.getItem('user'));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [isDisponibilidadModalOpen, setIsDisponibilidadModalOpen] = useState(false);
  const [selectedUserForDisponibilidad, setSelectedUserForDisponibilidad] = useState<Usuario | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedEquipoId, setSelectedEquipoId] = useState<number | null>(currentEquipo?.id || null);
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    contraseña: '',
    sexo: 'M' as 'M' | 'F' | 'O',
    cargo: '',
    cargoId: undefined as number | undefined,
    rol: currentUser?.rol === 'superAdmin' ? 'voluntario' : 'voluntario' as 'voluntario' | 'admin' | 'superAdmin' | 'grupo',
    participacionMensual: undefined as number | null | undefined,
    tieneCoche: false,
    siempreCon: undefined as number | undefined,
    nuncaCon: undefined as number | undefined,
    equipoId: currentEquipo?.id || 1
  });

  const queryClient = useQueryClient();

  // Obtener usuarios
  const { data: usuarios, isLoading, error } = useQuery({
    queryKey: ['usuarios', currentEquipoId, currentPage, itemsPerPage, selectedEquipoId, sortBy, sortOrder, searchTerm],
    queryFn: () => {
      console.log('UserManagement - fetching usuarios with currentEquipoId:', currentEquipoId, 'page:', currentPage, 'limit:', itemsPerPage, 'selectedEquipoId:', selectedEquipoId, 'sortBy:', sortBy, 'sortOrder:', sortOrder, 'searchTerm:', searchTerm);
      return apiService.getUsuarios(currentPage, itemsPerPage, selectedEquipoId || undefined, sortBy, sortOrder, searchTerm);
    }
  });

  // Obtener cargos
  const { data: cargos } = useQuery({
    queryKey: ['cargos', currentEquipoId],
    queryFn: () => apiService.getCargos(),
  });

  // Mutaciones
  const createUserMutation = useMutation({
    mutationFn: (data: Partial<Usuario>) => apiService.createUsuario(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      handleCloseModal();
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
      handleCloseModal();
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
      nuncaCon: undefined,
      equipoId: currentEquipo?.id || 1
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
      rol: currentUser?.rol !== 'superAdmin' && user.rol === 'superAdmin' ? 'admin' : user.rol,
      participacionMensual: user.participacionMensual,
      tieneCoche: user.tieneCoche || false,
      siempreCon: user.siempreCon,
      nuncaCon: user.nuncaCon,
      equipoId: user.equipoId || currentEquipo?.id || 1
    });
    setIsModalOpen(true);
  };

  const handleDisponibilidad = (user: Usuario) => {
    setSelectedUserForDisponibilidad(user);
    setIsDisponibilidadModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    resetForm();
  };

  const handleDelete = (userId: number) => {
    // Si el usuario actual es admin y está intentando eliminar un superAdmin, no permitirlo
    const userToDelete = usuarios?.data?.find(u => u.id === userId);
    if (currentUser?.rol === 'admin' && userToDelete?.rol === 'superAdmin') {
      Swal.fire({
        icon: 'error',
        title: 'Acceso denegado',
        text: 'No tienes permisos para eliminar usuarios con rol de Super Administrador',
        confirmButtonText: 'Entendido'
      });
      return;
    }

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

  // Funciones de paginación
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset a la primera página
  };

  // Función para manejar cambio de equipo
  const handleEquipoChange = (equipoId: number | null) => {
    setSelectedEquipoId(equipoId);
    setCurrentPage(1); // Reset a la primera página
  };

  // Función para manejar ordenamiento
  const handleSort = (field: string) => {
    if (sortBy === field) {
      // Si ya está ordenando por este campo, cambiar el orden
      if (sortOrder === 'ASC') {
        setSortOrder('DESC');
      } else if (sortOrder === 'DESC') {
        // Tercer clic: quitar ordenamiento
        setSortBy('');
        setSortOrder('');
      }
    } else {
      // Si es un campo nuevo, ordenar ascendente por defecto
      setSortBy(field);
      setSortOrder('ASC');
    }
    setCurrentPage(1); // Reset a la primera página
  };

  // Función para obtener el ícono de ordenamiento
  const getSortIcon = (field: string) => {
    if (sortBy !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    if (sortOrder === 'ASC') {
      return (
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    } else if (sortOrder === 'DESC') {
      return (
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      );
    } else {
      // Sin ordenamiento
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
  };

  // Función para manejar búsqueda
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset a la primera página
  };

  // Obtener información de paginación
  const pagination = usuarios?.pagination;



  const handleSendToAllUsers = async () => {
    try {
      // Obtener el mes actual y los próximos meses
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      const months = [];
      for (let i = 0; i < 12; i++) {
        const date = new Date(currentYear, currentMonth + i, 1);
        const monthName = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        const monthValue = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        months.push({ value: monthValue, label: monthName });
      }

      // Mostrar selector de mes
      const { value: selectedMonth } = await Swal.fire({
        title: 'Seleccionar mes',
        text: '¿Para qué mes quieres enviar las notificaciones?',
        input: 'select',
        inputOptions: months.reduce((acc, month) => {
          acc[month.value] = month.label;
          return acc;
        }, {} as Record<string, string>),
        inputValue: months[0].value,
        showCancelButton: true,
        confirmButtonColor: '#f59e0b',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Continuar',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
          if (!value) {
            return 'Debes seleccionar un mes';
          }
        }
      });

      if (!selectedMonth) return;

      // Mostrar confirmación final
      const monthLabel = months.find(m => m.value === selectedMonth)?.label;
      const result = await Swal.fire({
        title: '¿Enviar notificaciones?',
        html: `
          <div class="text-center">
            <p class="mb-3">Se enviarán notificaciones a todos los usuarios con turnos en:</p>
            <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <strong class="text-blue-800 dark:text-blue-200">${monthLabel}</strong>
            </div>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#f59e0b',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, enviar',
        cancelButtonText: 'Cancelar'
      });

      if (!result.isConfirmed) return;

      // Mostrar loading
      Swal.fire({
        title: 'Enviando notificaciones...',
        text: `Enviando notificaciones para ${monthLabel}`,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Ejecutar envío a todos con el mes seleccionado
      const response = await apiService.sendNotificationsToAllUsers(selectedMonth);
      
      // Mostrar resultado
      await Swal.fire({
        icon: 'success',
        title: 'Notificaciones enviadas',
        html: `
          <div class="text-center">
            <p class="mb-3">Se han enviado notificaciones para <strong>${monthLabel}</strong>.</p>
            <div class="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-sm">
              <p><strong>Resultado:</strong></p>
              <ul class="list-disc list-inside mt-2">
                <li>✅ Emails enviados: ${response.data?.sent || 0}</li>
                <li>❌ Emails fallidos: ${response.data?.failed || 0}</li>
              </ul>
            </div>
            <p class="mt-3 text-xs text-gray-600 dark:text-gray-400">
              Revisa los logs del servidor para más detalles.
            </p>
          </div>
        `,
        confirmButtonText: 'Perfecto'
      });

    } catch (error: any) {
      console.error('Error enviando a todos los usuarios:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error en el envío',
        text: error.response?.data?.message || 'Error interno del servidor',
        confirmButtonText: 'Entendido'
      });
    }
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
        Error al cargar usuarios: {(error as any)?.message || 'Error desconocido'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestión de Usuarios
        </h2>
        <div className="flex space-x-3">
          <button
            onClick={handleSendToAllUsers}
            className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            title="Enviar notificaciones a TODOS los usuarios con turnos (para pruebas)"
          >
            📨 Enviar a Todos
          </button>
          <button
            onClick={handleReplicarDisponibilidades}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            title="Replicar disponibilidades del mes actual al siguiente mes"
          >
            📅 Replicar Disponibilidades
          </button>
          <button
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            + Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
          {/* Campo de Búsqueda */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 flex-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Buscar:
            </label>
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Buscar por nombre, email, cargo, rol..."
                className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            {searchTerm && (
              <button
                onClick={() => handleSearch('')}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 whitespace-nowrap"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Selector de Equipo - Solo para superAdmin */}
          {currentUser?.rol === 'superAdmin' && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                Filtrar por Equipo:
              </label>
              <select
                value={selectedEquipoId || ''}
                onChange={(e) => handleEquipoChange(e.target.value ? parseInt(e.target.value) : null)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white min-w-[200px]"
              >
                <option value="">Todos los equipos</option>
              {equipos?.map((equipo) => (
                <option key={equipo.id} value={equipo.id}>
                  {equipo.nombre}
                </option>
              ))}
            </select>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {selectedEquipoId ? `Mostrando usuarios del equipo seleccionado` : ''}
            </span>
            </div>
          )}
        </div>
      </div>

      {/* Vista de escritorio - Tabla */}
      <div className="hidden lg:block bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="relative">
          <div className="overflow-x-auto custom-scrollbar" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgb(156 163 175) transparent'
          }}>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                             <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                 <tr>
                   <th 
                     className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                     onClick={() => handleSort('nombre')}
                   >
                     <div className="flex items-center space-x-1">
                       <span>Usuario</span>
                       {getSortIcon('nombre')}
                     </div>
                   </th>
                                     <th 
                     className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                     onClick={() => handleSort('cargo')}
                   >
                     <div className="flex items-center space-x-1">
                       <span>Cargo</span>
                       {getSortIcon('cargo')}
                     </div>
                   </th>
                                     <th 
                     className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                     onClick={() => handleSort('rol')}
                   >
                     <div className="flex items-center space-x-1">
                       <span>Rol</span>
                       {getSortIcon('rol')}
                     </div>
                   </th>
                  {currentUser?.rol === 'superAdmin' && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Equipo
                    </th>
                  )}
                                     <th 
                     className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                     onClick={() => handleSort('participacionMensual')}
                   >
                     <div className="flex items-center space-x-1">
                       <span>Participación</span>
                       {getSortIcon('participacionMensual')}
                     </div>
                   </th>
                                     <th 
                     className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                     onClick={() => handleSort('tieneCoche')}
                   >
                     <div className="flex items-center space-x-1">
                       <span>Coche</span>
                       {getSortIcon('tieneCoche')}
                     </div>
                   </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Siempre Con
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Nunca Con
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {usuarios?.data && usuarios.data.length > 0 ? (
                  usuarios.data.map((user: Usuario) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2.5 h-2.5 rounded-full ${
                            user.rol === 'admin' || user.rol === 'superAdmin' ? 'bg-green-500' : 'bg-blue-500'
                          }`}></div>
                          
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 dark:text-white truncate text-sm">
                              {user.nombre}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-300 truncate">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                        {user.cargo || '-'}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.rol === 'superAdmin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                          user.rol === 'admin' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {user.rol}
                        </span>
                      </td>
                      {currentUser?.rol === 'superAdmin' && (
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                          {user.equipo?.nombre || 'Sin equipo'}
                        </td>
                      )}
                                             <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                         <ParticipacionMensualDisplay
                           userId={user.id}
                           participacionMensual={user.participacionMensual}
                         />
                       </td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                        {user.tieneCoche ? 'Sí' : 'No'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                        {user.siempreConUsuario ? user.siempreConUsuario.nombre : '-'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                        {user.nuncaConUsuario ? user.nuncaConUsuario.nombre : '-'}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleEdit(user)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                            title="Editar usuario"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDisponibilidad(user)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            title="Gestionar disponibilidad"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </button>
                                                     {!(currentUser?.rol === 'admin' && user.rol === 'superAdmin') && (
                             <button
                               onClick={() => handleDelete(user.id)}
                               className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                               title="Eliminar usuario"
                             >
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                               </svg>
                             </button>
                           )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={currentUser?.rol === 'superAdmin' ? 9 : 8} className="px-4 py-6 text-center text-gray-500 dark:text-gray-300">
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
            <div key={user.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              {/* Header de la tarjeta */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    user.rol === 'admin' || user.rol === 'superAdmin' ? 'bg-green-500' : 'bg-blue-500'
                  }`}></div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {user.nombre}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-300">
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
                  <span className="text-gray-400 dark:text-gray-400">Cargo:</span>
                  <p className="text-gray-900 dark:text-white font-medium">{user.cargo || '-'}</p>
                </div>
                {currentUser?.rol === 'superAdmin' && (
                  <div>
                    <span className="text-gray-400 dark:text-gray-400">Equipo:</span>
                    <p className="text-gray-900 dark:text-white font-medium">{user.equipo?.nombre || 'Sin equipo'}</p>
                  </div>
                )}
                <div>
                                     <span className="text-gray-400 dark:text-gray-400">Participación:</span>
                   <div className="text-gray-900 dark:text-white font-medium">
                     <ParticipacionMensualDisplay
                       userId={user.id}
                       participacionMensual={user.participacionMensual}
                     />
                   </div>
                </div>
                <div>
                  <span className="text-gray-400 dark:text-gray-400">Tiene Coche:</span>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {user.tieneCoche ? 'Sí' : 'No'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400 dark:text-gray-400">Siempre Con:</span>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {user.siempreConUsuario ? user.siempreConUsuario.nombre : '-'}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400 dark:text-gray-400">Nunca Con:</span>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {user.nuncaConUsuario ? user.nuncaConUsuario.nombre : '-'}
                  </p>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex space-x-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleEdit(user)}
                  className="flex-1 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium text-sm py-2 px-3 rounded-lg border border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDisponibilidad(user)}
                  className="flex-1 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm py-2 px-3 rounded-lg border border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  Disponibilidad
                </button>
                                 {!(currentUser?.rol === 'admin' && user.rol === 'superAdmin') && (
                   <button
                     onClick={() => handleDelete(user.id)}
                     className="flex-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm py-2 px-3 rounded-lg border border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                   >
                     Eliminar
                   </button>
                 )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 dark:text-gray-300">
              No hay usuarios registrados.
            </p>
          </div>
        )}
      </div>

      {/* Modal para crear/editar usuario */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleCloseModal}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón X para cerrar */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Cerrar modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 pr-8">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre <span className="text-red-500">*</span>
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

              {/* Campo Rol - Siempre visible */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rol <span className="text-red-500">*</span>
                </label>
                <select
                  name="rol"
                  value={formData.rol}
                  onChange={(e) => setFormData({...formData, rol: e.target.value as 'voluntario' | 'admin' | 'superAdmin' | 'grupo'})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                  disabled={editingUser?.rol === 'superAdmin' && currentUser?.rol !== 'superAdmin'}
                >
                  <option value="voluntario">Voluntario</option>
                  <option value="grupo">Grupo</option>
                  <option value="admin">Administrador</option>
                  {currentUser?.rol === 'superAdmin' ? (
                    <option value="superAdmin">Super Administrador</option>
                  ) : null}
                </select>
                {editingUser?.rol === 'superAdmin' && currentUser?.rol !== 'superAdmin' && (
                  <p className="text-xs text-gray-500 mt-1">
                    No puedes cambiar el rol de un Super Administrador
                  </p>
                )}
              </div>

              {/* Campo Equipo - Solo visible para superAdmin */}
              {currentUser?.rol === 'superAdmin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Equipo <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="equipoId"
                    value={formData.equipoId}
                    onChange={(e) => setFormData({...formData, equipoId: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    {equipos?.map((equipo) => (
                      <option key={equipo.id} value={equipo.id}>
                        {equipo.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Resto de campos - Solo visibles si NO es rol grupo */}
              {formData.rol !== 'grupo' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Columna Izquierda */}
                  <div className="space-y-4">
                                         <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                         Email <span className="text-xs text-gray-500">(opcional)</span>
                       </label>
                       <input
                         type="email"
                         name="email"
                         value={formData.email}
                         onChange={(e) => setFormData({...formData, email: e.target.value})}
                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                         placeholder="Dejar vacío si no tendrá acceso a la app"
                         disabled={editingUser?.rol === 'superAdmin' && currentUser?.rol !== 'superAdmin'}
                         autoComplete="off"
                       />
                       <p className="text-xs text-gray-500 mt-1">
                         Sin email = sin acceso a la aplicación
                       </p>
                       {editingUser?.rol === 'superAdmin' && currentUser?.rol !== 'superAdmin' && (
                         <p className="text-xs text-red-500 mt-1">
                           No puedes modificar el email de un Super Administrador
                         </p>
                       )}
                     </div>

                     <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                         Contraseña <span className="text-xs text-gray-500">(opcional)</span>
                       </label>
                       <input
                         type="password"
                         name="contraseña"
                         value={formData.contraseña}
                         onChange={(e) => setFormData({...formData, contraseña: e.target.value})}
                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                         placeholder={editingUser ? "Dejar vacía para mantener la contraseña actual" : "Dejar vacía si no tendrá acceso a la app"}
                         disabled={editingUser?.rol === 'superAdmin' && currentUser?.rol !== 'superAdmin'}
                         autoComplete="new-password"
                       />
                       <p className="text-xs text-gray-500 mt-1">
                         {editingUser 
                           ? "Dejar vacía para mantener la contraseña actual"
                           : "Sin contraseña = sin acceso a la aplicación"
                         }
                       </p>
                       {editingUser?.rol === 'superAdmin' && currentUser?.rol !== 'superAdmin' && (
                         <p className="text-xs text-red-500 mt-1">
                           No puedes modificar la contraseña de un Super Administrador
                         </p>
                       )}
                     </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Sexo <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="sexo"
                        value={formData.sexo}
                        onChange={(e) => setFormData({...formData, sexo: e.target.value as 'M' | 'F' | 'O'})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      >
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
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
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Participación Mensual (opcional)
                      </label>
                      <input
                        type="number"
                        name="participacionMensual"
                        value={formData.participacionMensual || ''}
                        onChange={(e) => setFormData({...formData, participacionMensual: e.target.value ? parseInt(e.target.value) : undefined})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        min="0"
                        placeholder="Número de veces al mes"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tiene Coche
                      </label>
                      <select
                        name="tieneCoche"
                        value={formData.tieneCoche ? 'true' : 'false'}
                        onChange={(e) => setFormData({...formData, tieneCoche: e.target.value === 'true'})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="false">No</option>
                        <option value="true">Sí</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Siempre Con (opcional)
                      </label>
                      <select
                        name="siempreCon"
                        value={formData.siempreCon || ''}
                        onChange={(e) => setFormData({...formData, siempreCon: e.target.value ? parseInt(e.target.value) : undefined})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
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
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nunca Con (opcional)
                      </label>
                      <select
                        name="nuncaCon"
                        value={formData.nuncaCon || ''}
                        onChange={(e) => setFormData({...formData, nuncaCon: e.target.value ? parseInt(e.target.value) : undefined})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
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

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createUserMutation.isPending || updateUserMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {createUserMutation.isPending || updateUserMutation.isPending ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Controles de Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            {/* Información de paginación */}
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Mostrando {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} a {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} de {pagination.totalItems} usuarios
            </div>

            {/* Selector de elementos por página */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Mostrar:
              </label>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-700 dark:text-gray-300">por página</span>
            </div>

            {/* Navegación de páginas */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(1)}
                disabled={!pagination.hasPrevPage}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white"
              >
                Primera
              </button>
              
              <button
                onClick={() => handlePageChange(pagination.prevPage || 1)}
                disabled={!pagination.hasPrevPage}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white"
              >
                Anterior
              </button>

              {/* Números de página */}
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 text-sm border rounded-md ${
                        pageNum === pagination.currentPage
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-700 dark:text-white'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(pagination.nextPage || pagination.totalPages)}
                disabled={!pagination.hasNextPage}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white"
              >
                Siguiente
              </button>
              
              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={!pagination.hasNextPage}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white"
              >
                Última
              </button>
            </div>
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
