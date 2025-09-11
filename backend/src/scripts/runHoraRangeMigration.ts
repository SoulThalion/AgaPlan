import sequelize from '../config/database';
import { QueryInterface } from 'sequelize';

async function main() {
  try {
    console.log('🚀 Iniciando migración de rangos de horas...');
    
    const queryInterface = sequelize.getQueryInterface();
    
    // Verificar el estado actual del campo hora
    console.log('📊 Verificando estado actual del campo hora...');
    const currentState = await sequelize.query(
      "SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'turnos' AND COLUMN_NAME = 'hora'",
      { type: 'SELECT' }
    );
    console.log('Estado actual:', currentState);
    
    // Ejecutar la migración directamente
    console.log('🔄 Modificando campo hora de STRING(5) a STRING(11)...');
    
    await queryInterface.changeColumn('turnos', 'hora', {
      type: 'VARCHAR(11)', // Aumentar de 5 a 11 para "HH:MM-HH:MM"
      allowNull: false,
    });
    
    console.log('✅ Campo hora modificado exitosamente');
    
    // Verificar que el cambio se aplicó
    console.log('📊 Verificando nuevo estado del campo hora...');
    const newState = await sequelize.query(
      "SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'turnos' AND COLUMN_NAME = 'hora'",
      { type: 'SELECT' }
    );
    console.log('Nuevo estado:', newState);
    
    // Marcar la migración como ejecutada en la tabla de migraciones
    console.log('📝 Marcando migración como ejecutada...');
    try {
      await sequelize.query(
        'INSERT INTO migrations (name) VALUES (?)',
        {
          replacements: ['017-modify-hora-to-range'],
          type: 'INSERT'
        }
      );
      console.log('✅ Migración marcada como ejecutada');
    } catch (error: any) {
      if (error.message && error.message.includes('Duplicate entry')) {
        console.log('ℹ️ Migración ya marcada como ejecutada');
      } else {
        console.error('⚠️ Error marcando migración:', error.message || error);
      }
    }
    
    console.log('🎉 Migración de rangos de horas completada exitosamente');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  }
}

main();
