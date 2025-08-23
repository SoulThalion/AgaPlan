import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  // Modificar el ENUM del campo rol para incluir 'grupo'
  await queryInterface.changeColumn('usuarios', 'rol', {
    type: DataTypes.ENUM('voluntario', 'admin', 'superAdmin', 'grupo'),
    allowNull: false,
    defaultValue: 'voluntario',
  });
}

export async function down(queryInterface: QueryInterface) {
  // Revertir el cambio, removiendo 'grupo' del ENUM
  await queryInterface.changeColumn('usuarios', 'rol', {
    type: DataTypes.ENUM('voluntario', 'admin', 'superAdmin'),
    allowNull: false,
    defaultValue: 'voluntario',
  });
}
