'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Friendrelates extends Model {
        static associate(models) {
            // define association here
        }
    }
    // /**
    //  * Helper method for defining associations.
    //  * This method is not a part of Sequelize lifecycle.
    //  * The `models/index` file will call this method automatically.
    //  */
    Friendrelates.index = 2;
    ;
    Friendrelates.init({
        userid: {
            type: DataTypes.INTEGER,
            notEmpty: true,
            primaryKey: true,
            references: {
                model: "users",
                key: "userid"
            }
        },
        friendid: {
            type: DataTypes.INTEGER,
            notEmpty: true,
            primaryKey: true,
            references: {
                model: "users",
                key: "userid"
            }
        },
        datetimeMakefriend: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'friendrelates',
        timestamps: false,
        createdAt: false,
        updatedAt: false,
    });
    Friendrelates.associate = function (models) {
        Friendrelates.belongsTo(models.users, { as: 'ihavefriend', foreignKey: 'userid' });
        Friendrelates.belongsTo(models.users, { as: 'imafriend', foreignKey: 'friendid' });
    };
    return Friendrelates;
};
//# sourceMappingURL=friendrelates.js.map