import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.addColumn('turnos', 'exhibidor', {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1, // Valor por defecto para registros existentes
  });

  // Agregar índice único compuesto
  await queryInterface.addIndex('turnos', ['fecha', 'hora', 'lugarId', 'exhibidor'], {
    unique: true,
    name: 'turnos_fecha_hora_lugar_exhibidor_unique'
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Remover índice único
  await queryInterface.removeIndex('turnos', 'turnos_fecha_hora_lugar_exhibidor_unique');
  
  // Remover columna
  await queryInterface.removeColumn('turnos', 'exhibidor');
}
