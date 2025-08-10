import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface LugarAttributes {
  id: number;
  nombre: string;
  direccion: string;
  descripcion?: string;
  capacidad?: number;
  exhibidores?: number;
  activo?: boolean;
  latitud?: number;
  longitud?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LugarCreationAttributes extends Optional<LugarAttributes, 'id'> {}

class Lugar extends Model<LugarAttributes, LugarCreationAttributes> implements LugarAttributes {
  public id!: number;
  public nombre!: string;
  public direccion!: string;
  public descripcion?: string;
  public capacidad?: number;
  public exhibidores?: number;
  public activo?: boolean;
  public latitud?: number;
  public longitud?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Lugar.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    direccion: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    capacidad: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        isInt: true,
      },
    },
    exhibidores: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        isInt: true,
      },
    },
    latitud: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
      validate: {
        min: -90,
        max: 90,
      },
    },
    longitud: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
      validate: {
        min: -180,
        max: 180,
      },
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'lugares',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['nombre']
      }
    ]
  }
);

export default Lugar;
