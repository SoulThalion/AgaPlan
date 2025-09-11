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

    // Si es superAdmin, verificar si hay un equipo específico en el header
    if (req.user?.rol === 'superAdmin') {
      const currentEquipoId = req.headers['x-current-equipo-id'];
      
      if (currentEquipoId) {
        equipoId = parseInt(currentEquipoId as string);
        // NO modificar req.user.equipoId para evitar interferir con operaciones de creación/edición
        // En su lugar, almacenar el equipoId temporal en req.query
      } else {
        // Si no hay header, no aplicar filtro (ver todos los equipos)
        return next();
      }
    } else {
      // Si no es superAdmin, usar su equipo
      equipoId = req.user?.equipoId || 1;
    }

    // Agregar el filtro de equipo a la query
    if (!req.query) {
      req.query = {};
    }

    // Solo agregar equipoId a la query si no existe ya (para no sobrescribir el del frontend)
    // Verificar si equipoId está presente en la query (incluso si es null/undefined)
    if (!req.query.hasOwnProperty('equipoId')) {
      req.query.equipoId = equipoId.toString();
    }

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
  console.log('buildEquipoWhereClause - req.query.equipoId:', req.query.equipoId);
  
  // Obtener el equipoId desde req.query (establecido por el middleware) o usar el original del usuario
  const equipoId = req.query.equipoId ? parseInt(req.query.equipoId as string) : (req.user?.equipoId || 1);
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
