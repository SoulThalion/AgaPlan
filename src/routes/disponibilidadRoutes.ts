import { Router } from 'express';
import { disponibilidadController } from '../controllers/disponibilidadController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Obtener todas las disponibilidades
router.get('/', disponibilidadController.getAllDisponibilidades);

// Obtener disponibilidades por usuario
router.get('/usuario/:usuarioId', disponibilidadController.getDisponibilidadesByUsuario);

// Crear nueva disponibilidad
router.post('/', disponibilidadController.createDisponibilidad);

// Actualizar disponibilidad
router.put('/:id', disponibilidadController.updateDisponibilidad);

// Eliminar disponibilidad
router.delete('/:id', disponibilidadController.deleteDisponibilidad);

export default router;

