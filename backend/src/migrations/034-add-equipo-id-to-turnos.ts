import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  // Agregar columna equipoId a turnos
  await queryInterface.addColumn('turnos', 'equipoId', {
    type: DataTypes.INTEGER,
    allowNull: true, // Temporalmente nullable para la migración
    references: {
      model: 'equipos',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  });

  // Crear índice para equipoId
  await queryInterface.addIndex('turnos', ['equipoId'], {
    name: 'turnos_equipo_id_index',
  });
}

export async function down(queryInterface: QueryInterface) {
  // Eliminar índice
  await queryInterface.removeIndex('turnos', 'turnos_equipo_id_index');
  
  // Eliminar columna
  await queryInterface.removeColumn('turnos', 'equipoId');
}
