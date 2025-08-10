import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar si la columna ya existe
  const tableDescription = await queryInterface.describeTable('usuarios');
  
  if (!tableDescription.participacionMensual) {
    await queryInterface.addColumn('usuarios', 'participacionMensual', {
      type: DataTypes.INTEGER,
      allowNull: true,
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Verificar si la columna existe antes de eliminarla
  const tableDescription = await queryInterface.describeTable('usuarios');
  
  if (tableDescription.participacionMensual) {
    await queryInterface.removeColumn('usuarios', 'participacionMensual');
  }
}
