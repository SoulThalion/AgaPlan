import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { authMiddleware } from './authMiddleware';
import { requireAdmin, requireSuperAdmin, requireVoluntario } from './roleMiddleware';

// Exportar funciones de autenticación y roles para uso en las rutas
export const authenticateToken = authMiddleware;
export const requireRole = (roles: string[]) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (roles.includes('admin')) {
      return requireAdmin(req, res, next);
    } else if (roles.includes('superAdmin')) {
      return requireSuperAdmin(req, res, next);
    } else if (roles.includes('voluntario')) {
      return requireVoluntario(req, res, next);
    }
    // Por defecto, requerir admin
    return requireAdmin(req, res, next);
  };
};

export const setupMiddleware = (app: express.Application) => {
  // CORS
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://tu-dominio.com'] 
      : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
  }));

  // Body parser
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Logger con Morgan
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // Middleware para parsear JSON
  app.use(express.json());
};
