import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.createTable('equipos', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
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

  // Crear índice único para nombre
  await queryInterface.addIndex('equipos', ['nombre'], {
    unique: true,
    name: 'equipos_nombre_unique',
  });

  // Crear índice para activo
  await queryInterface.addIndex('equipos', ['activo'], {
    name: 'equipos_activo_index',
  });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable('equipos');
}
