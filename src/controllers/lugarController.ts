import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import Lugar from '../models/Lugar';
import Turno from '../models/Turno';
import { Op } from 'sequelize';

// Obtener todos los lugares
export const getAllLugares = async (req: Request, res: Response) => {
  try {
    const lugares = await Lugar.findAll({
      order: [['nombre', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: lugares
    });
  } catch (error) {
    console.error('Error obteniendo lugares:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener un lugar por ID
export const getLugarById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const lugar = await Lugar.findByPk(id);

    if (!lugar) {
      return res.status(404).json({
        success: false,
        message: 'Lugar no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: lugar
    });
  } catch (error) {
    console.error('Error obteniendo lugar:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Crear un nuevo lugar
export const createLugar = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { nombre, direccion } = req.body;

    // Validaciones
    if (!nombre || !direccion) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y dirección son requeridos'
      });
    }

    if (nombre.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'El nombre debe tener al menos 2 caracteres'
      });
    }

    // Verificar si ya existe un lugar con ese nombre
    const existingLugar = await Lugar.findOne({ where: { nombre: nombre.trim() } });
    if (existingLugar) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un lugar con ese nombre'
      });
    }

    const nuevoLugar = await Lugar.create({
      nombre: nombre.trim(),
      direccion: direccion.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Lugar creado exitosamente',
      data: nuevoLugar
    });
  } catch (error) {
    console.error('Error creando lugar:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar un lugar
export const updateLugar = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre, direccion } = req.body;

    // Validaciones
    if (!nombre && !direccion) {
      return res.status(400).json({
        success: false,
        message: 'Al menos un campo debe ser proporcionado para actualizar'
      });
    }

    const lugar = await Lugar.findByPk(id);
    if (!lugar) {
      return res.status(404).json({
        success: false,
        message: 'Lugar no encontrado'
      });
    }

    // Verificar si el nuevo nombre ya existe en otro lugar
    if (nombre && nombre !== lugar.nombre) {
            const existingLugar = await Lugar.findOne({ 
        where: { 
          nombre: nombre.trim(),
          id: { [Op.ne]: id } 
        } 
      });
      
      if (existingLugar) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe otro lugar con ese nombre'
        });
      }
    }

    // Actualizar campos
    if (nombre) lugar.nombre = nombre.trim();
    if (direccion) lugar.direccion = direccion.trim();

    await lugar.save();

    res.status(200).json({
      success: true,
      message: 'Lugar actualizado exitosamente',
      data: lugar
    });
  } catch (error) {
    console.error('Error actualizando lugar:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar un lugar
export const deleteLugar = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const lugar = await Lugar.findByPk(id);

    if (!lugar) {
      return res.status(404).json({
        success: false,
        message: 'Lugar no encontrado'
      });
    }

    // Verificar si tiene turnos asociados
    const turnosCount = await Turno.count({ where: { lugarId: id } });
    if (turnosCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar el lugar porque tiene turnos asociados'
      });
    }

    await lugar.destroy();

    res.status(200).json({
      success: true,
      message: 'Lugar eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando lugar:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
