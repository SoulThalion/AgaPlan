"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
const sequelize_1 = require("sequelize");
async function up(queryInterface) {
    await queryInterface.createTable('cargos', {
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombre: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        descripcion: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true,
        },
        prioridad: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 999,
        },
        activo: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        createdAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
    });
    // Crear índices
    await queryInterface.addIndex('cargos', ['nombre'], {
        unique: true,
        name: 'cargos_nombre_unique'
    });
    await queryInterface.addIndex('cargos', ['prioridad'], {
        name: 'cargos_prioridad_index'
    });
    await queryInterface.addIndex('cargos', ['activo'], {
        name: 'cargos_activo_index'
    });
}
async function down(queryInterface) {
    await queryInterface.dropTable('cargos');
}
