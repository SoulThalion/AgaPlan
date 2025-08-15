import { Request, Response } from 'express';
import UserDisponibilidadConfig from '../models/UserDisponibilidadConfig';
import Usuario from '../models/Usuario';

// Obtener todas las configuraciones de disponibilidad de un usuario
export const getConfiguracionesByUsuario = async (req: Request, res: Response) => {
  try {
    const { usuarioId } = req.params;
    const { mes } = req.query;

    const whereClause: any = { usuarioId: parseInt(usuarioId) };
    if (mes) {
      whereClause.mes = mes;
    }

    const configuraciones = await UserDisponibilidadConfig.findAll({
      where: whereClause,
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'email'],
        },
      ],
      order: [['mes', 'DESC'], ['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: configuraciones,
    });
  } catch (error) {
    console.error('Error al obtener configuraciones de disponibilidad:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};

// Obtener una configuración específica por ID
export const getConfiguracionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const configuracion = await UserDisponibilidadConfig.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'email'],
        },
      ],
    });

    if (!configuracion) {
      return res.status(404).json({
        success: false,
        message: 'Configuración de disponibilidad no encontrada',
      });
    }

    res.json({
      success: true,
      data: configuracion,
    });
  } catch (error) {
    console.error('Error al obtener configuración de disponibilidad:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};

// Crear una nueva configuración de disponibilidad
export const createConfiguracion = async (req: Request, res: Response) => {
  try {
    const { usuarioId, mes, tipo_disponibilidad, configuracion } = req.body;

    // Validaciones
    if (!usuarioId || !mes || !tipo_disponibilidad || !configuracion) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos',
      });
    }

    // Verificar que el usuario existe
    const usuario = await Usuario.findByPk(usuarioId);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Verificar formato del mes (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(mes)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de mes inválido. Debe ser YYYY-MM',
      });
    }

    // Verificar que no exista una configuración duplicada solo para tipos que no permiten múltiples
    // Los tipos 'todasTardes', 'todasMananas' solo permiten una configuración por mes
    // Los tipos 'diasSemana', 'fechaConcreta', 'noDisponibleFecha' permiten múltiples configuraciones
    if (tipo_disponibilidad === 'todasTardes' || tipo_disponibilidad === 'todasMananas') {
      const existingConfig = await UserDisponibilidadConfig.findOne({
        where: {
          usuarioId,
          mes,
          tipo_disponibilidad,
        },
      });

      if (existingConfig) {
        return res.status(409).json({
          success: false,
          message: `Ya existe una configuración de '${tipo_disponibilidad}' para este usuario y mes`,
        });
      }
    }

    // Crear la configuración
    const nuevaConfiguracion = await UserDisponibilidadConfig.create({
      usuarioId,
      mes,
      tipo_disponibilidad,
      configuracion,
      activo: true,
    });

    res.status(201).json({
      success: true,
      data: nuevaConfiguracion,
      message: 'Configuración de disponibilidad creada exitosamente',
    });
  } catch (error) {
    console.error('Error al crear configuración de disponibilidad:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};

// Actualizar una configuración existente
export const updateConfiguracion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { configuracion, activo } = req.body;

    const configuracionExistente = await UserDisponibilidadConfig.findByPk(id);
    if (!configuracionExistente) {
      return res.status(404).json({
        success: false,
        message: 'Configuración de disponibilidad no encontrada',
      });
    }

    // Actualizar solo los campos permitidos
    const updateData: any = {};
    if (configuracion !== undefined) {
      updateData.configuracion = configuracion;
    }
    if (activo !== undefined) {
      updateData.activo = activo;
    }

    await configuracionExistente.update(updateData);

    res.json({
      success: true,
      data: configuracionExistente,
      message: 'Configuración de disponibilidad actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error al actualizar configuración de disponibilidad:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};

// Eliminar una configuración
export const deleteConfiguracion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const configuracion = await UserDisponibilidadConfig.findByPk(id);
    if (!configuracion) {
      return res.status(404).json({
        success: false,
        message: 'Configuración de disponibilidad no encontrada',
      });
    }

    await configuracion.destroy();

    res.json({
      success: true,
      message: 'Configuración de disponibilidad eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar configuración de disponibilidad:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};

// Obtener configuraciones por mes (para todos los usuarios)
export const getConfiguracionesByMes = async (req: Request, res: Response) => {
  try {
    const { mes } = req.params;

    // Verificar formato del mes
    if (!/^\d{4}-\d{2}$/.test(mes)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de mes inválido. Debe ser YYYY-MM',
      });
    }

    const configuraciones = await UserDisponibilidadConfig.findAll({
      where: { mes, activo: true },
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'email'],
        },
      ],
      order: [['usuarioId', 'ASC'], ['tipo_disponibilidad', 'ASC']],
    });

    res.json({
      success: true,
      data: configuraciones,
    });
  } catch (error) {
    console.error('Error al obtener configuraciones por mes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};

// Obtener configuraciones del usuario autenticado por mes
export const getConfiguracionesUsuarioAutenticado = async (req: Request, res: Response) => {
  try {
    const { mes } = req.params;
    const usuarioId = (req as any).user?.id; // Obtener ID del usuario autenticado

    if (!usuarioId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
    }

    // Verificar formato del mes
    if (!/^\d{4}-\d{2}$/.test(mes)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de mes inválido. Debe ser YYYY-MM',
      });
    }

    const configuraciones = await UserDisponibilidadConfig.findAll({
      where: { 
        usuarioId, 
        mes, 
        activo: true 
      },
      order: [['tipo_disponibilidad', 'ASC']],
    });

    res.json({
      success: true,
      data: configuraciones,
    });
  } catch (error) {
    console.error('Error al obtener configuraciones del usuario autenticado:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};
