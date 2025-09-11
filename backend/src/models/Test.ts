import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface TestAttributes {
  id: number;
  message: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Para la creación, el id es opcional ya que Sequelize lo genera automáticamente
interface TestCreationAttributes extends Optional<TestAttributes, 'id'> {}

class Test extends Model<TestAttributes, TestCreationAttributes> implements TestAttributes {
  public id!: number;
  public message!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Test.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'tests',
    timestamps: true,
  }
);

export default Test;
