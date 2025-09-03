import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  // Agregar columna equipoId a exhibidores
  await queryInterface.addColumn('exhibidores', 'equipoId', {
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
  await queryInterface.addIndex('exhibidores', ['equipoId'], {
    name: 'exhibidores_equipo_id_index',
  });
}

export async function down(queryInterface: QueryInterface) {
  // Eliminar índice
  await queryInterface.removeIndex('exhibidores', 'exhibidores_equipo_id_index');
  
  // Eliminar columna
  await queryInterface.removeColumn('exhibidores', 'equipoId');
}
