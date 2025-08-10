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
var sequelize_1 = require("sequelize");
var database_1 = require("../config/database");
function forceMigration() {
    return __awaiter(this, void 0, void 0, function () {
        var queryInterface, tableDescription, error_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, 9, 11]);
                    console.log('🔄 Forzando migración 012-add-exhibidor-to-turnos...');
                    queryInterface = database_1.default.getQueryInterface();
                    return [4 /*yield*/, queryInterface.describeTable('turnos')];
                case 1:
                    tableDescription = _a.sent();
                    console.log('📋 Columnas actuales en tabla turnos:', Object.keys(tableDescription));
                    if (!!tableDescription.exhibidor) return [3 /*break*/, 3];
                    console.log('➕ Agregando columna exhibidor...');
                    return [4 /*yield*/, queryInterface.addColumn('turnos', 'exhibidor', {
                            type: sequelize_1.DataTypes.INTEGER,
                            allowNull: false,
                            defaultValue: 1,
                        })];
                case 2:
                    _a.sent();
                    console.log('✅ Columna exhibidor agregada');
                    return [3 /*break*/, 4];
                case 3:
                    console.log('ℹ️ Columna exhibidor ya existe');
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, queryInterface.addIndex('turnos', ['fecha', 'hora', 'lugarId', 'exhibidor'], {
                            unique: true,
                            name: 'turnos_fecha_hora_lugar_exhibidor_unique'
                        })];
                case 5:
                    _a.sent();
                    console.log('✅ Índice único agregado');
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    if (error_1.name === 'SequelizeUniqueConstraintError') {
                        console.log('ℹ️ Índice único ya existe');
                    }
                    else {
                        throw error_1;
                    }
                    return [3 /*break*/, 7];
                case 7:
                    console.log('🎉 Migración forzada completada');
                    return [3 /*break*/, 11];
                case 8:
                    error_2 = _a.sent();
                    console.error('❌ Error en migración forzada:', error_2);
                    return [3 /*break*/, 11];
                case 9: return [4 /*yield*/, database_1.default.close()];
                case 10:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 11: return [2 /*return*/];
            }
        });
    });
}
forceMigration();
