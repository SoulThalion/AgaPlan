import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware';
import {
  getAllEquipos,
  getEquipoById,
  createEquipo,
  updateEquipo,
  deleteEquipo,
  assignUsuarioToEquipo,
  getEquipoStats
} from '../controllers/equipoController';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas para gestión de equipos (solo superAdmin)
router.get('/', requireRole(['superAdmin']), getAllEquipos);
router.get('/stats', requireRole(['superAdmin']), getEquipoStats);
router.get('/:id', requireRole(['superAdmin']), getEquipoById);
router.post('/', requireRole(['superAdmin']), createEquipo);
router.put('/:id', requireRole(['superAdmin']), updateEquipo);
router.delete('/:id', requireRole(['superAdmin']), deleteEquipo);

// Ruta para asignar usuario a equipo
router.post('/assign-user', requireRole(['superAdmin']), assignUsuarioToEquipo);

export default router;
