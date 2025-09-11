import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.createTable('disponibilidades', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    dia_semana: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    hora_inicio: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    hora_fin: {
      type: DataTypes.STRING(5),
      allowNull: false,
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

  // Crear índices
  await queryInterface.addIndex('disponibilidades', ['usuarioId'], {
    name: 'disponibilidades_usuarioId_index',
  });

  await queryInterface.addIndex('disponibilidades', ['dia_semana'], {
    name: 'disponibilidades_dia_semana_index',
  });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable('disponibilidades');
}
