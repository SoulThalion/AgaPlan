import nodemailer from 'nodemailer';
import { Turno, Usuario, Lugar, Exhibidor } from '../models';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface TurnoNotificationData {
  turno: Turno;
  usuario: Usuario;
  lugar: Lugar;
  exhibidores: Exhibidor[];
  companeros: Usuario[];
  tipoNotificacion: 'una_semana' | 'un_dia' | 'una_hora';
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private config: EmailConfig | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Configuración desde variables de entorno
    const emailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    };

    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      console.warn('⚠️  Configuración de email no encontrada. Las notificaciones por email estarán deshabilitadas.');
      return;
    }

    this.config = emailConfig;
    this.transporter = nodemailer.createTransport(emailConfig);
  }

  async sendTurnoNotification(data: TurnoNotificationData): Promise<boolean> {
    if (!this.transporter || !this.config) {
      console.warn('⚠️  Servicio de email no configurado. No se puede enviar notificación.');
      return false;
    }

    if (!data.usuario.email) {
      console.warn(`⚠️  Usuario ${data.usuario.nombre} no tiene email configurado.`);
      return false;
    }

    try {
      const emailContent = this.generateEmailContent(data);
      
      const mailOptions = {
        from: `"AgaPlan" <${this.config.auth.user}>`,
        to: data.usuario.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email enviado a ${data.usuario.email}: ${result.messageId}`);
      return true;
    } catch (error) {
      console.error(`❌ Error enviando email a ${data.usuario.email}:`, error);
      return false;
    }
  }

  private generateEmailContent(data: TurnoNotificationData) {
    const { turno, usuario, lugar, exhibidores, companeros, tipoNotificacion } = data;
    
    // Formatear fecha y hora
    const fecha = new Date(turno.fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const [horaInicio, horaFin] = turno.hora.split('-');
    const horario = `${horaInicio} - ${horaFin}`;
    
    // Generar contenido según el tipo de notificación
    let subject = '';
    let tiempoRestante = '';
    
    switch (tipoNotificacion) {
      case 'una_semana':
        subject = `Recordatorio: Tu turno en AgaPlan es en una semana`;
        tiempoRestante = 'una semana';
        break;
      case 'un_dia':
        subject = `Recordatorio: Tu turno en AgaPlan es mañana`;
        tiempoRestante = 'un día';
        break;
      case 'una_hora':
        subject = `Recordatorio: Tu turno en AgaPlan es en una hora`;
        tiempoRestante = 'una hora';
        break;
    }

    const companerosText = companeros.length > 0 
      ? companeros.map(c => c.nombre).join(', ')
      : 'No hay compañeros asignados';

    const exhibidoresText = exhibidores.length > 0
      ? exhibidores.map(e => e.nombre).join(', ')
      : 'No hay exhibidores asignados';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #3b82f6;
          }
          .header h1 {
            color: #3b82f6;
            margin: 0;
            font-size: 24px;
          }
          .turno-info {
            background-color: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #3b82f6;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .info-label {
            font-weight: bold;
            color: #4a5568;
          }
          .info-value {
            color: #2d3748;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #718096;
            font-size: 14px;
          }
          .highlight {
            background-color: #fef3c7;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #f59e0b;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 AgaPlan</h1>
            <p>Recordatorio de Turno</p>
          </div>
          
          <div class="highlight">
            <strong>¡Hola ${usuario.nombre}!</strong><br>
            Te recordamos que tienes un turno en <strong>${tiempoRestante}</strong>.
          </div>
          
          <div class="turno-info">
            <h3 style="margin-top: 0; color: #3b82f6;">📋 Detalles del Turno</h3>
            
            <div class="info-row">
              <span class="info-label">📅 Fecha:</span>
              <span class="info-value">${fecha}</span>
            </div>
            
            <div class="info-row">
              <span class="info-label">🕐 Horario:</span>
              <span class="info-value">${horario}</span>
            </div>
            
            <div class="info-row">
              <span class="info-label">📍 Lugar:</span>
              <span class="info-value">${lugar.nombre}</span>
            </div>
            
            <div class="info-row">
              <span class="info-label">🏠 Dirección:</span>
              <span class="info-value">${lugar.direccion}</span>
            </div>
            
            <div class="info-row">
              <span class="info-label">🎪 Exhibidores:</span>
              <span class="info-value">${exhibidoresText}</span>
            </div>
            
            <div class="info-row">
              <span class="info-label">👥 Compañeros:</span>
              <span class="info-value">${companerosText}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Este es un mensaje automático del sistema AgaPlan.</p>
            <p>Si tienes alguna pregunta, contacta con los administradores.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      ¡Hola ${usuario.nombre}!
      
      Te recordamos que tienes un turno en ${tiempoRestante}.
      
      DETALLES DEL TURNO:
      - Fecha: ${fecha}
      - Horario: ${horario}
      - Lugar: ${lugar.nombre}
      - Dirección: ${lugar.direccion}
      - Exhibidores: ${exhibidoresText}
      - Compañeros: ${companerosText}
      
      Este es un mensaje automático del sistema AgaPlan.
      Si tienes alguna pregunta, contacta con los administradores.
    `;

    return { subject, html, text };
  }

  async testConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('✅ Conexión SMTP verificada correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error verificando conexión SMTP:', error);
      return false;
    }
  }
}

export default new EmailService();
