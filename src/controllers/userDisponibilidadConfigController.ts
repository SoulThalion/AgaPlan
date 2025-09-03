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

    // Crear nueva configuración (se permiten múltiples configuraciones del mismo tipo)
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

// Nuevo endpoint optimizado: Obtener usuarios disponibles para una fecha específica
export const getUsuariosDisponiblesParaFecha = async (req: Request, res: Response) => {
  try {
    const { fecha, horaInicio, horaFin } = req.query;
    const equipoId = (req as any).user?.equipoId; // Obtener equipo del usuario autenticado

    if (!fecha || !horaInicio || !horaFin) {
      return res.status(400).json({
        success: false,
        message: 'Los parámetros fecha, horaInicio y horaFin son requeridos',
      });
    }

    // Validar formato de fecha
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha as string)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de fecha inválido. Debe ser YYYY-MM-DD',
      });
    }

    const fechaTurno = new Date(fecha as string);
    const diaSemana = fechaTurno.getDay();
    const mesTurno = `${fechaTurno.getFullYear()}-${(fechaTurno.getMonth() + 1).toString().padStart(2, '0')}`;

    // Obtener todos los usuarios del equipo
    const usuarios = await Usuario.findAll({
      where: { 
        equipoId,
        activo: true 
      },
      attributes: ['id', 'nombre', 'email', 'sexo', 'cargo', 'cargoId', 'rol', 'participacionMensual', 'tieneCoche', 'siempreCon', 'nuncaCon'],
      include: [
        {
          model: require('../models/Cargo').default,
          as: 'cargoInfo',
          attributes: ['id', 'nombre', 'descripcion', 'prioridad', 'activo'],
          required: false
        }
      ]
    });

    // Obtener todas las configuraciones de disponibilidad para el mes en una sola consulta
    const configuraciones = await UserDisponibilidadConfig.findAll({
      where: { 
        mes: mesTurno,
        activo: true 
      },
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id'],
          where: { equipoId }
        }
      ]
    });

    // Crear un mapa de configuraciones por usuario para acceso rápido
    const configuracionesPorUsuario = new Map();
    configuraciones.forEach(config => {
      const usuarioId = config.usuarioId;
      if (!configuracionesPorUsuario.has(usuarioId)) {
        configuracionesPorUsuario.set(usuarioId, []);
      }
      configuracionesPorUsuario.get(usuarioId).push(config);
    });

    // Filtrar usuarios que tienen disponibilidad para el turno
    const usuariosDisponibles = usuarios.filter(usuario => {
      const configsUsuario = configuracionesPorUsuario.get(usuario.id) || [];
      
      // Verificar si el usuario tiene disponibilidad para este turno específico
      return verificarDisponibilidadParaTurno(configsUsuario, {
        fecha: fecha as string,
        hora: `${horaInicio}-${horaFin}`,
        diaSemana
      });
    });

    res.json({
      success: true,
      data: usuariosDisponibles,
    });
  } catch (error) {
    console.error('Error al obtener usuarios disponibles para fecha:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};

// Función helper para verificar disponibilidad (replicada del frontend)
const verificarDisponibilidadParaTurno = (configuraciones: any[], turno: any): boolean => {
  const [horaInicioTurno, horaFinTurno] = turno.hora.split('-');
  
  for (const config of configuraciones) {
    switch (config.tipo_disponibilidad) {
      case 'todasTardes':
        // Verificar si es tarde (a partir de las 14:00)
        if (horaInicioTurno >= '14:00') {
          // Si tiene hora personalizada, verificar que coincida
          if (config.configuracion.hora_inicio && config.configuracion.hora_fin) {
            if (horaInicioTurno >= config.configuracion.hora_inicio && horaFinTurno <= config.configuracion.hora_fin) {
              return true;
            }
          } else {
            // Sin hora personalizada, cualquier tarde
            return true;
          }
        }
        break;
        
      case 'todasMananas':
        // Verificar si es mañana (hasta las 14:00)
        if (horaFinTurno <= '14:00') {
          // Si tiene hora personalizada, verificar que coincida
          if (config.configuracion.hora_inicio && config.configuracion.hora_fin) {
            if (horaInicioTurno >= config.configuracion.hora_inicio && horaFinTurno <= config.configuracion.hora_fin) {
              return true;
            }
          } else {
            // Sin hora personalizada, cualquier mañana
            return true;
          }
        }
        break;
       
      case 'diasSemana':
        // Verificar si el día del turno está en los días configurados
        if (config.configuracion.dias && config.configuracion.dias.includes(turno.diaSemana)) {
          const periodo = config.configuracion.periodo;
          
          if (periodo === 'manana' && horaFinTurno <= '14:00') {
            return true;
          } else if (periodo === 'tarde' && horaInicioTurno >= '14:00') {
            return true;
          } else if (periodo === 'todoElDia') {
            // Si es "Todo el día", está disponible sin importar la hora
            return true;
          } else if (periodo === 'personalizado' && config.configuracion.hora_inicio_personalizado && config.configuracion.hora_fin_personalizado) {
            if (horaInicioTurno >= config.configuracion.hora_inicio_personalizado && horaFinTurno <= config.configuracion.hora_fin_personalizado) {
              return true;
            }
          }
        }
        break;
        
      case 'fechaConcreta':
        // Verificar si la fecha del turno coincide
        if (config.configuracion.fecha === turno.fecha) {
          const periodo = config.configuracion.periodo_fecha;
          
          if (periodo === 'manana' && horaFinTurno <= '14:00') {
            return true;
          } else if (periodo === 'tarde' && horaInicioTurno >= '14:00') {
            return true;
          } else if (periodo === 'todoElDia') {
            // Si es "Todo el día", está disponible sin importar la hora
            return true;
          } else if (periodo === 'personalizado' && config.configuracion.hora_inicio_fecha && config.configuracion.hora_fin_fecha) {
            if (horaInicioTurno >= config.configuracion.hora_inicio_fecha && horaFinTurno <= config.configuracion.hora_fin_fecha) {
              return true;
            }
          }
        }
        break;
        
      case 'noDisponibleFecha':
        // Si el usuario NO está disponible en esta fecha, no incluirlo
        if (config.configuracion.fecha === turno.fecha) {
          const periodo = config.configuracion.periodo_fecha;
          
          if (periodo === 'manana' && horaFinTurno <= '14:00') {
            return false; // No disponible en la mañana
          } else if (periodo === 'tarde' && horaInicioTurno >= '14:00') {
            return false; // No disponible en la tarde
          } else if (periodo === 'todoElDia') {
            return false; // No disponible todo el día
          } else if (periodo === 'personalizado' && config.configuracion.hora_inicio_fecha && config.configuracion.hora_fin_fecha) {
            if (horaInicioTurno >= config.configuracion.hora_inicio_fecha && horaFinTurno <= config.configuracion.hora_fin_fecha) {
              return false; // No disponible en el horario personalizado
            }
          }
        }
        break;
    }
  }
  
  // Si no hay configuraciones específicas, el usuario no está disponible
  return false;
};