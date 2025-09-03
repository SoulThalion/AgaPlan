import express from 'express';
import {
  getConfiguracionesByUsuario,
  getConfiguracionById,
  createConfiguracion,
  updateConfiguracion,
  deleteConfiguracion,
  getConfiguracionesByMes,
  getConfiguracionesUsuarioAutenticado,
  getUsuariosDisponiblesParaFecha,
} from '../controllers/userDisponibilidadConfigController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/roleMiddleware';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener configuraciones de un usuario específico
router.get('/usuario/:usuarioId', getConfiguracionesByUsuario);

// Obtener configuraciones por mes (para todos los usuarios)
router.get('/mes/:mes', getConfiguracionesByMes);

// Obtener configuraciones del usuario autenticado por mes
router.get('/usuario-autenticado/:mes', getConfiguracionesUsuarioAutenticado);

// Nuevo endpoint optimizado: Obtener usuarios disponibles para una fecha específica
router.get('/usuarios-disponibles-para-fecha', getUsuariosDisponiblesParaFecha);

// Obtener una configuración específica por ID
router.get('/:id', getConfiguracionById);

// Rutas protegidas (solo admin o superior)
router.post('/', requireAdmin, createConfiguracion);
router.put('/:id', requireAdmin, updateConfiguracion);
router.delete('/:id', requireAdmin, deleteConfiguracion);

export default router;
