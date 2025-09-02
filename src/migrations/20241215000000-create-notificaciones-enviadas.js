'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('notificaciones_enviadas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      turnoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'turnos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      usuarioId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      tipoNotificacion: {
        type: Sequelize.ENUM('una_semana', 'un_dia', 'una_hora'),
        allowNull: false
      },
      fechaEnvio: {
        type: Sequelize.DATE,
        allowNull: false
      },
      emailEnviado: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      error: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Crear índices
    await queryInterface.addIndex('notificaciones_enviadas', {
      fields: ['turnoId', 'usuarioId', 'tipoNotificacion'],
      unique: true,
      name: 'unique_notification_per_turno_usuario_tipo'
    });

    await queryInterface.addIndex('notificaciones_enviadas', {
      fields: ['fechaEnvio'],
      name: 'idx_notificaciones_fecha_envio'
    });

    await queryInterface.addIndex('notificaciones_enviadas', {
      fields: ['tipoNotificacion'],
      name: 'idx_notificaciones_tipo'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('notificaciones_enviadas');
  }
};
