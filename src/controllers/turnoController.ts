import { Request, Response } from 'express';
import Turno from '../models/Turno';
import Lugar from '../models/Lugar';
import Usuario from '../models/Usuario';
import TurnoExhibidor from '../models/TurnoExhibidor';
import Exhibidor from '../models/Exhibidor';
import Disponibilidad from '../models/Disponibilidad';
import { AuthenticatedRequest } from '../types/auth';
import { Op } from 'sequelize';
import TurnoUsuario from '../models/TurnoUsuario';
import { buildEquipoWhereClause } from '../middleware/equipoMiddleware';

// Función helper para verificar si se cumplen los requisitos del turno
export const verificarRequisitosTurno = (usuarios: any[], lugar: any) => {
  const tieneMasculino = usuarios.some(u => u.sexo === 'M');
  const tieneCoche = usuarios.some(u => u.tieneCoche);
  const plazasOcupadas = usuarios.length;
  const capacidad = lugar?.capacidad || 0;
  
  return {
    tieneMasculino,
    tieneCoche,
    plazasOcupadas,
    capacidad,
    completo: capacidad > 0 ? plazasOcupadas >= capacidad : plazasOcupadas > 0,
    requisitosCumplidos: tieneMasculino && (tieneCoche || !usuarios.some(u => u.tieneCoche))
  };
};

