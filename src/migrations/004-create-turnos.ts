import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.createTable('turnos', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    hora: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM('libre', 'ocupado'),
      allowNull: false,
      defaultValue: 'libre',
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Opcional si está libre
      references: {
        model: 'usuarios',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    lugarId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'lugares',
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

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable('turnos');
}
