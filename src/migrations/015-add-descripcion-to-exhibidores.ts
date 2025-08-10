import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  try {
    // Verificar si la columna descripcion ya existe
    const tableDescription = await queryInterface.describeTable('exhibidores');
    
    if (!tableDescription.descripcion) {
      await queryInterface.addColumn('exhibidores', 'descripcion', {
        type: DataTypes.TEXT,
        allowNull: true,
      });
      console.log('✅ Columna descripcion agregada a la tabla exhibidores');
    } else {
      console.log('ℹ️ La columna descripcion ya existe en la tabla exhibidores');
    }
  } catch (error) {
    console.error('❌ Error al agregar columna descripcion:', error);
    throw error;
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  try {
    // Verificar si la columna descripcion existe antes de eliminarla
    const tableDescription = await queryInterface.describeTable('exhibidores');
    
    if (tableDescription.descripcion) {
      await queryInterface.removeColumn('exhibidores', 'descripcion');
      console.log('✅ Columna descripcion eliminada de la tabla exhibidores');
    } else {
      console.log('ℹ️ La columna descripcion no existe en la tabla exhibidores');
    }
  } catch (error) {
    console.error('❌ Error al eliminar columna descripcion:', error);
    throw error;
  }
}
