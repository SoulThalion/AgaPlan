"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
const sequelize_1 = require("sequelize");
async function up(queryInterface) {
    await queryInterface.addColumn('lugares', 'latitud', {
        type: sequelize_1.DataTypes.DECIMAL(10, 8),
        allowNull: true,
    });
    await queryInterface.addColumn('lugares', 'longitud', {
        type: sequelize_1.DataTypes.DECIMAL(11, 8),
        allowNull: true,
    });
}
async function down(queryInterface) {
    await queryInterface.removeColumn('lugares', 'latitud');
    await queryInterface.removeColumn('lugares', 'longitud');
}
