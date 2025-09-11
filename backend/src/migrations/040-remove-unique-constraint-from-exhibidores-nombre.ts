import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  try {
    // Eliminar el índice único del campo nombre si existe (se llama simplemente 'nombre')
    await queryInterface.removeIndex('exhibidores', 'nombre');
    console.log('✅ Índice único nombre eliminado');
  } catch (error) {
    console.log('ℹ️ Índice nombre no encontrado, continuando...');
  }
  
  // También intentar eliminar cualquier restricción única en el campo nombre
  try {
    await queryInterface.removeConstraint('exhibidores', 'exhibidores_nombre_key');
    console.log('✅ Restricción única exhibidores_nombre_key eliminada');
  } catch (error) {
    console.log('ℹ️ Restricción exhibidores_nombre_key no encontrada, continuando...');
  }
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  // Restaurar el índice único del campo nombre
  await queryInterface.addIndex('exhibidores', {
    fields: ['nombre'],
    unique: true,
    name: 'nombre'
  });
  console.log('✅ Índice único nombre restaurado');
};
