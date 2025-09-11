import { QueryInterface, DataTypes } from 'sequelize';
import sequelize from '../config/database';

async function runMigration() {
  try {
    console.log('🔄 Ejecutando migración para crear tabla notificaciones_enviadas...');
    
    const queryInterface = sequelize.getQueryInterface();
    
    // Crear la tabla
    await queryInterface.createTable('notificaciones_enviadas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      turnoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'turnos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      tipoNotificacion: {
        type: DataTypes.ENUM('una_semana', 'un_dia', 'una_hora'),
        allowNull: false
      },
      fechaEnvio: {
        type: DataTypes.DATE,
        allowNull: false
      },
      emailEnviado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      error: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    });

    console.log('✅ Tabla notificaciones_enviadas creada');

    // Crear índices
    await queryInterface.addIndex('notificaciones_enviadas', {
      fields: ['turnoId', 'usuarioId', 'tipoNotificacion'],
      unique: true,
      name: 'unique_notification_per_turno_usuario_tipo'
    });

    console.log('✅ Índice único creado');

    await queryInterface.addIndex('notificaciones_enviadas', {
      fields: ['fechaEnvio'],
      name: 'idx_notificaciones_fecha_envio'
    });

    console.log('✅ Índice de fecha creado');

    await queryInterface.addIndex('notificaciones_enviadas', {
      fields: ['tipoNotificacion'],
      name: 'idx_notificaciones_tipo'
    });

    console.log('✅ Índice de tipo creado');
    console.log('🎉 Migración completada exitosamente');

  } catch (error) {
    console.error('❌ Error ejecutando migración:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar la migración si se llama directamente
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en script:', error);
      process.exit(1);
    });
}

export default runMigration;
