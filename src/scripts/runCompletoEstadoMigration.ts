import sequelize from '../config/database';

async function runCompletoEstadoMigration() {
  try {
    console.log('🚀 Iniciando migración para agregar estado "completo" a turnos...');
    
    // Ejecutar la migración SQL directamente
    await sequelize.query(`
      ALTER TABLE turnos
      MODIFY COLUMN estado ENUM('libre', 'ocupado', 'completo')
      NOT NULL DEFAULT 'libre'
    `);
    
    console.log('✅ Migración completada exitosamente');
    
    // Verificar que el cambio se aplicó
    const [results] = await sequelize.query(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'turnos' AND COLUMN_NAME = 'estado'
    `);
    
    console.log('📊 Estado actual de la columna estado:', results);
    
    await sequelize.close();
    console.log('🔌 Conexión cerrada');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    await sequelize.close();
  }
}

runCompletoEstadoMigration();
