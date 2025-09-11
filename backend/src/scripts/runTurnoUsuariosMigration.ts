import sequelize from '../config/database';
import { QueryInterface } from 'sequelize';

async function main() {
  try {
    console.log('🚀 Ejecutando migración: 018-create-turno-usuarios-table');
    
    const queryInterface = sequelize.getQueryInterface();
    
    // Verificar si la tabla ya existe
    const tableExists = await queryInterface.tableExists('turno_usuarios');
    if (tableExists) {
      console.log('ℹ️ Tabla turno_usuarios ya existe, continuando...');
    } else {
      // Crear tabla intermedia turno_usuarios
      await queryInterface.createTable('turno_usuarios', {
        id: {
          type: 'INTEGER',
          autoIncrement: true,
          primaryKey: true,
        },
        turnoId: {
          type: 'INTEGER',
          allowNull: false,
          references: {
            model: 'turnos',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        usuarioId: {
          type: 'INTEGER',
          allowNull: false,
          references: {
            model: 'usuarios',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        createdAt: {
          type: 'DATE',
          allowNull: false,
        },
        updatedAt: {
          type: 'DATE',
          allowNull: false,
        },
      });

      // Crear índices para mejorar el rendimiento
      await queryInterface.addIndex('turno_usuarios', ['turnoId'], {
        name: 'turno_usuarios_turnoId_index',
      });

      await queryInterface.addIndex('turno_usuarios', ['usuarioId'], {
        name: 'turno_usuarios_usuarioId_index',
      });

      // Crear índice único para evitar duplicados
      await queryInterface.addIndex('turno_usuarios', ['turnoId', 'usuarioId'], {
        unique: true,
        name: 'turno_usuarios_turno_usuario_unique',
      });

      console.log('✅ Tabla turno_usuarios creada exitosamente');
    }

    // Marcar la migración como ejecutada si no está marcada
    const migrationExists = await sequelize.query(
      'SELECT COUNT(*) as count FROM migrations WHERE name = ?',
      {
        replacements: ['018-create-turno-usuarios-table'],
        type: 'SELECT' as any,
      }
    );
    
    if (Array.isArray(migrationExists) && migrationExists[0] && (migrationExists[0] as any).count === 0) {
      await sequelize.query(
        'INSERT INTO migrations (name, executed_at) VALUES (?, NOW())',
        {
          replacements: ['018-create-turno-usuarios-table'],
          type: 'INSERT' as any,
        }
      );
      console.log('✅ Migración marcada como ejecutada');
    } else {
      console.log('ℹ️ Migración ya marcada como ejecutada');
    }
    
    // Ahora eliminar el campo usuarioId de la tabla turnos
    console.log('🔄 Eliminando campo usuarioId de la tabla turnos...');
    
    // Verificar si el campo usuarioId existe
    const tableDescription = await queryInterface.describeTable('turnos');
    const hasUsuarioId = 'usuarioId' in tableDescription;
    
    if (hasUsuarioId) {
      // Primero eliminar el índice único que incluye usuarioId
      try {
        await queryInterface.removeIndex('turnos', 'turnos_fecha_hora_lugar_usuario_unique');
      } catch (error) {
        console.log('ℹ️ Índice turnos_fecha_hora_lugar_usuario_unique no existe, continuando...');
      }
      
      // Eliminar el campo usuarioId
      await queryInterface.removeColumn('turnos', 'usuarioId');
      console.log('✅ Campo usuarioId eliminado de la tabla turnos');
    } else {
      console.log('ℹ️ Campo usuarioId ya no existe en la tabla turnos');
    }
    
    // Recrear el índice único sin usuarioId
    try {
      // Verificar si el índice ya existe
      const existingIndexes = await queryInterface.showIndex('turnos');
      const indexExists = Array.isArray(existingIndexes) && existingIndexes.some((index: any) => 
        index.name === 'turnos_fecha_hora_lugar_unique'
      );
      
      if (!indexExists) {
        await queryInterface.addIndex('turnos', ['fecha', 'hora', 'lugarId'], {
          unique: true,
          name: 'turnos_fecha_hora_lugar_unique',
        });
        console.log('✅ Índice único turnos_fecha_hora_lugar_unique creado');
      } else {
        console.log('ℹ️ Índice único turnos_fecha_hora_lugar_unique ya existe');
      }
    } catch (error) {
      console.log('ℹ️ Error al crear índice único:', error);
    }
    
    console.log('🎉 Migración completada exitosamente');
    
  } catch (error: any) {
    console.error('❌ Error ejecutando migración:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

main();
