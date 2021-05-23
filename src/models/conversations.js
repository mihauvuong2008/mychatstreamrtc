
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Conversations extends Model {
    // /**
    //  * Helper method for defining associations.
    //  * This method is not a part of Sequelize lifecycle.
    //  * The `models/index` file will call this method automatically.
    //  */
    static index = 7;
    static associate(models) {
      // define association here
    }
  };
  Conversations.init({
    conversationid: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    chatboxid:{
      type: DataTypes.INTEGER,
      references: {
        model: "chatboxs",
        key: "chatboxid"
      }
    },
    startAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'conversations',
    timestamps: false,
    createdAt: false,
    updatedAt: false,
  });
  Conversations.associate = function(models) {
    Conversations.hasMany(models.saytoConversations, {as: 'sayto', foreignKey: 'conversationid', onDelete: 'CASCADE'});
    Conversations.hasMany(models.unreadMessages, {as: 'unread', foreignKey: 'conversationid', onDelete: 'CASCADE'});
    Conversations.belongsTo(models.chatboxs, {as: 'conversation', foreignKey: 'chatboxid',  onDelete: 'CASCADE'});
  }
  return Conversations;
};
