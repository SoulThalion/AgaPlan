import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth';

/**
 * Middleware para filtrar datos por equipo
 * Asegura que los usuarios solo accedan a datos de su equipo
 * Los superAdmin pueden ver todos los datos
 */
export const filterByEquipo = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    let equipoId: number;

    console.log('filterByEquipo - req.user.rol:', req.user?.rol);
    console.log('filterByEquipo - req.user.equipoId:', req.user?.equipoId);
    console.log('filterByEquipo - headers:', req.headers);

    // Si es superAdmin, verificar si hay un equipo específico en el header
    if (req.user?.rol === 'superAdmin') {
      const currentEquipoId = req.headers['x-current-equipo-id'];
      console.log('filterByEquipo - currentEquipoId from header:', currentEquipoId);
      
      if (currentEquipoId) {
        equipoId = parseInt(currentEquipoId as string);
        console.log('filterByEquipo - parsed equipoId:', equipoId);
        // IMPORTANTE: Modificar temporalmente el equipoId del usuario para que los controladores lo usen
        req.user.equipoId = equipoId;
        console.log('filterByEquipo - modified req.user.equipoId to:', req.user.equipoId);
      } else {
        console.log('filterByEquipo - no header found, skipping filter');
        // Si no hay header, no aplicar filtro (ver todos los equipos)
        return next();
      }
    } else {
      // Si no es superAdmin, usar su equipo
      equipoId = req.user?.equipoId || 1;
      console.log('filterByEquipo - using user equipoId:', equipoId);
    }

    // Agregar el filtro de equipo a la query
    if (!req.query) {
      req.query = {};
    }

    // Agregar equipoId a la query para que los controladores lo usen
    req.query.equipoId = equipoId.toString();

    next();
  } catch (error) {
    console.error('Error en middleware de equipo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Middleware para verificar que el usuario pertenece al equipo del recurso
 * Útil para operaciones específicas donde se necesita verificar pertenencia
 */
export const verifyEquipoAccess = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Si es superAdmin, permitir acceso
    if (req.user?.rol === 'superAdmin') {
      return next();
    }

    const userEquipoId = req.user?.equipoId || 1;
    const resourceEquipoId = req.params.equipoId || req.body.equipoId;

    // Si no se especifica equipoId en el recurso, asumir que es del equipo del usuario
    if (!resourceEquipoId) {
      return next();
    }

    // Verificar que el usuario pertenece al equipo del recurso
    if (parseInt(resourceEquipoId) !== userEquipoId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este recurso'
      });
    }

    next();
  } catch (error) {
    console.error('Error en middleware de verificación de equipo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Helper function para construir where clause con filtro de equipo
 * Útil en controladores para agregar automáticamente el filtro de equipo
 */
export const buildEquipoWhereClause = (req: AuthenticatedRequest, additionalWhere: any = {}) => {
  console.log('buildEquipoWhereClause - req.user.rol:', req.user?.rol);
  console.log('buildEquipoWhereClause - req.user.equipoId:', req.user?.equipoId);
  
  // Obtener el equipoId (puede ser modificado por el middleware para superAdmin)
  const equipoId = req.user?.equipoId || 1;
  console.log('buildEquipoWhereClause - using equipoId:', equipoId);
  
  // Siempre aplicar filtro de equipo (incluso para superAdmin con equipo seleccionado)
  return {
    ...additionalWhere,
    equipoId
  };
};

/**
 * Middleware específico para rutas de equipos
 * Solo permite acceso a superAdmin
 */
export const requireSuperAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user?.rol !== 'superAdmin') {
    return res.status(403).json({
      success: false,
      message: 'Solo los super administradores pueden acceder a esta funcionalidad'
    });
  }
  next();
};
