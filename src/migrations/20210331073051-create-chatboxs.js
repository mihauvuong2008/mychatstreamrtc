'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('chatboxs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      chatboxid: {
        type: Sequelize.INTEGER
      },
      chatboxName: {
        type: Sequelize.STRING
      },
      creatorid: {
        type: Sequelize.INTEGER
      },
      datetimeCreate: {
        type: Sequelize.DATE
      },
      type: {
        type: Sequelize.ENUM('group', 'friend')
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
    await queryInterface.dropTable('chatboxs');
  }
};