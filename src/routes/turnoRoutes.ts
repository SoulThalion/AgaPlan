import { Router } from 'express';
import { 
  getAllTurnos, 
  getTurnoById, 
  createTurno, 
  updateTurno, 
  deleteTurno,
  ocuparTurno,
  liberarTurno,
  asignarUsuarioATurno,
  generarTurnosAutomaticos,
  createTurnosRecurrentes,
  getTurnos,
  limpiarTodosLosUsuariosDeTurnos
} from '../controllers/turnoController';
import { requireAdmin } from '../middleware/roleMiddleware';
import { authMiddleware } from '../middleware/authMiddleware';
import { filterByEquipo } from '../middleware';

const router = Router();

// Rutas públicas (solo lectura)
router.get('/', getTurnos);

// Ruta para limpiar todos los usuarios de todos los turnos (admin o superior)
router.delete('/limpiar-usuarios', authMiddleware, filterByEquipo, requireAdmin, limpiarTodosLosUsuariosDeTurnos);

// Ruta para generar turnos automáticos (admin o superior)
router.post('/generar-automaticos', authMiddleware, filterByEquipo, requireAdmin, generarTurnosAutomaticos);

// Rutas con parámetros dinámicos (DEBEN IR DESPUÉS de las rutas específicas)
router.get('/:id', getTurnoById);
router.post('/', authMiddleware, filterByEquipo, requireAdmin, createTurno);
router.post('/recurrentes', authMiddleware, filterByEquipo, requireAdmin, createTurnosRecurrentes);
router.put('/:id', authMiddleware, filterByEquipo, requireAdmin, updateTurno);
router.delete('/:id', authMiddleware, filterByEquipo, requireAdmin, deleteTurno);

// Rutas para voluntarios (requieren autenticación)
router.post('/:id/ocupar', authMiddleware, filterByEquipo, ocuparTurno);
router.post('/:id/liberar', authMiddleware, filterByEquipo, liberarTurno);

// Ruta para asignar usuarios a turnos (admin o superior)
router.post('/:id/asignar-usuario', authMiddleware, filterByEquipo, requireAdmin, asignarUsuarioATurno);

export default router;
