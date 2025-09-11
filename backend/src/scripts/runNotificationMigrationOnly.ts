import { QueryInterface, DataTypes } from 'sequelize';
import sequelize from '../config/database';

// Configurar variables de entorno temporalmente
process.env.DB_HOST = 'localhost';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.DB_NAME = 'AgaPlan';
process.env.DB_PORT = '3306';
process.env.NODE_ENV = 'development';

async function runNotificationMigration() {
  try {
    console.log('🔄 Ejecutando migración para crear tabla notificaciones_enviadas...');
    console.log('📋 Configuración:');
    console.log(`   Host: ${process.env.DB_HOST}`);
    console.log(`   User: ${process.env.DB_USER}`);
    console.log(`   Database: ${process.env.DB_NAME}`);
    console.log(`   Port: ${process.env.DB_PORT}`);
    console.log('');
    
    const queryInterface = sequelize.getQueryInterface();
    
    // Verificar si la tabla ya existe
    const tableExists = await queryInterface.tableExists('notificaciones_enviadas');
    if (tableExists) {
      console.log('⚠️ La tabla notificaciones_enviadas ya existe');
      console.log('¿Deseas continuar? Esto podría causar errores.');
      return;
    }
    
    // Crear la tabla
    await queryInterface.createTable('notificaciones_enviadas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER.UNSIGNED
      },
      turnoId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'turnos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      usuarioId: {
        type: DataTypes.INTEGER.UNSIGNED,
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
  runNotificationMigration()
    .then(() => {
      console.log('✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en script:', error);
      console.log('');
      console.log('💡 Para ejecutar esta migración necesitas:');
      console.log('   1. Iniciar MySQL en tu sistema');
      console.log('   2. Crear la base de datos "AgaPlan" si no existe');
      console.log('   3. Asegurarte de que el usuario "root" tenga permisos');
      process.exit(1);
    });
}

export default runNotificationMigration;
