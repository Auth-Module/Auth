const { DataTypes, Op } = require('sequelize');
const sequelize = require('../config');

const User = sequelize.define(
    'User',
    {
        name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true
        },
        socialMedia: {
            type: DataTypes.STRING,
            allowNull: true
        },
        socialId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true
        }
    },
    {
        freezeTableName: true
    }
);

const findOrCreate = async (user) => {
    try {
        if (user.email || user.socialId) {
            let userDetails = await User.findOne({
                where: {
                    [Op.or]: [{ email: user.email }, { socialId: user.socialId }]
                }
            });

            if (userDetails === null) {
                console.log(user);
                userDetails = await User.create(user);
            }
            const userData = userDetails.toJSON();
            delete userData.password;
            delete userData.updatedAt;
            delete userData.createdAt;
            return userData;
        }
        throw new Error('error in user');
    } catch (error) {
        throw new Error('error in user');
    }
};

module.exports = { findOrCreate };
