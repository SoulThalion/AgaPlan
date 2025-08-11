import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface TurnoUsuarioAttributes {
  id: number;
  turnoId: number;
  usuarioId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TurnoUsuarioCreationAttributes extends Optional<TurnoUsuarioAttributes, 'id'> {}

class TurnoUsuario extends Model<TurnoUsuarioAttributes, TurnoUsuarioCreationAttributes> implements TurnoUsuarioAttributes {
  public id!: number;
  public turnoId!: number;
  public usuarioId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TurnoUsuario.init(
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
    tableName: 'turno_usuarios',
    timestamps: true,
    indexes: [
      {
        fields: ['turnoId'],
      },
      {
        fields: ['usuarioId'],
      },
      {
        unique: true,
        fields: ['turnoId', 'usuarioId'],
      },
    ],
  }
);

export default TurnoUsuario;
