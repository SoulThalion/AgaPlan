import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  // Crear equipo por defecto
  await queryInterface.sequelize.query(
    "INSERT INTO equipos (nombre, descripcion, activo, createdAt, updatedAt) VALUES ('Equipo Principal', 'Equipo por defecto para datos existentes', true, NOW(), NOW());"
  );
  
  // Obtener el ID del equipo recién creado
  const [equipos] = await queryInterface.sequelize.query(
    "SELECT id FROM equipos WHERE nombre = 'Equipo Principal' LIMIT 1;"
  );
  
  const equipoId = (equipos as any)[0].id;

  // Asignar todos los usuarios existentes al equipo por defecto
  await queryInterface.sequelize.query(
    `UPDATE usuarios SET "equipoId" = ${equipoId} WHERE "equipoId" IS NULL;`
  );

  // Asignar todos los lugares existentes al equipo por defecto
  await queryInterface.sequelize.query(
    `UPDATE lugares SET "equipoId" = ${equipoId} WHERE "equipoId" IS NULL;`
  );

  // Asignar todos los turnos existentes al equipo por defecto
  await queryInterface.sequelize.query(
    `UPDATE turnos SET "equipoId" = ${equipoId} WHERE "equipoId" IS NULL;`
  );

  // Asignar todos los cargos existentes al equipo por defecto
  await queryInterface.sequelize.query(
    `UPDATE cargos SET "equipoId" = ${equipoId} WHERE "equipoId" IS NULL;`
  );

  // Asignar todos los exhibidores existentes al equipo por defecto
  await queryInterface.sequelize.query(
    `UPDATE exhibidores SET "equipoId" = ${equipoId} WHERE "equipoId" IS NULL;`
  );

  // Ahora hacer las columnas NOT NULL ya que todos los registros tienen equipoId
  await queryInterface.changeColumn('usuarios', 'equipoId', {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'equipos',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT', // Cambiar a RESTRICT para evitar eliminación accidental
  });

  await queryInterface.changeColumn('lugares', 'equipoId', {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'equipos',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  });

  await queryInterface.changeColumn('turnos', 'equipoId', {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'equipos',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  });

  await queryInterface.changeColumn('cargos', 'equipoId', {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'equipos',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  });

  await queryInterface.changeColumn('exhibidores', 'equipoId', {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'equipos',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  });
}

export async function down(queryInterface: QueryInterface) {
  // Hacer las columnas nullable nuevamente
  await queryInterface.changeColumn('usuarios', 'equipoId', {
    type: DataTypes.INTEGER,
    allowNull: true,
  });

  await queryInterface.changeColumn('lugares', 'equipoId', {
    type: DataTypes.INTEGER,
    allowNull: true,
  });

  await queryInterface.changeColumn('turnos', 'equipoId', {
    type: DataTypes.INTEGER,
    allowNull: true,
  });

  await queryInterface.changeColumn('cargos', 'equipoId', {
    type: DataTypes.INTEGER,
    allowNull: true,
  });

  await queryInterface.changeColumn('exhibidores', 'equipoId', {
    type: DataTypes.INTEGER,
    allowNull: true,
  });

  // Limpiar los equipoId
  await queryInterface.sequelize.query(
    'UPDATE usuarios SET "equipoId" = NULL;'
  );
  await queryInterface.sequelize.query(
    'UPDATE lugares SET "equipoId" = NULL;'
  );
  await queryInterface.sequelize.query(
    'UPDATE turnos SET "equipoId" = NULL;'
  );
  await queryInterface.sequelize.query(
    'UPDATE cargos SET "equipoId" = NULL;'
  );
  await queryInterface.sequelize.query(
    'UPDATE exhibidores SET "equipoId" = NULL;'
  );

  // Eliminar el equipo por defecto
  await queryInterface.sequelize.query(
    "DELETE FROM equipos WHERE nombre = 'Equipo Principal';"
  );
}
