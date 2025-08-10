import { runMigrations } from '../migrations/runner';

async function main() {
  try {
    console.log('🚀 Iniciando ejecución de migraciones...');
    await runMigrations();
    console.log('✅ Migraciones completadas exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error);
    process.exit(1);
  }
}

main();
