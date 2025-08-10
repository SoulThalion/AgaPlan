import { Router } from 'express';
import { 
  getAllLugares, 
  getLugarById, 
  createLugar, 
  updateLugar, 
  deleteLugar 
} from '../controllers/lugarController';
import { requireSuperAdmin } from '../middleware/roleMiddleware';

const router = Router();

// Rutas públicas (solo lectura)
router.get('/', getAllLugares);
router.get('/:id', getLugarById);

// Rutas protegidas (solo superAdmin)
router.post('/', requireSuperAdmin, createLugar);
router.put('/:id', requireSuperAdmin, updateLugar);
router.delete('/:id', requireSuperAdmin, deleteLugar);

export default router;
