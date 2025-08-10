import { Router } from 'express';
import { getAllTests, createTest } from '../controllers/testController';

const router = Router();

// GET /test - Obtener todos los tests
router.get('/', getAllTests);

// POST /test - Crear un nuevo test
router.post('/', createTest);

export default router;
