'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SaytoConversations extends Model {
    // /**
    // * Helper method for defining associations.
    // * This method is not a part of Sequelize lifecycle.
    // * The `models/index` file will call this method automatically.
    // */
    static index = 10;
    static associate(models) {
      // define association here
    }
  };
  SaytoConversations.init({
    unhideUsermindid:  {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "messages",
        key: "unhideUsermindid"
      }
    },
    conversationid:  {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "conversations",
        key: "conversationid"
      }
    },
    datetimetell: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'saytoConversations',
    timestamps: false,
    createdAt: false,
    updatedAt: false,
  });
  SaytoConversations.associate = function(models) {
    models.saytoConversations.belongsTo(models.conversations, {as: 'sayto', foreignKey: 'conversationid', onDelete: 'CASCADE'});
  };
  return SaytoConversations;
};
