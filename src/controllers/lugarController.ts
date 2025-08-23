import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/auth';
import Lugar from '../models/Lugar';
import Turno from '../models/Turno';
import { Op } from 'sequelize';
import sequelize from '../config/database';

// Endpoint de prueba para verificar la conexión
export const testLugarConnection = async (req: Request, res: Response) => {
  try {
    console.log('🔍 testLugarConnection: Probando conexión...');
    
    // Probar conexión directa
    await sequelize.authenticate();
    console.log('✅ testLugarConnection: Conexión exitosa');
    
    // Probar consulta simple
    const [results] = await sequelize.query('SELECT 1 as test');
    console.log('✅ testLugarConnection: Consulta simple exitosa:', results);
    
    // Probar si la tabla existe
    const [tables] = await sequelize.query("SHOW TABLES LIKE 'lugares'");
    console.log('✅ testLugarConnection: Tabla lugares existe:', tables.length > 0);
    
    // Mostrar estructura real de la tabla
    if (tables.length > 0) {
      const [columns] = await sequelize.query("DESCRIBE lugares");
      console.log('📋 testLugarConnection: Estructura real de la tabla lugares:');
      columns.forEach((col: any) => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Conexión exitosa',
      data: {
        connection: 'OK',
        query: 'OK',
        tableExists: tables.length > 0,
        columns: tables.length > 0 ? await sequelize.query("DESCRIBE lugares") : []
      }
    });
  } catch (error: any) {
    console.error('❌ testLugarConnection Error:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error en prueba de conexión',
      error: error.message
    });
  }
};

// Endpoint de prueba para verificar el modelo Sequelize
export const testLugarModel = async (req: Request, res: Response) => {
  try {
    console.log('🔍 testLugarModel: Probando modelo Sequelize...');
    console.log('🔍 testLugarModel: Modelo Lugar:', !!Lugar);
    console.log('🔍 testLugarModel: Tipo de Lugar:', typeof Lugar);
    console.log('🔍 testLugarModel: Lugar.findAll:', typeof Lugar.findAll);
    
    // Probar consulta directa con Sequelize
    const [lugares] = await sequelize.query('SELECT * FROM lugares LIMIT 5');
    console.log('✅ testLugarModel: Consulta directa exitosa, lugares encontrados:', lugares.length);
    
    // Probar el modelo Sequelize
    const lugaresModel = await Lugar.findAll({
      limit: 5,
      raw: true // Obtener datos planos
    });
    console.log('✅ testLugarModel: Modelo Sequelize exitoso, lugares encontrados:', lugaresModel.length);
    
    res.status(200).json({
      success: true,
      message: 'Modelo Sequelize funcionando',
      data: {
        directQuery: lugares.length,
        sequelizeModel: lugaresModel.length,
        lugares: lugaresModel
      }
    });
  } catch (error: any) {
    console.error('❌ testLugarModel Error:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error en prueba del modelo',
      error: error.message
    });
  }
};

// Obtener todos los lugares
export const getAllLugares = async (req: Request, res: Response) => {
  try {
    console.log('🔍 getAllLugares: Iniciando búsqueda de lugares...');
    console.log('🔍 getAllLugares: Modelo Lugar importado:', !!Lugar);
    console.log('🔍 getAllLugares: Tipo de Lugar:', typeof Lugar);
    
    // Prueba simple de conexión
    console.log('🔍 getAllLugares: Probando conexión a la base de datos...');
    
    const lugares = await Lugar.findAll({
      order: [['nombre', 'ASC']]
    });

    console.log('✅ getAllLugares: Lugares encontrados:', lugares.length);
    console.log('📋 getAllLugares: Datos de lugares:', JSON.stringify(lugares, null, 2));

    res.status(200).json({
      success: true,
      data: lugares
    });
  } catch (error: any) {
    console.error('❌ Error obteniendo lugares:', error);
    console.error('❌ Stack trace:', error.stack);
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
    const { nombre, direccion, descripcion, capacidad, exhibidores, latitud, longitud } = req.body;

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

    // Validar capacidad si se proporciona
    if (capacidad !== undefined && (capacidad < 1 || !Number.isInteger(capacidad))) {
      return res.status(400).json({
        success: false,
        message: 'La capacidad debe ser un número entero mayor a 0'
      });
    }

    // Validar exhibidores si se proporciona
    if (exhibidores !== undefined && (exhibidores < 1 || !Number.isInteger(exhibidores))) {
      return res.status(400).json({
        success: false,
        message: 'La cantidad de exhibidores debe ser un número entero mayor a 0'
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
      direccion: direccion.trim(),
      descripcion: descripcion?.trim(),
      capacidad: capacidad,
      exhibidores: exhibidores,
      latitud: latitud,
      longitud: longitud
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
    const { nombre, direccion, descripcion, capacidad, exhibidores, latitud, longitud } = req.body;

    // Validaciones
    if (!nombre && !direccion && descripcion === undefined && capacidad === undefined && exhibidores === undefined) {
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

    // Validar capacidad si se proporciona
    if (capacidad !== undefined && (capacidad < 1 || !Number.isInteger(capacidad))) {
      return res.status(400).json({
        success: false,
        message: 'La capacidad debe ser un número entero mayor a 0'
      });
    }

    // Validar exhibidores si se proporciona
    if (exhibidores !== undefined && (exhibidores < 1 || !Number.isInteger(exhibidores))) {
      return res.status(400).json({
        success: false,
        message: 'La cantidad de exhibidores debe ser un número entero mayor a 0'
      });
    }

    // Actualizar campos
    if (nombre) lugar.nombre = nombre.trim();
    if (direccion) lugar.direccion = direccion.trim();
    if (descripcion !== undefined) lugar.descripcion = descripcion?.trim();
    if (capacidad !== undefined) lugar.capacidad = capacidad;
    if (exhibidores !== undefined) lugar.exhibidores = exhibidores;
    if (latitud !== undefined) lugar.latitud = latitud;
    if (longitud !== undefined) lugar.longitud = longitud;

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
