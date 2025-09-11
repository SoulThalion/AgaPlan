"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
const sequelize_1 = require("sequelize");
async function up(queryInterface) {
    await queryInterface.addColumn('turnos', 'exhibidor', {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1, // Valor por defecto para registros existentes
    });
    // Agregar índice único compuesto
    await queryInterface.addIndex('turnos', ['fecha', 'hora', 'lugarId', 'exhibidor'], {
        unique: true,
        name: 'turnos_fecha_hora_lugar_exhibidor_unique'
    });
}
async function down(queryInterface) {
    // Remover índice único
    await queryInterface.removeIndex('turnos', 'turnos_fecha_hora_lugar_exhibidor_unique');
    // Remover columna
    await queryInterface.removeColumn('turnos', 'exhibidor');
}
