import { Op } from 'sequelize';
import { Turno, Usuario, Lugar, Exhibidor, TurnoUsuario, TurnoExhibidor, UsuarioNotificacionConfig } from '../models';
import emailService, { TurnosAgrupadosNotificationData } from './emailService';

export interface NotificationJob {
  turnoId: number;
  usuarioId: number;
  tipoNotificacion: 'una_semana' | 'un_dia' | 'una_hora';
  fechaEnvio: Date;
}

class NotificationService {
  
  /**
   * Obtiene todos los turnos que necesitan notificaciones en el momento actual
   */
  async getPendingNotifications(): Promise<NotificationJob[]> {
    const now = new Date();
    const jobs: NotificationJob[] = [];

    // Obtener turnos que necesitan notificación de una semana antes
    const unaSemanaJobs = await this.getTurnosForNotification(now, 'una_semana');
    jobs.push(...unaSemanaJobs);

    // Obtener turnos que necesitan notificación de un día antes
    const unDiaJobs = await this.getTurnosForNotification(now, 'un_dia');
    jobs.push(...unDiaJobs);

    // Obtener turnos que necesitan notificación de una hora antes
    const unaHoraJobs = await this.getTurnosForNotification(now, 'una_hora');
    jobs.push(...unaHoraJobs);

    return jobs;
  }

  /**
   * Obtiene turnos que necesitan notificación para un tipo específico
   */
  private async getTurnosForNotification(now: Date, tipo: 'una_semana' | 'un_dia' | 'una_hora'): Promise<NotificationJob[]> {
    const jobs: NotificationJob[] = [];
    
    // Calcular la fecha objetivo según el tipo de notificación
    let fechaObjetivo: Date;
    switch (tipo) {
      case 'una_semana':
        fechaObjetivo = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 días
        break;
      case 'un_dia':
        fechaObjetivo = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +1 día
        break;
      case 'una_hora':
        fechaObjetivo = new Date(now.getTime() + 60 * 60 * 1000); // +1 hora
        break;
    }

    // Obtener turnos para la fecha objetivo
    const turnos = await Turno.findAll({
      where: {
        fecha: fechaObjetivo.toISOString().split('T')[0], // Formato YYYY-MM-DD
        estado: 'ocupado' // Solo turnos ocupados
      },
      include: [
        {
          model: Usuario,
          as: 'usuarios',
          through: { attributes: [] },
          where: {
            email: { [Op.ne]: null }, // Solo usuarios con email
            activo: true
          }
        },
        {
          model: Lugar,
          as: 'lugar'
        },
        {
          model: Exhibidor,
          as: 'exhibidores',
          through: { attributes: [] }
        }
      ]
    });

    // Para cada turno, verificar la configuración de notificaciones de cada usuario
    for (const turno of turnos) {
      if (turno.usuarios) {
        for (const usuario of turno.usuarios) {
        // Obtener configuración de notificaciones del usuario
        const config = await UsuarioNotificacionConfig.findOne({
          where: { usuarioId: usuario.id }
        });

        // Si no hay configuración, crear una por defecto
        if (!config) {
          await UsuarioNotificacionConfig.create({
            usuarioId: usuario.id,
            notificarUnaSemanaAntes: true,
            notificarUnDiaAntes: true,
            notificarUnaHoraAntes: true,
            activo: true
          });
        }

          // Verificar si el usuario quiere recibir este tipo de notificación
          const shouldNotify = this.shouldSendNotification(config, tipo);
          
          if (shouldNotify) {
            jobs.push({
              turnoId: turno.id,
              usuarioId: usuario.id,
              tipoNotificacion: tipo,
              fechaEnvio: now
            });
          }
        }
      }
    }

    return jobs;
  }

  /**
   * Verifica si se debe enviar una notificación según la configuración del usuario
   */
  private shouldSendNotification(config: UsuarioNotificacionConfig | null, tipo: 'una_semana' | 'un_dia' | 'una_hora'): boolean {
    if (!config || !config.activo) {
      return false;
    }

    switch (tipo) {
      case 'una_semana':
        return config.notificarUnaSemanaAntes;
      case 'un_dia':
        return config.notificarUnDiaAntes;
      case 'una_hora':
        return config.notificarUnaHoraAntes;
      default:
        return false;
    }
  }

  /**
   * Procesa una notificación específica
   */
  async processNotification(job: NotificationJob): Promise<boolean> {
    try {
      // Obtener datos completos del turno
      const turno = await Turno.findByPk(job.turnoId, {
        include: [
          {
            model: Usuario,
            as: 'usuarios',
            through: { attributes: [] }
          },
          {
            model: Lugar,
            as: 'lugar'
          },
          {
            model: Exhibidor,
            as: 'exhibidores',
            through: { attributes: [] }
          }
        ]
      });

      if (!turno) {
        console.warn(`⚠️  Turno ${job.turnoId} no encontrado`);
        return false;
      }

      // Encontrar el usuario específico
      if (!turno.usuarios) {
        console.warn(`⚠️  Turno ${job.turnoId} no tiene usuarios asignados`);
        return false;
      }

      const usuario = turno.usuarios.find(u => u.id === job.usuarioId);
      if (!usuario) {
        console.warn(`⚠️  Usuario ${job.usuarioId} no encontrado en turno ${job.turnoId}`);
        return false;
      }

      // Obtener compañeros (otros usuarios del turno)
      const companeros = turno.usuarios.filter(u => u.id !== job.usuarioId);

      // Preparar datos para el email
      const emailData = {
        turno,
        usuario,
        lugar: turno.lugar,
        exhibidores: turno.exhibidores || [],
        companeros,
        tipoNotificacion: job.tipoNotificacion
      };

      // Enviar email
      const success = await emailService.sendTurnoNotification(emailData);
      
      if (success) {
        console.log(`✅ Notificación ${job.tipoNotificacion} enviada a ${usuario.nombre} (${usuario.email}) para turno ${job.turnoId}`);
      }

      return success;
    } catch (error) {
      console.error(`❌ Error procesando notificación para turno ${job.turnoId}, usuario ${job.usuarioId}:`, error);
      return false;
    }
  }

