import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  try {
    // Verificar si el equipo ya existe
    const [equipos] = await queryInterface.sequelize.query(
      "SELECT id FROM equipos WHERE nombre = 'Equipo Principal' LIMIT 1;"
    );
    
    let equipoId;
    
    if ((equipos as any[]).length === 0) {
      // Crear equipo por defecto solo si no existe
      await queryInterface.sequelize.query(
        "INSERT INTO equipos (nombre, descripcion, activo, createdAt, updatedAt) VALUES ('Equipo Principal', 'Equipo por defecto para datos existentes', true, NOW(), NOW());"
      );
      
      // Obtener el ID del equipo recién creado
      const [equiposCreados] = await queryInterface.sequelize.query(
        "SELECT id FROM equipos WHERE nombre = 'Equipo Principal' LIMIT 1;"
      );
      
      equipoId = (equiposCreados as any)[0].id;
      console.log('✅ Equipo Principal creado con ID:', equipoId);
    } else {
      equipoId = (equipos as any)[0].id;
      console.log('ℹ️ Equipo Principal ya existe con ID:', equipoId);
    }

    // Asignar todos los usuarios existentes al equipo por defecto (usando backticks para MySQL)
    await queryInterface.sequelize.query(
      `UPDATE usuarios SET equipoId = ${equipoId} WHERE equipoId IS NULL;`
    );

    // Asignar todos los lugares existentes al equipo por defecto
    await queryInterface.sequelize.query(
      `UPDATE lugares SET equipoId = ${equipoId} WHERE equipoId IS NULL;`
    );

    // Asignar todos los turnos existentes al equipo por defecto
    await queryInterface.sequelize.query(
      `UPDATE turnos SET equipoId = ${equipoId} WHERE equipoId IS NULL;`
    );

    // Asignar todos los cargos existentes al equipo por defecto
    await queryInterface.sequelize.query(
      `UPDATE cargos SET equipoId = ${equipoId} WHERE equipoId IS NULL;`
    );

    // Asignar todos los exhibidores existentes al equipo por defecto
    await queryInterface.sequelize.query(
      `UPDATE exhibidores SET equipoId = ${equipoId} WHERE equipoId IS NULL;`
    );

    console.log('✅ Todos los registros asignados al Equipo Principal');
    
    // No cambiar las columnas a NOT NULL debido al límite de claves en MySQL
    console.log('ℹ️ Saltando cambio a NOT NULL debido al límite de claves en MySQL');
    
  } catch (error) {
    console.log('Error en migración 037:', error);
    throw error;
  }
}

export async function down(queryInterface: QueryInterface) {
  // Limpiar los equipoId usando sintaxis correcta de MySQL
  await queryInterface.sequelize.query(
    'UPDATE usuarios SET equipoId = NULL;'
  );
  await queryInterface.sequelize.query(
    'UPDATE lugares SET equipoId = NULL;'
  );
  await queryInterface.sequelize.query(
    'UPDATE turnos SET equipoId = NULL;'
  );
  await queryInterface.sequelize.query(
    'UPDATE cargos SET equipoId = NULL;'
  );
  await queryInterface.sequelize.query(
    'UPDATE exhibidores SET equipoId = NULL;'
  );

  // Eliminar el equipo por defecto
  await queryInterface.sequelize.query(
    "DELETE FROM equipos WHERE nombre = 'Equipo Principal';"
  );
}
