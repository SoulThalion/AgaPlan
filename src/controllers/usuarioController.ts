import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import Usuario from '../models/Usuario';

export const getAllUsuarios = async (req: Request, res: Response) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'nombre', 'email', 'sexo', 'cargo', 'rol', 'participacionMensual', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: usuarios
    });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const getUsuarioById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findByPk(id, {
      attributes: ['id', 'nombre', 'email', 'sexo', 'cargo', 'rol', 'participacionMensual', 'createdAt', 'updatedAt']
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: usuario
    });
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const createUsuario = async (req: Request, res: Response) => {
  try {
    const { nombre, email, contraseña, sexo, cargo, rol, participacionMensual } = req.body;

    // Validaciones básicas
    if (!nombre || !email || !contraseña || !sexo || !cargo) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }

    if (contraseña.length < 6) {
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

    // Crear el usuario (el hash de contraseña se maneja en el modelo)
    const newUsuario = await Usuario.create({
      nombre,
      email,
      contraseña,
      sexo,
      cargo,
      rol: rol || 'voluntario',
      participacionMensual: participacionMensual || undefined
    });

    // Excluir la contraseña de la respuesta
    const { contraseña: _, ...usuarioSinContraseña } = newUsuario.toJSON();

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: usuarioSinContraseña
    });
  } catch (error) {
    console.error('Error creando usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const updateUsuario = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    let updateData = req.body;
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    // Buscar el usuario a actualizar
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar permisos: solo puede actualizar su propio perfil o ser admin/superAdmin
    if (currentUser.id !== parseInt(id) && currentUser.rol === 'voluntario') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para actualizar este usuario'
      });
    }

    // Si es admin, no puede cambiar roles a superAdmin
    if (currentUser.rol === 'admin' && updateData.rol === 'superAdmin') {
      return res.status(403).json({
        success: false,
        message: 'No puedes asignar el rol superAdmin'
      });
    }

    // Si es voluntario, solo puede actualizar ciertos campos de su propio perfil
    if (currentUser.rol === 'voluntario' && currentUser.id === parseInt(id)) {
      const allowedFields = ['nombre', 'cargo', 'participacionMensual'];
      const filteredData: any = {};
      
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          filteredData[field] = updateData[field];
        }
      });
      
      updateData = filteredData;
    }

    // Actualizar el usuario
    await usuario.update(updateData);

    // Excluir la contraseña de la respuesta
    const { contraseña: _, ...usuarioActualizado } = usuario.toJSON();

    res.status(200).json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: usuarioActualizado
    });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const deleteUsuario = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    // Buscar el usuario a eliminar
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar permisos: solo superAdmin puede eliminar usuarios
    if (currentUser.rol !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        message: 'Solo los superAdmin pueden eliminar usuarios'
      });
    }

    // No permitir que un superAdmin se elimine a sí mismo
    if (currentUser.id === parseInt(id)) {
      return res.status(400).json({
        success: false,
        message: 'No puedes eliminar tu propia cuenta'
      });
    }

    // Eliminar el usuario
    await usuario.destroy();

    res.status(200).json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const configurarParticipacionMensual = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { participacionMensual } = req.body;
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    // Validar que participacionMensual sea un número válido
    if (participacionMensual !== undefined && (participacionMensual < 0 || !Number.isInteger(participacionMensual))) {
      return res.status(400).json({
        success: false,
        message: 'La participación mensual debe ser un número entero mayor o igual a 0'
      });
    }

    // Buscar el usuario
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar permisos: solo puede configurar su propio perfil o ser admin/superAdmin
    if (currentUser.id !== parseInt(id) && currentUser.rol === 'voluntario') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para configurar este usuario'
      });
    }

    // Solo los voluntarios pueden tener participación mensual
    if (usuario.rol !== 'voluntario') {
      return res.status(400).json({
        success: false,
        message: 'Solo los voluntarios pueden configurar participación mensual'
      });
    }

    // Actualizar la participación mensual
    await usuario.update({ participacionMensual });

    // Excluir la contraseña de la respuesta
    const { contraseña: _, ...usuarioActualizado } = usuario.toJSON();

    res.status(200).json({
      success: true,
      message: 'Participación mensual configurada exitosamente',
      data: usuarioActualizado
    });
  } catch (error) {
    console.error('Error configurando participación mensual:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
