'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Messages extends Model {
        static associate(models) {
            // define association here
        }
    }
    // /**
    // * Helper method for defining associations.
    // * This method is not a part of Sequelize lifecycle.
    // * The `models/index` file will call this method automatically.
    // */
    Messages.index = 8;
    ;
    Messages.init({
        unhideUsermindid: {
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        unhideuserid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "users",
                key: "userid"
            }
        },
        messageData: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        datetimeUnhide: {
            type: DataTypes.DATE,
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM('msg', 'mmf')
        }
    }, {
        sequelize,
        modelName: 'messages',
        timestamps: false,
        createdAt: false,
        updatedAt: false,
    });
    Messages.associate = function (models) {
        Messages.belongsTo(models.users, { as: 'unhidemind', foreignKey: 'unhideuserid', onDelete: 'CASCADE' });
    };
    return Messages;
};
//# sourceMappingURL=messages.js.map