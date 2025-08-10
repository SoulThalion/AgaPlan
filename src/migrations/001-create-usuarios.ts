import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.createTable('usuarios', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    contraseña: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    sexo: {
      type: DataTypes.ENUM('M', 'F', 'O'),
      allowNull: false,
    },
    cargo: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    rol: {
      type: DataTypes.ENUM('voluntario', 'admin', 'superAdmin'),
      allowNull: false,
      defaultValue: 'voluntario',
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

  // Crear índice único para email
  await queryInterface.addIndex('usuarios', ['email'], {
    unique: true,
    name: 'usuarios_email_unique',
  });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable('usuarios');
}
