import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { apiService } from '../services/api';
import type { Usuario } from '../types';

interface DisponibilidadModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Usuario | null;
}

interface DisponibilidadConfig {
  tipo_disponibilidad: string;
  configuracion: any;
}

const DisponibilidadModal: React.FC<DisponibilidadModalProps> = ({ isOpen, onClose, user }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [disponibilidades, setDisponibilidades] = useState<any[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    todasTardes: { horaInicio: '15:00', horaFin: '20:00' },
    todasMananas: { horaInicio: '08:00', horaFin: '13:00' },
    diasSemana: { dias: [] as number[], periodo: 'manana', horaInicio: '', horaFin: '' },
    fechaConcreta: { fecha: '', periodo: 'manana', horaInicio: '', horaFin: '' },
    noDisponibleFecha: { fecha: '', periodo: 'manana', horaInicio: '', horaFin: '' }
  });

  useEffect(() => {
    if (isOpen && user) {
      const currentDate = new Date();
      const currentMonth = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
      setSelectedMonth(currentMonth);
      loadDisponibilidades(currentMonth);
    }
  }, [isOpen, user]);

  const loadDisponibilidades = async (mes: string) => {
    if (!user) return;
    
    try {
      const response = await apiService.getUserDisponibilidadConfig(user.id, mes);
      const data = response?.data || [];
      setDisponibilidades(data);
    } catch (error) {
      console.error('Error al cargar disponibilidades:', error);
      setDisponibilidades([]);
    }
  };

  const handleMonthChange = (mes: string) => {
    setSelectedMonth(mes);
    loadDisponibilidades(mes);
  };

  const handleOptionToggle = (option: string) => {
    setSelectedOptions(prev => 
      prev.includes(option) 
        ? prev.filter(o => o !== option)
        : [...prev, option]
    );
  };

  const handleSave = async () => {
    if (!user || !selectedMonth || selectedOptions.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Debe seleccionar un mes y al menos una opción de disponibilidad',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    try {
      const configuraciones: DisponibilidadConfig[] = [];

      selectedOptions.forEach(option => {
        switch (option) {
          case 'todasTardes':
            configuraciones.push({
              tipo_disponibilidad: 'todasTardes',
              configuracion: {
                hora_inicio: formData.todasTardes.horaInicio,
                hora_fin: formData.todasTardes.horaFin
              }
            });
            break;
          case 'todasMananas':
            configuraciones.push({
              tipo_disponibilidad: 'todasMananas',
              configuracion: {
                hora_inicio: formData.todasMananas.horaInicio,
                hora_fin: formData.todasMananas.horaFin
              }
            });
            break;
          case 'diasSemana':
            if (formData.diasSemana.dias.length > 0) {
              configuraciones.push({
                tipo_disponibilidad: 'diasSemana',
                configuracion: {
                  dias: formData.diasSemana.dias,
                  periodo: formData.diasSemana.periodo,
                  hora_inicio_personalizado: formData.diasSemana.horaInicio,
                  hora_fin_personalizado: formData.diasSemana.horaFin
                }
              });
            }
            break;
          case 'fechaConcreta':
            if (formData.fechaConcreta.fecha) {
              configuraciones.push({
                tipo_disponibilidad: 'fechaConcreta',
                configuracion: {
                  fecha: formData.fechaConcreta.fecha,
                  periodo_fecha: formData.fechaConcreta.periodo,
                  hora_inicio_fecha: formData.fechaConcreta.horaInicio,
                  hora_fin_fecha: formData.fechaConcreta.horaFin
                }
              });
            }
            break;
          case 'noDisponibleFecha':
            if (formData.noDisponibleFecha.fecha) {
              configuraciones.push({
                tipo_disponibilidad: 'noDisponibleFecha',
                configuracion: {
                  fecha: formData.noDisponibleFecha.fecha,
                  periodo_fecha: formData.noDisponibleFecha.periodo,
                  hora_inicio_fecha: formData.noDisponibleFecha.horaInicio,
                  hora_fin_fecha: formData.noDisponibleFecha.horaFin
                }
              });
            }
            break;
        }
      });

      // Guardar cada configuración
      for (const config of configuraciones) {
        await apiService.createUserDisponibilidadConfig({
          usuarioId: user.id,
          mes: selectedMonth,
          tipo_disponibilidad: config.tipo_disponibilidad,
          configuracion: config.configuracion
        });
      }

      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Disponibilidades guardadas correctamente',
        confirmButtonText: 'Aceptar'
      });
      loadDisponibilidades(selectedMonth);
      setSelectedOptions([]);
    } catch (error: any) {
      console.error('Error al guardar disponibilidades:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Error al guardar disponibilidades',
        confirmButtonText: 'Aceptar'
      });
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: '¿Estás seguro?',
      text: '¿Estás seguro de que quieres eliminar esta disponibilidad?',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await apiService.deleteUserDisponibilidadConfig(id);
        Swal.fire({
          icon: 'success',
          title: '¡Eliminado!',
          text: 'La disponibilidad ha sido eliminada correctamente',
          confirmButtonText: 'Aceptar'
        });
        loadDisponibilidades(selectedMonth);
      } catch (error) {
        console.error('Error al eliminar disponibilidad:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al eliminar disponibilidad',
          confirmButtonText: 'Aceptar'
        });
      }
    }
  };

  const getDescripcionLegible = (disp: any) => {
    const config = disp.configuracion;
    switch (disp.tipo_disponibilidad) {
      case 'todasTardes':
        return `Todas las tardes ${config.hora_inicio ? `(${config.hora_inicio} - ${config.hora_fin || '20:00'})` : ''}`;
      case 'todasMananas':
        return `Todas las mañanas ${config.hora_inicio ? `(${config.hora_inicio} - ${config.hora_fin || '14:00'})` : ''}`;
      case 'diasSemana':
        const diasNombres = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const diasSeleccionados = config.dias ? config.dias.map((d: number) => diasNombres[d]).join(', ') : '';
        return `Días: ${diasSeleccionados} - ${config.periodo || 'mañana'}`;
      case 'fechaConcreta':
        return `Fecha: ${config.fecha} - ${config.periodo_fecha || 'mañana'}`;
      case 'noDisponibleFecha':
        return `NO disponible: ${config.fecha} - ${config.periodo_fecha || 'mañana'}`;
      default:
        return disp.tipo_disponibilidad;
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-dark rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header del modal */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{user.nombre}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            user.rol === 'superAdmin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
            user.rol === 'admin' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          }`}>
            {user.rol}
          </span>
        </div>

        {/* Selector de mes */}
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium text-blue-900 dark:text-blue-200">Mes de disponibilidad:</span>
            </div>
            <select 
              value={selectedMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="px-3 py-1.5 text-sm border border-blue-300 dark:border-blue-600 rounded-md bg-white dark:bg-gray-700 text-blue-900 dark:text-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
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
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">Selecciona el mes para el que quieres configurar la disponibilidad</p>
        </div>

        {/* Opciones de disponibilidad */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Columna Izquierda */}
          <div className="space-y-4">
            {/* Opción 1: Todas las tardes */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedOptions.includes('todasTardes')}
                    onChange={() => handleOptionToggle('todasTardes')}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Todas las tardes</span>
                </label>
                <span className="text-xs text-gray-500 dark:text-gray-400">Opcional: especificar franja horaria</span>
              </div>
              {selectedOptions.includes('todasTardes') && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Hora inicio tarde</label>
                      <input 
                        type="time" 
                        value={formData.todasTardes.horaInicio}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          todasTardes: { ...prev.todasTardes, horaInicio: e.target.value }
                        }))}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Hora fin tarde</label>
                      <input 
                        type="time" 
                        value={formData.todasTardes.horaFin}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          todasTardes: { ...prev.todasTardes, horaFin: e.target.value }
                        }))}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Opción 2: Todas las mañanas */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedOptions.includes('todasMananas')}
                    onChange={() => handleOptionToggle('todasMananas')}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Todas las mañanas</span>
                </label>
                <span className="text-xs text-gray-500 dark:text-gray-400">Opcional: especificar franja horaria</span>
              </div>
              {selectedOptions.includes('todasMananas') && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Hora inicio mañana</label>
                      <input 
                        type="time" 
                        value={formData.todasMananas.horaInicio}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          todasMananas: { ...prev.todasMananas, horaInicio: e.target.value }
                        }))}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Hora fin mañana</label>
                      <input 
                        type="time" 
                        value={formData.todasMananas.horaFin}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          todasMananas: { ...prev.todasMananas, horaFin: e.target.value }
                        }))}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Opción 3: Días específicos de la semana */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedOptions.includes('diasSemana')}
                    onChange={() => handleOptionToggle('diasSemana')}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Días específicos de la semana</span>
                </label>
                <span className="text-xs text-gray-500 dark:text-gray-400">Elegir mañana o tarde + franja horaria</span>
              </div>
              {selectedOptions.includes('diasSemana') && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
                  <div className="space-y-3">
                    <div className="grid grid-cols-7 gap-2">
                      {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((dia, index) => (
                        <div key={index} className="text-center">
                          <label className="flex flex-col items-center space-y-1 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={formData.diasSemana.dias.includes(index)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData(prev => ({
                                    ...prev,
                                    diasSemana: { ...prev.diasSemana, dias: [...prev.diasSemana.dias, index] }
                                  }));
                                } else {
                                  setFormData(prev => ({
                                    ...prev,
                                    diasSemana: { ...prev.diasSemana, dias: prev.diasSemana.dias.filter(d => d !== index) }
                                  }));
                                }
                              }}
                              className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <span className="text-xs text-gray-700 dark:text-gray-300">{dia}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Período</label>
                        <select 
                          value={formData.diasSemana.periodo}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            diasSemana: { ...prev.diasSemana, periodo: e.target.value }
                          }))}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="manana">Mañana</option>
                          <option value="tarde">Tarde</option>
                          <option value="personalizado">Personalizado</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Franja horaria</label>
                        <div className="grid grid-cols-2 gap-1">
                          <input 
                            type="time" 
                            placeholder="Inicio" 
                            value={formData.diasSemana.horaInicio}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              diasSemana: { ...prev.diasSemana, horaInicio: e.target.value }
                            }))}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                          <input 
                            type="time" 
                            placeholder="Fin" 
                            value={formData.diasSemana.horaFin}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              diasSemana: { ...prev.diasSemana, horaFin: e.target.value }
                            }))}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Columna Derecha */}
          <div className="space-y-4">
            {/* Opción 4: Fecha concreta */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedOptions.includes('fechaConcreta')}
                    onChange={() => handleOptionToggle('fechaConcreta')}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Fecha concreta</span>
                </label>
                <span className="text-xs text-gray-500 dark:text-gray-400">Elegir mañana o tarde + franja horaria</span>
              </div>
              {selectedOptions.includes('fechaConcreta') && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha</label>
                        <input 
                          type="date" 
                          value={formData.fechaConcreta.fecha}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            fechaConcreta: { ...prev.fechaConcreta, fecha: e.target.value }
                          }))}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Período</label>
                        <select 
                          value={formData.fechaConcreta.periodo}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            fechaConcreta: { ...prev.fechaConcreta, periodo: e.target.value }
                          }))}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="manana">Mañana</option>
                          <option value="tarde">Tarde</option>
                          <option value="personalizado">Personalizado</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Hora inicio</label>
                        <input 
                          type="time" 
                          value={formData.fechaConcreta.horaInicio}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            fechaConcreta: { ...prev.fechaConcreta, horaInicio: e.target.value }
                          }))}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Hora fin</label>
                        <input 
                          type="time" 
                          value={formData.fechaConcreta.horaFin}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            fechaConcreta: { ...prev.fechaConcreta, horaFin: e.target.value }
                          }))}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Opción 5: NO disponible - Fecha concreta */}
            <div className="border border-red-200 dark:border-red-700 rounded-lg p-4 bg-red-50 dark:bg-red-900/20">
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedOptions.includes('noDisponibleFecha')}
                    onChange={() => handleOptionToggle('noDisponibleFecha')}
                    className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm font-medium text-red-900 dark:text-red-200">NO disponible - Fecha concreta</span>
                </label>
                <span className="text-xs text-red-500 dark:text-red-400">Especificar fecha y horario NO disponible</span>
              </div>
              {selectedOptions.includes('noDisponibleFecha') && (
                <div className="mt-3 pt-3 border-t border-red-100 dark:border-red-600">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-red-700 dark:text-red-300 mb-1">Fecha</label>
                        <input 
                          type="date" 
                          value={formData.noDisponibleFecha.fecha}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            noDisponibleFecha: { ...prev.noDisponibleFecha, fecha: e.target.value }
                          }))}
                          className="w-full px-2 py-1 border border-red-300 dark:border-red-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-red-700 dark:text-red-300 mb-1">Período</label>
                        <select 
                          value={formData.noDisponibleFecha.periodo}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            noDisponibleFecha: { ...prev.noDisponibleFecha, periodo: e.target.value }
                          }))}
                          className="w-full px-2 py-1 border border-red-300 dark:border-red-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="manana">Mañana</option>
                          <option value="tarde">Tarde</option>
                          <option value="personalizado">Personalizado</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-red-700 dark:text-red-300 mb-1">Hora inicio</label>
                        <input 
                          type="time" 
                          value={formData.noDisponibleFecha.horaInicio}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            noDisponibleFecha: { ...prev.noDisponibleFecha, horaInicio: e.target.value }
                          }))}
                          className="w-full px-2 py-1 border border-red-300 dark:border-red-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-red-700 dark:text-red-300 mb-1">Hora fin</label>
                        <input 
                          type="time" 
                          value={formData.noDisponibleFecha.horaFin}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            noDisponibleFecha: { ...prev.noDisponibleFecha, horaFin: e.target.value }
                          }))}
                          className="w-full px-2 py-1 border border-red-300 dark:border-red-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Vista previa de disponibilidades actuales */}
        <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Disponibilidades Actuales</h5>
          {disponibilidades.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">No hay disponibilidades configuradas para este mes.</p>
          ) : (
            <div className="space-y-2">
              {disponibilidades.map((disp) => (
                <div key={disp.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded border">
                  <span className="text-sm text-gray-900 dark:text-white">{getDescripcionLegible(disp)}</span>
                  <button 
                    onClick={() => handleDelete(disp.id)}
                    className="text-red-600 hover:text-red-800 text-xs"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={selectedOptions.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md transition-colors"
          >
            Guardar Disponibilidades
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisponibilidadModal;
