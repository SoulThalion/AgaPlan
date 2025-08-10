import { Router } from 'express';
import {
  getAllExhibidores,
  getExhibidorById,
  createExhibidor,
  updateExhibidor,
  deleteExhibidor,
} from '../controllers/exhibidorController';
import { authenticateToken, requireRole } from '../middleware';

const router = Router();

// Rutas públicas (para obtener exhibidores)
router.get('/', getAllExhibidores);
router.get('/:id', getExhibidorById);

// Rutas protegidas (requieren autenticación y rol de administrador)
router.post('/', authenticateToken, requireRole(['admin']), createExhibidor);
router.put('/:id', authenticateToken, requireRole(['admin']), updateExhibidor);
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteExhibidor);

export default router;
