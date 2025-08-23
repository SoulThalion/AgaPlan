import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.changeColumn('turnos', 'estado', {
    type: DataTypes.ENUM('libre', 'ocupado', 'completo'),
    allowNull: false,
    defaultValue: 'libre',
  });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.changeColumn('turnos', 'estado', {
    type: DataTypes.ENUM('libre', 'ocupado'),
    allowNull: false,
    defaultValue: 'libre',
  });
}
