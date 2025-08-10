import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  // Agregar campo activo a la tabla usuarios
  await queryInterface.addColumn('usuarios', 'activo', {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true
  });

  // Agregar campo capacidad a la tabla lugares
  await queryInterface.addColumn('lugares', 'capacidad', {
    type: DataTypes.INTEGER,
    allowNull: true
  });

  // Agregar campo activo a la tabla lugares
  await queryInterface.addColumn('lugares', 'activo', {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true
  });

  // Agregar campo activo a la tabla disponibilidades
  await queryInterface.addColumn('disponibilidades', 'activo', {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  });
}

export async function down(queryInterface: QueryInterface) {
  // Revertir cambios
  await queryInterface.removeColumn('usuarios', 'activo');
  await queryInterface.removeColumn('lugares', 'capacidad');
  await queryInterface.removeColumn('lugares', 'activo');
  await queryInterface.removeColumn('disponibilidades', 'activo');
}
