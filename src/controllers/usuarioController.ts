import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import Usuario from '../models/Usuario';
import { Op } from 'sequelize';
import Turno from '../models/Turno';
import { buildEquipoWhereClause } from '../middleware/equipoMiddleware';

export const getAllUsuarios = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const usuarios = await Usuario.findAll({
      where: buildEquipoWhereClause(req),
      attributes: ['id', 'nombre', 'email', 'sexo', 'cargo', 'cargoId', 'rol', 'participacionMensual', 'tieneCoche', 'siempreCon', 'nuncaCon', 'createdAt'],
      include: [
        {
          model: Usuario,
          as: 'siempreConUsuario',
          attributes: ['id', 'nombre', 'email'],
          required: false
        },
        {
          model: Usuario,
          as: 'nuncaConUsuario',
          attributes: ['id', 'nombre', 'email'],
          required: false
        },
        {
          model: require('../models/Cargo').default,
          as: 'cargoInfo',
          attributes: ['id', 'nombre', 'descripcion', 'prioridad', 'activo'],
          required: false
        }
      ],
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

export const getUsuarioById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findOne({
      where: {
        id,
        ...buildEquipoWhereClause(req)
      },
      attributes: ['id', 'nombre', 'email', 'sexo', 'cargo', 'cargoId', 'rol', 'participacionMensual', 'tieneCoche', 'siempreCon', 'nuncaCon', 'createdAt', 'updatedAt'],
      include: [
        {
          model: Usuario,
          as: 'siempreConUsuario',
          attributes: ['id', 'nombre', 'email'],
          required: false
        },
        {
          model: Usuario,
          as: 'nuncaConUsuario',
          attributes: ['id', 'nombre', 'email'],
          required: false
        },
        {
          model: require('../models/Cargo').default,
          as: 'cargoInfo',
          attributes: ['id', 'nombre', 'descripcion', 'prioridad', 'activo'],
          required: false
        }
      ]
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

export const createUsuario = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { nombre, email, contraseña, sexo, cargo, cargoId, rol, participacionMensual, tieneCoche, siempreCon, nuncaCon, equipoId } = req.body;

    // Validaciones básicas - solo nombre, sexo y cargo son obligatorios
    if (!nombre || !sexo || !cargo) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, sexo y cargo son campos obligatorios'
      });
    }



    // Validación: si se proporciona contraseña, también debe proporcionarse email
    if (contraseña && !email) {
      return res.status(400).json({
        success: false,
        message: 'Si proporcionas una contraseña, también debes proporcionar un email'
      });
    }

    // Validación de contraseña solo si se proporciona
    if (contraseña && contraseña.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Verificar si el email ya existe (solo si se proporciona email)
    if (email) {
      const existingUser = await Usuario.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está registrado'
        });
      }
    }

    // Determinar el equipoId para el nuevo usuario
    let usuarioEquipoId: number;
    if (req.user?.rol === 'superAdmin' && equipoId) {
      // SuperAdmin puede elegir el equipo
      usuarioEquipoId = equipoId;
    } else if (req.user?.equipoId) {
      // Admin usa su propio equipo
      usuarioEquipoId = req.user.equipoId;
    } else {
      // Fallback al equipo principal (ID: 1)
      usuarioEquipoId = 1;
    }

    // Crear el usuario (el hash de contraseña se maneja en el modelo)
    const newUsuario = await Usuario.create({
      nombre,
      email: email || null, // null si no se proporciona
      contraseña: contraseña || null, // null si no se proporciona
      sexo,
      cargo,
      cargoId: cargoId || undefined,
      rol: rol || 'voluntario',
      participacionMensual: participacionMensual || undefined,
      tieneCoche: tieneCoche || false,
      siempreCon: siempreCon || undefined,
      nuncaCon: nuncaCon || undefined,
      equipoId: usuarioEquipoId
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
    console.log('=== INICIO updateUsuario ===');
    console.log('ID del usuario:', req.params.id);
    console.log('Datos recibidos:', JSON.stringify(req.body, null, 2));
    console.log('Usuario actual:', req.user);
    
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
      const allowedFields = ['nombre', 'cargo', 'cargoId', 'participacionMensual', 'tieneCoche', 'siempreCon', 'nuncaCon'];
      const filteredData: any = {};
      
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          filteredData[field] = updateData[field];
        }
      });
      
      updateData = filteredData;
    }

    // Si no se está cambiando la contraseña, eliminarla del updateData
    if (!updateData.contraseña || updateData.contraseña === '') {
      delete updateData.contraseña;
    }

    // Si el email está vacío, convertirlo a null para evitar errores de validación
    if (updateData.email === '') {
      updateData.email = null;
    }

    // Validación: si se proporciona contraseña, también debe proporcionarse email
    if (updateData.contraseña && !updateData.email) {
      return res.status(400).json({
        success: false,
        message: 'Si proporcionas una contraseña, también debes proporcionar un email'
      });
    }

    // Validación de contraseña solo si se proporciona
    if (updateData.contraseña && updateData.contraseña.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Verificar si el email ya existe (solo si se está cambiando)
    if (updateData.email && updateData.email !== usuario.email) {
      const existingUser = await Usuario.findOne({ where: { email: updateData.email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está registrado'
        });
      }
    }

    // Actualizar el usuario
    console.log('Datos finales para actualizar:', JSON.stringify(updateData, null, 2));
    await usuario.update(updateData);
    console.log('Usuario actualizado exitosamente');

    // Excluir la contraseña de la respuesta
    const { contraseña: _, ...usuarioActualizado } = usuario.toJSON();

    console.log('=== FIN updateUsuario - ÉXITO ===');
    res.status(200).json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: usuarioActualizado
    });
  } catch (error: any) {
    console.error('=== ERROR en updateUsuario ===');
    console.error('Error completo:', error);
    console.error('Stack trace:', error?.stack);
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

// Función para obtener la participación mensual actual de un usuario
export const getParticipacionMensualActual = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { mes, año } = req.query;
    
    // Obtener el usuario
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Determinar el mes y año a consultar
    let mesAConsultar: number;
    let añoAConsultar: number;

    if (mes !== undefined && año !== undefined) {
      // Si se proporcionan parámetros, validarlos y usarlos
      const mesNum = parseInt(mes as string);
      const añoNum = parseInt(año as string);
      
      if (isNaN(mesNum) || mesNum < 0 || mesNum > 11) {
        return res.status(400).json({ 
          message: 'El mes debe ser un número entre 0 y 11 (0=enero, 11=diciembre)' 
        });
      }
      
      if (isNaN(añoNum) || añoNum < 1900 || añoNum > 2100) {
        return res.status(400).json({ 
          message: 'El año debe ser un número válido entre 1900 y 2100' 
        });
      }
      
      mesAConsultar = mesNum;
      añoAConsultar = añoNum;
    } else {
      // Si no se proporcionan parámetros, usar el mes y año actuales
      const fechaActual = new Date();
      mesAConsultar = fechaActual.getMonth();
      añoAConsultar = fechaActual.getFullYear();
    }

    // Obtener todos los turnos del usuario en el mes especificado
    const turnosDelMes = await Turno.findAll({
      include: [
        {
          model: Usuario,
          as: 'usuarios',
          where: { id: id }
        }
      ],
      where: {
        fecha: {
          [Op.and]: [
            { [Op.gte]: new Date(añoAConsultar, mesAConsultar, 1) },
            { [Op.lt]: new Date(añoAConsultar, mesAConsultar + 1, 1) }
          ]
        }
      }
    });

    const turnosOcupados = turnosDelMes.length;
    const limiteMensual = usuario.participacionMensual;

    res.json({
      usuarioId: id,
      nombre: usuario.nombre,
      mes: mesAConsultar,
      año: añoAConsultar,
      turnosOcupados,
      limiteMensual,
      disponible: limiteMensual === null || limiteMensual === undefined || turnosOcupados < (limiteMensual || 0),
      porcentaje: limiteMensual ? Math.round((turnosOcupados / limiteMensual) * 100) : null
    });

  } catch (error) {
    console.error('Error al obtener participación mensual actual:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
