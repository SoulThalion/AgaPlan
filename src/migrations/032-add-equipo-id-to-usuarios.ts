import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  try {
    // Verificar si la columna equipoId ya existe
    const tableDescription = await queryInterface.describeTable('usuarios');
    
    if (!tableDescription.equipoId) {
      // Agregar columna equipoId a usuarios sin clave foránea por ahora
      await queryInterface.addColumn('usuarios', 'equipoId', {
        type: DataTypes.INTEGER,
        allowNull: true,
      });
      console.log('✅ Columna equipoId agregada a la tabla usuarios');
    } else {
      console.log('ℹ️ Columna equipoId ya existe en la tabla usuarios');
    }

    // No crear índice debido al límite de 64 claves en MySQL
    console.log('ℹ️ Saltando creación de índice debido al límite de claves en MySQL');
  } catch (error) {
    console.log('Error en migración 032:', error);
    throw error;
  }
}

export async function down(queryInterface: QueryInterface) {
  // No eliminar índice ya que no se creó debido al límite de claves
  
  // Eliminar columna
  await queryInterface.removeColumn('usuarios', 'equipoId');
}
