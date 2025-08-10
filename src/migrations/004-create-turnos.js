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
exports.up = up;
exports.down = down;
var sequelize_1 = require("sequelize");
function up(queryInterface) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, queryInterface.createTable('turnos', {
                        id: {
                            type: sequelize_1.DataTypes.INTEGER,
                            autoIncrement: true,
                            primaryKey: true,
                        },
                        fecha: {
                            type: sequelize_1.DataTypes.DATEONLY,
                            allowNull: false,
                        },
                        hora: {
                            type: sequelize_1.DataTypes.STRING(5),
                            allowNull: false,
                        },
                        estado: {
                            type: sequelize_1.DataTypes.ENUM('libre', 'ocupado'),
                            allowNull: false,
                            defaultValue: 'libre',
                        },
                        usuarioId: {
                            type: sequelize_1.DataTypes.INTEGER,
                            allowNull: true, // Opcional si está libre
                            references: {
                                model: 'usuarios',
                                key: 'id',
                            },
                            onUpdate: 'CASCADE',
                            onDelete: 'SET NULL',
                        },
                        lugarId: {
                            type: sequelize_1.DataTypes.INTEGER,
                            allowNull: false,
                            references: {
                                model: 'lugares',
                                key: 'id',
                            },
                            onUpdate: 'CASCADE',
                            onDelete: 'CASCADE',
                        },
                        createdAt: {
                            type: sequelize_1.DataTypes.DATE,
                            allowNull: false,
                        },
                        updatedAt: {
                            type: sequelize_1.DataTypes.DATE,
                            allowNull: false,
                        },
                    })];
                case 1:
                    _a.sent();
                    // Crear índices
                    return [4 /*yield*/, queryInterface.addIndex('turnos', ['fecha'], {
                            name: 'turnos_fecha_index',
                        })];
                case 2:
                    // Crear índices
                    _a.sent();
                    return [4 /*yield*/, queryInterface.addIndex('turnos', ['estado'], {
                            name: 'turnos_estado_index',
                        })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, queryInterface.addIndex('turnos', ['usuarioId'], {
                            name: 'turnos_usuarioId_index',
                        })];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, queryInterface.addIndex('turnos', ['lugarId'], {
                            name: 'turnos_lugarId_index',
                        })];
                case 5:
                    _a.sent();
                    // Crear índice único para fecha, hora y lugar
                    return [4 /*yield*/, queryInterface.addIndex('turnos', ['fecha', 'hora', 'lugarId'], {
                            unique: true,
                            name: 'turnos_fecha_hora_lugar_unique',
                        })];
                case 6:
                    // Crear índice único para fecha, hora y lugar
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function down(queryInterface) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, queryInterface.dropTable('turnos')];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
