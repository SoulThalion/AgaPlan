const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || undefined,
  database: process.env.DB_NAME || 'AgaPlan',
  port: parseInt(process.env.DB_PORT || '3306'),
  logging: console.log
});

async function fixExhibidoresTableStructure() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente');

    // Verificar si la columna lugarId existe
    console.log('🔄 Verificando si existe la columna lugarId...');
    const [columns] = await sequelize.query('SHOW COLUMNS FROM exhibidores');
    const hasLugarId = columns.some(col => col.Field === 'lugarId');
    
    if (hasLugarId) {
      console.log('❌ Columna lugarId encontrada - eliminándola...');
      
      // Eliminar la columna lugarId
      await sequelize.query('ALTER TABLE exhibidores DROP COLUMN lugarId');
      console.log('✅ Columna lugarId eliminada');
    } else {
      console.log('ℹ️ Columna lugarId no existe');
    }

    // Verificar la estructura final
    console.log('\n🔄 Verificando estructura final...');
    const [finalColumns] = await sequelize.query('SHOW COLUMNS FROM exhibidores');
    console.log('📋 Estructura final de la tabla exhibidores:');
    finalColumns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });

    console.log('\n🎉 Tabla exhibidores corregida correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixExhibidoresTableStructure();
