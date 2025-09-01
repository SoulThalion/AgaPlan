import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export interface UsuarioNotificacionConfigAttributes {
  id?: number;
  usuarioId: number;
  notificarUnaSemanaAntes: boolean;
  notificarUnDiaAntes: boolean;
  notificarUnaHoraAntes: boolean;
  activo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UsuarioNotificacionConfigCreationAttributes 
  extends Omit<UsuarioNotificacionConfigAttributes, 'id' | 'createdAt' | 'updatedAt'> {
  id?: number;
}

class UsuarioNotificacionConfig extends Model<UsuarioNotificacionConfigAttributes, UsuarioNotificacionConfigCreationAttributes> 
  implements UsuarioNotificacionConfigAttributes {
  public id!: number;
  public usuarioId!: number;
  public notificarUnaSemanaAntes!: boolean;
  public notificarUnDiaAntes!: boolean;
  public notificarUnaHoraAntes!: boolean;
  public activo!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UsuarioNotificacionConfig.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
    notificarUnaSemanaAntes: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    notificarUnDiaAntes: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    notificarUnaHoraAntes: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'usuario_notificacion_config',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['usuarioId']
      }
    ],
  }
);

export default UsuarioNotificacionConfig;
