'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tokens extends Model {
    // /**
    // * Helper method for defining associations.
    // * This method is not a part of Sequelize lifecycle.
    // * The `models/index` file will call this method automatically.
    // */
     static index = 0;
    static associate(models) {
      // define association here
    }
  };
  Tokens.init({
    accesstoken: DataTypes.STRING,
    refreshtoken: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    sequelize,
    modelName: 'tokens',
    timestamps: false,
  });
  return Tokens;
};
