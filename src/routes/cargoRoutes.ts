import { Router } from 'express';
import { 
  createCargo, 
  getAllCargos, 
  getCargoById, 
  updateCargo, 
  deleteCargo 
} from '../controllers/cargoController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Rutas para cargos
router.get('/', getAllCargos);
router.get('/:id', getCargoById);
router.post('/', createCargo);
router.put('/:id', updateCargo);
router.delete('/:id', deleteCargo);

export default router;
