import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  // Eliminar el índice único existente
  await queryInterface.removeIndex('user_disponibilidad_config', 'user_disponibilidad_config_usuario_mes_tipo_index');
  
  // Crear un nuevo índice no único para mejorar el rendimiento de las consultas
  await queryInterface.addIndex('user_disponibilidad_config', {
    fields: ['usuarioId', 'mes', 'tipo_disponibilidad'],
    name: 'user_disponibilidad_config_usuario_mes_tipo_index',
    unique: false
  });
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  // Eliminar el índice no único
  await queryInterface.removeIndex('user_disponibilidad_config', 'user_disponibilidad_config_usuario_mes_tipo_index');
  
  // Restaurar el índice único original
  await queryInterface.addIndex('user_disponibilidad_config', {
    fields: ['usuarioId', 'mes', 'tipo_disponibilidad'],
    name: 'user_disponibilidad_config_usuario_mes_tipo_index',
    unique: true
  });
};
