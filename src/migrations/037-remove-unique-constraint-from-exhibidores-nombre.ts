import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Eliminar la restricción única del campo nombre
  await queryInterface.removeConstraint('exhibidores', 'exhibidores_nombre_key');
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Recrear la restricción única del campo nombre
  await queryInterface.addConstraint('exhibidores', {
    fields: ['nombre'],
    type: 'unique',
    name: 'exhibidores_nombre_key'
  });
}
