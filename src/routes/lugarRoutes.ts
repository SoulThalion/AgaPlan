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
import { requireAdmin } from '../middleware/roleMiddleware';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Rutas de prueba para verificar conexión y modelo
router.get('/test', testLugarConnection);
router.get('/test-model', testLugarModel);

// Rutas públicas (solo lectura)
router.get('/', getAllLugares);
router.get('/:id', getLugarById);

// Rutas protegidas (primero autenticación, luego verificación de rol)
// Permite acceso a admin y superAdmin
router.post('/', authMiddleware, requireAdmin, createLugar);
router.put('/:id', authMiddleware, requireAdmin, updateLugar);
router.delete('/:id', authMiddleware, requireAdmin, deleteLugar);

export default router;
