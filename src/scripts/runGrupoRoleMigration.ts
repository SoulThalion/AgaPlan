import sequelize from '../config/database';

async function runGrupoRoleMigration() {
  try {
    console.log('🚀 Iniciando migración para agregar rol "grupo"...');
    
    // Ejecutar la migración
    await sequelize.query(`
      ALTER TABLE usuarios 
      MODIFY COLUMN rol ENUM('voluntario', 'admin', 'superAdmin', 'grupo') 
      NOT NULL DEFAULT 'voluntario'
    `);
    
    console.log('✅ Migración completada exitosamente');
    console.log('✅ Rol "grupo" agregado a la tabla usuarios');
    
    // Verificar que el cambio se aplicó
    const [results] = await sequelize.query(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'usuarios' 
      AND COLUMN_NAME = 'rol'
    `);
    
    console.log('📋 Verificación del campo rol:');
    console.log(results);
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión a la base de datos cerrada');
  }
}

// Ejecutar la migración
runGrupoRoleMigration();
