import sequelize from '../config/database';
import { QueryInterface, DataTypes, Sequelize } from 'sequelize';

// Importar todas las migraciones
import * as createUsuarios from './001-create-usuarios';
import * as createLugares from './002-create-lugares';
import * as createDisponibilidades from './003-create-disponibilidades';
import * as createTurnos from './004-create-turnos';
import * as addParticipacionMensual from './005-add-participacion-mensual';
import * as addMissingFields from './006-add-missing-fields';
import * as createCargosTable from './007-create-cargos-table';
import * as addLugarFields from './008-add-lugar-fields';
import * as addCoordinatesToLugares from './010-add-coordinates-to-lugares';
import * as addExhibidorToTurnos from './012-add-exhibidor-to-turnos';
import * as createExhibidoresTable from './013-create-exhibidores-table';
import * as modifyTurnosExhibidorToExhibidorId from './014-modify-turnos-exhibidor-to-exhibidorId';
import * as addDescripcionToExhibidores from './015-add-descripcion-to-exhibidores';
import createTurnoExhibidoresTable from './016-create-turno-exhibidores-table';
import * as modifyHoraToRange from './017-modify-hora-to-range';
import * as createTurnoUsuariosTable from './018-create-turno-usuarios-table';
import * as makeEmailPasswordOptional from './022-make-email-password-optional';
import * as createUserDisponibilidadConfig from './021-create-user-disponibilidad-config';
import * as addCargoIdToUsuarios from './023-add-cargoId-to-usuarios';
import * as addGrupoRole from './024-add-grupo-role';
import * as addCompletoEstadoTurno from './025-add-completo-estado-turno';
import * as addMissingUsuarioFields from './026-add-missing-usuario-fields';
import * as addDescripcionToLugares from './027-add-descripcion-to-lugares';
import * as removeUniqueConstraintUserDisponibilidadConfig from './028-remove-unique-constraint-user-disponibilidad-config';
import * as createUsuarioNotificacionConfig from './029-create-usuario-notificacion-config';

const migrations = [
  { name: '001-create-usuarios', up: createUsuarios.up, down: createUsuarios.down },
  { name: '002-create-lugares', up: createLugares.up, down: createLugares.down },
  { name: '003-create-disponibilidades', up: createDisponibilidades.up, down: createDisponibilidades.down },
  { name: '004-create-turnos', up: createTurnos.up, down: createTurnos.down },
  { name: '005-add-participacion-mensual', up: addParticipacionMensual.up, down: addParticipacionMensual.down },
  { name: '006-add-missing-fields', up: addMissingFields.up, down: addMissingFields.down },
  { name: '007-create-cargos-table', up: createCargosTable.up, down: createCargosTable.down },
  { name: '008-add-lugar-fields', up: addLugarFields.up, down: addLugarFields.down },
  { name: '010-add-coordinates-to-lugares', up: addCoordinatesToLugares.up, down: addCoordinatesToLugares.down },
  { name: '012-add-exhibidor-to-turnos', up: addExhibidorToTurnos.up, down: addExhibidorToTurnos.down },
  { name: '013-create-exhibidores-table', up: createExhibidoresTable.up, down: createExhibidoresTable.down },
  { name: '014-modify-turnos-exhibidor-to-exhibidorId', up: modifyTurnosExhibidorToExhibidorId.up, down: modifyTurnosExhibidorToExhibidorId.down },
  { name: '015-add-descripcion-to-exhibidores', up: addDescripcionToExhibidores.up, down: addDescripcionToExhibidores.down },
  { name: '016-create-turno-exhibidores-table', up: createTurnoExhibidoresTable.up, down: createTurnoExhibidoresTable.down },
  { name: '017-modify-hora-to-range', up: modifyHoraToRange.up, down: modifyHoraToRange.down },
  { name: '018-create-turno-usuarios-table', up: createTurnoUsuariosTable.up, down: createTurnoUsuariosTable.down },
  { name: '021-create-user-disponibilidad-config', up: createUserDisponibilidadConfig.up, down: createUserDisponibilidadConfig.down },
  { name: '022-make-email-password-optional', up: makeEmailPasswordOptional.up, down: makeEmailPasswordOptional.down },
  { name: '023-add-cargoId-to-usuarios', up: addCargoIdToUsuarios.up, down: addCargoIdToUsuarios.down },
  { name: '024-add-grupo-role', up: addGrupoRole.up, down: addGrupoRole.down },
  { name: '025-add-completo-estado-turno', up: addCompletoEstadoTurno.up, down: addCompletoEstadoTurno.down },
  { name: '026-add-missing-usuario-fields', up: addMissingUsuarioFields.up, down: addMissingUsuarioFields.down },
  { name: '027-add-descripcion-to-lugares', up: addDescripcionToLugares.up, down: addDescripcionToLugares.down },
  { name: '028-remove-unique-constraint-user-disponibilidad-config', up: removeUniqueConstraintUserDisponibilidadConfig.up, down: removeUniqueConstraintUserDisponibilidadConfig.down },
  { name: '029-create-usuario-notificacion-config', up: createUsuarioNotificacionConfig.up, down: createUsuarioNotificacionConfig.down },
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
    `, { type: 'RAW' });
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
        type: 'SELECT'
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
        type: 'INSERT'
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
      { type: 'SELECT' }
    );
    
    if (!result || (result as any[]).length === 0) {
      console.log('ℹ️ No hay migraciones para revertir');
      return;
    }
    
    const lastMigrationName = ((result as any[])[0] as any).name;
    const migration = migrations.find(m => m.name === lastMigrationName);
    
    if (migration) {
      console.log(`🔄 Revertiendo migración: ${lastMigrationName}`);
      await migration.down(sequelize.getQueryInterface());
      
      // Eliminar registro de la migración
      await sequelize.query(
        'DELETE FROM migrations WHERE name = ?',
        {
          replacements: [lastMigrationName],
          type: 'DELETE'
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
