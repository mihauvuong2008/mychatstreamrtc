'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class InviteChatboxs extends Model {
        static associate(models) {
            // define association here
        }
    }
    // /**
    //  * Helper method for defining associations.
    //  * This method is not a part of Sequelize lifecycle.
    //  * The `models/index` file will call this method automatically.
    //  */
    InviteChatboxs.index = 6;
    ;
    InviteChatboxs.init({
        senderid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: "users",
                key: "userid"
            }
        },
        receiverid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: "users",
                key: "userid"
            }
        },
        chatboxid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: "chatboxs",
                key: "chatboxid"
            }
        },
        datetimeInvite: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'inviteChatboxs',
        timestamps: false,
        createdAt: false,
        updatedAt: false
    });
    InviteChatboxs.associate = function (models) {
        InviteChatboxs.belongsTo(models.chatboxs, { as: 'invite', foreignKey: 'chatboxid', onDelete: 'CASCADE' }); // da chay o chatbox khi tao bang
        InviteChatboxs.belongsTo(models.users, { as: 'receiver', foreignKey: 'receiverid', foreignKey: 'receiverid', onDelete: 'CASCADE' });
        InviteChatboxs.belongsTo(models.users, { as: 'sender', foreignKey: 'senderid', foreignKey: 'senderid', onDelete: 'CASCADE' });
    };
    return InviteChatboxs;
};
//# sourceMappingURL=invitechatboxs.js.map