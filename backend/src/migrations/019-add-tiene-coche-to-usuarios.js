'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('usuarios', 'tieneCoche', {
      type: 'BOOLEAN',
      allowNull: true,
      defaultValue: false,
      comment: 'Indica si el usuario tiene coche disponible'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('usuarios', 'tieneCoche');
  }
};
