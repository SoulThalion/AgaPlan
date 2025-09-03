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
import { filterByEquipo } from '../middleware';

const router = Router();

// Rutas públicas (para obtener exhibidores)
router.get('/', authMiddleware, filterByEquipo, getAllExhibidores);
router.get('/:id', authMiddleware, filterByEquipo, getExhibidorById);

// Rutas protegidas (requieren autenticación y rol de admin o superior)
router.post('/', authMiddleware, filterByEquipo, requireAdmin, createExhibidor);
router.put('/:id', authMiddleware, filterByEquipo, requireAdmin, updateExhibidor);
router.delete('/:id', authMiddleware, filterByEquipo, requireAdmin, deleteExhibidor);

export default router;
