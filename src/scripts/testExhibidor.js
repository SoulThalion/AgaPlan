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

async function testExhibidorCreation() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente');

    // Intentar crear un exhibidor directamente
    console.log('🔄 Creando exhibidor de prueba...');
    const result = await sequelize.query(`
      INSERT INTO exhibidores (nombre, descripcion, activo, createdAt, updatedAt) 
      VALUES (?, ?, ?, NOW(), NOW())
    `, {
      replacements: ['Exhibidor Test Directo', 'Descripción de prueba directa', true],
      type: Sequelize.QueryTypes.INSERT
    });

    console.log('✅ Exhibidor creado exitosamente:', result);

    // Verificar que se creó
    const exhibidores = await sequelize.query(
      'SELECT * FROM exhibidores WHERE nombre = ?',
      {
        replacements: ['Exhibidor Test Directo'],
        type: Sequelize.QueryTypes.SELECT
      }
    );

    console.log('📋 Exhibidores encontrados:', exhibidores);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testExhibidorCreation();
