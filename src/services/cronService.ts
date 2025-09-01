import * as cron from 'node-cron';
import notificationService from './notificationService';
import emailService from './emailService';

class CronService {
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  /**
   * Inicializa todos los trabajos programados
   */
  initialize(): void {
    console.log('🕐 Inicializando trabajos programados...');

    // Verificar conexión SMTP al inicio
    this.testEmailConnection();

    // Trabajo para notificaciones de una semana antes (diario a las 9:00 AM)
    this.scheduleJob('notifications-week', '0 9 * * *', async () => {
      console.log('📅 Ejecutando notificaciones de una semana antes...');
      await notificationService.processAllPendingNotifications();
    });

    // Trabajo para notificaciones de un día antes (diario a las 9:00 AM)
    this.scheduleJob('notifications-day', '0 9 * * *', async () => {
      console.log('📅 Ejecutando notificaciones de un día antes...');
      await notificationService.processAllPendingNotifications();
    });

    // Trabajo para notificaciones de una hora antes (cada hora)
    this.scheduleJob('notifications-hour', '0 * * * *', async () => {
      console.log('⏰ Ejecutando notificaciones de una hora antes...');
      await notificationService.processAllPendingNotifications();
    });

    // Trabajo de mantenimiento diario (a las 2:00 AM)
    this.scheduleJob('maintenance', '0 2 * * *', async () => {
      console.log('🔧 Ejecutando mantenimiento diario...');
      await this.dailyMaintenance();
    });

    console.log('✅ Trabajos programados inicializados correctamente');
  }

  /**
   * Programa un trabajo cron
   */
  private scheduleJob(name: string, schedule: string, task: () => Promise<void>): void {
    const job = cron.schedule(schedule, async () => {
      try {
        await task();
      } catch (error) {
        console.error(`❌ Error en trabajo programado ${name}:`, error);
      }
    }, {
      timezone: 'Europe/Madrid' // Zona horaria de España
    });

    this.jobs.set(name, job);
    job.start();
    console.log(`⏰ Trabajo ${name} programado: ${schedule}`);
  }

  /**
   * Detiene todos los trabajos programados
   */
  stopAll(): void {
    console.log('🛑 Deteniendo todos los trabajos programados...');
    
    for (const [name, job] of this.jobs) {
      job.stop();
      console.log(`⏹️  Trabajo ${name} detenido`);
    }
    
    this.jobs.clear();
  }

  /**
   * Detiene un trabajo específico
   */
  stopJob(name: string): boolean {
    const job = this.jobs.get(name);
    if (job) {
      job.stop();
      this.jobs.delete(name);
      console.log(`⏹️  Trabajo ${name} detenido`);
      return true;
    }
    return false;
  }

  /**
   * Inicia un trabajo específico
   */
  startJob(name: string): boolean {
    const job = this.jobs.get(name);
    if (job) {
      job.start();
      console.log(`▶️  Trabajo ${name} iniciado`);
      return true;
    }
    return false;
  }

  /**
   * Obtiene el estado de todos los trabajos
   */
  getJobsStatus(): { name: string; running: boolean }[] {
    const status: { name: string; running: boolean }[] = [];
    
    for (const [name, job] of this.jobs) {
      status.push({
        name,
        running: job.getStatus() === 'scheduled'
      });
    }
    
    return status;
  }

  /**
   * Ejecuta notificaciones manualmente (para testing)
   */
  async runNotificationsManually(): Promise<{ sent: number; failed: number }> {
    console.log('🔧 Ejecutando notificaciones manualmente...');
    return await notificationService.processAllPendingNotifications();
  }

  /**
   * Mantenimiento diario
   */
  private async dailyMaintenance(): Promise<void> {
    try {
      // Verificar conexión SMTP
      await this.testEmailConnection();
      
      // Aquí se pueden agregar más tareas de mantenimiento
      console.log('✅ Mantenimiento diario completado');
    } catch (error) {
      console.error('❌ Error en mantenimiento diario:', error);
    }
  }

  /**
   * Prueba la conexión SMTP
   */
  private async testEmailConnection(): Promise<void> {
    try {
      const isConnected = await emailService.testConnection();
      if (isConnected) {
        console.log('✅ Conexión SMTP verificada');
      } else {
        console.warn('⚠️  No se pudo verificar la conexión SMTP');
      }
    } catch (error) {
      console.error('❌ Error verificando conexión SMTP:', error);
    }
  }

  /**
   * Obtiene información sobre los trabajos programados
   */
  getInfo(): { name: string; schedule: string; description: string }[] {
    return [
      {
        name: 'notifications-week',
        schedule: '0 9 * * *',
        description: 'Notificaciones de una semana antes (diario a las 9:00 AM)'
      },
      {
        name: 'notifications-day',
        schedule: '0 9 * * *',
        description: 'Notificaciones de un día antes (diario a las 9:00 AM)'
      },
      {
        name: 'notifications-hour',
        schedule: '0 * * * *',
        description: 'Notificaciones de una hora antes (cada hora)'
      },
      {
        name: 'maintenance',
        schedule: '0 2 * * *',
        description: 'Mantenimiento diario (a las 2:00 AM)'
      }
    ];
  }
}

export default new CronService();
