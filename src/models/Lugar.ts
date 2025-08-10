import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface LugarAttributes {
  id: number;
  nombre: string;
  direccion: string;
  capacidad?: number;
  activo?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LugarCreationAttributes extends Optional<LugarAttributes, 'id'> {}

class Lugar extends Model<LugarAttributes, LugarCreationAttributes> implements LugarAttributes {
  public id!: number;
  public nombre!: string;
  public direccion!: string;
  public capacidad?: number;
  public activo?: boolean;
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
    capacidad: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        isInt: true,
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
