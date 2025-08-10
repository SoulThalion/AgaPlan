import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Solo agregamos exhibidores ya que descripcion y capacidad ya existen
  await queryInterface.addColumn('lugares', 'exhibidores', {
    type: DataTypes.INTEGER,
    allowNull: true,
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeColumn('lugares', 'exhibidores');
}
