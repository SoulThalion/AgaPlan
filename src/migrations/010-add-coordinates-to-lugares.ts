import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.addColumn('lugares', 'latitud', {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  });

  await queryInterface.addColumn('lugares', 'longitud', {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeColumn('lugares', 'latitud');
  await queryInterface.removeColumn('lugares', 'longitud');
}
