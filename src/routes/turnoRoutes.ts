import { Router } from 'express';
import { 
  getAllTurnos, 
  getTurnoById, 
  createTurno, 
  updateTurno, 
  deleteTurno,
  ocuparTurno,
  liberarTurno,
  generarTurnosAutomaticos,
  createTurnosRecurrentes
} from '../controllers/turnoController';
import { requireAdmin, requireSuperAdmin } from '../middleware/roleMiddleware';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Rutas públicas (solo lectura)
router.get('/', getAllTurnos);
router.get('/:id', getTurnoById);

// Rutas protegidas para admin y superAdmin
router.post('/', authMiddleware, requireAdmin, createTurno);
router.post('/recurrentes', authMiddleware, requireAdmin, createTurnosRecurrentes);
router.put('/:id', authMiddleware, requireAdmin, updateTurno);
router.delete('/:id', authMiddleware, requireAdmin, deleteTurno);

// Ruta para generar turnos automáticos (solo superAdmin)
router.post('/generar-automaticos', authMiddleware, requireSuperAdmin, generarTurnosAutomaticos);

// Rutas para voluntarios (requieren autenticación)
router.post('/:id/ocupar', authMiddleware, ocuparTurno);
router.post('/:id/liberar', authMiddleware, liberarTurno);

export default router;
