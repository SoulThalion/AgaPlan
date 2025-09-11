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

async function testExhibidorFinal() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente');

    // Verificar estructura actual
    console.log('🔄 Verificando estructura actual...');
    const [columns] = await sequelize.query('SHOW COLUMNS FROM exhibidores');
    console.log('📋 Estructura actual de la tabla exhibidores:');
    columns.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });

    // Intentar crear un exhibidor
    console.log('\n🔄 Creando exhibidor de prueba...');
    const result = await sequelize.query(`
      INSERT INTO exhibidores (nombre, descripcion, activo, createdAt, updatedAt) 
      VALUES (?, ?, ?, NOW(), NOW())
    `, {
      replacements: ['Exhibidor Test Final', 'Descripción de prueba final', true],
      type: Sequelize.QueryTypes.INSERT
    });

    console.log('✅ Exhibidor creado exitosamente:', result);

    // Verificar que se creó
    const exhibidores = await sequelize.query(
      'SELECT * FROM exhibidores WHERE nombre = ?',
      {
        replacements: ['Exhibidor Test Final'],
        type: Sequelize.QueryTypes.SELECT
      }
    );

    console.log('📋 Exhibidor encontrado:', exhibidores[0]);

    console.log('\n🎉 ¡Prueba exitosa! La tabla exhibidores funciona correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testExhibidorFinal();
