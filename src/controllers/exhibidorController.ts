import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import Exhibidor from '../models/Exhibidor';

// Obtener todos los exhibidores
export const getAllExhibidores = async (req: Request, res: Response): Promise<void> => {
  try {
    const exhibidores = await Exhibidor.findAll({
      where: { activo: true },
      order: [['nombre', 'ASC']],
    });

    res.json({
      success: true,
      data: exhibidores,
    });
  } catch (error) {
    console.error('Error al obtener exhibidores:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};

// Obtener un exhibidor por ID
export const getExhibidorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const exhibidor = await Exhibidor.findByPk(id);

    if (!exhibidor) {
      res.status(404).json({
        success: false,
        message: 'Exhibidor no encontrado',
      });
      return;
    }

    res.json({
      success: true,
      data: exhibidor,
    });
  } catch (error) {
    console.error('Error al obtener exhibidor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};

// Crear un nuevo exhibidor
export const createExhibidor = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre || nombre.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'El nombre del exhibidor es requerido',
      });
      return;
    }

    // Verificar si ya existe un exhibidor con ese nombre
    const existingExhibidor = await Exhibidor.findOne({
      where: { nombre: nombre.trim() },
    });

    if (existingExhibidor) {
      res.status(400).json({
        success: false,
        message: 'Ya existe un exhibidor con ese nombre',
      });
      return;
    }

    const exhibidor = await Exhibidor.create({
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || null,
      activo: true,
      equipoId: req.user?.equipoId || 1
    });

    res.status(201).json({
      success: true,
      data: exhibidor,
      message: 'Exhibidor creado exitosamente',
    });
  } catch (error) {
    console.error('Error al crear exhibidor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};

// Actualizar un exhibidor
export const updateExhibidor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, activo } = req.body;

    const exhibidor = await Exhibidor.findByPk(id);

    if (!exhibidor) {
      res.status(404).json({
        success: false,
        message: 'Exhibidor no encontrado',
      });
      return;
    }

    if (nombre !== undefined) {
      if (!nombre || nombre.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'El nombre del exhibidor es requerido',
        });
        return;
      }

      // Verificar si ya existe otro exhibidor con ese nombre
      const existingExhibidor = await Exhibidor.findOne({
        where: { 
          nombre: nombre.trim(),
          id: { [require('sequelize').Op.ne]: id }
        },
      });

      if (existingExhibidor) {
        res.status(400).json({
          success: false,
          message: 'Ya existe otro exhibidor con ese nombre',
        });
        return;
      }

      exhibidor.nombre = nombre.trim();
    }

    if (descripcion !== undefined) {
      exhibidor.descripcion = descripcion?.trim() || null;
    }

    if (activo !== undefined) {
      exhibidor.activo = activo;
    }

    await exhibidor.save();

    res.json({
      success: true,
      data: exhibidor,
      message: 'Exhibidor actualizado exitosamente',
    });
  } catch (error) {
    console.error('Error al actualizar exhibidor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};

// Eliminar un exhibidor (marcar como inactivo)
export const deleteExhibidor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const exhibidor = await Exhibidor.findByPk(id);

    if (!exhibidor) {
      res.status(404).json({
        success: false,
        message: 'Exhibidor no encontrado',
      });
      return;
    }

    // Marcar como inactivo en lugar de eliminar físicamente
    exhibidor.activo = false;
    await exhibidor.save();

    res.json({
      success: true,
      message: 'Exhibidor eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar exhibidor:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};
