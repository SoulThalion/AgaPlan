import { Request, Response } from 'express';
import { UsuarioNotificacionConfig } from '../models';
import notificationService from '../services/notificationService';
import cronService from '../services/cronService';

export class NotificationController {
  
  /**
   * Obtiene la configuración de notificaciones de un usuario
   */
  async getUserNotificationConfig(req: Request, res: Response): Promise<void> {
    try {
      const { usuarioId } = req.params;
      const userId = parseInt(usuarioId);

      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: 'ID de usuario inválido'
        });
        return;
      }

      const config = await notificationService.getUserNotificationConfig(userId);
      
      if (!config) {
        // Si no existe configuración, crear una por defecto
        const defaultConfig = await notificationService.updateUserNotificationConfig(userId, {});
        res.json({
          success: true,
          data: defaultConfig
        });
        return;
      }

      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      console.error('Error obteniendo configuración de notificaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualiza la configuración de notificaciones de un usuario
   */
  async updateUserNotificationConfig(req: Request, res: Response): Promise<void> {
    try {
      const { usuarioId } = req.params;
      const userId = parseInt(usuarioId);
      const { notificarUnaSemanaAntes, notificarUnDiaAntes, notificarUnaHoraAntes, activo } = req.body;

      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: 'ID de usuario inválido'
        });
        return;
      }

      const config = await notificationService.updateUserNotificationConfig(userId, {
        notificarUnaSemanaAntes,
        notificarUnDiaAntes,
        notificarUnaHoraAntes,
        activo
      });

      res.json({
        success: true,
        message: 'Configuración de notificaciones actualizada correctamente',
        data: config
      });
    } catch (error) {
      console.error('Error actualizando configuración de notificaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Ejecuta notificaciones manualmente (para testing)
   */
  async runNotificationsManually(req: Request, res: Response): Promise<void> {
    try {
      const result = await cronService.runNotificationsManually();
      
      res.json({
        success: true,
        message: 'Notificaciones ejecutadas manualmente',
        data: result
      });
    } catch (error) {
      console.error('Error ejecutando notificaciones manualmente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Prueba específicamente las notificaciones de una hora antes
   */
  async testOneHourNotifications(req: Request, res: Response): Promise<void> {
    try {
      const result = await notificationService.testOneHourNotifications();
      
      res.json({
        success: true,
        message: 'Prueba de notificaciones de una hora antes completada',
        data: {
          sent: result.sent,
          failed: result.failed,
          totalJobs: result.jobs.length,
          jobs: result.jobs.map(job => ({
            turnoId: job.turnoId,
            usuarioId: job.usuarioId,
            tipoNotificacion: job.tipoNotificacion,
            fechaEnvio: job.fechaEnvio
          }))
        }
      });
    } catch (error) {
      console.error('Error probando notificaciones de una hora antes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Endpoint para Render Cron Job - Notificaciones de una semana antes
   */
  async cronWeekNotifications(req: Request, res: Response): Promise<void> {
    try {
      console.log('📅 [CRON] Ejecutando notificaciones de una semana antes...');
      const result = await notificationService.processAllPendingNotifications();
      
      console.log(`📊 [CRON] Notificaciones de una semana: ${result.sent} enviadas, ${result.failed} fallidas`);
      
      res.json({
        success: true,
        message: 'Notificaciones de una semana antes procesadas',
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ [CRON] Error en notificaciones de una semana:', error);
      res.status(500).json({
        success: false,
        message: 'Error procesando notificaciones de una semana antes',
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Endpoint para Render Cron Job - Notificaciones de un día antes
   */
  async cronDayNotifications(req: Request, res: Response): Promise<void> {
    try {
      console.log('📅 [CRON] Ejecutando notificaciones de un día antes...');
      const result = await notificationService.processAllPendingNotifications();
      
      console.log(`📊 [CRON] Notificaciones de un día: ${result.sent} enviadas, ${result.failed} fallidas`);
      
      res.json({
        success: true,
        message: 'Notificaciones de un día antes procesadas',
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ [CRON] Error en notificaciones de un día:', error);
      res.status(500).json({
        success: false,
        message: 'Error procesando notificaciones de un día antes',
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Endpoint para Render Cron Job - Notificaciones de una hora antes
   */
  async cronHourNotifications(req: Request, res: Response): Promise<void> {
    try {
      console.log('⏰ [CRON] Ejecutando notificaciones de una hora antes...');
      const result = await notificationService.processAllPendingNotifications();
      
      console.log(`📊 [CRON] Notificaciones de una hora: ${result.sent} enviadas, ${result.failed} fallidas`);
      
      res.json({
        success: true,
        message: 'Notificaciones de una hora antes procesadas',
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ [CRON] Error en notificaciones de una hora:', error);
      res.status(500).json({
        success: false,
        message: 'Error procesando notificaciones de una hora antes',
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Endpoint para Render Cron Job - Mantenimiento diario
   */
  async cronMaintenance(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔧 [CRON] Ejecutando mantenimiento diario...');
      
      // Verificar conexión SMTP
      const emailService = require('../services/emailService').default;
      const isConnected = await emailService.testConnection();
      
      console.log(`📧 [CRON] Conexión SMTP: ${isConnected ? 'OK' : 'FALLO'}`);
      
      res.json({
        success: true,
        message: 'Mantenimiento diario completado',
        data: {
          smtpConnection: isConnected,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('❌ [CRON] Error en mantenimiento:', error);
      res.status(500).json({
        success: false,
        message: 'Error en mantenimiento diario',
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Endpoint inteligente para Render Cron Job - Evalúa y ejecuta todas las notificaciones necesarias
   */
  async smartCronJob(req: Request, res: Response): Promise<void> {
    const startTime = new Date();
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    
    console.log(`🚀 [SMART-CRON] ===== NUEVA LLAMADA AL ENDPOINT =====`);
    console.log(`📅 [SMART-CRON] Timestamp: ${startTime.toISOString()}`);
    console.log(`🌐 [SMART-CRON] IP del cliente: ${clientIP}`);
    console.log(`🔧 [SMART-CRON] User-Agent: ${userAgent}`);
    console.log(`📊 [SMART-CRON] Iniciando evaluación inteligente de notificaciones...`);
    
    const results = {
      notifications: {
        week: { sent: 0, failed: 0, executed: false },
        day: { sent: 0, failed: 0, executed: false },
        hour: { sent: 0, failed: 0, executed: false }
      },
      maintenance: { executed: false, smtpConnection: false },
      totalSent: 0,
      totalFailed: 0,
      executionTime: 0
    };

    try {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      
      console.log(`⏰ [SMART-CRON] Hora actual: ${hour}:${minute.toString().padStart(2, '0')}`);

      // 1. Verificar si es hora de notificaciones diarias (9:00 AM)
      if (hour === 9 && minute === 0) {
        console.log('📅 [SMART-CRON] Ejecutando notificaciones de una semana y un día antes...');
        
        // Ejecutar notificaciones de una semana antes
        try {
          const weekResult = await notificationService.processAllPendingNotifications();
          results.notifications.week = { ...weekResult, executed: true };
          console.log(`📊 [SMART-CRON] Notificaciones semana: ${weekResult.sent} enviadas, ${weekResult.failed} fallidas`);
        } catch (error) {
          console.error('❌ [SMART-CRON] Error en notificaciones semana:', error);
        }

        // Ejecutar notificaciones de un día antes
        try {
          const dayResult = await notificationService.processAllPendingNotifications();
          results.notifications.day = { ...dayResult, executed: true };
          console.log(`📊 [SMART-CRON] Notificaciones día: ${dayResult.sent} enviadas, ${dayResult.failed} fallidas`);
        } catch (error) {
          console.error('❌ [SMART-CRON] Error en notificaciones día:', error);
        }
      }

      // 2. Verificar si es hora de notificaciones de una hora antes (cada 10 minutos)
      if (minute % 10 === 0) {
        console.log('⏰ [SMART-CRON] Ejecutando notificaciones de una hora antes...');
        
        try {
          const hourResult = await notificationService.processAllPendingNotifications();
          results.notifications.hour = { ...hourResult, executed: true };
          console.log(`📊 [SMART-CRON] Notificaciones hora: ${hourResult.sent} enviadas, ${hourResult.failed} fallidas`);
        } catch (error) {
          console.error('❌ [SMART-CRON] Error en notificaciones hora:', error);
        }
      }

      // 3. Verificar si es hora de mantenimiento (2:00 AM)
      if (hour === 2 && minute === 0) {
        console.log('🔧 [SMART-CRON] Ejecutando mantenimiento diario...');
        
        try {
          const emailService = require('../services/emailService').default;
          const isConnected = await emailService.testConnection();
          results.maintenance = { executed: true, smtpConnection: isConnected };
          console.log(`📧 [SMART-CRON] Conexión SMTP: ${isConnected ? 'OK' : 'FALLO'}`);
        } catch (error) {
          console.error('❌ [SMART-CRON] Error en mantenimiento:', error);
        }
      }

      // Calcular totales
      results.totalSent = results.notifications.week.sent + results.notifications.day.sent + results.notifications.hour.sent;
      results.totalFailed = results.notifications.week.failed + results.notifications.day.failed + results.notifications.hour.failed;
      
      const endTime = new Date();
      results.executionTime = endTime.getTime() - startTime.getTime();

      // Determinar qué acciones se ejecutaron
      const executedActions = [];
      if (results.notifications.week.executed) executedActions.push('notificaciones-semana');
      if (results.notifications.day.executed) executedActions.push('notificaciones-día');
      if (results.notifications.hour.executed) executedActions.push('notificaciones-hora');
      if (results.maintenance.executed) executedActions.push('mantenimiento');

      const message = executedActions.length > 0 
        ? `Acciones ejecutadas: ${executedActions.join(', ')}`
        : 'No se ejecutaron acciones (no es el momento adecuado)';

      console.log(`✅ [SMART-CRON] Completado en ${results.executionTime}ms - ${message}`);

      const responseData = {
        success: true,
        message,
        data: {
          ...results,
          executedActions,
          timestamp: endTime.toISOString()
        }
      };

      // Log detallado del resultado
      console.log(`📋 [SMART-CRON] ===== RESULTADO DEL ENDPOINT =====`);
      console.log(`✅ [SMART-CRON] Éxito: ${responseData.success}`);
      console.log(`💬 [SMART-CRON] Mensaje: ${responseData.message}`);
      console.log(`📊 [SMART-CRON] Notificaciones enviadas: ${results.totalSent}`);
      console.log(`❌ [SMART-CRON] Notificaciones fallidas: ${results.totalFailed}`);
      console.log(`⏱️ [SMART-CRON] Tiempo de ejecución: ${results.executionTime}ms`);
      console.log(`🎯 [SMART-CRON] Acciones ejecutadas: ${executedActions.length > 0 ? executedActions.join(', ') : 'Ninguna'}`);
      console.log(`📅 [SMART-CRON] Timestamp de respuesta: ${endTime.toISOString()}`);
      console.log(`🔚 [SMART-CRON] ===== FIN DE LA LLAMADA =====`);

      res.json(responseData);

    } catch (error) {
      const errorTime = new Date();
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      console.error('❌ [SMART-CRON] ===== ERROR EN EL ENDPOINT =====');
      console.error(`❌ [SMART-CRON] Error: ${errorMessage}`);
      console.error(`📅 [SMART-CRON] Timestamp del error: ${errorTime.toISOString()}`);
      console.error(`🔚 [SMART-CRON] ===== FIN DE LA LLAMADA CON ERROR =====`);
      
      const errorResponse = {
        success: false,
        message: 'Error en cron job inteligente',
        error: errorMessage,
        timestamp: errorTime.toISOString()
      };
      
      res.status(500).json(errorResponse);
    }
  }

  /**
   * Calcula el próximo tiempo de ejecución relevante
   */
  private getNextExecutionTime(now: Date): string {
    const next = new Date(now);
    
    // Si es antes de las 9:00, próximo es 9:00
    if (now.getHours() < 9) {
      next.setHours(9, 0, 0, 0);
    }
    // Si es después de las 9:00 pero antes de las 2:00 del día siguiente, próximo es 2:00
    else if (now.getHours() < 2 || (now.getHours() === 2 && now.getMinutes() === 0)) {
      next.setDate(next.getDate() + 1);
      next.setHours(2, 0, 0, 0);
    }
    // Si es después de las 2:00, próximo es 9:00 del día siguiente
    else {
      next.setDate(next.getDate() + 1);
      next.setHours(9, 0, 0, 0);
    }
    
    return next.toISOString();
  }

  /**
   * Envía notificaciones a TODOS los usuarios con turnos (para pruebas)
   */
  async sendNotificationsToAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const { month } = req.body;
      
      if (!month) {
        res.status(400).json({
          success: false,
          message: 'El parámetro "month" es requerido (formato: YYYY-MM)'
        });
        return;
      }

      const result = await notificationService.sendNotificationsToAllUsers(month);
      
      res.json({
        success: true,
        message: `Notificaciones enviadas a todos los usuarios con turnos para ${month}`,
        data: result
      });
    } catch (error) {
      console.error('Error enviando notificaciones a todos los usuarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtiene el estado de los trabajos programados
   */
  async getCronJobsStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = cronService.getJobsStatus();
      const info = cronService.getInfo();
      
      res.json({
        success: true,
        data: {
          jobs: status,
          info: info
        }
      });
    } catch (error) {
      console.error('Error obteniendo estado de trabajos programados:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtiene todas las configuraciones de notificaciones
   */
  async getAllNotificationConfigs(req: Request, res: Response): Promise<void> {
    try {
      const configs = await UsuarioNotificacionConfig.findAll({
        include: [
          {
            model: require('../models').Usuario,
            as: 'usuario',
            attributes: ['id', 'nombre', 'email']
          }
        ]
      });

      res.json({
        success: true,
        data: configs
      });
    } catch (error) {
      console.error('Error obteniendo configuraciones de notificaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Crea configuración de notificaciones para un usuario
   */
  async createUserNotificationConfig(req: Request, res: Response): Promise<void> {
    try {
      const { usuarioId, notificarUnaSemanaAntes, notificarUnDiaAntes, notificarUnaHoraAntes, activo } = req.body;

      if (!usuarioId) {
        res.status(400).json({
          success: false,
          message: 'ID de usuario es requerido'
        });
        return;
      }

      const config = await notificationService.updateUserNotificationConfig(usuarioId, {
        notificarUnaSemanaAntes,
        notificarUnDiaAntes,
        notificarUnaHoraAntes,
        activo
      });

      res.status(201).json({
        success: true,
        message: 'Configuración de notificaciones creada correctamente',
        data: config
      });
    } catch (error) {
      console.error('Error creando configuración de notificaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

export default new NotificationController();
