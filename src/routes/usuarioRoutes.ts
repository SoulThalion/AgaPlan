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

const router = Router();

// Rutas públicas (solo para registro inicial)
router.post('/', createUsuario);

// Rutas protegidas
router.get('/', authMiddleware, requireAdmin, getAllUsuarios);
router.get('/:id', authMiddleware, getUsuarioById);
router.put('/:id', authMiddleware, requireAdmin, updateUsuario);
router.delete('/:id', authMiddleware, requireAdmin, deleteUsuario);

// Ruta específica para configurar participación mensual (admin o superior)
router.patch('/:id/participacion-mensual', authMiddleware, requireAdmin, configurarParticipacionMensual);

// Ruta para obtener la participación mensual actual de un usuario
router.get('/:id/participacion-mensual-actual', getParticipacionMensualActual);

export default router;
