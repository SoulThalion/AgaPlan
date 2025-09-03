import { Router } from 'express';
import {
  getAllUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  configurarParticipacionMensual,
  getParticipacionMensualActual
} from '../controllers/usuarioController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/roleMiddleware';
import { filterByEquipo } from '../middleware';

const router = Router();

// Rutas públicas (solo para registro inicial)
router.post('/', createUsuario);

// Rutas protegidas
router.get('/', authMiddleware, filterByEquipo, requireAdmin, getAllUsuarios);
router.get('/:id', authMiddleware, filterByEquipo, getUsuarioById);
router.put('/:id', authMiddleware, filterByEquipo, requireAdmin, updateUsuario);
router.delete('/:id', authMiddleware, filterByEquipo, requireAdmin, deleteUsuario);

// Ruta específica para configurar participación mensual (admin o superior)
router.patch('/:id/participacion-mensual', authMiddleware, filterByEquipo, requireAdmin, configurarParticipacionMensual);

// Ruta para obtener la participación mensual actual de un usuario
router.get('/:id/participacion-mensual-actual', getParticipacionMensualActual);

export default router;
