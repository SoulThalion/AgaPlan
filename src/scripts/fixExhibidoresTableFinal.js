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

async function fixExhibidoresTableFinal() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente');

    // Verificar restricciones de clave foránea
    console.log('🔄 Verificando restricciones de clave foránea...');
    const [constraints] = await sequelize.query(`
      SELECT 
        CONSTRAINT_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'exhibidores'
    `, {
      replacements: [process.env.DB_NAME || 'AgaPlan']
    });

    console.log('📋 Restricciones encontradas:');
    constraints.forEach(constraint => {
      console.log(`  ${constraint.CONSTRAINT_NAME}: ${constraint.COLUMN_NAME} -> ${constraint.REFERENCED_TABLE_NAME}.${constraint.REFERENCED_COLUMN_NAME}`);
    });

    // Eliminar restricciones de clave foránea que involucren lugarId
    for (const constraint of constraints) {
      if (constraint.COLUMN_NAME === 'lugarId' && constraint.REFERENCED_TABLE_NAME === 'lugares') {
        console.log(`🔄 Eliminando restricción de clave foránea ${constraint.CONSTRAINT_NAME}...`);
        await sequelize.query(`ALTER TABLE exhibidores DROP FOREIGN KEY ${constraint.CONSTRAINT_NAME}`);
        console.log(`✅ Restricción ${constraint.CONSTRAINT_NAME} eliminada`);
      }
    }

    // Eliminar restricciones únicas que involucren lugarId
    console.log('🔄 Verificando restricciones únicas...');
    const [uniqueConstraints] = await sequelize.query(`
      SELECT 
        CONSTRAINT_NAME,
        COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'exhibidores' 
      AND CONSTRAINT_NAME LIKE '%unique%'
    `, {
      replacements: [process.env.DB_NAME || 'AgaPlan']
    });

    console.log('📋 Restricciones únicas encontradas:');
    uniqueConstraints.forEach(constraint => {
      console.log(`  ${constraint.CONSTRAINT_NAME}: ${constraint.COLUMN_NAME}`);
    });

    // Eliminar restricciones únicas que involucren lugarId
    for (const constraint of uniqueConstraints) {
      if (constraint.COLUMN_NAME === 'lugarId') {
        console.log(`🔄 Eliminando restricción única ${constraint.CONSTRAINT_NAME}...`);
        try {
          await sequelize.query(`ALTER TABLE exhibidores DROP INDEX ${constraint.CONSTRAINT_NAME}`);
          console.log(`✅ Restricción única ${constraint.CONSTRAINT_NAME} eliminada`);
        } catch (error) {
          console.log(`⚠️ No se pudo eliminar ${constraint.CONSTRAINT_NAME}: ${error.message}`);
        }
      }
    }

    // Ahora eliminar la columna lugarId
    console.log('🔄 Eliminando columna lugarId...');
    await sequelize.query('ALTER TABLE exhibidores DROP COLUMN lugarId');
    console.log('✅ Columna lugarId eliminada');

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

fixExhibidoresTableFinal();
