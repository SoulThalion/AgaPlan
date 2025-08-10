"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
const sequelize_1 = require("sequelize");
async function up(queryInterface) {
    await queryInterface.createTable('disponibilidades', {
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        dia_semana: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
        },
        hora_inicio: {
            type: sequelize_1.DataTypes.STRING(5),
            allowNull: false,
        },
        hora_fin: {
            type: sequelize_1.DataTypes.STRING(5),
            allowNull: false,
        },
        usuarioId: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'usuarios',
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
    });
    // Crear índices
    await queryInterface.addIndex('disponibilidades', ['usuarioId'], {
        name: 'disponibilidades_usuarioId_index',
    });
    await queryInterface.addIndex('disponibilidades', ['dia_semana'], {
        name: 'disponibilidades_dia_semana_index',
    });
}
async function down(queryInterface) {
    await queryInterface.dropTable('disponibilidades');
}
