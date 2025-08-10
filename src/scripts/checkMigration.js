const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  dialect: 'mysql',
  logging: false
});

async function checkMigration() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Verificar si existe la tabla turno_exhibidores
    const [turnoExhibidoresExists] = await sequelize.query(
      "SHOW TABLES LIKE 'turno_exhibidores'"
    );
    
    if (turnoExhibidoresExists.length > 0) {
      console.log('✅ Tabla turno_exhibidores existe');
      
      // Verificar estructura de la tabla
      const [columns] = await sequelize.query(
        "SHOW COLUMNS FROM turno_exhibidores"
      );
      console.log('📋 Estructura de turno_exhibidores:');
      columns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    } else {
      console.log('❌ Tabla turno_exhibidores NO existe');
    }

    // Verificar si se eliminó exhibidorId de turnos
    const [turnosColumns] = await sequelize.query(
      "SHOW COLUMNS FROM turnos"
    );
    
    const hasExhibidorId = turnosColumns.some(col => col.Field === 'exhibidorId');
    if (hasExhibidorId) {
      console.log('❌ Columna exhibidorId aún existe en turnos');
    } else {
      console.log('✅ Columna exhibidorId fue eliminada de turnos');
    }

    // Verificar índices únicos en turnos
    const [indexes] = await sequelize.query(
      "SHOW INDEX FROM turnos WHERE Key_name LIKE '%unique%'"
    );
    console.log('🔍 Índices únicos en turnos:');
    indexes.forEach(idx => {
      console.log(`  - ${idx.Key_name}: ${idx.Column_name}`);
    });

    // Verificar si hay datos en turno_exhibidores
    const [count] = await sequelize.query(
      "SELECT COUNT(*) as count FROM turno_exhibidores"
    );
    console.log(`📊 Registros en turno_exhibidores: ${count[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkMigration();
