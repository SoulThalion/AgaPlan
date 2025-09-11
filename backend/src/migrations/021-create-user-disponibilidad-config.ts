import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.createTable('user_disponibilidad_config', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
    mes: {
      type: DataTypes.STRING(7), // Formato YYYY-MM
      allowNull: false,
    },
    tipo_disponibilidad: {
      type: DataTypes.ENUM('todasTardes', 'todasMananas', 'diasSemana', 'fechaConcreta', 'noDisponibleFecha'),
      allowNull: false,
    },
    configuracion: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Almacena la configuración específica según el tipo (horarios, días, fechas, etc.)',
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
  await queryInterface.addIndex('user_disponibilidad_config', ['usuarioId'], {
    name: 'user_disponibilidad_config_usuarioId_index',
  });

  await queryInterface.addIndex('user_disponibilidad_config', ['mes'], {
    name: 'user_disponibilidad_config_mes_index',
  });

  await queryInterface.addIndex('user_disponibilidad_config', ['tipo_disponibilidad'], {
    name: 'user_disponibilidad_config_tipo_disponibilidad_index',
  });

  // Índice compuesto para búsquedas eficientes
  await queryInterface.addIndex('user_disponibilidad_config', ['usuarioId', 'mes'], {
    name: 'user_disponibilidad_config_usuarioId_mes_index',
  });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable('user_disponibilidad_config');
}
