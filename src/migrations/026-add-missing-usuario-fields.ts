import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  console.log('🔄 Agregando campos faltantes a la tabla usuarios...');
  
  try {
    // Verificar si la columna tieneCoche ya existe
    const tableInfo = await queryInterface.describeTable('usuarios');
    
    if (!tableInfo.tieneCoche) {
      console.log('📋 Agregando columna tieneCoche...');
      await queryInterface.addColumn('usuarios', 'tieneCoche', {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
        comment: 'Indica si el usuario tiene coche disponible'
      });
      console.log('✅ Columna tieneCoche agregada');
    } else {
      console.log('ℹ️ Columna tieneCoche ya existe');
    }

    if (!tableInfo.siempreCon) {
      console.log('📋 Agregando columna siempreCon...');
      await queryInterface.addColumn('usuarios', 'siempreCon', {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'ID del usuario que siempre debe acompañar a este usuario'
      });
      console.log('✅ Columna siempreCon agregada');
    } else {
      console.log('ℹ️ Columna siempreCon ya existe');
    }

    if (!tableInfo.nuncaCon) {
      console.log('📋 Agregando columna nuncaCon...');
      await queryInterface.addColumn('usuarios', 'nuncaCon', {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'ID del usuario que nunca debe acompañar a este usuario'
      });
      console.log('✅ Columna nuncaCon agregada');
    } else {
      console.log('ℹ️ Columna nuncaCon ya existe');
    }

    console.log('🎉 Migración completada exitosamente');
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    throw error;
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  console.log('🔄 Revertiendo campos de usuarios...');
  
  try {
    const tableInfo = await queryInterface.describeTable('usuarios');
    
    if (tableInfo.nuncaCon) {
      console.log('📋 Eliminando columna nuncaCon...');
      await queryInterface.removeColumn('usuarios', 'nuncaCon');
    }
    
    if (tableInfo.siempreCon) {
      console.log('📋 Eliminando columna siempreCon...');
      await queryInterface.removeColumn('usuarios', 'siempreCon');
    }
    
    if (tableInfo.tieneCoche) {
      console.log('📋 Eliminando columna tieneCoche...');
      await queryInterface.removeColumn('usuarios', 'tieneCoche');
    }
    
    console.log('✅ Migración revertida exitosamente');
  } catch (error) {
    console.error('❌ Error al revertir la migración:', error);
    throw error;
  }
}
