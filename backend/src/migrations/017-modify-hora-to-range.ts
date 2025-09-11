import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  // Modificar el campo hora para soportar rangos (HH:MM-HH:MM)
  await queryInterface.changeColumn('turnos', 'hora', {
    type: DataTypes.STRING(11), // Aumentar de 5 a 11 para "HH:MM-HH:MM"
    allowNull: false,
    validate: {
      is: /^([01]?[0-9]|2[0-3]):[0-5][0-9]-([01]?[0-9]|2[0-3]):[0-5][0-9]$/, // Formato HH:MM-HH:MM
    },
  });

  // Actualizar el índice único para incluir el nuevo formato
  await queryInterface.removeIndex('turnos', 'turnos_fecha_hora_lugar_unique');
  
  await queryInterface.addIndex('turnos', ['fecha', 'hora', 'lugarId'], {
    unique: true,
    name: 'turnos_fecha_hora_lugar_unique',
  });
}

export async function down(queryInterface: QueryInterface) {
  // Revertir el campo hora a su formato original
  await queryInterface.changeColumn('turnos', 'hora', {
    type: DataTypes.STRING(5),
    allowNull: false,
    validate: {
      is: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, // Formato HH:MM original
    },
  });

  // Revertir el índice único
  await queryInterface.removeIndex('turnos', 'turnos_fecha_hora_lugar_unique');
  
  await queryInterface.addIndex('turnos', ['fecha', 'hora', 'lugarId'], {
    unique: true,
    name: 'turnos_fecha_hora_lugar_unique',
  });
}
