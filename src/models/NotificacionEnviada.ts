import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export interface NotificacionEnviadaAttributes {
  id?: number;
  turnoId: number;
  usuarioId: number;
  tipoNotificacion: 'una_semana' | 'un_dia' | 'una_hora';
  fechaEnvio: Date;
  emailEnviado: boolean;
  error?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NotificacionEnviadaCreationAttributes 
  extends Omit<NotificacionEnviadaAttributes, 'id' | 'createdAt' | 'updatedAt'> {
}

class NotificacionEnviada extends Model<NotificacionEnviadaAttributes, NotificacionEnviadaCreationAttributes> 
  implements NotificacionEnviadaAttributes {
  
  public id!: number;
  public turnoId!: number;
  public usuarioId!: number;
  public tipoNotificacion!: 'una_semana' | 'un_dia' | 'una_hora';
  public fechaEnvio!: Date;
  public emailEnviado!: boolean;
  public error?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

NotificacionEnviada.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    turnoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'turnos',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    tipoNotificacion: {
      type: DataTypes.ENUM('una_semana', 'un_dia', 'una_hora'),
      allowNull: false,
    },
    fechaEnvio: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    emailEnviado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    error: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'notificaciones_enviadas',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['turnoId', 'usuarioId', 'tipoNotificacion'],
        name: 'unique_notification_per_turno_usuario_tipo'
      },
      {
        fields: ['fechaEnvio']
      },
      {
        fields: ['tipoNotificacion']
      }
    ],
  }
);

export default NotificacionEnviada;
