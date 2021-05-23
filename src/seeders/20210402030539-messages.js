'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.changeColumn('messages', 'messageData',
    {
      type: Sequelize.TEXT
    }
  );
},

down: async (queryInterface, Sequelize) => {
  // /**
  // * Add commands to revert seed here.
  // *
  // * Example:
  // * await queryInterface.bulkDelete('People', null, {});
  // */
}
};
