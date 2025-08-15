import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  // Hacer email opcional
  await queryInterface.changeColumn('usuarios', 'email', {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
  });

  // Hacer contraseña opcional
  await queryInterface.changeColumn('usuarios', 'contraseña', {
    type: DataTypes.STRING(255),
    allowNull: true,
  });
}

export async function down(queryInterface: QueryInterface) {
  // Revertir email a obligatorio
  await queryInterface.changeColumn('usuarios', 'email', {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  });

  // Revertir contraseña a obligatorio
  await queryInterface.changeColumn('usuarios', 'contraseña', {
    type: DataTypes.STRING(255),
    allowNull: false,
  });
}
