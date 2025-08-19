import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  // Agregar campo cargoId a la tabla usuarios (sin restricciones de foreign key)
  await queryInterface.addColumn('usuarios', 'cargoId', {
    type: DataTypes.INTEGER,
    allowNull: true
  });
}

export async function down(queryInterface: QueryInterface) {
  // Eliminar columna cargoId
  await queryInterface.removeColumn('usuarios', 'cargoId');
}
