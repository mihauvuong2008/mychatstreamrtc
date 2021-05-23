'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('unreadMessages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      readerid: {
        type: Sequelize.INTEGER
      },
      unhideUsermindid: {
        type: Sequelize.INTEGER
      },
      converstationid: {
        type: Sequelize.INTEGER
      },
      datetimeread: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('unreadMessages');
  }
};