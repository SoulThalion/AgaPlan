import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface TurnoAttributes {
  id: number;
  fecha: Date;
  hora: string; // Formato HH:MM
  estado: 'libre' | 'ocupado';
  usuarioId?: number; // Opcional si está libre
  lugarId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TurnoCreationAttributes extends Optional<TurnoAttributes, 'id'> {}

class Turno extends Model<TurnoAttributes, TurnoCreationAttributes> implements TurnoAttributes {
  public id!: number;
  public fecha!: Date;
  public hora!: string;
  public estado!: 'libre' | 'ocupado';
  public usuarioId?: number;
  public lugarId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Turno.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    hora: {
      type: DataTypes.STRING(5),
      allowNull: false,
      validate: {
        is: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, // Formato HH:MM
      },
    },
    estado: {
      type: DataTypes.ENUM('libre', 'ocupado'),
      allowNull: false,
      defaultValue: 'libre',
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Opcional si está libre
      references: {
        model: 'usuarios',
        key: 'id',
      },
    },
    lugarId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'lugares',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'turnos',
    timestamps: true,
    indexes: [
      {
        fields: ['fecha'],
      },
      {
        fields: ['estado'],
      },
      {
        fields: ['usuarioId'],
      },
      {
        fields: ['lugarId'],
      },
      {
        unique: true,
        fields: ['fecha', 'hora', 'lugarId'], // Un turno único por fecha, hora y lugar
      },
    ],
  }
);

export default Turno;
