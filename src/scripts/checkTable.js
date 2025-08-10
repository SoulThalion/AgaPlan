const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || undefined,
  database: process.env.DB_NAME || 'AgaPlan',
  port: parseInt(process.env.DB_PORT || '3306'),
  logging: false
});

async function checkTable() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');

    // Verificar estructura
    const [columns] = await sequelize.query('SHOW COLUMNS FROM exhibidores');
    console.log('\n📋 Estructura de la tabla exhibidores:');
    columns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTable();
