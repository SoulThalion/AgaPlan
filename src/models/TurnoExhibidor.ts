import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface TurnoExhibidorAttributes {
  id: number;
  turnoId: number;
  exhibidorId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TurnoExhibidorCreationAttributes extends Optional<TurnoExhibidorAttributes, 'id'> {}

class TurnoExhibidor extends Model<TurnoExhibidorAttributes, TurnoExhibidorCreationAttributes> implements TurnoExhibidorAttributes {
  public id!: number;
  public turnoId!: number;
  public exhibidorId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TurnoExhibidor.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    turnoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'turnos',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    exhibidorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'exhibidores',
        key: 'id',
      },
      onDelete: 'RESTRICT',
    },
  },
  {
    sequelize,
    tableName: 'turno_exhibidores',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['turnoId', 'exhibidorId'], // Un exhibidor solo puede estar una vez en un turno
      },
      {
        fields: ['turnoId'],
      },
      {
        fields: ['exhibidorId'],
      },
    ],
  }
);

export default TurnoExhibidor;
