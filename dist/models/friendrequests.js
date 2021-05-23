'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Friendrequests extends Model {
        static associate(models) {
            // define association here
        }
    }
    // /**
    //  * Helper method for defining associations.
    //  * This method is not a part of Sequelize lifecycle.
    //  * The `models/index` file will call this method automatically.
    //  */
    Friendrequests.index = 3;
    ;
    Friendrequests.init({
        partnerid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: "users",
                key: "userid"
            }
        },
        userid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: "users",
                key: "userid"
            }
        },
        datetimesendrequest: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'friendrequests',
        timestamps: false,
        createdAt: false,
        updatedAt: false,
    });
    Friendrequests.associate = function (models) {
        Friendrequests.belongsTo(models.users, { as: 'sendrequest', foreignKey: 'partnerid' });
        Friendrequests.belongsTo(models.users, { as: 'revicerequest', foreignKey: 'userid' });
    };
    return Friendrequests;
};
//# sourceMappingURL=friendrequests.js.map