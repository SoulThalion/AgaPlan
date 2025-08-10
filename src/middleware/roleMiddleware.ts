import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth';

type Role = 'voluntario' | 'admin' | 'superAdmin';

const roleHierarchy: Record<Role, number> = {
  voluntario: 1,
  admin: 2,
  superAdmin: 3
};

export const roleMiddleware = (requiredRole: Role) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const userRoleLevel = roleHierarchy[req.user.rol];
      const requiredRoleLevel = roleHierarchy[requiredRole];

      if (userRoleLevel < requiredRoleLevel) {
        return res.status(403).json({
          success: false,
          message: `Acceso denegado. Se requiere rol: ${requiredRole}`
        });
      }

      next();
    } catch (error) {
      console.error('Error en middleware de roles:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
};

// Middlewares específicos para cada rol
export const requireVoluntario = roleMiddleware('voluntario');
export const requireAdmin = roleMiddleware('admin');
export const requireSuperAdmin = roleMiddleware('superAdmin');

// Middleware para verificar si el usuario es el propietario del recurso o tiene rol superior
export const requireOwnershipOrRole = (requiredRole: Role) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const userRoleLevel = roleHierarchy[req.user.rol];
      const requiredRoleLevel = roleHierarchy[requiredRole];

      // Si tiene el rol requerido o superior, permitir acceso
      if (userRoleLevel >= requiredRoleLevel) {
        return next();
      }

      // Si no tiene el rol, verificar si es el propietario del recurso
      const resourceUserId = parseInt(req.params.userId || req.params.id);
      
      if (req.user.id === resourceUserId) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. No tienes permisos para este recurso'
      });
    } catch (error) {
      console.error('Error en middleware de ownership:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
};
