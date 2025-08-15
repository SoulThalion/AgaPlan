import express from 'express';
import {
  getConfiguracionesByUsuario,
  getConfiguracionById,
  createConfiguracion,
  updateConfiguracion,
  deleteConfiguracion,
  getConfiguracionesByMes,
  getConfiguracionesUsuarioAutenticado,
} from '../controllers/userDisponibilidadConfigController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener configuraciones de un usuario específico
router.get('/usuario/:usuarioId', getConfiguracionesByUsuario);

// Obtener configuraciones por mes (para todos los usuarios)
router.get('/mes/:mes', getConfiguracionesByMes);

// Obtener configuraciones del usuario autenticado por mes
router.get('/usuario-autenticado/:mes', getConfiguracionesUsuarioAutenticado);

// Obtener una configuración específica por ID
router.get('/:id', getConfiguracionById);

// Crear una nueva configuración
router.post('/', createConfiguracion);

// Actualizar una configuración existente
router.put('/:id', updateConfiguracion);

// Eliminar una configuración
router.delete('/:id', deleteConfiguracion);

export default router;
