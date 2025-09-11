"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
const sequelize_1 = require("sequelize");
async function up(queryInterface) {
    // Solo agregamos exhibidores ya que descripcion y capacidad ya existen
    await queryInterface.addColumn('lugares', 'exhibidores', {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    });
}
async function down(queryInterface) {
    await queryInterface.removeColumn('lugares', 'exhibidores');
}
