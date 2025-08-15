"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrations = runMigrations;
exports.rollbackLastMigration = rollbackLastMigration;
exports.showMigrationStatus = showMigrationStatus;
var database_1 = require("../config/database");
var sequelize_1 = require("sequelize");
// Importar las migraciones
var createUsuarios = require("./001-create-usuarios");
var createLugares = require("./002-create-lugares");
var createDisponibilidades = require("./003-create-disponibilidades");
var createTurnos = require("./004-create-turnos");
var addParticipacionMensual = require("./005-add-participacion-mensual");
var addMissingFields = require("./006-add-missing-fields");
var createCargosTable = require("./007-create-cargos-table");
var addLugarFields = require("./008-add-lugar-fields");
var addCoordinatesToLugares = require("./010-add-coordinates-to-lugares");
var addExhibidorToTurnos = require("./012-add-exhibidor-to-turnos");
var addTieneCocheToUsuarios = require("./019-add-tiene-coche-to-usuarios");
var createUserDisponibilidadConfig = require("./021-create-user-disponibilidad-config");
var removeUniqueIndexUserDisponibilidadConfig = require("./022-remove-unique-index-user-disponibilidad-config");
// Lista de migraciones en orden de ejecución
var migrations = [
    { name: '001-create-usuarios', up: createUsuarios.up, down: createUsuarios.up },
    { name: '002-create-lugares', up: createLugares.up, down: createLugares.up },
    { name: '003-create-disponibilidades', up: createDisponibilidades.up, down: createDisponibilidades.up },
    { name: '004-create-turnos', up: createTurnos.up, down: createTurnos.up },
    { name: '005-add-participacion-mensual', up: addParticipacionMensual.up, down: addParticipacionMensual.up },
    { name: '006-add-missing-fields', up: addMissingFields.up, down: addMissingFields.up },
    { name: '007-create-cargos-table', up: createCargosTable.up, down: createCargosTable.up },
    { name: '008-add-lugar-fields', up: addLugarFields.up, down: addLugarFields.up },
    { name: '010-add-coordinates-to-lugares', up: addCoordinatesToLugares.up, down: addCoordinatesToLugares.up },
    { name: '012-add-exhibidor-to-turnos', up: addExhibidorToTurnos.up, down: addExhibidorToTurnos.up },
    { name: '021-create-user-disponibilidad-config', up: createUserDisponibilidadConfig.up, down: createUserDisponibilidadConfig.down },
    { name: '022-remove-unique-index-user-disponibilidad-config', up: removeUniqueIndexUserDisponibilidadConfig.up, down: removeUniqueIndexUserDisponibilidadConfig.down }
    // { name: '019-add-tiene-coche-to-usuarios', up: addTieneCocheToUsuarios.up, down: addTieneCocheToUsuarios.down }
];
// Función para crear la tabla de migraciones si no existe
function createMigrationsTable() {
    return __awaiter(this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, database_1.default.query("\n      CREATE TABLE IF NOT EXISTS migrations (\n        id INT AUTO_INCREMENT PRIMARY KEY,\n        name VARCHAR(255) NOT NULL UNIQUE,\n        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n      )\n    ", { type: sequelize_1.QueryTypes.RAW })];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error creando tabla de migraciones:', error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Función para verificar si una migración ya fue ejecutada
function isMigrationExecuted(migrationName) {
    return __awaiter(this, void 0, void 0, function () {
        var result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, database_1.default.query('SELECT COUNT(*) as count FROM migrations WHERE name = ?', {
                            replacements: [migrationName],
                            type: sequelize_1.QueryTypes.SELECT
                        })];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result[0].count > 0];
                case 2:
                    error_2 = _a.sent();
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Función para marcar una migración como ejecutada
function markMigrationAsExecuted(migrationName) {
    return __awaiter(this, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, database_1.default.query('INSERT INTO migrations (name) VALUES (?)', {
                            replacements: [migrationName],
                            type: sequelize_1.QueryTypes.INSERT
                        })];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error("Error marcando migraci\u00F3n ".concat(migrationName, " como ejecutada:"), error_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Función para ejecutar todas las migraciones pendientes
function runMigrations() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, migrations_1, migration, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    console.log('🔄 Iniciando ejecución de migraciones...');
                    // Crear tabla de migraciones si no existe
                    return [4 /*yield*/, createMigrationsTable()];
                case 1:
                    // Crear tabla de migraciones si no existe
                    _a.sent();
                    _i = 0, migrations_1 = migrations;
                    _a.label = 2;
                case 2:
                    if (!(_i < migrations_1.length)) return [3 /*break*/, 7];
                    migration = migrations_1[_i];
                    return [4 /*yield*/, isMigrationExecuted(migration.name)];
                case 3:
                    if (_a.sent()) {
                        console.log("\u2705 Migraci\u00F3n ".concat(migration.name, " ya ejecutada, saltando..."));
                        return [3 /*break*/, 6];
                    }
                    console.log("\uD83D\uDD04 Ejecutando migraci\u00F3n: ".concat(migration.name));
                    return [4 /*yield*/, migration.up(database_1.default.getQueryInterface())];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, markMigrationAsExecuted(migration.name)];
                case 5:
                    _a.sent();
                    console.log("\u2705 Migraci\u00F3n ".concat(migration.name, " ejecutada exitosamente"));
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 2];
                case 7:
                    console.log('🎉 Todas las migraciones han sido ejecutadas');
                    return [3 /*break*/, 9];
                case 8:
                    error_4 = _a.sent();
                    console.error('❌ Error ejecutando migraciones:', error_4);
                    throw error_4;
                case 9: return [2 /*return*/];
            }
        });
    });
}
// Función para revertir la última migración
function rollbackLastMigration() {
    return __awaiter(this, void 0, void 0, function () {
        var result, lastMigrationName_1, migration, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    console.log('🔄 Revertiendo última migración...');
                    return [4 /*yield*/, database_1.default.query('SELECT name FROM migrations ORDER BY id DESC LIMIT 1', { type: sequelize_1.QueryTypes.SELECT })];
                case 1:
                    result = _a.sent();
                    if (result.length === 0) {
                        console.log('ℹ️ No hay migraciones para revertir');
                        return [2 /*return*/];
                    }
                    lastMigrationName_1 = result[0].name;
                    migration = migrations.find(function (m) { return m.name === lastMigrationName_1; });
                    if (!migration) return [3 /*break*/, 4];
                    console.log("\uD83D\uDD04 Revertiendo migraci\u00F3n: ".concat(lastMigrationName_1));
                    return [4 /*yield*/, migration.down(database_1.default.getQueryInterface())];
                case 2:
                    _a.sent();
                    // Eliminar registro de la migración
                    return [4 /*yield*/, database_1.default.query('DELETE FROM migrations WHERE name = ?', {
                            replacements: [lastMigrationName_1],
                            type: sequelize_1.QueryTypes.DELETE
                        })];
                case 3:
                    // Eliminar registro de la migración
                    _a.sent();
                    console.log("\u2705 Migraci\u00F3n ".concat(lastMigrationName_1, " revertida exitosamente"));
                    return [3 /*break*/, 5];
                case 4:
                    console.log("\u26A0\uFE0F No se encontr\u00F3 la migraci\u00F3n ".concat(lastMigrationName_1, " en el c\u00F3digo"));
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_5 = _a.sent();
                    console.error('❌ Error revirtiendo migración:', error_5);
                    throw error_5;
                case 7: return [2 /*return*/];
            }
        });
    });
}
// Función para mostrar el estado de las migraciones
function showMigrationStatus() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, migrations_2, migration, executed, status_1, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    console.log('📊 Estado de las migraciones:');
                    _i = 0, migrations_2 = migrations;
                    _a.label = 1;
                case 1:
                    if (!(_i < migrations_2.length)) return [3 /*break*/, 4];
                    migration = migrations_2[_i];
                    return [4 /*yield*/, isMigrationExecuted(migration.name)];
                case 2:
                    executed = _a.sent();
                    status_1 = executed ? '✅ Ejecutada' : '⏳ Pendiente';
                    console.log("  ".concat(migration.name, ": ").concat(status_1));
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_6 = _a.sent();
                    console.error('❌ Error mostrando estado de migraciones:', error_6);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
