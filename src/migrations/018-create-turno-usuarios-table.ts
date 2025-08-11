import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  // Crear tabla intermedia turno_usuarios
  await queryInterface.createTable('turno_usuarios', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    turnoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'turnos',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  // Crear índices para mejorar el rendimiento
  await queryInterface.addIndex('turno_usuarios', ['turnoId'], {
    name: 'turno_usuarios_turnoId_index',
  });

  await queryInterface.addIndex('turno_usuarios', ['usuarioId'], {
    name: 'turno_usuarios_usuarioId_index',
  });

  // Crear índice único para evitar duplicados
  await queryInterface.addIndex('turno_usuarios', ['turnoId', 'usuarioId'], {
    unique: true,
    name: 'turno_usuarios_turno_usuario_unique',
  });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable('turno_usuarios');
}
