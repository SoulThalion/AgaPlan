import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  try {
    // Verificar si el índice existe antes de intentar eliminarlo
    const indexes = await queryInterface.showIndex('user_disponibilidad_config') as any[];
    const indexExists = indexes.some((index: any) => index.name === 'user_disponibilidad_config_usuario_mes_tipo_index');
    
    if (indexExists) {
      // Eliminar el índice único existente
      await queryInterface.removeIndex('user_disponibilidad_config', 'user_disponibilidad_config_usuario_mes_tipo_index');
    }
  } catch (error) {
    console.log('El índice no existe o ya fue eliminado, continuando...');
  }
  
  // Crear un nuevo índice no único para mejorar el rendimiento de las consultas
  await queryInterface.addIndex('user_disponibilidad_config', {
    fields: ['usuarioId', 'mes', 'tipo_disponibilidad'],
    name: 'user_disponibilidad_config_usuario_mes_tipo_index',
    unique: false
  });
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  try {
    // Verificar si el índice existe antes de intentar eliminarlo
    const indexes = await queryInterface.showIndex('user_disponibilidad_config') as any[];
    const indexExists = indexes.some((index: any) => index.name === 'user_disponibilidad_config_usuario_mes_tipo_index');
    
    if (indexExists) {
      // Eliminar el índice no único
      await queryInterface.removeIndex('user_disponibilidad_config', 'user_disponibilidad_config_usuario_mes_tipo_index');
    }
  } catch (error) {
    console.log('El índice no existe o ya fue eliminado, continuando...');
  }
  
  // Restaurar el índice único original
  await queryInterface.addIndex('user_disponibilidad_config', {
    fields: ['usuarioId', 'mes', 'tipo_disponibilidad'],
    name: 'user_disponibilidad_config_usuario_mes_tipo_index',
    unique: true
  });
};
