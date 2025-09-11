import { Request, Response } from 'express';
import Disponibilidad from '../models/Disponibilidad';
import Usuario from '../models/Usuario';
import { Op } from 'sequelize';

export const disponibilidadController = {
  // Obtener todas las disponibilidades
  async getAllDisponibilidades(req: Request, res: Response) {
    try {
      const disponibilidades = await Disponibilidad.findAll({
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['id', 'nombre', 'email']
          }
        ],
        order: [['dia_semana', 'ASC'], ['hora_inicio', 'ASC']]
      });

      res.json({
        success: true,
        data: disponibilidades,
        message: 'Disponibilidades obtenidas exitosamente'
      });
    } catch (error) {
      console.error('Error al obtener disponibilidades:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Obtener disponibilidades por usuario
  async getDisponibilidadesByUsuario(req: Request, res: Response) {
    try {
      const { usuarioId } = req.params;
      
      if (!usuarioId) {
        return res.status(400).json({
          success: false,
          message: 'ID de usuario es requerido'
        });
      }

      const disponibilidades = await Disponibilidad.findAll({
        where: { usuarioId: parseInt(usuarioId) },
        order: [['dia_semana', 'ASC'], ['hora_inicio', 'ASC']]
      });

      res.json({
        success: true,
        data: disponibilidades,
        message: 'Disponibilidades del usuario obtenidas exitosamente'
      });
    } catch (error) {
      console.error('Error al obtener disponibilidades del usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Crear nueva disponibilidad
  async createDisponibilidad(req: Request, res: Response) {
    try {
      const { dia_semana, hora_inicio, hora_fin, usuarioId } = req.body;

      // Validaciones básicas
      if (!dia_semana || !hora_inicio || !hora_fin || !usuarioId) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son requeridos'
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

      // Verificar que no haya conflicto de horarios para el mismo usuario y día
      const conflicto = await Disponibilidad.findOne({
        where: {
          usuarioId,
          dia_semana,
          [Op.or]: [
            {
              hora_inicio: {
                [Op.lt]: hora_fin,
                [Op.gte]: hora_inicio
              }
            },
            {
              hora_fin: {
                [Op.gt]: hora_inicio,
                [Op.lte]: hora_fin
              }
            }
          ]
        }
      });

      if (conflicto) {
        return res.status(400).json({
          success: false,
          message: 'Existe un conflicto de horarios para este día'
        });
      }

      const disponibilidad = await Disponibilidad.create({
        dia_semana,
        hora_inicio,
        hora_fin,
        usuarioId,
        activo: true
      });

      res.status(201).json({
        success: true,
        data: disponibilidad,
        message: 'Disponibilidad creada exitosamente'
      });
    } catch (error) {
      console.error('Error al crear disponibilidad:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Actualizar disponibilidad
  async updateDisponibilidad(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { dia_semana, hora_inicio, hora_fin } = req.body;

      const disponibilidad = await Disponibilidad.findByPk(id);
      if (!disponibilidad) {
        return res.status(404).json({
          success: false,
          message: 'Disponibilidad no encontrada'
        });
      }

      // Verificar que no haya conflicto de horarios (excluyendo la disponibilidad actual)
      if (dia_semana !== undefined || hora_inicio !== undefined || hora_fin !== undefined) {
        const conflicto = await Disponibilidad.findOne({
          where: {
            id: { [Op.ne]: id },
            usuarioId: disponibilidad.usuarioId,
            dia_semana: dia_semana || disponibilidad.dia_semana,
            [Op.or]: [
              {
                hora_inicio: {
                  [Op.lt]: hora_fin || disponibilidad.hora_fin,
                  [Op.gte]: hora_inicio || disponibilidad.hora_inicio
                }
              },
              {
                hora_fin: {
                  [Op.gt]: hora_inicio || disponibilidad.hora_inicio,
                  [Op.lte]: hora_fin || disponibilidad.hora_fin
                }
              }
            ]
          }
        });

        if (conflicto) {
          return res.status(400).json({
            success: false,
            message: 'Existe un conflicto de horarios para este día'
          });
        }
      }

      await disponibilidad.update({
        dia_semana: dia_semana || disponibilidad.dia_semana,
        hora_inicio: hora_inicio || disponibilidad.hora_inicio,
        hora_fin: hora_fin || disponibilidad.hora_fin,
        activo: req.body.activo !== undefined ? req.body.activo : disponibilidad.activo
      });

      res.json({
        success: true,
        data: disponibilidad,
        message: 'Disponibilidad actualizada exitosamente'
      });
    } catch (error) {
      console.error('Error al actualizar disponibilidad:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // Eliminar disponibilidad
  async deleteDisponibilidad(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const disponibilidad = await Disponibilidad.findByPk(id);
      if (!disponibilidad) {
        return res.status(404).json({
          success: false,
          message: 'Disponibilidad no encontrada'
        });
      }

      await disponibilidad.destroy();

      res.json({
        success: true,
        message: 'Disponibilidad eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar disponibilidad:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
};

