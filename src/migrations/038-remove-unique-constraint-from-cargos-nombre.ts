import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  try {
    // Eliminar el índice único del campo nombre si existe
    await queryInterface.removeIndex('cargos', 'cargos_nombre');
    console.log('✅ Índice único cargos_nombre eliminado');
  } catch (error) {
    console.log('ℹ️ Índice cargos_nombre no encontrado, continuando...');
  }
  
  // También intentar eliminar cualquier restricción única en el campo nombre
  try {
    await queryInterface.removeConstraint('cargos', 'cargos_nombre_key');
    console.log('✅ Restricción única cargos_nombre_key eliminada');
  } catch (error) {
    console.log('ℹ️ Restricción cargos_nombre_key no encontrada, continuando...');
  }
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  // Restaurar el índice único del campo nombre
  await queryInterface.addIndex('cargos', {
    fields: ['nombre'],
    unique: true,
    name: 'cargos_nombre'
  });
  console.log('✅ Índice único cargos_nombre restaurado');
};
