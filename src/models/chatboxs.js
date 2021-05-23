'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chatboxs extends Model {
    // /**
    //  * Helper method for defining associations.
    //  * This method is not a part of Sequelize lifecycle.
    //  * The `models/index` file will call this method automatically.
    //  */
    static index = 4;
    static associate(models) {
      // define association here
    }
  };
  Chatboxs.init({
    chatboxid: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    chatboxName: {
      type: DataTypes.STRING,
      notEmpty: true
    },
    creatorid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "userid"
      }
    },
    datetimeCreate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('group', 'friend')
    }
  }, {
    sequelize,
    modelName: 'chatboxs',
    timestamps: false,
    createdAt: false,
    updatedAt: false,
  });
  Chatboxs.associate = function(models) {
    Chatboxs.belongsTo(models.users, {as: 'createdby',  foreignKey: 'creatorid', onDelete: 'CASCADE'});
    Chatboxs.hasMany(models.inviteChatboxs, {as: 'invite', foreignKey: 'chatboxid', onDelete: 'CASCADE'});
    Chatboxs.hasMany(models.memberOfChatboxs, {as: 'chatboxmember', foreignKey: 'chatboxid',  onDelete: 'CASCADE'});
    Chatboxs.hasMany(models.conversations, {as: 'conversation', foreignKey: 'chatboxid',  onDelete: 'CASCADE'});
  };
  return Chatboxs;
};
