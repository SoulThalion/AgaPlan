import { Router } from 'express';
import testRoutes from './testRoutes';
import usuarioRoutes from './usuarioRoutes';
import authRoutes from './authRoutes';
import lugarRoutes from './lugarRoutes';
import turnoRoutes from './turnoRoutes';
import disponibilidadRoutes from './disponibilidadRoutes';
import cargoRoutes from './cargoRoutes';
import exhibidorRoutes from './exhibidorRoutes';
import userDisponibilidadConfigRoutes from './userDisponibilidadConfigRoutes';
import notificationRoutes from './notificationRoutes';
import equipoRoutes from './equipoRoutes';

const router = Router();

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de la API
router.use('/test', testRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/lugares', lugarRoutes);
router.use('/turnos', turnoRoutes);
router.use('/disponibilidades', disponibilidadRoutes);
router.use('/cargos', cargoRoutes);
router.use('/exhibidores', exhibidorRoutes);
router.use('/user-disponibilidad-config', userDisponibilidadConfigRoutes);
router.use('/notifications', notificationRoutes);
router.use('/equipos', equipoRoutes);

export default router;
