import { runMigrations } from '../migrations/runner';

// Configurar variables de entorno temporalmente
process.env.DB_HOST = 'localhost';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.DB_NAME = 'AgaPlan';
process.env.DB_PORT = '3306';
process.env.NODE_ENV = 'development';

async function main() {
  try {
    console.log('🚀 Iniciando ejecución de migraciones con configuración temporal...');
    console.log('📋 Configuración:');
    console.log(`   Host: ${process.env.DB_HOST}`);
    console.log(`   User: ${process.env.DB_USER}`);
    console.log(`   Database: ${process.env.DB_NAME}`);
    console.log(`   Port: ${process.env.DB_PORT}`);
    console.log('');
    
    await runMigrations();
    console.log('✅ Migraciones completadas exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error);
    console.log('');
    console.log('💡 Posibles soluciones:');
    console.log('   1. Asegúrate de que MySQL esté ejecutándose');
    console.log('   2. Verifica que la base de datos "AgaPlan" exista');
    console.log('   3. Confirma que el usuario "root" tenga permisos');
    console.log('   4. Revisa que el puerto 3306 esté disponible');
    process.exit(1);
  }
}

main();
