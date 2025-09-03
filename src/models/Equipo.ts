import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export interface EquipoAttributes {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EquipoCreationAttributes extends Omit<EquipoAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Equipo extends Model<EquipoAttributes, EquipoCreationAttributes> implements EquipoAttributes {
  public id!: number;
  public nombre!: string;
  public descripcion?: string;
  public activo!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Equipo.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        len: [2, 100],
        notEmpty: true,
      },
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'equipos',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['nombre']
      },
      {
        fields: ['activo']
      }
    ],
  }
);

export default Equipo;
