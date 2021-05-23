'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('saytoConversations', {
      unhideUsermindid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        foreignKey: {
            model: "messages",
            key: "unhideUsermindid"
        }
      },
      conversationid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        foreignKey: {
            model: "conversations",
            key: "conversationid"
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      datetimetell: {
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('saytoConversations');
  }
};
