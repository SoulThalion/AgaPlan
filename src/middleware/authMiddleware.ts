import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, JwtPayload } from '../types/auth';
import Usuario from '../models/Usuario';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_super_segura_cambiala_en_produccion';

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    const token = authHeader.substring(7); // Remover 'Bearer ' del inicio
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      
      // Verificar que el usuario aún existe en la base de datos
      const usuario = await Usuario.findByPk(decoded.id, {
        attributes: ['id', 'nombre', 'email', 'rol']
      });
      
      if (!usuario) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      
      // Añadir información del usuario a la request
      req.user = {
        id: usuario.id,
        email: usuario.email || '', // Proporcionar valor por defecto si email es undefined
        nombre: usuario.nombre,
        rol: usuario.rol
      };
      
      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
