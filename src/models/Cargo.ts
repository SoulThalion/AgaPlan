import { Model, DataTypes, Sequelize } from 'sequelize';
import { sequelize } from './index';

export interface CargoAttributes {
  id: number;
  nombre: string;
  descripcion?: string;
  prioridad: number; // Prioridad para asignación de turnos (1 = más alta, 999 = más baja)
  activo: boolean;
  equipoId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CargoCreationAttributes extends Omit<CargoAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Cargo extends Model<CargoAttributes, CargoCreationAttributes> implements CargoAttributes {
  public id!: number;
  public nombre!: string;
  public descripcion?: string;
  public prioridad!: number;
  public activo!: boolean;
  public equipoId!: number;
  public equipo?: any; // Para la relación con Equipo
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Cargo.init(
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
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    prioridad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 999,
      validate: {
        min: 1,
        max: 999,
        isInt: true,
      },
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    equipoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'equipos',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'cargos',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['nombre']
      },
      {
        fields: ['prioridad']
      },
      {
        fields: ['activo']
      }
    ],
  }
);

export default Cargo;
