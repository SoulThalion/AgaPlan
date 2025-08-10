import { Request, Response } from 'express';
import Turno from '../models/Turno';
import Lugar from '../models/Lugar';
import Usuario from '../models/Usuario';
import TurnoExhibidor from '../models/TurnoExhibidor';
import Exhibidor from '../models/Exhibidor';
import Disponibilidad from '../models/Disponibilidad';
import { AuthenticatedRequest } from '../types/auth';
import { Op } from 'sequelize';

// Obtener todos los turnos
export const getAllTurnos = async (req: Request, res: Response) => {
  try {
    const turnos = await Turno.findAll({
      include: [
        {
          model: Lugar,
          as: 'lugar',
          attributes: ['id', 'nombre', 'direccion']
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'email']
        },
        {
          model: Exhibidor,
          as: 'exhibidores',
          through: { attributes: [] }, // No incluir atributos de la tabla intermedia
          attributes: ['id', 'nombre', 'descripcion']
        }
      ],
      order: [['fecha', 'ASC'], ['hora', 'ASC']]
    });

    res.json({
      success: true,
      data: turnos
    });
  } catch (error) {
    console.error('Error obteniendo turnos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener un turno por ID
export const getTurnoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const turno = await Turno.findByPk(id, {
      include: [
        {
          model: Lugar,
          as: 'lugar',
          attributes: ['id', 'nombre', 'direccion', 'exhibidores']
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'email']
        },
        {
          model: Exhibidor,
          as: 'exhibidores',
          through: { attributes: [] },
          attributes: ['id', 'nombre', 'descripcion']
        }
      ]
    });

    if (!turno) {
      return res.status(404).json({
        success: false,
        message: 'Turno no encontrado'
      });
    }

    res.json({
      success: true,
      data: turno
    });
  } catch (error) {
    console.error('Error obteniendo turno:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Crear un nuevo turno
export const createTurno = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fecha, hora, lugarId, exhibidorIds } = req.body;

    // Validaciones básicas
    if (!fecha || !hora || !lugarId || !exhibidorIds || !Array.isArray(exhibidorIds)) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos y exhibidorIds debe ser un array'
      });
    }

    // Validar formato de fecha
    const fechaDate = new Date(fecha);
    if (isNaN(fechaDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Formato de fecha inválido'
      });
    }

    // Validar que no sea fecha pasada
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (fechaDate < hoy) {
      return res.status(400).json({
        success: false,
        message: 'No se pueden crear turnos en fechas pasadas'
      });
    }

    // Validar formato de hora
    const horaRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!horaRegex.test(hora)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de hora inválido (HH:MM)'
      });
    }

    // Obtener información del lugar
    const lugar = await Lugar.findByPk(lugarId);
    if (!lugar) {
      return res.status(404).json({
        success: false,
        message: 'Lugar no encontrado'
      });
    }

    // Validar que la cantidad de exhibidores no exceda la disponible en el lugar
    if (exhibidorIds.length > (lugar.exhibidores || 1)) {
      return res.status(400).json({
        success: false,
        message: `La cantidad de exhibidores (${exhibidorIds.length}) excede la disponible (${lugar.exhibidores || 1}) en este lugar`
      });
    }

    // Verificar que no existe un turno en la misma fecha, hora y lugar
    const existingTurno = await Turno.findOne({
      where: { fecha, hora, lugarId }
    });

    if (existingTurno) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un turno en esa fecha, hora y lugar'
      });
    }

    // Crear el turno
    const nuevoTurno = await Turno.create({
      fecha,
      hora,
      lugarId,
      estado: 'libre'
    });

    // Crear las relaciones con exhibidores
    if (exhibidorIds.length > 0) {
      const turnoExhibidorRecords = exhibidorIds.map(exhibidorId => ({
        turnoId: nuevoTurno.id,
        exhibidorId
      }));
      
      await TurnoExhibidor.bulkCreate(turnoExhibidorRecords);
    }

    // Obtener el turno completo con información del lugar y exhibidores
    const turnoCompleto = await Turno.findByPk(nuevoTurno.id, {
      include: [
        {
          model: Lugar,
          as: 'lugar',
          attributes: ['id', 'nombre', 'direccion', 'exhibidores']
        },
        {
          model: Exhibidor,
          as: 'exhibidores',
          through: { attributes: [] },
          attributes: ['id', 'nombre', 'descripcion']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Turno creado exitosamente',
      data: turnoCompleto
    });
  } catch (error) {
    console.error('Error creando turno:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar un turno
export const updateTurno = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { fecha, hora, lugarId, exhibidorIds } = req.body;

    const turno = await Turno.findByPk(id);
    if (!turno) {
      return res.status(404).json({
        success: false,
        message: 'Turno no encontrado'
      });
    }

    // Solo permitir actualizar turnos libres
    if (turno.estado === 'ocupado') {
      return res.status(400).json({
        success: false,
        message: 'No se puede modificar un turno ocupado'
      });
    }

    // Validaciones para campos proporcionados
    if (fecha) {
      const fechaDate = new Date(fecha);
      if (isNaN(fechaDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Formato de fecha inválido'
        });
      }

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (fechaDate < hoy) {
        return res.status(400).json({
          success: false,
          message: 'No se pueden crear turnos en fechas pasadas'
        });
      }
    }

    if (hora) {
      const horaRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!horaRegex.test(hora)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de hora inválido (HH:MM)'
        });
      }
    }

    // Si se está cambiando el lugar, validar que la cantidad de exhibidores sea válida
    if (lugarId && lugarId !== turno.lugarId) {
      const lugar = await Lugar.findByPk(lugarId);
      if (!lugar) {
        return res.status(404).json({
          success: false,
          message: 'Lugar no encontrado'
        });
      }

      if (exhibidorIds && exhibidorIds.length > (lugar.exhibidores || 1)) {
        return res.status(400).json({
          success: false,
          message: `La cantidad de exhibidores (${exhibidorIds.length}) excede la disponible (${lugar.exhibidores || 1}) en este lugar`
        });
      }
    }

    // Actualizar el turno
    const updateData: any = {};
    if (fecha) updateData.fecha = fecha;
    if (hora) updateData.hora = hora;
    if (lugarId) updateData.lugarId = lugarId;

    await turno.update(updateData);

    // Actualizar exhibidores si se proporcionan
    if (exhibidorIds && Array.isArray(exhibidorIds)) {
      // Eliminar relaciones existentes
      await TurnoExhibidor.destroy({
        where: { turnoId: parseInt(id) }
      });

      // Crear nuevas relaciones
      if (exhibidorIds.length > 0) {
        const turnoExhibidorRecords = exhibidorIds.map(exhibidorId => ({
          turnoId: parseInt(id),
          exhibidorId
        }));
        
        await TurnoExhibidor.bulkCreate(turnoExhibidorRecords);
      }
    }

    // Obtener el turno actualizado
    const turnoActualizado = await Turno.findByPk(id, {
      include: [
        {
          model: Lugar,
          as: 'lugar',
          attributes: ['id', 'nombre', 'direccion', 'exhibidores']
        },
        {
          model: Exhibidor,
          as: 'exhibidores',
          through: { attributes: [] },
          attributes: ['id', 'nombre', 'descripcion']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Turno actualizado exitosamente',
      data: turnoActualizado
    });
  } catch (error) {
    console.error('Error actualizando turno:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar un turno
export const deleteTurno = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const turno = await Turno.findByPk(id);

    if (!turno) {
      return res.status(404).json({
        success: false,
        message: 'Turno no encontrado'
      });
    }

    // Solo permitir eliminar turnos libres
    if (turno.estado === 'ocupado') {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar un turno ocupado'
      });
    }

    await turno.destroy();

    res.status(200).json({
      success: true,
      message: 'Turno eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando turno:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Ocupar un turno (voluntario se apunta)
export const ocuparTurno = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const usuarioId = req.user!.id;

    const turno = await Turno.findByPk(id);
    if (!turno) {
      return res.status(404).json({
        success: false,
        message: 'Turno no encontrado'
      });
    }

    if (turno.estado === 'ocupado') {
      return res.status(400).json({
        success: false,
        message: 'El turno ya está ocupado'
      });
    }

    // Verificar que el usuario no tenga otro turno en la misma fecha
    const turnoExistente = await Turno.findOne({
      where: {
        fecha: turno.fecha,
        usuarioId,
        id: { [Op.ne]: id }
      }
    });

    if (turnoExistente) {
      return res.status(400).json({
        success: false,
        message: 'Ya tienes un turno asignado en esa fecha'
      });
    }

    // Verificar disponibilidad del usuario
    const diaSemana = new Date(turno.fecha).getDay();
    const disponibilidad = await Disponibilidad.findOne({
      where: {
        usuarioId,
        dia_semana: diaSemana
      }
    });

    if (!disponibilidad) {
      return res.status(400).json({
        success: false,
        message: 'No tienes disponibilidad para este día de la semana'
      });
    }

    // Verificar que la hora del turno esté dentro de tu disponibilidad
    const horaTurno = turno.hora;
    if (horaTurno < disponibilidad.hora_inicio || horaTurno > disponibilidad.hora_fin) {
      return res.status(400).json({
        success: false,
        message: `La hora del turno (${horaTurno}) no está dentro de tu disponibilidad (${disponibilidad.hora_inicio} - ${disponibilidad.hora_fin})`
      });
    }

    // Asignar el turno al usuario
    turno.usuarioId = usuarioId;
    turno.estado = 'ocupado';
    await turno.save();

    // Obtener el turno con información completa
    const turnoOcupado = await Turno.findByPk(id, {
      include: [
        {
          model: Lugar,
          as: 'lugar',
          attributes: ['id', 'nombre', 'direccion']
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'email']
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Turno ocupado exitosamente',
      data: turnoOcupado
    });
  } catch (error) {
    console.error('Error ocupando turno:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Liberar un turno (voluntario se borra)
export const liberarTurno = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const usuarioId = req.user!.id;

    const turno = await Turno.findByPk(id);
    if (!turno) {
      return res.status(404).json({
        success: false,
        message: 'Turno no encontrado'
      });
    }

    if (turno.estado === 'libre') {
      return res.status(400).json({
        success: false,
        message: 'El turno ya está libre'
      });
    }

    // Verificar que el usuario sea el propietario del turno
    if (turno.usuarioId !== usuarioId) {
      return res.status(403).json({
        success: false,
        message: 'Solo puedes liberar tus propios turnos'
      });
    }

    // Liberar el turno
    turno.usuarioId = undefined;
    turno.estado = 'libre';
    await turno.save();

    // Obtener el turno liberado con información del lugar
    const turnoLiberado = await Turno.findByPk(id, {
      include: [
        {
          model: Lugar,
          as: 'lugar',
          attributes: ['id', 'nombre', 'direccion']
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Turno liberado exitosamente',
      data: turnoLiberado
    });
  } catch (error) {
    console.error('Error liberando turno:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Generar turnos automáticamente
export const generarTurnosAutomaticos = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { tipo, fechaInicio, lugarId, horaInicio, horaFin, intervalo } = req.body;

    // Validaciones
    if (!tipo || !fechaInicio || !lugarId || !horaInicio || !horaFin || !intervalo) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }

    if (!['semanal', 'mensual'].includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: 'El tipo debe ser "semanal" o "mensual"'
      });
    }

    // Verificar que el lugar existe
    const lugar = await Lugar.findByPk(lugarId);
    if (!lugar) {
      return res.status(404).json({
        success: false,
        message: 'Lugar no encontrado'
      });
    }

    // Validar formato de horas
    const horaRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!horaRegex.test(horaInicio) || !horaRegex.test(horaFin)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de hora inválido (HH:MM)'
      });
    }

    if (horaInicio >= horaFin) {
      return res.status(400).json({
        success: false,
        message: 'La hora de inicio debe ser menor que la hora de fin'
      });
    }

    if (intervalo < 15 || intervalo > 120) {
      return res.status(400).json({
        success: false,
        message: 'El intervalo debe estar entre 15 y 120 minutos'
      });
    }

    const fechaInicioDate = new Date(fechaInicio);
    if (isNaN(fechaInicioDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Formato de fecha inválido'
      });
    }

    // Calcular fechas de fin
    let fechaFinDate: Date;
    if (tipo === 'semanal') {
      fechaFinDate = new Date(fechaInicioDate);
      fechaFinDate.setDate(fechaFinDate.getDate() + 7);
    } else {
      fechaFinDate = new Date(fechaInicioDate);
      fechaFinDate.setMonth(fechaFinDate.getMonth() + 1);
    }

    // Generar turnos
    const turnosGenerados = [];
    const fechaActual = new Date(fechaInicioDate);

    while (fechaActual < fechaFinDate) {
      const diaSemana = fechaActual.getDay();
      
      // Solo generar turnos de lunes a viernes (1-5)
      if (diaSemana >= 1 && diaSemana <= 5) {
        const horaActual = new Date(`2000-01-01T${horaInicio}:00`);
        const horaFinDate = new Date(`2000-01-01T${horaFin}:00`);

        while (horaActual < horaFinDate) {
          const horaString = horaActual.toTimeString().slice(0, 5);
          
          // Obtener el lugar para saber cuántos exhibidores tiene
          const lugar = await Lugar.findByPk(lugarId);
          const numExhibidores = lugar?.exhibidores || 1;
          
          // Verificar si ya existe un turno en esa fecha, hora y lugar
          const turnoExistente = await Turno.findOne({
            where: {
              fecha: fechaActual,
              hora: horaString,
              lugarId
            }
          });

          if (!turnoExistente) {
            // Crear el turno
            const nuevoTurno = await Turno.create({
              fecha: fechaActual,
              hora: horaString,
              lugarId,
              estado: 'libre'
            });

            // Crear las relaciones con exhibidores (del 1 al número máximo)
            const turnoExhibidorRecords = [];
            for (let exhibidor = 1; exhibidor <= numExhibidores; exhibidor++) {
              turnoExhibidorRecords.push({
                turnoId: nuevoTurno.id,
                exhibidorId: exhibidor
              });
            }
            
            await TurnoExhibidor.bulkCreate(turnoExhibidorRecords);
            turnosGenerados.push(nuevoTurno);
          }

          // Avanzar al siguiente intervalo
          horaActual.setMinutes(horaActual.getMinutes() + intervalo);
        }
      }

      // Avanzar al siguiente día
      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    res.status(201).json({
      success: true,
      message: `Se generaron ${turnosGenerados.length} turnos automáticamente`,
      data: {
        turnosGenerados: turnosGenerados.length,
        fechaInicio: fechaInicioDate.toISOString().split('T')[0],
        fechaFin: fechaFinDate.toISOString().split('T')[0],
        tipo
      }
    });
  } catch (error) {
    console.error('Error generando turnos automáticos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
