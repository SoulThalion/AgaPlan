import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';

interface NotificationConfig {
  id: number;
  usuarioId: number;
  notificarUnaSemanaAntes: boolean;
  notificarUnDiaAntes: boolean;
  notificarUnaHoraAntes: boolean;
  activo: boolean;
}

interface CronJobStatus {
  name: string;
  running: boolean;
}

interface CronJobInfo {
  name: string;
  schedule: string;
  description: string;
}

const NotificationSettings: React.FC = (): JSX.Element => {
  const { user: currentUser } = useAuth();
  const [isTesting, setIsTesting] = useState(false);
  const queryClient = useQueryClient();

  // Obtener configuración de notificaciones del usuario actual
  const { data: notificationConfig, isLoading: configLoading } = useQuery({
    queryKey: ['notificationConfig', currentUser?.id],
    queryFn: () => apiService.getNotificationConfig(currentUser?.id || 0),
    enabled: !!currentUser?.id
  });

  // Obtener estado de trabajos programados (solo para admins)
  const { data: cronStatus, isLoading: cronLoading } = useQuery({
    queryKey: ['cronStatus'],
    queryFn: () => apiService.getCronJobsStatus(),
    enabled: currentUser?.rol === 'admin' || currentUser?.rol === 'superAdmin'
  });

  // Mutación para actualizar configuración
  const updateConfigMutation = useMutation({
    mutationFn: (config: Partial<NotificationConfig>) => 
      apiService.updateNotificationConfig(currentUser?.id || 0, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationConfig'] });
      Swal.fire({
        icon: 'success',
        title: 'Configuración actualizada',
        text: 'Tus preferencias de notificaciones han sido guardadas.',
        timer: 2000,
        showConfirmButton: false
      });
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'No se pudo actualizar la configuración.',
        confirmButtonText: 'Entendido'
      });
    }
  });

  // Función para probar emails
  const handleTestEmails = async () => {
    if (!(currentUser?.rol === 'admin' || currentUser?.rol === 'superAdmin')) {
      Swal.fire({
        icon: 'warning',
        title: 'Acceso restringido',
        text: 'Solo los administradores pueden probar el sistema de emails.',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    try {
      setIsTesting(true);
      
      const result = await Swal.fire({
        title: '¿Probar sistema de emails?',
        text: 'Esto enviará notificaciones de prueba a todos los usuarios con turnos programados.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, probar',
        cancelButtonText: 'Cancelar'
      });

      if (!result.isConfirmed) return;

      Swal.fire({
        title: 'Probando emails...',
        text: 'Ejecutando notificaciones de prueba',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await apiService.testEmailNotifications();
      
      await Swal.fire({
        icon: 'success',
        title: 'Prueba completada',
        html: `
          <div class="text-center">
            <p class="mb-3">Se han procesado las notificaciones de prueba.</p>
            <div class="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-sm">
              <p><strong>Resultado:</strong></p>
              <ul class="list-disc list-inside mt-2">
                <li>✅ Emails enviados: ${response.data?.sent || 0}</li>
                <li>❌ Emails fallidos: ${response.data?.failed || 0}</li>
              </ul>
            </div>
          </div>
        `,
        confirmButtonText: 'Perfecto'
      });

    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'Error al probar emails',
        html: `
          <div class="text-center">
            <p class="mb-3">No se pudo ejecutar la prueba de emails.</p>
            <div class="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-sm">
              <p><strong>Posibles causas:</strong></p>
              <ul class="list-disc list-inside mt-2 text-xs">
                <li>Configuración SMTP incorrecta</li>
                <li>Servidor de email no disponible</li>
                <li>Credenciales de email inválidas</li>
                <li>No hay turnos programados para notificar</li>
              </ul>
            </div>
          </div>
        `,
        confirmButtonText: 'Entendido'
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Función para actualizar configuración
  const handleConfigChange = (field: keyof NotificationConfig, value: boolean) => {
    if (!notificationConfig?.data) return;
    
    updateConfigMutation.mutate({
      [field]: value
    });
  };

  if (configLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const config = notificationConfig?.data;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Configuración de Notificaciones
        </h2>
        {(currentUser?.rol === 'admin' || currentUser?.rol === 'superAdmin') && (
          <button
            onClick={handleTestEmails}
            disabled={isTesting}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            title="Probar el sistema de notificaciones por email"
          >
            {isTesting ? '⏳ Probando...' : '📧 Probar Emails'}
          </button>
        )}
      </div>

      {/* Configuración personal */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Mis Preferencias de Notificación
        </h3>
        
        <div className="space-y-4">
          {/* Activar/Desactivar todas las notificaciones */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Activar notificaciones por email
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Habilita o deshabilita todas las notificaciones por email
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config?.activo ?? true}
                onChange={(e) => handleConfigChange('activo', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Notificación una semana antes */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Notificación una semana antes
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Recibir recordatorio 7 días antes del turno
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config?.notificarUnaSemanaAntes ?? true}
                onChange={(e) => handleConfigChange('notificarUnaSemanaAntes', e.target.checked)}
                disabled={!config?.activo}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
            </label>
          </div>

          {/* Notificación un día antes */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Notificación un día antes
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Recibir recordatorio 1 día antes del turno
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config?.notificarUnDiaAntes ?? true}
                onChange={(e) => handleConfigChange('notificarUnDiaAntes', e.target.checked)}
                disabled={!config?.activo}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
            </label>
          </div>

          {/* Notificación una hora antes */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Notificación una hora antes
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Recibir recordatorio 1 hora antes del turno
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config?.notificarUnaHoraAntes ?? true}
                onChange={(e) => handleConfigChange('notificarUnaHoraAntes', e.target.checked)}
                disabled={!config?.activo}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Estado del sistema (solo para admins) */}
      {(currentUser?.rol === 'admin' || currentUser?.rol === 'superAdmin') && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Estado del Sistema
          </h3>
          
          {cronLoading ? (
            <div className="flex justify-center items-center h-16">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Estado de trabajos programados */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Trabajos Programados
                </h4>
                <div className="space-y-2">
                  {cronStatus?.data?.jobs?.map((job: CronJobStatus) => (
                    <div key={job.name} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {job.name}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        job.running 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {job.running ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Información de trabajos */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Programación
                </h4>
                <div className="space-y-2">
                  {cronStatus?.data?.info?.map((info: CronJobInfo) => (
                    <div key={info.name} className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {info.description}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Horario: {info.schedule}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;
