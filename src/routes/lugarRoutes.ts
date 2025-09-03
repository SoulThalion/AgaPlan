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
import { filterByEquipo } from '../middleware';

const router = Router();

// Rutas de prueba para verificar conexión y modelo
router.get('/test', testLugarConnection);
router.get('/test-model', testLugarModel);

// Rutas públicas (solo lectura)
router.get('/', authMiddleware, filterByEquipo, getAllLugares);
router.get('/:id', authMiddleware, filterByEquipo, getLugarById);

// Rutas protegidas (primero autenticación, luego verificación de rol)
// Permite acceso a admin y superAdmin
router.post('/', authMiddleware, filterByEquipo, requireAdmin, createLugar);
router.put('/:id', authMiddleware, filterByEquipo, requireAdmin, updateLugar);
router.delete('/:id', authMiddleware, filterByEquipo, requireAdmin, deleteLugar);

export default router;
