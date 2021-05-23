'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class UnreadMessages extends Model {
        static associate(models) {
            // define association here
        }
    }
    // /**
    // * Helper method for defining associations.
    // * This method is not a part of Sequelize lifecycle.
    // * The `models/index` file will call this method automatically.
    // */
    UnreadMessages.index = 9;
    ;
    UnreadMessages.init({
        readerid: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: "users",
                key: "userid"
            },
        },
        unhideUsermindid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: "messages",
                key: "unhideUsermindid"
            }
        },
        conversationid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "conversations",
                key: "conversationid"
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        datetimeread: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'unreadMessages',
        timestamps: false,
        createdAt: false,
        updatedAt: false,
    });
    UnreadMessages.associate = function (models) {
        UnreadMessages.belongsTo(models.conversations, { as: 'unread', foreignKey: 'conversationid', onDelete: 'CASCADE' });
    };
    return UnreadMessages;
};
//# sourceMappingURL=unreadmessages.js.map