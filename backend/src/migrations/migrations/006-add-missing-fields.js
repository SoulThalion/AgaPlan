"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
const sequelize_1 = require("sequelize");
async function up(queryInterface) {
    // Agregar campo activo a la tabla usuarios
    await queryInterface.addColumn('usuarios', 'activo', {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
    });
    // Agregar campo capacidad a la tabla lugares
    await queryInterface.addColumn('lugares', 'capacidad', {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true
    });
    // Agregar campo activo a la tabla lugares
    await queryInterface.addColumn('lugares', 'activo', {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
    });
    // Agregar campo activo a la tabla disponibilidades
    await queryInterface.addColumn('disponibilidades', 'activo', {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    });
}
async function down(queryInterface) {
    // Revertir cambios
    await queryInterface.removeColumn('usuarios', 'activo');
    await queryInterface.removeColumn('lugares', 'capacidad');
    await queryInterface.removeColumn('lugares', 'activo');
    await queryInterface.removeColumn('disponibilidades', 'activo');
}
