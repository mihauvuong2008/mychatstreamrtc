'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Users extends Model {
        static associate(models) {
            // define association here
        }
    }
    // /**
    // * Helper method for defining associations.
    // * This method is not a part of Sequelize lifecycle.
    // * The `models/index` file will call this method automatically.
    // */
    Users.index = 1;
    ;
    Users.init({
        userid: {
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        firstName: {
            type: DataTypes.STRING,
            notEmpty: true
        },
        lastName: {
            type: DataTypes.STRING,
            notEmpty: true
        },
        email: {
            type: DataTypes.STRING,
            validate: {
                isEmail: true
            }
        },
        username: {
            type: DataTypes.STRING
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lasttimelogin: {
            type: DataTypes.DATE
        },
        touchme: {
            type: DataTypes.BOOLEAN,
            default: false
        }
    }, {
        sequelize,
        modelName: 'users',
        timestamps: false,
        createdAt: false,
        updatedAt: false,
    });
    Users.associate = function (models) {
        Users.hasMany(models.inviteChatboxs, { as: 'unhidemind', foreignKey: 'unhideuserid', onDelete: 'CASCADE' });
        Users.hasMany(models.inviteChatboxs, { as: 'receiver', foreignKey: 'receiverid', onDelete: 'CASCADE' });
        Users.hasMany(models.inviteChatboxs, { as: 'sender', foreignKey: 'senderid', onDelete: 'CASCADE' });
        Users.belongsToMany(models.users, { through: models.friendrelates, as: 'ihavefriend', foreignKey: 'userid' });
        Users.belongsToMany(models.users, { through: models.friendrelates, as: 'imafriend', foreignKey: 'friendid' });
        Users.belongsToMany(models.users, { through: models.friendrequests, as: 'sendrequest', foreignKey: 'partnerid' });
        Users.belongsToMany(models.users, { through: models.friendrequests, as: 'revicerequest', foreignKey: 'userid' });
        Users.hasMany(models.memberOfChatboxs, { as: 'member', foreignKey: 'memberid', onDelete: 'CASCADE' });
    };
    return Users;
};
//# sourceMappingURL=users.js.map