// Obtener todos los turnos
export const getAllTurnos = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const turnos = await Turno.findAll({
      where: buildEquipoWhereClause(req),
      include: [
        {
          model: Lugar,
          as: 'lugar',
          attributes: ['id', 'nombre', 'direccion']
        },
        {
          model: Usuario,
          as: 'usuarios',
          through: { attributes: [] },
          attributes: ['id', 'nombre', 'email', 'cargo', 'sexo', 'tieneCoche']
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
export const getTurnoById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const turno = await Turno.findOne({
      where: {
        id,
        ...buildEquipoWhereClause(req)
      },
      include: [
        {
          model: Lugar,
          as: 'lugar',
          attributes: ['id', 'nombre', 'direccion', 'exhibidores']
        },
        {
          model: Usuario,
          as: 'usuarios',
          through: { attributes: [] },
          attributes: ['id', 'nombre', 'email', 'cargo', 'sexo', 'tieneCoche']
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
    const { fecha, hora, lugarId, exhibidorIds, usuarioIds, estado } = req.body;

    // Validar campos requeridos
    if (!fecha || !hora || !lugarId || !exhibidorIds || !Array.isArray(exhibidorIds)) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: fecha, hora, lugarId, exhibidorIds'
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

    // Validar formato de hora (ahora es un rango HH:MM-HH:MM)
    const horaRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]-([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!horaRegex.test(hora)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de hora inválido. Debe ser HH:MM-HH:MM (ej: 09:00-10:00)'
      });
    }

    // Validar que la hora de fin sea mayor que la de inicio
    const [horaInicio, horaFin] = hora.split('-');
    if (horaInicio >= horaFin) {
      return res.status(400).json({
        success: false,
        message: 'La hora de fin debe ser mayor que la hora de inicio'
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

    // Verificar que no haya un turno en la misma fecha, hora y lugar
    const turnoExistente = await Turno.findOne({
      where: { fecha, hora, lugarId }
    });

    if (turnoExistente) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un turno en esta fecha, hora y lugar'
      });
    }

    // Crear el turno
    const nuevoTurno = await Turno.create({
      fecha,
      hora,
      lugarId,
      estado: estado || 'libre',
      equipoId: req.user?.equipoId || 1
    });

    // Crear las relaciones con exhibidores
    const turnoExhibidorRecords = exhibidorIds.map((exhibidorId: number) => ({
      turnoId: nuevoTurno.id,
      exhibidorId
    }));

    await TurnoExhibidor.bulkCreate(turnoExhibidorRecords);

    // Crear las relaciones con usuarios si se proporcionan
    if (usuarioIds && Array.isArray(usuarioIds) && usuarioIds.length > 0) {
      const turnoUsuarioRecords = usuarioIds.map((usuarioId: number) => ({
        turnoId: nuevoTurno.id,
        usuarioId
      }));

      await TurnoUsuario.bulkCreate(turnoUsuarioRecords);
    }

    // Obtener el turno con sus relaciones
    const turnoCompleto = await Turno.findByPk(nuevoTurno.id, {
      include: [
        { model: Lugar, as: 'lugar' },
        { model: Usuario, as: 'usuarios' },
        { model: Exhibidor, as: 'exhibidores' }
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
      const horaRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]-([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!horaRegex.test(hora)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de hora inválido. Debe ser HH:MM-HH:MM (ej: 09:00-10:00)'
        });
      }
      const [horaInicio, horaFin] = hora.split('-');
      if (horaInicio >= horaFin) {
        return res.status(400).json({
          success: false,
          message: 'La hora de fin debe ser mayor que la hora de inicio'
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
        const turnoExhibidorRecords = exhibidorIds.map((exhibidorId: number) => ({
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

    const turno = await Turno.findByPk(id, {
      include: [
        { model: Usuario, as: 'usuarios', through: { attributes: [] } }
      ]
    });
    
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
      include: [
        { 
          model: Usuario, 
          as: 'usuarios', 
          where: { id: usuarioId },
          through: { attributes: [] }
        }
      ],
      where: {
        fecha: turno.fecha,
        id: { [Op.ne]: id }
      }
    });

    if (turnoExistente) {
      return res.status(400).json({
        success: false,
        message: 'Ya tienes un turno asignado en esa fecha'
      });
    }

    // Verificar disponibilidad del usuario (solo si no es admin)
    if (req.user!.rol !== 'admin' && req.user!.rol !== 'superAdmin') {
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
      const [horaInicio, horaFin] = turno.hora.split('-');
      if (horaInicio < disponibilidad.hora_inicio || horaFin > disponibilidad.hora_fin) {
        return res.status(400).json({
          success: false,
          message: `La hora del turno (${turno.hora}) no está dentro de tu disponibilidad (${disponibilidad.hora_inicio} - ${disponibilidad.hora_fin})`
        });
      }
    }

    // Asignar el turno al usuario usando la tabla intermedia
    await TurnoUsuario.create({
      turnoId: turno.id,
      usuarioId: usuarioId
    });

    // LÓGICA ESPECIAL PARA ROL "GRUPO"
    if (req.user!.rol === 'grupo') {
      // Obtener el lugar del turno para verificar capacidad
      const lugar = await Lugar.findByPk(turno.lugarId);
      
      if (lugar && lugar.capacidad) {
        // Si es rol "grupo", marcar el turno como completo
        // No se crean usuarios ficticios, solo se marca como ocupado por el grupo
        turno.estado = 'completo';
        await turno.save();
        
        console.log(`✅ Turno ${turno.id} marcado como completo por usuario grupo`);
      }
    } else {
      // Para otros roles, verificar si se cumple la capacidad
      const lugar = await Lugar.findByPk(turno.lugarId);
      const usuariosActuales = turno.usuarios || [];
      if (lugar && lugar.capacidad && usuariosActuales.length >= lugar.capacidad) {
        turno.estado = 'completo';
        await turno.save();
      } else {
        // Solo actualizar a 'ocupado' si no se marcó como 'completo'
        turno.estado = 'ocupado';
        await turno.save();
      }
    }

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
          as: 'usuarios',
          attributes: ['id', 'nombre', 'email', 'cargo', 'sexo', 'tieneCoche']
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

// Asignar un usuario a un turno (admin)
export const asignarUsuarioATurno = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { usuarioId } = req.body;

    if (!usuarioId) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere el ID del usuario'
      });
    }

    const turno = await Turno.findByPk(id, {
      include: [
        { model: Usuario, as: 'usuarios', through: { attributes: [] } }
      ]
    });
    
    if (!turno) {
      return res.status(404).json({
        success: false,
        message: 'Turno no encontrado'
      });
    }

    // Verificar que el usuario no esté ya asignado al turno
    const usuarioYaAsignado = turno.usuarios?.find(u => u.id === usuarioId);
    if (usuarioYaAsignado) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya está asignado a este turno'
      });
    }

    // Verificar que el usuario no tenga otro turno en la misma fecha
    const turnoExistente = await Turno.findOne({
      include: [
        { 
          model: Usuario, 
          as: 'usuarios', 
          where: { id: usuarioId },
          through: { attributes: [] }
        }
      ],
      where: {
        fecha: turno.fecha,
        id: { [Op.ne]: id }
      }
    });

    if (turnoExistente) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya tiene un turno asignado en esa fecha'
      });
    }

    // Obtener información del usuario para verificar su rol
    const usuario = await Usuario.findByPk(usuarioId);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Asignar el turno al usuario usando la tabla intermedia
    await TurnoUsuario.create({
      turnoId: turno.id,
      usuarioId: usuarioId
    });

    // LÓGICA ESPECIAL PARA ROL "GRUPO"
    if (usuario.rol === 'grupo') {
      // Obtener el lugar del turno para verificar capacidad
      const lugar = await Lugar.findByPk(turno.lugarId);
      
      if (lugar && lugar.capacidad) {
        // Si es rol "grupo", marcar el turno como completo
        // No se crean usuarios ficticios, solo se marca como ocupado por el grupo
        turno.estado = 'completo';
        await turno.save();
        
        console.log(`✅ Turno ${turno.id} marcado como completo por usuario grupo`);
      }
    }

    // Actualizar el estado del turno si es necesario
    if (turno.estado === 'libre') {
      turno.estado = 'ocupado';
      await turno.save();
    }

    // Obtener el turno con información completa
    const turnoActualizado = await Turno.findByPk(id, {
      include: [
        {
          model: Lugar,
          as: 'lugar',
          attributes: ['id', 'nombre', 'direccion']
        },
        {
          model: Usuario,
          as: 'usuarios',
          attributes: ['id', 'nombre', 'email', 'cargo', 'sexo', 'tieneCoche']
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Usuario asignado al turno exitosamente',
      data: turnoActualizado
    });
  } catch (error) {
    console.error('Error asignando usuario al turno:', error);
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
    const userRole = req.user!.rol;

    const turno = await Turno.findByPk(id, {
      include: [
        { model: Usuario, as: 'usuarios', through: { attributes: [] } }
      ]
    });
    
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

    // Si es superAdmin, puede liberar cualquier turno
    // Si no, solo puede liberar sus propios turnos
    if (userRole !== 'superAdmin') {
      const usuarioAsignado = turno.usuarios?.find(u => u.id === usuarioId);
      if (!usuarioAsignado) {
        return res.status(403).json({
          success: false,
          message: 'Solo puedes liberar tus propios turnos'
        });
      }
    }

    // Si es superAdmin y no se especificó usuarioId, liberar todo el turno
    // Si se especificó usuarioId, liberar solo ese usuario
    let usuarioIdALiberar = usuarioId;
    if (userRole === 'superAdmin' && req.body.usuarioId) {
      usuarioIdALiberar = req.body.usuarioId;
    }

    // Liberar el turno eliminando la relación con el usuario
    await TurnoUsuario.destroy({
      where: {
        turnoId: turno.id,
        usuarioId: usuarioIdALiberar
      }
    });

    // Verificar si quedan otros usuarios asignados
    const usuariosRestantes = await TurnoUsuario.count({
      where: { turnoId: turno.id }
    });

    // Si no quedan usuarios, marcar el turno como libre
    if (usuariosRestantes === 0) {
      turno.estado = 'libre';
      await turno.save();
    }

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
    const horaRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]-([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!horaRegex.test(horaInicio) || !horaRegex.test(horaFin)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de hora inválido (HH:MM-HH:MM)'
      });
    }

    const [horaInicioInicio, horaFinInicio] = horaInicio.split('-');
    const [horaInicioFin, horaFinFin] = horaFin.split('-');

    if (horaInicioInicio >= horaFinInicio || horaInicioFin >= horaFinFin) {
      return res.status(400).json({
        success: false,
        message: 'La hora de fin debe ser mayor que la hora de inicio'
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
        const horaActualInicio = new Date(`2000-01-01T${horaInicioInicio}:00`);
        const horaActualFin = new Date(`2000-01-01T${horaFinInicio}:00`);

        while (horaActualInicio < horaActualFin) {
          const horaString = horaActualInicio.toTimeString().slice(0, 5);
          
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
              estado: 'libre',
              equipoId: req.user?.equipoId || 1
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
          horaActualInicio.setMinutes(horaActualInicio.getMinutes() + intervalo);
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

// Crear turnos recurrentes semanales
export const createTurnosRecurrentes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fechaInicio, hora, lugarId, exhibidorIds, usuarioIds, estado, esRecurrente, semanas } = req.body;

    // Validaciones básicas
    if (!fechaInicio || !hora || !lugarId || !exhibidorIds || exhibidorIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Fecha, hora, lugar y exhibidores son requeridos'
      });
    }

    if (esRecurrente && (!semanas || semanas < 1 || semanas > 52)) {
      return res.status(400).json({
        success: false,
        message: 'Para turnos recurrentes, el número de semanas debe estar entre 1 y 52'
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

    // Verificar que los exhibidores existen
    const exhibidores = await Exhibidor.findAll({
      where: { id: { [Op.in]: exhibidorIds } }
    });

    if (exhibidores.length !== exhibidorIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Uno o más exhibidores no existen'
      });
    }

    const turnosCreados = [];
    const fechaInicioDate = new Date(fechaInicio);
    
    if (isNaN(fechaInicioDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Formato de fecha inválido'
      });
    }

    if (esRecurrente) {
      // Crear turnos para cada semana
      for (let semana = 0; semana < semanas; semana++) {
        const fechaTurno = new Date(fechaInicioDate);
        fechaTurno.setDate(fechaTurno.getDate() + (semana * 7));

        // Verificar si ya existe un turno en esa fecha, hora y lugar
        const turnoExistente = await Turno.findOne({
          where: {
            fecha: fechaTurno,
            hora,
            lugarId
          }
        });

        if (!turnoExistente) {
          // Crear el turno
          const nuevoTurno = await Turno.create({
            fecha: fechaTurno,
            hora,
            lugarId,
            estado: estado || 'libre',
            equipoId: req.user?.equipoId || 1
          });

          // Crear las relaciones con exhibidores
          const turnoExhibidorRecords = exhibidorIds.map((exhibidorId: number) => ({
            turnoId: nuevoTurno.id,
            exhibidorId
          }));
          
          await TurnoExhibidor.bulkCreate(turnoExhibidorRecords);

          // Crear las relaciones con usuarios si se proporcionan
          if (usuarioIds && Array.isArray(usuarioIds) && usuarioIds.length > 0) {
            const turnoUsuarioRecords = usuarioIds.map((usuarioId: number) => ({
              turnoId: nuevoTurno.id,
              usuarioId
            }));
            await TurnoUsuario.bulkCreate(turnoUsuarioRecords);
          }

          turnosCreados.push(nuevoTurno);
        }
      }
    } else {
      // Crear solo un turno
      const turnoExistente = await Turno.findOne({
        where: {
          fecha: fechaInicioDate,
          hora,
          lugarId
        }
      });

      if (turnoExistente) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un turno en esa fecha, hora y lugar'
        });
      }

      const nuevoTurno = await Turno.create({
        fecha: fechaInicioDate,
        hora,
        lugarId,
        estado: estado || 'libre',
        equipoId: req.user?.equipoId || 1
      });

      // Crear las relaciones con exhibidores
      const turnoExhibidorRecords = exhibidorIds.map((exhibidorId: number) => ({
        turnoId: nuevoTurno.id,
        exhibidorId
      }));
      
      await TurnoExhibidor.bulkCreate(turnoExhibidorRecords);

      // Crear las relaciones con usuarios si se proporcionan
      if (usuarioIds && Array.isArray(usuarioIds) && usuarioIds.length > 0) {
        const turnoUsuarioRecords = usuarioIds.map((usuarioId: number) => ({
          turnoId: nuevoTurno.id,
          usuarioId
        }));
        await TurnoUsuario.bulkCreate(turnoUsuarioRecords);
      }

      turnosCreados.push(nuevoTurno);
    }

    res.status(201).json({
      success: true,
      message: esRecurrente 
        ? `Se crearon ${turnosCreados.length} turnos recurrentes semanales`
        : 'Turno creado exitosamente',
      data: turnosCreados
    });
  } catch (error) {
    console.error('Error creando turnos recurrentes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const getTurnos = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const turnos = await Turno.findAll({
      include: [
        {
          model: Lugar,
          as: 'lugar',
          attributes: ['id', 'nombre', 'direccion', 'exhibidores']
        },
        {
          model: Usuario,
          as: 'usuarios',
          through: { attributes: [] },
          attributes: ['id', 'nombre', 'email', 'cargo', 'sexo', 'tieneCoche', 'siempreCon', 'nuncaCon'],
          include: [
            {
              model: Usuario,
              as: 'siempreConUsuario',
              attributes: ['id', 'nombre']
            }
          ]
        },
        {
          model: Exhibidor,
          as: 'exhibidores',
          through: { attributes: [] },
          attributes: ['id', 'nombre', 'descripcion']
        }
      ],
      order: [['fecha', 'ASC'], ['hora', 'ASC']]
    });

    console.log('🔍 Backend: Turnos encontrados:', turnos.length);
    
    // Log detallado del primer turno para debug
    if (turnos.length > 0) {
      const primerTurno = turnos[0];
      console.log('🔍 Backend: Primer turno ID:', primerTurno.id);
      console.log('🔍 Backend: Usuarios del primer turno:', primerTurno.usuarios?.length || 0);
      
      if (primerTurno.usuarios && primerTurno.usuarios.length > 0) {
        const primerUsuario = primerTurno.usuarios[0];
        console.log('🔍 Backend: Primer usuario del primer turno:', {
          id: primerUsuario.id,
          nombre: primerUsuario.nombre,
          siempreCon: primerUsuario.siempreCon,
          tipoSiempreCon: typeof primerUsuario.siempreCon,
          todosLosCampos: Object.keys(primerUsuario)
        });
      }
    }

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

