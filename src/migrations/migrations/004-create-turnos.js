"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
const sequelize_1 = require("sequelize");
async function up(queryInterface) {
    await queryInterface.createTable('turnos', {
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
    });
    // Crear índices
    await queryInterface.addIndex('turnos', ['fecha'], {
        name: 'turnos_fecha_index',
    });
    await queryInterface.addIndex('turnos', ['estado'], {
        name: 'turnos_estado_index',
    });
    await queryInterface.addIndex('turnos', ['usuarioId'], {
        name: 'turnos_usuarioId_index',
    });
    await queryInterface.addIndex('turnos', ['lugarId'], {
        name: 'turnos_lugarId_index',
    });
    // Crear índice único para fecha, hora y lugar
    await queryInterface.addIndex('turnos', ['fecha', 'hora', 'lugarId'], {
        unique: true,
        name: 'turnos_fecha_hora_lugar_unique',
    });
}
async function down(queryInterface) {
    await queryInterface.dropTable('turnos');
}
