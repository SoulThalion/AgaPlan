import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface LugarAttributes {
  id: number;
  nombre: string;
  direccion: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LugarCreationAttributes extends Optional<LugarAttributes, 'id'> {}

class Lugar extends Model<LugarAttributes, LugarCreationAttributes> implements LugarAttributes {
  public id!: number;
  public nombre!: string;
  public direccion!: string;
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
  },
  {
    sequelize,
    tableName: 'lugares',
    timestamps: true,
  }
);

export default Lugar;
