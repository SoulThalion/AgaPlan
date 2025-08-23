import { Router } from 'express';
import { 
  getAllLugares, 
  getLugarById, 
  createLugar, 
  updateLugar, 
  deleteLugar,
  testLugarConnection,
  testLugarModel
} from '../controllers/lugarController';
import { requireSuperAdmin } from '../middleware/roleMiddleware';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Rutas de prueba para verificar conexión y modelo
router.get('/test', testLugarConnection);
router.get('/test-model', testLugarModel);

// Rutas públicas (solo lectura)
router.get('/', getAllLugares);
router.get('/:id', getLugarById);

// Rutas protegidas (primero autenticación, luego verificación de rol)
router.post('/', authMiddleware, requireSuperAdmin, createLugar);
router.put('/:id', authMiddleware, requireSuperAdmin, updateLugar);
router.delete('/:id', authMiddleware, requireSuperAdmin, deleteLugar);

export default router;
