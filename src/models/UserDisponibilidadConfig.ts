import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface UserDisponibilidadConfigAttributes {
  id: number;
  usuarioId: number;
  mes: string; // Formato YYYY-MM
  tipo_disponibilidad: 'todasTardes' | 'todasMananas' | 'diasSemana' | 'fechaConcreta' | 'noDisponibleFecha';
  configuracion: {
    // Para todasTardes y todasMananas
    hora_inicio?: string;
    hora_fin?: string;
    
    // Para diasSemana
    dias?: number[]; // 0-6 (Domingo-Sábado)
    periodo?: 'manana' | 'tarde' | 'personalizado';
    hora_inicio_personalizado?: string;
    hora_fin_personalizado?: string;
    
    // Para fechaConcreta y noDisponibleFecha
    fecha?: string; // Formato YYYY-MM-DD
    periodo_fecha?: 'manana' | 'tarde' | 'personalizado';
    hora_inicio_fecha?: string;
    hora_fin_fecha?: string;
  };
  activo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserDisponibilidadConfigCreationAttributes extends Optional<UserDisponibilidadConfigAttributes, 'id'> {}

class UserDisponibilidadConfig extends Model<UserDisponibilidadConfigAttributes, UserDisponibilidadConfigCreationAttributes> implements UserDisponibilidadConfigAttributes {
  public id!: number;
  public usuarioId!: number;
  public mes!: string;
  public tipo_disponibilidad!: 'todasTardes' | 'todasMananas' | 'diasSemana' | 'fechaConcreta' | 'noDisponibleFecha';
  public configuracion!: any;
  public activo!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserDisponibilidadConfig.init(
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
    },
    mes: {
      type: DataTypes.STRING(7),
      allowNull: false,
      validate: {
        is: /^\d{4}-\d{2}$/, // Formato YYYY-MM
      },
    },
    tipo_disponibilidad: {
      type: DataTypes.ENUM('todasTardes', 'todasMananas', 'diasSemana', 'fechaConcreta', 'noDisponibleFecha'),
      allowNull: false,
    },
    configuracion: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'user_disponibilidad_config',
    timestamps: true,
    indexes: [
      {
        fields: ['usuarioId'],
      },
      {
        fields: ['mes'],
      },
      {
        fields: ['tipo_disponibilidad'],
      },
      // NOTA: Se eliminó el índice único para permitir múltiples configuraciones
      // del mismo tipo para un usuario y mes (ej: diferentes días de la semana)
    ],
  }
);

export default UserDisponibilidadConfig;
