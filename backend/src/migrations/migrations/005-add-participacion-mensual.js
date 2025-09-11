"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
const sequelize_1 = require("sequelize");
async function up(queryInterface) {
    // Verificar si la columna ya existe
    const tableDescription = await queryInterface.describeTable('usuarios');
    if (!tableDescription.participacionMensual) {
        await queryInterface.addColumn('usuarios', 'participacionMensual', {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
        });
    }
}
async function down(queryInterface) {
    // Verificar si la columna existe antes de eliminarla
    const tableDescription = await queryInterface.describeTable('usuarios');
    if (tableDescription.participacionMensual) {
        await queryInterface.removeColumn('usuarios', 'participacionMensual');
    }
}
