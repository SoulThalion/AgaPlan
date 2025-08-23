import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RegisterRequest, LoginRequest, AuthResponse, JwtPayload, AuthenticatedRequest } from '../types/auth';
import Usuario from '../models/Usuario';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_super_segura_cambiala_en_produccion';
const JWT_EXPIRES_IN = '7d';

export const register = async (req: Request, res: Response) => {
  try {
    console.log('📝 Datos recibidos en registro:', JSON.stringify(req.body, null, 2));
    
    // Extraer datos sin tipado estricto para debug
    const { nombre, email, contraseña, sexo, cargo } = req.body;
    
    // Manejar el problema de encoding del campo contraseña
    const password = contraseña || req.body.password || req.body.contrasena;
    
    console.log('📝 Valores extraídos:');
    console.log('  - nombre:', nombre);
    console.log('  - email:', email);
    console.log('  - contraseña original:', contraseña ? '[HIDDEN]' : 'undefined');
    console.log('  - contraseña corregida:', password ? '[HIDDEN]' : 'undefined');
    console.log('  - sexo:', sexo);
    console.log('  - cargo:', cargo);

    // Validaciones básicas
    if (!nombre || !email || !password || !sexo) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, email, contraseña y sexo son requeridos'
      });
    }

    // Validar que cargo no sea undefined (puede ser string vacío)
    if (cargo === undefined) {
      return res.status(400).json({
        success: false,
        message: 'El campo cargo es requerido'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Verificar si el email ya existe
    const existingUser = await Usuario.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Determinar el rol del usuario
    let rol: 'voluntario' | 'admin' | 'superAdmin' | 'grupo' = 'voluntario';
    
    // Verificar si es el primer usuario (será superAdmin)
    const userCount = await Usuario.count();
    if (userCount === 0) {
      rol = 'superAdmin';
    }

    // Crear el usuario (el hash de contraseña se maneja en el modelo)
    const newUser = await Usuario.create({
      nombre,
      email,
      contraseña: password, // Usar la variable corregida
      sexo,
      cargo,
      rol
    });

    // Generar token JWT (sin la propiedad exp manual)
    const tokenPayload: Omit<JwtPayload, 'exp' | 'iat'> = {
      id: newUser.id,
      email: newUser.email!, // Usar ! porque sabemos que tiene email en este contexto
      rol: newUser.rol
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Respuesta exitosa
    const response: AuthResponse = {
      success: true,
      message: `Usuario registrado exitosamente como ${rol}`,
      token,
      user: {
        id: newUser.id,
        nombre: newUser.nombre,
        email: newUser.email!, // Usar ! porque sabemos que tiene email en este contexto
        rol: newUser.rol
      }
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, contraseña }: LoginRequest = req.body;

    // Validaciones básicas
    if (!email || !contraseña) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    // Buscar el usuario por email
    const user = await Usuario.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar que el usuario tenga contraseña (no es un usuario sin acceso)
    if (!user.contraseña) {
      return res.status(401).json({
        success: false,
        message: 'Este usuario no tiene acceso a la aplicación. Contacta al administrador.'
      });
    }

    // Verificar la contraseña
    const isValidPassword = await user.comparePassword(contraseña);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar token JWT (sin la propiedad exp manual)
    const tokenPayload: Omit<JwtPayload, 'exp' | 'iat'> = {
      id: user.id,
      email: user.email!, // Usar ! porque sabemos que tiene email en este contexto
      rol: user.rol
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Respuesta exitosa
    const response: AuthResponse = {
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email!, // Usar ! porque sabemos que tiene email en este contexto
        rol: user.rol
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // El usuario ya está disponible en req.user gracias al middleware de autenticación
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email || null, // Manejar caso donde email puede ser undefined
        rol: user.rol
      }
    });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
