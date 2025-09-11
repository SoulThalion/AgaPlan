import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface) => {
  // Crear la tabla
  await queryInterface.createTable('notificaciones_enviadas', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    turnoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'turnos',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    tipoNotificacion: {
      type: DataTypes.ENUM('una_semana', 'un_dia', 'una_hora'),
      allowNull: false
    },
    fechaEnvio: {
      type: DataTypes.DATE,
      allowNull: false
    },
    emailEnviado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    error: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
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
};

export const down = async (queryInterface: QueryInterface) => {
  await queryInterface.dropTable('notificaciones_enviadas');
};
