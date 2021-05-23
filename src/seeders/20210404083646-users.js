'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn( 'users',
    'touchme', Sequelize.BOOLEAN
    );
  },

  down: async (queryInterface, Sequelize) => {
    // /**
    //  * Add commands to revert seed here.
    //  *
    //  * Example:
    //  * await queryInterface.bulkDelete('People', null, {});
    //  */
  }
};
