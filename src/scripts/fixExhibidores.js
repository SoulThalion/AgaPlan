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

async function fixExhibidoresTable() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente');

    // Verificar si la tabla exhibidores existe
    const tableExists = await sequelize.query(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = 'exhibidores'",
      {
        replacements: [process.env.DB_NAME || 'AgaPlan'],
        type: Sequelize.QueryTypes.SELECT
      }
    );

    if (tableExists[0].count === 0) {
      console.log('🔄 Creando tabla exhibidores...');
      await sequelize.query(`
        CREATE TABLE exhibidores (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nombre VARCHAR(100) NOT NULL UNIQUE,
          descripcion TEXT,
          activo BOOLEAN NOT NULL DEFAULT true,
          createdAt DATETIME NOT NULL,
          updatedAt DATETIME NOT NULL
        )
      `);
      console.log('✅ Tabla exhibidores creada');
    } else {
      console.log('ℹ️ Tabla exhibidores ya existe');
      
      // Verificar si la columna descripcion existe
      const columns = await sequelize.query(
        "DESCRIBE exhibidores",
        { type: Sequelize.QueryTypes.RAW }
      );
      
      const hasDescripcion = columns.some(col => col.Field === 'descripcion');
      
      if (!hasDescripcion) {
        console.log('🔄 Agregando columna descripcion...');
        await sequelize.query(
          "ALTER TABLE exhibidores ADD COLUMN descripcion TEXT"
        );
        console.log('✅ Columna descripcion agregada');
      } else {
        console.log('ℹ️ Columna descripcion ya existe');
      }
    }

    console.log('🎉 Tabla exhibidores verificada y corregida');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixExhibidoresTable();
