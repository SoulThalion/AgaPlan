import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface DisponibilidadAttributes {
  id: number;
  dia_semana: number; // 0-6 (Domingo-Sábado)
  hora_inicio: string; // Formato HH:MM
  hora_fin: string; // Formato HH:MM
  usuarioId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DisponibilidadCreationAttributes extends Optional<DisponibilidadAttributes, 'id'> {}

class Disponibilidad extends Model<DisponibilidadAttributes, DisponibilidadCreationAttributes> implements DisponibilidadAttributes {
  public id!: number;
  public dia_semana!: number;
  public hora_inicio!: string;
  public hora_fin!: string;
  public usuarioId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Disponibilidad.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    dia_semana: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 6,
      },
    },
    hora_inicio: {
      type: DataTypes.STRING(5),
      allowNull: false,
      validate: {
        is: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, // Formato HH:MM
      },
    },
    hora_fin: {
      type: DataTypes.STRING(5),
      allowNull: false,
      validate: {
        is: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, // Formato HH:MM
      },
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'disponibilidades',
    timestamps: true,
    indexes: [
      {
        fields: ['usuarioId'],
      },
      {
        fields: ['dia_semana'],
      },
    ],
  }
);

export default Disponibilidad;
