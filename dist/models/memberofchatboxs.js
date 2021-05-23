'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class MemberOfChatboxs extends Model {
        static associate(models) {
            // define association here
        }
    }
    // /**
    //  * Helper method for defining associations.
    //  * This method is not a part of Sequelize lifecycle.
    //  * The `models/index` file will call this method automatically.
    //  */
    MemberOfChatboxs.index = 5;
    ;
    MemberOfChatboxs.init({
        chatboxid: {
            primaryKey: true,
            type: DataTypes.INTEGER,
            references: {
                model: "chatboxs",
                key: "chatboxid"
            }
        },
        memberid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: "users",
                key: "userid"
            }
        },
        chatboxuserkey: {
            allowNull: false,
            type: DataTypes.BOOLEAN
        },
        userchatboxname: DataTypes.STRING,
        datetimeJoin: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'memberOfChatboxs',
        timestamps: false,
        createdAt: false,
        updatedAt: false,
    });
    MemberOfChatboxs.associate = function (models) {
        MemberOfChatboxs.belongsTo(models.users, { as: 'member', foreignKey: 'memberid', onDelete: 'CASCADE' });
        MemberOfChatboxs.belongsTo(models.chatboxs, { as: 'chatboxmember', foreignKey: 'chatboxid', onDelete: 'CASCADE' });
    };
    return MemberOfChatboxs;
};
//# sourceMappingURL=memberofchatboxs.js.map