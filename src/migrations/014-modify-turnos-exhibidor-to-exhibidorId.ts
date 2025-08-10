import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Primero eliminamos la columna exhibidor si existe
  try {
    await queryInterface.removeColumn('turnos', 'exhibidor');
  } catch (error) {
    // La columna no existe, continuamos
  }

  // Agregamos la columna exhibidorId
  await queryInterface.addColumn('turnos', 'exhibidorId', {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  });

  // Agregamos la restricción de clave foránea
  await queryInterface.addConstraint('turnos', {
    fields: ['exhibidorId'],
    type: 'foreign key',
    name: 'fk_turnos_exhibidorId',
    references: {
      table: 'exhibidores',
      field: 'id',
    },
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  });

  // Agregamos el índice único compuesto
  await queryInterface.addIndex('turnos', ['fecha', 'hora', 'lugarId', 'exhibidorId'], {
    unique: true,
    name: 'idx_turnos_unique',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Eliminamos el índice único
  try {
    await queryInterface.removeIndex('turnos', 'idx_turnos_unique');
  } catch (error) {
    // El índice no existe, continuamos
  }

  // Eliminamos la restricción de clave foránea
  try {
    await queryInterface.removeConstraint('turnos', 'fk_turnos_exhibidorId');
  } catch (error) {
    // La restricción no existe, continuamos
  }

  // Eliminamos la columna exhibidorId
  await queryInterface.removeColumn('turnos', 'exhibidorId');

  // Restauramos la columna exhibidor original
  await queryInterface.addColumn('turnos', 'exhibidor', {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  });
}
