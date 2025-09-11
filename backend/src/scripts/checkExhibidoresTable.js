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

async function checkExhibidoresTable() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente');

    // Verificar la estructura de la tabla exhibidores
    console.log('🔄 Verificando estructura de la tabla exhibidores...');
    const columns = await sequelize.query(
      'DESCRIBE exhibidores',
      { type: Sequelize.QueryTypes.RAW }
    );

    console.log('📋 Estructura de la tabla exhibidores:');
    columns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''} ${col.Key ? `KEY: ${col.Key}` : ''}`);
    });

    // Verificar si hay datos en la tabla
    console.log('\n🔄 Verificando datos en la tabla...');
    const count = await sequelize.query(
      'SELECT COUNT(*) as count FROM exhibidores',
      { type: Sequelize.QueryTypes.SELECT }
    );

    console.log(`📊 Total de exhibidores: ${count[0].count}`);

    if (count[0].count > 0) {
      const sample = await sequelize.query(
        'SELECT * FROM exhibidores LIMIT 1',
        { type: Sequelize.QueryTypes.SELECT }
      );
      console.log('📋 Ejemplo de exhibidor:', sample[0]);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkExhibidoresTable();