// Limpiar todos los usuarios de todos los turnos (admin)
export const limpiarTodosLosUsuariosDeTurnos = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Verificar que el usuario sea admin
    if (req.user?.rol !== 'admin' && req.user?.rol !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Solo los administradores pueden realizar esta acción.'
      });
    }

    // Obtener parámetros de mes y año desde query params
    const { mes, año } = req.query;
    
    if (!mes || !año) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren los parámetros mes y año'
      });
    }

    const mesNum = parseInt(mes as string);
    const añoNum = parseInt(año as string);

    if (isNaN(mesNum) || isNaN(añoNum)) {
      return res.status(400).json({
        success: false,
        message: 'Los parámetros mes y año deben ser números válidos'
      });
    }

    // Construir fecha de inicio y fin del mes
    const fechaInicio = new Date(añoNum, mesNum, 1);
    const fechaFin = new Date(añoNum, mesNum + 1, 0); // Último día del mes

    console.log(`🧹 Limpiando usuarios de turnos del mes ${mesNum + 1}/${añoNum} (${fechaInicio.toISOString()} - ${fechaFin.toISOString()})`);

    // Obtener los IDs de los turnos del mes y año especificados
    const turnosDelMes = await Turno.findAll({
      where: {
        fecha: {
          [Op.between]: [fechaInicio.toISOString().split('T')[0], fechaFin.toISOString().split('T')[0]]
        }
      },
      attributes: ['id']
    });

    const turnoIds = turnosDelMes.map(turno => turno.id);

    if (turnoIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: `No hay turnos en el mes ${mesNum + 1}/${añoNum} para limpiar.`,
        data: { turnosLimpiados: 0 }
      });
    }

    // Eliminar las relaciones usuario-turno solo para los turnos del mes especificado
    const resultado = await TurnoUsuario.destroy({
      where: {
        turnoId: {
          [Op.in]: turnoIds
        }
      },
      force: true // Eliminación permanente
    });

    // Actualizar el estado de los turnos del mes especificado a 'libre'
    await Turno.update(
      { estado: 'libre' },
      { 
        where: {
          id: {
            [Op.in]: turnoIds
          }
        }
      }
    );

    console.log(`🧹 Se limpiaron ${resultado} asignaciones de usuarios de turnos del mes ${mesNum + 1}/${añoNum}`);

    res.status(200).json({
      success: true,
      message: `Se limpiaron exitosamente ${resultado} asignaciones de usuarios de turnos del mes ${mesNum + 1}/${añoNum}. Todos los turnos del mes ahora están libres.`,
      data: { turnosLimpiados: resultado }
    });
  } catch (error) {
    console.error('Error limpiando usuarios de turnos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al limpiar usuarios de turnos'
    });
  }
};
