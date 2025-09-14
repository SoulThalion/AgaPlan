import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import Cargo from '../models/Cargo';
import { buildEquipoWhereClause } from '../middleware/equipoMiddleware';

// Obtener todos los cargos
export const getAllCargos = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const cargos = await Cargo.findAll({
      where: buildEquipoWhereClause(req),
      order: [['prioridad', 'ASC'], ['nombre', 'ASC']]
    });
    
    res.json({
      success: true,
      data: cargos,
      message: 'Cargos obtenidos correctamente'
    });
  } catch (error) {
    console.error('Error al obtener cargos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener un cargo por ID
export const getCargoById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const cargo = await Cargo.findOne({
      where: {
        id,
        ...buildEquipoWhereClause(req)
      }
    });
    
    if (!cargo) {
      return res.status(404).json({
        success: false,
        message: 'Cargo no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: cargo,
      message: 'Cargo obtenido correctamente'
    });
  } catch (error) {
    console.error('Error al obtener cargo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Crear un nuevo cargo
export const createCargo = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { nombre, descripcion, prioridad, activo } = req.body;
    
    // Validaciones
    if (!nombre || !nombre.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del cargo es obligatorio'
      });
    }
    
    if (prioridad && (prioridad < 1 || prioridad > 999)) {
      return res.status(400).json({
        success: false,
        message: 'La prioridad debe estar entre 1 y 999'
      });
    }
    

    
    // Determinar el equipoId para el nuevo cargo
    let cargoEquipoId: number;
    console.log('createCargo - Determining equipoId:');
    console.log('  - req.user?.rol:', req.user?.rol);
    console.log('  - req.query.equipoId:', req.query.equipoId);
    console.log('  - req.user?.equipoId:', req.user?.equipoId);
    
    if (req.user?.rol === 'superAdmin' && req.query.equipoId) {
      // Si es superAdmin y hay un equipo seleccionado en la query, usar ese
      cargoEquipoId = parseInt(req.query.equipoId as string);
      console.log('createCargo - Using selected equipoId for superAdmin:', cargoEquipoId);
    } else {
      // Si no es superAdmin o no hay equipo seleccionado, usar el equipo del usuario
      cargoEquipoId = req.user?.equipoId || 1;
      console.log('createCargo - Using user equipoId:', cargoEquipoId);
    }

    const cargo = await Cargo.create({
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || null,
      prioridad: prioridad || 999,
      activo: activo !== undefined ? activo : true,
      equipoId: cargoEquipoId
    });
    
    res.status(201).json({
      success: true,
      data: cargo,
      message: 'Cargo creado correctamente'
    });
  } catch (error) {
    console.error('Error al crear cargo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar un cargo
export const updateCargo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, prioridad, activo } = req.body;
    
    const cargo = await Cargo.findByPk(id);
    
    if (!cargo) {
      return res.status(404).json({
        success: false,
        message: 'Cargo no encontrado'
      });
    }
    
    // Validaciones
    if (nombre && !nombre.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del cargo no puede estar vacío'
      });
    }
    
    if (prioridad && (prioridad < 1 || prioridad > 999)) {
      return res.status(400).json({
        success: false,
        message: 'La prioridad debe estar entre 1 y 999'
      });
    }
    

    
    await cargo.update({
      nombre: nombre?.trim() || cargo.nombre,
      descripcion: descripcion !== undefined ? descripcion?.trim() || null : cargo.descripcion,
      prioridad: prioridad || cargo.prioridad,
      activo: activo !== undefined ? activo : cargo.activo
    });
    
    res.json({
      success: true,
      data: cargo,
      message: 'Cargo actualizado correctamente'
    });
  } catch (error) {
    console.error('Error al actualizar cargo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar un cargo
export const deleteCargo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cargo = await Cargo.findByPk(id);
    
    if (!cargo) {
      return res.status(404).json({
        success: false,
        message: 'Cargo no encontrado'
      });
    }
    
    // Verificar si el cargo está siendo usado en turnos
    // TODO: Implementar verificación de dependencias
    
    await cargo.destroy();
    
    res.json({
      success: true,
      message: 'Cargo eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar cargo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
