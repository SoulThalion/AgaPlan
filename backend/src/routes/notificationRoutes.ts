import { Router } from 'express';
import notificationController from '../controllers/notificationController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireAdmin, requireSuperAdmin } from '../middleware/roleMiddleware';
import { cronAuthMiddleware } from '../middleware/cronAuthMiddleware';

const router = Router();

// ===== ENDPOINTS PÚBLICOS PARA CRON JOBS =====
// Estos endpoints NO requieren autenticación ya que los llama Cloudflare Workers

/**
 * @route GET /api/notifications/cron/week
 * @desc Endpoint para Cloudflare Workers - Notificaciones de una semana antes
 * @access Public (llamado por Cloudflare Workers)
 */
router.get('/cron/week', cronAuthMiddleware, notificationController.cronWeekNotifications);

/**
 * @route GET /api/notifications/cron/day
 * @desc Endpoint para Cloudflare Workers - Notificaciones de un día antes
 * @access Public (llamado por Cloudflare Workers)
 */
router.get('/cron/day', cronAuthMiddleware, notificationController.cronDayNotifications);

/**
 * @route GET /api/notifications/cron/hour
 * @desc Endpoint para Cloudflare Workers - Notificaciones de una hora antes
 * @access Public (llamado por Cloudflare Workers)
 */
router.get('/cron/hour', cronAuthMiddleware, notificationController.cronHourNotifications);

/**
 * @route GET /api/notifications/cron/maintenance
 * @desc Endpoint para Cloudflare Workers - Mantenimiento diario
 * @access Public (llamado por Cloudflare Workers)
 */
router.get('/cron/maintenance', cronAuthMiddleware, notificationController.cronMaintenance);

/**
 * @route GET /api/notifications/cron/smart
 * @desc Endpoint inteligente para Cloudflare Workers - Evalúa y ejecuta todas las notificaciones necesarias
 * @access Public (llamado por Cloudflare Workers)
 */
router.get('/cron/smart', cronAuthMiddleware, notificationController.smartCronJob);

// ===== ENDPOINTS PRIVADOS =====
// Todas las rutas siguientes requieren autenticación
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
 * @route POST /api/notifications/test-one-hour
 * @desc Prueba específicamente las notificaciones de una hora antes
 * @access Private (Admin/SuperAdmin)
 */
router.post('/test-one-hour', requireAdmin, notificationController.testOneHourNotifications);

/**
 * @route GET /api/notifications/test-time-calculation
 * @desc Prueba el cálculo de tiempo para notificaciones
 * @access Public (para testing)
 */
router.get('/test-time-calculation', notificationController.testTimeCalculation);



/**
 * @route POST /api/notifications/send-to-all
 * @desc Envía notificaciones a TODOS los usuarios con turnos (para pruebas)
 * @access Private (Admin/SuperAdmin)
 */
router.post('/send-to-all', requireAdmin, notificationController.sendNotificationsToAllUsers);

/**
 * @route GET /api/notifications/cron-status
 * @desc Obtiene el estado de los trabajos programados
 * @access Private (Admin/SuperAdmin)
 */
router.get('/cron-status', requireAdmin, notificationController.getCronJobsStatus);

export default router;
