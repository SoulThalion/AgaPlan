import { Router } from 'express';
import testRoutes from './testRoutes';
import usuarioRoutes from './usuarioRoutes';
import authRoutes from './authRoutes';
import lugarRoutes from './lugarRoutes';
import turnoRoutes from './turnoRoutes';
import disponibilidadRoutes from './disponibilidadRoutes';

const router = Router();

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de la API
router.use('/test', testRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/lugares', lugarRoutes);
router.use('/turnos', turnoRoutes);
router.use('/disponibilidades', disponibilidadRoutes);

export default router;
