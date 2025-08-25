import { Router } from 'express';
import {
  getAllExhibidores,
  getExhibidorById,
  createExhibidor,
  updateExhibidor,
  deleteExhibidor,
} from '../controllers/exhibidorController';
import { requireAdmin } from '../middleware/roleMiddleware';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Rutas públicas (para obtener exhibidores)
router.get('/', getAllExhibidores);
router.get('/:id', getExhibidorById);

// Rutas protegidas (requieren autenticación y rol de admin o superior)
router.post('/', authMiddleware, requireAdmin, createExhibidor);
router.put('/:id', authMiddleware, requireAdmin, updateExhibidor);
router.delete('/:id', authMiddleware, requireAdmin, deleteExhibidor);

export default router;
