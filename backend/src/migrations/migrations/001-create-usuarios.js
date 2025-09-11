"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
const sequelize_1 = require("sequelize");
async function up(queryInterface) {
    await queryInterface.createTable('usuarios', {
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombre: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
        },
        email: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        contraseña: {
            type: sequelize_1.DataTypes.STRING(255),
            allowNull: false,
        },
        sexo: {
            type: sequelize_1.DataTypes.ENUM('M', 'F', 'O'),
            allowNull: false,
        },
        cargo: {
            type: sequelize_1.DataTypes.STRING(100),
            allowNull: false,
        },
        rol: {
            type: sequelize_1.DataTypes.ENUM('voluntario', 'admin', 'superAdmin'),
            allowNull: false,
            defaultValue: 'voluntario',
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
    // Crear índice único para email
    await queryInterface.addIndex('usuarios', ['email'], {
        unique: true,
        name: 'usuarios_email_unique',
    });
}
async function down(queryInterface) {
    await queryInterface.dropTable('usuarios');
}