  /**
   * Procesa todas las notificaciones pendientes
   */
  async processAllPendingNotifications(): Promise<{ sent: number; failed: number }> {
    const jobs = await this.getPendingNotifications();
    let sent = 0;
    let failed = 0;

    console.log(`📧 Procesando ${jobs.length} notificaciones pendientes...`);

    for (const job of jobs) {
      const success = await this.processNotification(job);
      if (success) {
        sent++;
      } else {
        failed++;
      }
    }

    console.log(`📊 Notificaciones procesadas: ${sent} enviadas, ${failed} fallidas`);
    return { sent, failed };
  }

  /**
   * Crea o actualiza la configuración de notificaciones de un usuario
   */
  async updateUserNotificationConfig(
    usuarioId: number,
    config: {
      notificarUnaSemanaAntes?: boolean;
      notificarUnDiaAntes?: boolean;
      notificarUnaHoraAntes?: boolean;
      activo?: boolean;
    }
  ): Promise<UsuarioNotificacionConfig> {
    const [userConfig] = await UsuarioNotificacionConfig.upsert({
      usuarioId,
      notificarUnaSemanaAntes: config.notificarUnaSemanaAntes ?? true,
      notificarUnDiaAntes: config.notificarUnDiaAntes ?? true,
      notificarUnaHoraAntes: config.notificarUnaHoraAntes ?? true,
      activo: config.activo ?? true
    });

    return userConfig;
  }

  /**
   * Obtiene la configuración de notificaciones de un usuario
   */
  async getUserNotificationConfig(usuarioId: number): Promise<UsuarioNotificacionConfig | null> {
    return await UsuarioNotificacionConfig.findOne({
      where: { usuarioId }
    });
  }

  /**
   * Envía notificaciones a TODOS los usuarios con turnos (para pruebas manuales)
   * AGRUPA todos los turnos del usuario en un solo email
   */
  async sendNotificationsToAllUsers(month: string): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    console.log(`📧 Enviando notificaciones agrupadas a TODOS los usuarios con turnos para ${month}...`);

    // Parsear el mes (formato: YYYY-MM)
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59);

    console.log(`📅 Filtrando turnos entre ${startDate.toISOString()} y ${endDate.toISOString()}`);

    // Obtener todos los turnos con TODOS los usuarios (para mostrar compañeros correctamente)
    const turnos = await Turno.findAll({
      where: {
        estado: 'ocupado', // Solo turnos ocupados
        fecha: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [
        {
          model: Usuario,
          as: 'usuarios',
          through: { attributes: [] },
          where: {
            activo: true // Todos los usuarios activos
          }
        },
        {
          model: Lugar,
          as: 'lugar'
        },
        {
          model: Exhibidor,
          as: 'exhibidores',
          through: { attributes: [] }
        }
      ]
    });

    console.log(`📊 Encontrados ${turnos.length} turnos con usuarios`);

    // Agrupar turnos por usuario
    const turnosPorUsuario = new Map<number, {
      usuario: Usuario;
      turnos: Array<{
        turno: Turno;
        lugar: Lugar;
        exhibidores: Exhibidor[];
        companeros: Usuario[];
      }>;
    }>();

    // Procesar cada turno y agrupar por usuario
    for (const turno of turnos) {
      if (turno.usuarios) {
        // Filtrar solo usuarios con email para enviar notificaciones
        const usuariosConEmail = turno.usuarios.filter(u => u.email && u.email.trim() !== '');
        
        for (const usuario of usuariosConEmail) {
          // Obtener TODOS los compañeros del turno (incluyendo los que no tienen email)
          const companeros = turno.usuarios.filter(u => u.id !== usuario.id);

          // Agregar turno al usuario
          if (!turnosPorUsuario.has(usuario.id)) {
            turnosPorUsuario.set(usuario.id, {
              usuario,
              turnos: []
            });
          }

          turnosPorUsuario.get(usuario.id)!.turnos.push({
            turno,
            lugar: turno.lugar!,
            exhibidores: turno.exhibidores || [],
            companeros
          });
        }
      }
    }

    console.log(`👥 Encontrados ${turnosPorUsuario.size} usuarios únicos con email`);

    // Enviar un email por usuario con todos sus turnos
    for (const [usuarioId, usuarioData] of turnosPorUsuario) {
      try {
        const { usuario, turnos } = usuarioData;

        // Preparar datos para el email agrupado
        const emailData = {
          usuario,
          turnos, // Array de turnos agrupados
          tipoNotificacion: 'manual' as const, // Tipo especial para envío manual
          month // Mes seleccionado
        };

        // Enviar email agrupado
        const success = await emailService.sendTurnosAgrupadosNotification(emailData, month);
        
        if (success) {
          console.log(`✅ Notificación manual agrupada enviada a ${usuario.nombre} (${usuario.email}) con ${turnos.length} turnos`);
          sent++;
        } else {
          console.warn(`⚠️  Falló envío agrupado a ${usuario.nombre} (${usuario.email})`);
          failed++;
        }
      } catch (error) {
        console.error(`❌ Error enviando notificación agrupada a usuario ${usuarioId}:`, error);
        failed++;
      }
    }

    console.log(`📊 Notificaciones manuales agrupadas procesadas: ${sent} enviadas, ${failed} fallidas`);
    return { sent, failed };
  }
}

export default new NotificationService();
