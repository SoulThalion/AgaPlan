import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export interface ExhibidorAttributes {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  equipoId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ExhibidorCreationAttributes extends Omit<ExhibidorAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Exhibidor extends Model<ExhibidorAttributes, ExhibidorCreationAttributes> implements ExhibidorAttributes {
  public id!: number;
  public nombre!: string;
  public descripcion?: string;
  public activo!: boolean;
  public equipoId!: number;
  public equipo?: any; // Para la relación con Equipo
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Exhibidor.init(
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
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: 'exhibidores',
    timestamps: true,
    modelName: 'Exhibidor',
  }
);

export default Exhibidor;
