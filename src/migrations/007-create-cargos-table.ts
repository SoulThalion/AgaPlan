import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.createTable('cargos', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    prioridad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 999,
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
  await queryInterface.addIndex('cargos', ['nombre'], {
    unique: true,
    name: 'cargos_nombre_unique'
  });

  await queryInterface.addIndex('cargos', ['prioridad'], {
    name: 'cargos_prioridad_index'
  });

  await queryInterface.addIndex('cargos', ['activo'], {
    name: 'cargos_activo_index'
  });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable('cargos');
}
