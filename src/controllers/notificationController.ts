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
