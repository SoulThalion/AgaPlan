import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import Equipo from '../models/Equipo';
import Usuario from '../models/Usuario';

// Obtener todos los equipos (solo superAdmin)
export const getAllEquipos = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Verificar que sea superAdmin
    if (req.user?.rol !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        message: 'Solo los super administradores pueden ver todos los equipos'
      });
    }

    const equipos = await Equipo.findAll({
      order: [['nombre', 'ASC']],
      include: [
        {
          model: Usuario,
          as: 'usuarios',
          attributes: ['id', 'nombre', 'email', 'rol'],
          required: false
        }
      ]
    });

    res.json({
      success: true,
      data: equipos,
      message: 'Equipos obtenidos correctamente'
    });
  } catch (error) {
    console.error('Error al obtener equipos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener un equipo por ID (solo superAdmin)
export const getEquipoById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Verificar que sea superAdmin
    if (req.user?.rol !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        message: 'Solo los super administradores pueden ver equipos'
      });
    }

    const { id } = req.params;
    const equipo = await Equipo.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: 'usuarios',
          attributes: ['id', 'nombre', 'email', 'rol'],
          required: false
        }
      ]
    });

    if (!equipo) {
      return res.status(404).json({
        success: false,
        message: 'Equipo no encontrado'
      });
    }

    res.json({
      success: true,
      data: equipo,
      message: 'Equipo obtenido correctamente'
    });
  } catch (error) {
    console.error('Error al obtener equipo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Crear un nuevo equipo (solo superAdmin)
export const createEquipo = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Verificar que sea superAdmin
    if (req.user?.rol !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        message: 'Solo los super administradores pueden crear equipos'
      });
    }

    const { nombre, descripcion } = req.body;

    // Validaciones
    if (!nombre || !nombre.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del equipo es requerido'
      });
    }

    if (nombre.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del equipo debe tener al menos 2 caracteres'
      });
    }

    // Verificar si ya existe un equipo con ese nombre
    const existingEquipo = await Equipo.findOne({ 
      where: { nombre: nombre.trim() } 
    });
    
    if (existingEquipo) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un equipo con ese nombre'
      });
    }

    const nuevoEquipo = await Equipo.create({
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || null,
      activo: true
    });

    res.status(201).json({
      success: true,
      data: nuevoEquipo,
      message: 'Equipo creado exitosamente'
    });
  } catch (error) {
    console.error('Error al crear equipo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar un equipo (solo superAdmin)
export const updateEquipo = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Verificar que sea superAdmin
    if (req.user?.rol !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        message: 'Solo los super administradores pueden actualizar equipos'
      });
    }

    const { id } = req.params;
    const { nombre, descripcion, activo } = req.body;

    const equipo = await Equipo.findByPk(id);
    if (!equipo) {
      return res.status(404).json({
        success: false,
        message: 'Equipo no encontrado'
      });
    }

    // Validaciones
    if (nombre !== undefined) {
      if (!nombre || !nombre.trim()) {
        return res.status(400).json({
          success: false,
          message: 'El nombre del equipo es requerido'
        });
      }

      if (nombre.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'El nombre del equipo debe tener al menos 2 caracteres'
        });
      }

      // Verificar si ya existe otro equipo con ese nombre
      const existingEquipo = await Equipo.findOne({ 
        where: { 
          nombre: nombre.trim(),
          id: { [require('sequelize').Op.ne]: id }
        } 
      });
      
      if (existingEquipo) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe otro equipo con ese nombre'
        });
      }
    }

    // Actualizar el equipo
    await equipo.update({
      nombre: nombre?.trim() || equipo.nombre,
      descripcion: descripcion !== undefined ? (descripcion?.trim() || null) : equipo.descripcion,
      activo: activo !== undefined ? activo : equipo.activo
    });

    res.json({
      success: true,
      data: equipo,
      message: 'Equipo actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar equipo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar un equipo (solo superAdmin)
export const deleteEquipo = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Verificar que sea superAdmin
    if (req.user?.rol !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        message: 'Solo los super administradores pueden eliminar equipos'
      });
    }

    const { id } = req.params;

    const equipo = await Equipo.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: 'usuarios',
          required: false
        }
      ]
    });

    if (!equipo) {
      return res.status(404).json({
        success: false,
        message: 'Equipo no encontrado'
      });
    }

    // Verificar si el equipo tiene usuarios asignados
    if ((equipo as any).usuarios && (equipo as any).usuarios.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar un equipo que tiene usuarios asignados. Primero mueve los usuarios a otro equipo.'
      });
    }

    // No permitir eliminar el equipo principal (ID 1)
    if (equipo.id === 1) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar el equipo principal'
      });
    }

    await equipo.destroy();

    res.json({
      success: true,
      message: 'Equipo eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar equipo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Asignar usuario a equipo (solo superAdmin)
export const assignUsuarioToEquipo = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Verificar que sea superAdmin
    if (req.user?.rol !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        message: 'Solo los super administradores pueden asignar usuarios a equipos'
      });
    }

    const { usuarioId, equipoId } = req.body;

    // Validaciones
    if (!usuarioId || !equipoId) {
      return res.status(400).json({
        success: false,
        message: 'Usuario ID y Equipo ID son requeridos'
      });
    }

    // Verificar que el usuario existe
    const usuario = await Usuario.findByPk(usuarioId);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar que el equipo existe
    const equipo = await Equipo.findByPk(equipoId);
    if (!equipo) {
      return res.status(404).json({
        success: false,
        message: 'Equipo no encontrado'
      });
    }

    // Actualizar el usuario
    await usuario.update({ equipoId });

    res.json({
      success: true,
      message: `Usuario ${usuario.nombre} asignado al equipo ${equipo.nombre} exitosamente`
    });
  } catch (error) {
    console.error('Error al asignar usuario a equipo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas de equipos (solo superAdmin)
export const getEquipoStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Verificar que sea superAdmin
    if (req.user?.rol !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        message: 'Solo los super administradores pueden ver estadísticas de equipos'
      });
    }

    const equipos = await Equipo.findAll({
      include: [
        {
          model: Usuario,
          as: 'usuarios',
          attributes: ['id', 'rol'],
          required: false
        }
      ]
    });

    const stats = equipos.map(equipo => {
      const usuarios = (equipo as any).usuarios || [];
      const admins = usuarios.filter((u: any) => u.rol === 'admin').length;
      const voluntarios = usuarios.filter((u: any) => u.rol === 'voluntario').length;
      const grupos = usuarios.filter((u: any) => u.rol === 'grupo').length;

      return {
        id: equipo.id,
        nombre: equipo.nombre,
        activo: equipo.activo,
        totalUsuarios: usuarios.length,
        admins,
        voluntarios,
        grupos
      };
    });

    res.json({
      success: true,
      data: stats,
      message: 'Estadísticas de equipos obtenidas correctamente'
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de equipos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
