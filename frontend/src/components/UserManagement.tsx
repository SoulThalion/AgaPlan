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
    participacionMensual: undefined as number | undefined,
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
      rol: 'voluntario',
      participacionMensual: undefined,
      tieneCoche: false,
      siempreCon: undefined,
      nuncaCon: undefined
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
      participacionMensual: user.participacionMensual,
      tieneCoche: user.tieneCoche || false,
      siempreCon: user.siempreCon,
      nuncaCon: user.nuncaCon
    });
    setIsModalOpen(true);
  };

  const handleDisponibilidad = async (user: Usuario) => {
    try {
      Swal.fire({
        title: '',
        html: `
          <div class="text-left w-full max-w-4xl">
            <!-- Header del modal -->
            <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${user.nombre}</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">${user.email}</p>
                </div>
              </div>
              <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                user.rol === 'superAdmin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                user.rol === 'admin' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                'bg-green-100 text-green-800 dark:text-green-900 dark:text-green-200'
              }">${user.rol}</span>
            </div>

            <!-- Sección de disponibilidad -->
            <div class="mb-6">
              <h4 class="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Gestión de Disponibilidad
              </h4>
              
              <!-- Selector de mes -->
              <div class="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="text-sm font-medium text-blue-900 dark:text-blue-200">Mes de disponibilidad:</span>
                  </div>
                  <select id="mesDisponibilidad" class="px-3 py-1.5 text-sm border border-blue-300 dark:border-blue-600 rounded-md bg-white dark:bg-gray-700 text-blue-900 dark:text-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="2024-01">Enero 2024</option>
                    <option value="2024-02">Febrero 2024</option>
                    <option value="2024-03">Marzo 2024</option>
                    <option value="2024-04">Abril 2024</option>
                    <option value="2024-05">Mayo 2024</option>
                    <option value="2024-06">Junio 2024</option>
                    <option value="2024-07">Julio 2024</option>
                    <option value="2024-08">Agosto 2024</option>
                    <option value="2024-09">Septiembre 2024</option>
                    <option value="2024-10">Octubre 2024</option>
                    <option value="2024-11">Noviembre 2024</option>
                    <option value="2024-12">Diciembre 2024</option>
                    <option value="2025-01">Enero 2025</option>
                    <option value="2025-02">Febrero 2025</option>
                    <option value="2025-03">Marzo 2025</option>
                    <option value="2025-04">Abril 2025</option>
                    <option value="2025-05">Mayo 2025</option>
                    <option value="2025-06">Junio 2025</option>
                    <option value="2025-07">Julio 2025</option>
                    <option value="2025-08">Agosto 2025</option>
                    <option value="2025-09">Septiembre 2025</option>
                    <option value="2025-10">Octubre 2025</option>
                    <option value="2025-11">Noviembre 2025</option>
                    <option value="2025-12">Diciembre 2025</option>
                  </select>
                </div>
                <p class="text-xs text-blue-600 dark:text-blue-400 mt-2">Selecciona el mes para el que quieres configurar la disponibilidad</p>
              </div>
              
              <!-- Opciones de disponibilidad -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <!-- Columna Izquierda -->
                <div class="space-y-4">
                  <!-- Opción 1: Todas las tardes -->
                  <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div class="flex items-center justify-between">
                      <label class="flex items-center space-x-3 cursor-pointer">
                        <input type="checkbox" name="tipoDisponibilidad" value="todasTardes" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                        <span class="text-sm font-medium text-gray-900 dark:text-white">Todas las tardes</span>
                      </label>
                      <span class="text-xs text-gray-500 dark:text-gray-400">Opcional: especificar franja horaria</span>
                    </div>
                    <div class="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600 hidden" id="opcionesTodasTardes">
                      <div class="grid grid-cols-2 gap-3">
                        <div>
                          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Hora inicio tarde</label>
                          <input type="time" id="horaInicioTardes" value="15:00" class="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        </div>
                        <div>
                          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Hora fin tarde</label>
                          <input type="time" id="horaFinTardes" value="20:00" class="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Opción 2: Todas las mañanas -->
                  <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div class="flex items-center justify-between">
                      <label class="flex items-center space-x-3 cursor-pointer">
                        <input type="checkbox" name="tipoDisponibilidad" value="todasMananas" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                        <span class="text-sm font-medium text-gray-900 dark:text-white">Todas las mañanas</span>
                      </label>
                      <span class="text-xs text-gray-500 dark:text-gray-400">Opcional: especificar franja horaria</span>
                    </div>
                    <div class="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600 hidden" id="opcionesTodasMananas">
                      <div class="grid grid-cols-2 gap-3">
                        <div>
                          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Hora inicio mañana</label>
                          <input type="time" id="horaInicioMananas" value="08:00" class="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        </div>
                        <div>
                          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Hora fin mañana</label>
                          <input type="time" id="horaFinMananas" value="13:00" class="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Opción 3: Días específicos de la semana -->
                  <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div class="flex items-center justify-between">
                      <label class="flex items-center space-x-3 cursor-pointer">
                        <input type="checkbox" name="tipoDisponibilidad" value="diasSemana" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                        <span class="text-sm font-medium text-gray-900 dark:text-white">Días específicos de la semana</span>
                      </label>
                      <span class="text-xs text-gray-500 dark:text-gray-400">Elegir mañana o tarde + franja horaria</span>
                    </div>
                    <div class="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600 hidden" id="opcionesDiasSemana">
                      <div class="space-y-3">
                        <div class="grid grid-cols-7 gap-2">
                          ${['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((dia, index) => `
                            <div class="text-center">
                              <label class="flex flex-col items-center space-y-1 cursor-pointer">
                                <input type="checkbox" name="diasSemana" value="${index}" class="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                                <span class="text-xs text-gray-700 dark:text-gray-300">${dia}</span>
                              </label>
                            </div>
                          `).join('')}
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                          <div>
                            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Período</label>
                            <select id="periodoDias" class="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                              <option value="manana">Mañana</option>
                              <option value="tarde">Tarde</option>
                              <option value="personalizado">Personalizado</option>
                            </select>
                          </div>
                          <div>
                            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Franja horaria</label>
                            <div class="grid grid-cols-2 gap-1">
                              <input type="time" id="horaInicioDias" placeholder="Inicio" class="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                              <input type="time" id="horaFinDias" placeholder="Fin" class="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Columna Derecha -->
                <div class="space-y-4">
                  <!-- Opción 4: Fecha concreta -->
                  <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div class="flex items-center justify-between">
                      <label class="flex items-center space-x-3 cursor-pointer">
                        <input type="checkbox" name="tipoDisponibilidad" value="fechaConcreta" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                        <span class="text-sm font-medium text-gray-900 dark:text-white">Fecha concreta</span>
                      </label>
                      <span class="text-xs text-gray-500 dark:text-gray-400">Elegir mañana o tarde + franja horaria</span>
                    </div>
                    <div class="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600 hidden" id="opcionesFechaConcreta">
                      <div class="space-y-3">
                        <div class="grid grid-cols-2 gap-3">
                          <div>
                            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha</label>
                            <input type="date" id="fechaConcreta" class="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                          </div>
                          <div>
                            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Período</label>
                            <select id="periodoFecha" class="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                              <option value="manana">Mañana</option>
                              <option value="tarde">Tarde</option>
                              <option value="personalizado">Personalizado</option>
                            </select>
                          </div>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                          <div>
                            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Hora inicio</label>
                            <input type="time" id="horaInicioFecha" class="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                          </div>
                          <div>
                            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Hora fin</label>
                            <input type="time" id="horaFinFecha" class="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Opción 5: NO disponible - Fecha concreta -->
                  <div class="border border-red-200 dark:border-red-700 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
                    <div class="flex items-center justify-between">
                      <label class="flex items-center space-x-3 cursor-pointer">
                        <input type="checkbox" name="tipoDisponibilidad" value="noDisponibleFecha" class="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
                        <span class="text-sm font-medium text-red-900 dark:text-red-200">NO disponible - Fecha concreta</span>
                      </label>
                      <span class="text-xs text-red-500 dark:text-red-400">Especificar fecha y horario NO disponible</span>
                    </div>
                    <div class="mt-3 pt-3 border-t border-red-100 dark:border-red-600 hidden" id="opcionesNoDisponibleFecha">
                      <div class="space-y-3">
                        <div class="grid grid-cols-2 gap-3">
                          <div>
                            <label class="block text-xs font-medium text-red-700 dark:text-red-300 mb-1">Fecha</label>
                            <input type="date" id="fechaNoDisponible" class="w-full px-2 py-1 border border-red-300 dark:border-red-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                          </div>
                          <div>
                            <label class="block text-xs font-medium text-red-700 dark:text-red-300 mb-1">Período</label>
                            <select id="periodoNoDisponible" class="w-full px-2 py-1 border border-red-300 dark:border-red-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                              <option value="manana">Mañana</option>
                              <option value="tarde">Tarde</option>
                              <option value="personalizado">Personalizado</option>
                            </select>
                          </div>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                          <div>
                            <label class="block text-xs font-medium text-red-700 dark:text-red-300 mb-1">Hora inicio</label>
                            <input type="time" id="horaInicioNoDisponible" class="w-full px-2 py-1 border border-red-300 dark:border-red-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                          </div>
                          <div>
                            <label class="block text-xs font-medium text-red-700 dark:text-red-300 mb-1">Hora fin</label>
                            <input type="time" id="horaFinNoDisponible" class="w-full px-2 py-1 border border-red-300 dark:border-red-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Vista previa de disponibilidades actuales -->
              <div class="mt-4 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h5 class="text-sm font-medium text-gray-900 dark:text-white mb-2">Disponibilidades Actuales</h5>
                <div id="disponibilidadesActuales">
                  <p class="text-sm text-gray-600 dark:text-gray-400">No hay disponibilidades configuradas para este mes.</p>
                </div>
              </div>
            </div>

            <!-- Acciones -->
            <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                Cancelar
              </button>
              <button id="btnGuardarDisponibilidades" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
                Guardar Disponibilidades
              </button>
            </div>
          </div>
        `,
        showConfirmButton: false,
        showCloseButton: true,
        width: 'auto',
        customClass: {
          popup: 'swal2-custom-popup',
          closeButton: 'swal2-custom-close-button'
        },
        didOpen: () => {
          // Agregar estilos personalizados
          const style = document.createElement('style');
          style.textContent = `
            .swal2-custom-popup {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            }
            .swal2-custom-close-button {
              color: #6b7280;
              font-size: 1.5rem;
              top: 1rem;
              right: 1rem;
            }
            .swal2-custom-close-button:hover {
              color: #374151;
            }
          `;
          document.head.appendChild(style);

          // Funcionalidad para mostrar/ocultar opciones
          const checkboxes = document.querySelectorAll('input[name="tipoDisponibilidad"]');
          const opcionesTodasTardes = document.getElementById('opcionesTodasTardes');
          const opcionesTodasMananas = document.getElementById('opcionesTodasMananas');
          const opcionesDiasSemana = document.getElementById('opcionesDiasSemana');
          const opcionesFechaConcreta = document.getElementById('opcionesFechaConcreta');
          const opcionesNoDisponibleFecha = document.getElementById('opcionesNoDisponibleFecha');

          // Función para mostrar/ocultar opciones según checkbox
          const toggleOpciones = () => {
            // Obtener estado de cada checkbox
            const todasTardesElement = document.querySelector('input[value="todasTardes"]') as HTMLInputElement;
            const todasMananasElement = document.querySelector('input[value="todasMananas"]') as HTMLInputElement;
            const diasSemanaElement = document.querySelector('input[value="diasSemana"]') as HTMLInputElement;
            const fechaConcretaElement = document.querySelector('input[value="fechaConcreta"]') as HTMLInputElement;
            const noDisponibleFechaElement = document.querySelector('input[value="noDisponibleFecha"]') as HTMLInputElement;

            const todasTardesChecked = todasTardesElement?.checked || false;
            const todasMananasChecked = todasMananasElement?.checked || false;
            const diasSemanaChecked = diasSemanaElement?.checked || false;
            const fechaConcretaChecked = fechaConcretaElement?.checked || false;
            const noDisponibleFechaChecked = noDisponibleFechaElement?.checked || false;

            // Mostrar/ocultar opciones según estado
            if (opcionesTodasTardes) {
              if (todasTardesChecked) {
                opcionesTodasTardes.classList.remove('hidden');
              } else {
                opcionesTodasTardes.classList.add('hidden');
              }
            }

            if (opcionesTodasMananas) {
              if (todasMananasChecked) {
                opcionesTodasMananas.classList.remove('hidden');
              } else {
                opcionesTodasMananas.classList.add('hidden');
              }
            }

            if (opcionesDiasSemana) {
              if (diasSemanaChecked) {
                opcionesDiasSemana.classList.remove('hidden');
              } else {
                opcionesDiasSemana.classList.add('hidden');
              }
            }

            if (opcionesFechaConcreta) {
              if (fechaConcretaChecked) {
                opcionesFechaConcreta.classList.remove('hidden');
              } else {
                opcionesFechaConcreta.classList.add('hidden');
              }
            }

            if (opcionesNoDisponibleFecha) {
              if (noDisponibleFechaChecked) {
                opcionesNoDisponibleFecha.classList.remove('hidden');
              } else {
                opcionesNoDisponibleFecha.classList.add('hidden');
              }
            }
          };

          // Event listeners para los checkbox
          checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', toggleOpciones);
          });

          // Event listener para el botón de guardar disponibilidades
          const btnGuardar = document.getElementById('btnGuardarDisponibilidades');
          if (btnGuardar) {
            btnGuardar.addEventListener('click', () => {
              // Usar el usuario que se pasó al modal, no editingUser
              handleGuardarDisponibilidades(user);
            });
          }

          // Detectar y seleccionar el mes actual por defecto
          const mesDisponibilidadSelect = document.getElementById('mesDisponibilidad') as HTMLSelectElement;
          if (mesDisponibilidadSelect) {
            const fechaActual = new Date();
            const año = fechaActual.getFullYear();
            const mes = fechaActual.getMonth() + 1; // getMonth() devuelve 0-11
            const mesActual = `${año}-${mes.toString().padStart(2, '0')}`;
            
            // Buscar y seleccionar la opción del mes actual
            for (let i = 0; i < mesDisponibilidadSelect.options.length; i++) {
              if (mesDisponibilidadSelect.options[i].value === mesActual) {
                mesDisponibilidadSelect.options[i].selected = true;
                break;
              }
            }
          }

          // Cargar disponibilidades existentes para el mes seleccionado
          const cargarDisponibilidadesMes = async () => {
            const mesSeleccionado = (document.getElementById('mesDisponibilidad') as HTMLSelectElement)?.value;
            if (mesSeleccionado) {
              try {
                const response = await apiService.getUserDisponibilidadConfigByMes(mesSeleccionado);
                // Asegurarse de que disponibilidades sea siempre un array
                const disponibilidades = response?.data || [];
                cargarDisponibilidadesEnFormulario(disponibilidades);
                actualizarVistaPrevia(disponibilidades);
              } catch (error) {
                console.error('Error al cargar disponibilidades:', error);
                // En caso de error, usar array vacío
                cargarDisponibilidadesEnFormulario([]);
                actualizarVistaPrevia([]);
              }
            }
          };

          // Event listener para cambio de mes
          if (mesDisponibilidadSelect) {
            mesDisponibilidadSelect.addEventListener('change', cargarDisponibilidadesMes);
          }

          // Cargar disponibilidades iniciales
          cargarDisponibilidadesMes();
        }
      });
    } catch (error) {
      console.error('Error al cargar disponibilidades:', error);
      Swal.fire('Error', 'No se pudieron cargar las disponibilidades existentes', 'error');
    }
  };

  // Función para cargar disponibilidades en el formulario
  const cargarDisponibilidadesEnFormulario = (disponibilidades: any[]) => {
    // Asegurarse de que disponibilidades sea un array
    if (!Array.isArray(disponibilidades)) {
      console.warn('disponibilidades no es un array:', disponibilidades);
      disponibilidades = [];
    }

    // Limpiar formulario - NO marcar checkboxes, solo limpiar campos
    const checkboxes = document.querySelectorAll('input[name="tipoDisponibilidad"]') as NodeListOf<HTMLInputElement>;
    checkboxes.forEach(cb => cb.checked = false);

    // Ocultar todas las opciones
    const opciones = ['opcionesTodasTardes', 'opcionesTodasMananas', 'opcionesDiasSemana', 'opcionesFechaConcreta', 'opcionesNoDisponibleFecha'];
    opciones.forEach(id => {
      const elemento = document.getElementById(id);
      if (elemento) elemento.classList.add('hidden');
    });

    // Limpiar todos los campos de entrada
    const campos = [
      'horaInicioTardes', 'horaFinTardes',
      'horaInicioMananas', 'horaFinMananas',
      'horaInicioDias', 'horaFinDias',
      'fechaConcreta', 'horaInicioFecha', 'horaFinFecha',
      'fechaNoDisponible', 'horaInicioNoDisponible', 'horaFinNoDisponible'
    ];
    
    campos.forEach(campoId => {
      const campo = document.getElementById(campoId) as HTMLInputElement;
      if (campo) {
        if (campo.type === 'time') {
          campo.value = '';
        } else if (campo.type === 'date') {
          campo.value = '';
        }
      }
    });

    // Limpiar selects
    const selects = ['periodoDias', 'periodoFecha', 'periodoNoDisponible'];
    selects.forEach(selectId => {
      const select = document.getElementById(selectId) as HTMLSelectElement;
      if (select) {
        select.selectedIndex = 0;
      }
    });

    // Limpiar checkboxes de días de la semana
    const checkboxesDias = document.querySelectorAll('input[name="diasSemana"]') as NodeListOf<HTMLInputElement>;
    checkboxesDias.forEach(cb => cb.checked = false);

    // NOTA: Los checkboxes principales NO se marcan automáticamente
    // ya que son solo para seleccionar qué tipo de disponibilidad agregar
  };

  // Función para eliminar una disponibilidad
  const eliminarDisponibilidad = async (id: number) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta disponibilidad se eliminará permanentemente',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        await apiService.deleteUserDisponibilidadConfig(id);
        
        Swal.fire('¡Eliminado!', 'La disponibilidad se ha eliminado correctamente', 'success');
        
        // Recargar disponibilidades para el mes actual
        const mesActual = (document.getElementById('mesDisponibilidad') as HTMLSelectElement)?.value;
        if (mesActual) {
          try {
            const response = await apiService.getUserDisponibilidadConfigByMes(mesActual);
            const disponibilidadesActualizadas = response?.data || [];
            actualizarVistaPrevia(disponibilidadesActualizadas);
            cargarDisponibilidadesEnFormulario(disponibilidadesActualizadas);
          } catch (error) {
            console.error('Error al recargar disponibilidades:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error al eliminar disponibilidad:', error);
      Swal.fire('Error', 'No se pudo eliminar la disponibilidad', 'error');
    }
  };

  // Función para actualizar la vista previa
  const actualizarVistaPrevia = (disponibilidades: any[]) => {
    const vistaPrevia = document.getElementById('disponibilidadesActuales');
    if (!vistaPrevia) return;

    // Asegurarse de que disponibilidades sea un array
    if (!Array.isArray(disponibilidades)) {
      console.warn('disponibilidades no es un array en actualizarVistaPrevia:', disponibilidades);
      disponibilidades = [];
    }

    if (disponibilidades.length === 0) {
      vistaPrevia.innerHTML = '<p class="text-sm text-gray-600 dark:text-gray-400">No hay disponibilidades configuradas para este mes.</p>';
      return;
    }

    let html = '<div class="space-y-2">';
    disponibilidades.forEach(disp => {
      const config = disp.configuracion;
      let descripcion = '';
      
      switch (disp.tipo_disponibilidad) {
        case 'todasTardes':
          descripcion = `Todas las tardes ${config.hora_inicio ? `(${config.hora_inicio} - ${config.hora_fin || '20:00'})` : ''}`;
          break;
        case 'todasMananas':
          descripcion = `Todas las mañanas ${config.hora_inicio ? `(${config.hora_inicio} - ${config.hora_fin || '14:00'})` : ''}`;
          break;
        case 'diasSemana':
          const diasNombres = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
          const diasSeleccionados = config.dias ? config.dias.map((d: number) => diasNombres[d]).join(', ') : '';
          descripcion = `Días: ${diasSeleccionados} - ${config.periodo || 'mañana'}`;
          break;
        case 'fechaConcreta':
          descripcion = `Fecha: ${config.fecha} - ${config.periodo_fecha || 'mañana'}`;
          break;
        case 'noDisponibleFecha':
          descripcion = `NO disponible: ${config.fecha} - ${config.periodo_fecha || 'mañana'}`;
          break;
      }
      
      html += `
        <div class="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded border">
          <span class="text-sm text-gray-900 dark:text-white">${descripcion}</span>
          <button class="text-red-600 hover:text-red-800 text-xs eliminar-disponibilidad-btn" data-id="${disp.id}">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      `;
    });
    html += '</div>';
    
    vistaPrevia.innerHTML = html;

    // Agregar event listeners a los botones de eliminar
    const botonesEliminar = vistaPrevia.querySelectorAll('.eliminar-disponibilidad-btn');
    botonesEliminar.forEach(boton => {
      boton.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
        if (id) {
          eliminarDisponibilidad(parseInt(id));
        }
      });
    });
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

  // Función para guardar las disponibilidades configuradas
  const handleGuardarDisponibilidades = async (user: Usuario) => {
    try {
      const mesSeleccionado = (document.getElementById('mesDisponibilidad') as HTMLSelectElement)?.value;
      if (!mesSeleccionado) {
        Swal.fire('Error', 'Debe seleccionar un mes', 'error');
        return;
      }

      // Obtener todas las opciones seleccionadas
      const checkboxes = document.querySelectorAll('input[name="tipoDisponibilidad"]:checked') as NodeListOf<HTMLInputElement>;
      
      if (checkboxes.length === 0) {
        Swal.fire('Error', 'Debe seleccionar al menos una opción de disponibilidad', 'error');
        return;
      }

      // Procesar cada opción seleccionada
      const configuraciones = [];
      
      for (const checkbox of checkboxes) {
        const tipo = checkbox.value;
        let configuracion: any = {};

        switch (tipo) {
          case 'todasTardes':
            const horaInicioTardes = (document.getElementById('horaInicioTardes') as HTMLInputElement)?.value;
            const horaFinTardes = (document.getElementById('horaFinTardes') as HTMLInputElement)?.value;
            configuracion = {
              hora_inicio: horaInicioTardes || '14:00',
              hora_fin: horaFinTardes || '20:00'
            };
            break;

          case 'todasMananas':
            const horaInicioMananas = (document.getElementById('horaInicioMananas') as HTMLInputElement)?.value;
            const horaFinMananas = (document.getElementById('horaFinMananas') as HTMLInputElement)?.value;
            configuracion = {
              hora_inicio: horaInicioMananas || '08:00',
              hora_fin: horaFinMananas || '14:00'
            };
            break;

          case 'diasSemana':
            const diasSeleccionados = Array.from(document.querySelectorAll('input[name="diasSemana"]:checked') as NodeListOf<HTMLInputElement>)
              .map(cb => parseInt(cb.value));
            const periodoDias = (document.querySelector('input[name="periodoDias"]:checked') as HTMLInputElement)?.value || 'manana';
            const horaInicioDias = (document.getElementById('horaInicioDias') as HTMLInputElement)?.value;
            const horaFinDias = (document.getElementById('horaFinDias') as HTMLInputElement)?.value;
            
            configuracion = {
              dias: diasSeleccionados,
              periodo: periodoDias,
              hora_inicio_personalizado: horaInicioDias,
              hora_fin_personalizado: horaFinDias
            };
            break;

          case 'fechaConcreta':
            const fecha = (document.getElementById('fechaConcreta') as HTMLInputElement)?.value;
            const periodoFecha = (document.querySelector('input[name="periodoFecha"]:checked') as HTMLInputElement)?.value || 'manana';
            const horaInicioFecha = (document.getElementById('horaInicioFecha') as HTMLInputElement)?.value;
            const horaFinFecha = (document.getElementById('horaFinFecha') as HTMLInputElement)?.value;
            
            configuracion = {
              fecha: fecha,
              periodo_fecha: periodoFecha,
              hora_inicio_fecha: horaInicioFecha,
              hora_fin_fecha: horaFinFecha
            };
            break;

          case 'noDisponibleFecha':
            const fechaNoDisponible = (document.getElementById('fechaNoDisponible') as HTMLInputElement)?.value;
            const periodoNoDisponible = (document.querySelector('input[name="periodoNoDisponible"]:checked') as HTMLInputElement)?.value || 'manana';
            const horaInicioNoDisponible = (document.getElementById('horaInicioNoDisponible') as HTMLInputElement)?.value;
            const horaFinNoDisponible = (document.getElementById('horaFinNoDisponible') as HTMLInputElement)?.value;
            
            configuracion = {
              fecha: fechaNoDisponible,
              periodo_fecha: periodoNoDisponible,
              hora_inicio_fecha: horaInicioNoDisponible,
              hora_fin_fecha: horaFinNoDisponible
            };
            break;
        }

        configuraciones.push({
          tipo_disponibilidad: tipo,
          configuracion: configuracion
        });
      }

      // Mostrar confirmación
      const result = await Swal.fire({
        title: 'Confirmar Disponibilidades',
        html: `
          <div class="text-left">
            <p class="mb-2"><strong>Mes:</strong> ${mesSeleccionado}</p>
            <p class="mb-2"><strong>Opciones seleccionadas:</strong></p>
            <ul class="list-disc list-inside">
              ${configuraciones.map(c => `<li>${c.tipo_disponibilidad}</li>`).join('')}
            </ul>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33'
      });

      if (result.isConfirmed) {
        // Guardar cada configuración
        for (const config of configuraciones) {
          await apiService.createUserDisponibilidadConfig({
            usuarioId: user.id,
            mes: mesSeleccionado,
            tipo_disponibilidad: config.tipo_disponibilidad,
            configuracion: config.configuracion
          });
        }

        Swal.fire('¡Éxito!', 'Disponibilidades guardadas correctamente', 'success');
        
        // Cerrar el modal
        Swal.close();

        // Recargar disponibilidades para el mes actual
        const mesActual = new Date().toISOString().slice(0, 7); // Formato YYYY-MM
        try {
          const response = await apiService.getUserDisponibilidadConfigByMes(mesActual);
          const disponibilidadesActualizadas = response?.data || [];
          // Si el modal sigue abierto, actualizar la vista previa
          const vistaPrevia = document.getElementById('disponibilidadesActuales');
          if (vistaPrevia) {
            actualizarVistaPrevia(disponibilidadesActualizadas);
          }
        } catch (error) {
          console.error('Error al recargar disponibilidades:', error);
        }
      }

    } catch (error: any) {
      console.error('Error al guardar disponibilidades:', error);
      
      let mensajeError = 'No se pudieron guardar las disponibilidades';
      
      if (error.response?.status === 409) {
        mensajeError = error.response.data?.message || 'Ya existe una configuración similar para este mes';
      } else if (error.response?.status === 400) {
        mensajeError = error.response.data?.message || 'Datos de configuración inválidos';
      } else if (error.response?.status === 404) {
        mensajeError = 'Usuario no encontrado';
      } else if (error.response?.status >= 500) {
        mensajeError = 'Error del servidor. Inténtalo de nuevo más tarde';
      }
      
      Swal.fire('Error', mensajeError, 'error');
    }
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
                        {user.participacionMensual ? `${user.participacionMensual}%` : '-'}
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
                  <p className="text-neutral-text dark:text-white font-medium">
                    {user.participacionMensual ? `${user.participacionMensual}%` : '-'}
                  </p>
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
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Columna Izquierda */}
                <div className="space-y-4">
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
                </div>

                {/* Columna Derecha */}
                <div className="space-y-4">
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
    </div>
  );
};

export default UserManagement;
