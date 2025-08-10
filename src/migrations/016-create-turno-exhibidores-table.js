'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log('🔄 Creando tabla turno_exhibidores...');
      
      // Crear la nueva tabla turno_exhibidores
      await queryInterface.createTable('turno_exhibidores', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        turnoId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'turnos',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        exhibidorId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'exhibidores',
            key: 'id',
          },
          onDelete: 'RESTRICT',
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      });

      // Crear índices
      await queryInterface.addIndex('turno_exhibidores', ['turnoId']);
      await queryInterface.addIndex('turno_exhibidores', ['exhibidorId']);
      await queryInterface.addIndex('turno_exhibidores', ['turnoId', 'exhibidorId'], {
        unique: true,
        name: 'turno_exhibidor_unique'
      });

      console.log('✅ Tabla turno_exhibidores creada');

      // Migrar datos existentes si los hay
      console.log('🔄 Migrando datos existentes...');
      const [turnos] = await queryInterface.sequelize.query(
        'SELECT id, exhibidorId FROM turnos WHERE exhibidorId IS NOT NULL'
      );

      if (turnos.length > 0) {
        console.log(`📋 Migrando ${turnos.length} turnos existentes...`);
        
        for (const turno of turnos) {
          if (turno.exhibidorId) {
            await queryInterface.sequelize.query(
              'INSERT INTO turno_exhibidores (turnoId, exhibidorId, createdAt, updatedAt) VALUES (?, ?, NOW(), NOW())',
              {
                replacements: [turno.id, turno.exhibidorId]
              }
            );
          }
        }
        
        console.log('✅ Datos migrados correctamente');
      } else {
        console.log('ℹ️ No hay datos existentes para migrar');
      }

      // Eliminar la columna exhibidorId de la tabla turnos
      console.log('🔄 Eliminando columna exhibidorId de turnos...');
      await queryInterface.removeColumn('turnos', 'exhibidorId');
      console.log('✅ Columna exhibidorId eliminada');

      // Actualizar el índice único
      console.log('🔄 Actualizando índices...');
      try {
        await queryInterface.removeIndex('turnos', 'turnos_fecha_hora_lugarId_exhibidorId_unique');
      } catch (error) {
        console.log('ℹ️ Índice original no encontrado, continuando...');
      }
      
      await queryInterface.addIndex('turnos', ['fecha', 'hora', 'lugarId'], {
        unique: true,
        name: 'turnos_fecha_hora_lugarId_unique'
      });
      console.log('✅ Índices actualizados');

      console.log('🎉 Migración completada exitosamente');
    } catch (error) {
      console.error('❌ Error en la migración:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      console.log('🔄 Revertiendo migración...');

      // Agregar de vuelta la columna exhibidorId a turnos
      console.log('🔄 Restaurando columna exhibidorId en turnos...');
      await queryInterface.addColumn('turnos', 'exhibidorId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'exhibidores',
          key: 'id',
        },
      });

      // Restaurar índice único original
      try {
        await queryInterface.removeIndex('turnos', 'turnos_fecha_hora_lugarId_unique');
      } catch (error) {
        console.log('ℹ️ Índice nuevo no encontrado, continuando...');
      }
      
      await queryInterface.addIndex('turnos', ['fecha', 'hora', 'lugarId', 'exhibidorId'], {
        unique: true,
        name: 'turnos_fecha_hora_lugarId_exhibidorId_unique'
      });

      // Migrar datos de vuelta
      const [turnoExhibidores] = await queryInterface.sequelize.query(
        'SELECT turnoId, exhibidorId FROM turno_exhibidores'
      );

      for (const te of turnoExhibidores) {
        await queryInterface.sequelize.query(
          'UPDATE turnos SET exhibidorId = ? WHERE id = ?',
          {
            replacements: [te.exhibidorId, te.turnoId]
          }
        );
      }

      // Eliminar la tabla turno_exhibidores
      await queryInterface.dropTable('turno_exhibidores');

      console.log('✅ Migración revertida exitosamente');
    } catch (error) {
      console.error('❌ Error al revertir la migración:', error);
      throw error;
    }
  }
};
