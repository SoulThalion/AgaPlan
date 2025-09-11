import { Router } from 'express';
import { getAllTests, createTest } from '../controllers/testController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/roleMiddleware';

const router = Router();

// GET /test - Obtener todos los tests
router.get('/', getAllTests);

// POST /test - Crear un nuevo test (solo admin o superior)
router.post('/', authMiddleware, requireAdmin, createTest);

export default router;
