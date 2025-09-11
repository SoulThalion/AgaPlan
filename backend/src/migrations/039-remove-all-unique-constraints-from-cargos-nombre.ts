import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  console.log('🔄 Eliminando todos los índices únicos del campo nombre en cargos...');
  
  // Lista de índices únicos que pueden existir en el campo nombre
  const uniqueIndexes = [
    'nombre',
    'cargos_nombre',
    'cargos_nombre_unique'
  ];
  
  for (const indexName of uniqueIndexes) {
    try {
      await queryInterface.removeIndex('cargos', indexName);
      console.log(`✅ Índice único ${indexName} eliminado`);
    } catch (error) {
      console.log(`ℹ️ Índice ${indexName} no encontrado, continuando...`);
    }
  }
  
  // También intentar eliminar cualquier restricción única en el campo nombre
  const uniqueConstraints = [
    'cargos_nombre_key',
    'nombre_key',
    'cargos_nombre_unique_key'
  ];
  
  for (const constraintName of uniqueConstraints) {
    try {
      await queryInterface.removeConstraint('cargos', constraintName);
      console.log(`✅ Restricción única ${constraintName} eliminada`);
    } catch (error) {
      console.log(`ℹ️ Restricción ${constraintName} no encontrada, continuando...`);
    }
  }
  
  console.log('✅ Proceso de eliminación de restricciones únicas completado');
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  // Restaurar el índice único del campo nombre
  await queryInterface.addIndex('cargos', {
    fields: ['nombre'],
    unique: true,
    name: 'cargos_nombre_unique'
  });
  console.log('✅ Índice único cargos_nombre_unique restaurado');
};
