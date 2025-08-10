import sequelize from '../config/database';
import { QueryTypes } from 'sequelize';

// Importar las migraciones
import * as createUsuarios from './001-create-usuarios';
import * as createLugares from './002-create-lugares';
import * as createDisponibilidades from './003-create-disponibilidades';
import * as createTurnos from './004-create-turnos';
import * as addParticipacionMensual from './005-add-participacion-mensual';

// Lista de migraciones en orden de ejecución
const migrations = [
  { name: '001-create-usuarios', up: createUsuarios.up, down: createUsuarios.down },
  { name: '002-create-lugares', up: createLugares.up, down: createLugares.down },
  { name: '003-create-disponibilidades', up: createDisponibilidades.up, down: createDisponibilidades.down },
  { name: '004-create-turnos', up: createTurnos.up, down: createTurnos.down },
  { name: '005-add-participacion-mensual', up: addParticipacionMensual.up, down: addParticipacionMensual.down }
];

// Función para crear la tabla de migraciones si no existe
async function createMigrationsTable() {
  try {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, { type: QueryTypes.RAW });
  } catch (error) {
    console.error('Error creando tabla de migraciones:', error);
  }
}

// Función para verificar si una migración ya fue ejecutada
async function isMigrationExecuted(migrationName: string): Promise<boolean> {
  try {
    const result = await sequelize.query(
      'SELECT COUNT(*) as count FROM migrations WHERE name = ?',
      {
        replacements: [migrationName],
        type: QueryTypes.SELECT
      }
    );
    return (result[0] as any).count > 0;
  } catch (error) {
    return false;
  }
}

// Función para marcar una migración como ejecutada
async function markMigrationAsExecuted(migrationName: string) {
  try {
    await sequelize.query(
      'INSERT INTO migrations (name) VALUES (?)',
      {
        replacements: [migrationName],
        type: QueryTypes.INSERT
      }
    );
  } catch (error) {
    console.error(`Error marcando migración ${migrationName} como ejecutada:`, error);
  }
}

// Función para ejecutar todas las migraciones pendientes
export async function runMigrations() {
  try {
    console.log('🔄 Iniciando ejecución de migraciones...');
    
    // Crear tabla de migraciones si no existe
    await createMigrationsTable();
    
    for (const migration of migrations) {
      if (await isMigrationExecuted(migration.name)) {
        console.log(`✅ Migración ${migration.name} ya ejecutada, saltando...`);
        continue;
      }
      
      console.log(`🔄 Ejecutando migración: ${migration.name}`);
      await migration.up(sequelize.getQueryInterface());
      await markMigrationAsExecuted(migration.name);
      console.log(`✅ Migración ${migration.name} ejecutada exitosamente`);
    }
    
    console.log('🎉 Todas las migraciones han sido ejecutadas');
  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error);
    throw error;
  }
}

// Función para revertir la última migración
export async function rollbackLastMigration() {
  try {
    console.log('🔄 Revertiendo última migración...');
    
    // Obtener la última migración ejecutada
    const result = await sequelize.query(
      'SELECT name FROM migrations ORDER BY id DESC LIMIT 1',
      { type: QueryTypes.SELECT }
    );
    
    if (result.length === 0) {
      console.log('ℹ️ No hay migraciones para revertir');
      return;
    }
    
    const lastMigrationName = (result[0] as any).name;
    const migration = migrations.find(m => m.name === lastMigrationName);
    
    if (migration) {
      console.log(`🔄 Revertiendo migración: ${lastMigrationName}`);
      await migration.down(sequelize.getQueryInterface());
      
      // Eliminar registro de la migración
      await sequelize.query(
        'DELETE FROM migrations WHERE name = ?',
        {
          replacements: [lastMigrationName],
          type: QueryTypes.DELETE
        }
      );
      
      console.log(`✅ Migración ${lastMigrationName} revertida exitosamente`);
    } else {
      console.log(`⚠️ No se encontró la migración ${lastMigrationName} en el código`);
    }
  } catch (error) {
    console.error('❌ Error revirtiendo migración:', error);
    throw error;
  }
}

// Función para mostrar el estado de las migraciones
export async function showMigrationStatus() {
  try {
    console.log('📊 Estado de las migraciones:');
    
    for (const migration of migrations) {
      const executed = await isMigrationExecuted(migration.name);
      const status = executed ? '✅ Ejecutada' : '⏳ Pendiente';
      console.log(`  ${migration.name}: ${status}`);
    }
  } catch (error) {
    console.error('❌ Error mostrando estado de migraciones:', error);
  }
}
