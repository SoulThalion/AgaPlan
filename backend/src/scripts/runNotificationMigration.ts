import { runMigrations } from '../migrations/runner';

async function runNotificationMigration() {
  try {
    console.log('🔄 Ejecutando migración de notificaciones...');
    await runMigrations();
    console.log('✅ Migración de notificaciones completada');
  } catch (error) {
    console.error('❌ Error ejecutando migración de notificaciones:', error);
    process.exit(1);
  }
}

runNotificationMigration();
