"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrations = runMigrations;
exports.rollbackLastMigration = rollbackLastMigration;
exports.showMigrationStatus = showMigrationStatus;
const database_1 = require("../config/database");
const sequelize_1 = require("sequelize");
// Importar las migraciones
const createUsuarios = require("./001-create-usuarios");
const createLugares = require("./002-create-lugares");
const createDisponibilidades = require("./003-create-disponibilidades");
const createTurnos = require("./004-create-turnos");
const addParticipacionMensual = require("./005-add-participacion-mensual");
const addMissingFields = require("./006-add-missing-fields");
const createCargosTable = require("./007-create-cargos-table");
const addLugarFields = require("./008-add-lugar-fields");
const addCoordinatesToLugares = require("./010-add-coordinates-to-lugares");
const addExhibidorToTurnos = require("./012-add-exhibidor-to-turnos");
const createExhibidoresTable = require("./013-create-exhibidores-table");
const addDescripcionToExhibidores = require("./015-add-descripcion-to-exhibidores");
// Lista de migraciones en orden de ejecución
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
    { name: '015-add-descripcion-to-exhibidores', up: addDescripcionToExhibidores.up, down: addDescripcionToExhibidores.down }
];
// Función para crear la tabla de migraciones si no existe
async function createMigrationsTable() {
    try {
        await database_1.default.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, { type: sequelize_1.QueryTypes.RAW });
    }
    catch (error) {
        console.error('Error creando tabla de migraciones:', error);
    }
}
// Función para verificar si una migración ya fue ejecutada
async function isMigrationExecuted(migrationName) {
    try {
        const result = await database_1.default.query('SELECT COUNT(*) as count FROM migrations WHERE name = ?', {
            replacements: [migrationName],
            type: sequelize_1.QueryTypes.SELECT
        });
        return result[0].count > 0;
    }
    catch (error) {
        return false;
    }
}
// Función para marcar una migración como ejecutada
async function markMigrationAsExecuted(migrationName) {
    try {
        await database_1.default.query('INSERT INTO migrations (name) VALUES (?)', {
            replacements: [migrationName],
            type: sequelize_1.QueryTypes.INSERT
        });
    }
    catch (error) {
        console.error(`Error marcando migración ${migrationName} como ejecutada:`, error);
    }
}
// Función para ejecutar todas las migraciones pendientes
async function runMigrations() {
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
            await migration.up(database_1.default.getQueryInterface());
            await markMigrationAsExecuted(migration.name);
            console.log(`✅ Migración ${migration.name} ejecutada exitosamente`);
        }
        console.log('🎉 Todas las migraciones han sido ejecutadas');
    }
    catch (error) {
        console.error('❌ Error ejecutando migraciones:', error);
        throw error;
    }
}
// Función para revertir la última migración
async function rollbackLastMigration() {
    try {
        console.log('🔄 Revertiendo última migración...');
        // Obtener la última migración ejecutada
        const result = await database_1.default.query('SELECT name FROM migrations ORDER BY id DESC LIMIT 1', { type: sequelize_1.QueryTypes.SELECT });
        if (result.length === 0) {
            console.log('ℹ️ No hay migraciones para revertir');
            return;
        }
        const lastMigrationName = result[0].name;
        const migration = migrations.find(m => m.name === lastMigrationName);
        if (migration) {
            console.log(`🔄 Revertiendo migración: ${lastMigrationName}`);
            await migration.down(database_1.default.getQueryInterface());
            // Eliminar registro de la migración
            await database_1.default.query('DELETE FROM migrations WHERE name = ?', {
                replacements: [lastMigrationName],
                type: sequelize_1.QueryTypes.DELETE
            });
            console.log(`✅ Migración ${lastMigrationName} revertida exitosamente`);
        }
        else {
            console.log(`⚠️ No se encontró la migración ${lastMigrationName} en el código`);
        }
    }
    catch (error) {
        console.error('❌ Error revirtiendo migración:', error);
        throw error;
    }
}
// Función para mostrar el estado de las migraciones
async function showMigrationStatus() {
    try {
        console.log('📊 Estado de las migraciones:');
        for (const migration of migrations) {
            const executed = await isMigrationExecuted(migration.name);
            const status = executed ? '✅ Ejecutada' : '⏳ Pendiente';
            console.log(`  ${migration.name}: ${status}`);
        }
    }
    catch (error) {
        console.error('❌ Error mostrando estado de migraciones:', error);
    }
}
