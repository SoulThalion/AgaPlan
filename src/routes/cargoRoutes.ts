import { Router } from 'express';
import { 
  createCargo, 
  getAllCargos, 
  getCargoById, 
  updateCargo, 
  deleteCargo 
} from '../controllers/cargoController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/roleMiddleware';
import { filterByEquipo } from '../middleware';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);
router.use(filterByEquipo);

// Rutas para cargos
router.get('/', getAllCargos);
router.get('/:id', getCargoById);

// Rutas protegidas (solo admin o superior)
router.post('/', requireAdmin, createCargo);
router.put('/:id', requireAdmin, updateCargo);
router.delete('/:id', requireAdmin, deleteCargo);

export default router;
