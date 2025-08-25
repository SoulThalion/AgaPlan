import { Router } from 'express';
import { disponibilidadController } from '../controllers/disponibilidadController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/roleMiddleware';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Obtener todas las disponibilidades
router.get('/', disponibilidadController.getAllDisponibilidades);

// Obtener disponibilidades por usuario
router.get('/usuario/:usuarioId', disponibilidadController.getDisponibilidadesByUsuario);

// Rutas protegidas (solo admin o superior)
router.post('/', requireAdmin, disponibilidadController.createDisponibilidad);
router.put('/:id', requireAdmin, disponibilidadController.updateDisponibilidad);
router.delete('/:id', requireAdmin, disponibilidadController.deleteDisponibilidad);

export default router;

