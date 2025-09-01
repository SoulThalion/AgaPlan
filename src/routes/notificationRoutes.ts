import { Router } from 'express';
import notificationController from '../controllers/notificationController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireAdmin, requireSuperAdmin } from '../middleware/roleMiddleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * @route GET /api/notifications/config/:usuarioId
 * @desc Obtiene la configuración de notificaciones de un usuario
 * @access Private
 */
router.get('/config/:usuarioId', notificationController.getUserNotificationConfig);

/**
 * @route PUT /api/notifications/config/:usuarioId
 * @desc Actualiza la configuración de notificaciones de un usuario
 * @access Private
 */
router.put('/config/:usuarioId', notificationController.updateUserNotificationConfig);

/**
 * @route POST /api/notifications/config
 * @desc Crea configuración de notificaciones para un usuario
 * @access Private (Admin/SuperAdmin)
 */
router.post('/config', requireAdmin, notificationController.createUserNotificationConfig);

/**
 * @route GET /api/notifications/configs
 * @desc Obtiene todas las configuraciones de notificaciones
 * @access Private (Admin/SuperAdmin)
 */
router.get('/configs', requireAdmin, notificationController.getAllNotificationConfigs);

/**
 * @route POST /api/notifications/run-manual
 * @desc Ejecuta notificaciones manualmente (para testing)
 * @access Private (Admin/SuperAdmin)
 */
router.post('/run-manual', requireAdmin, notificationController.runNotificationsManually);

/**
 * @route GET /api/notifications/cron-status
 * @desc Obtiene el estado de los trabajos programados
 * @access Private (Admin/SuperAdmin)
 */
router.get('/cron-status', requireAdmin, notificationController.getCronJobsStatus);

export default router;
