const { DataTypes, Op } = require('sequelize');
const sequelize = require('../config');
const { Sha512Encryption } = require('../../helper/encryption');

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

const removeItemFromUserData = (user) => {
    const userData = { ...user };
    const deleteParams = ['password', 'updatedAt', 'createdAt'];
    deleteParams.forEach((v) => {
        if (userData[v]) {
            delete userData[v];
        }
    });
    return userData;
};

const findOrCreateUserBySocialMedia = async (user) => {
    try {
        if ((user.email || user.socialId) && !user.password) {
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
            return removeItemFromUserData(userData);
        }
        throw new Error('error in user');
    } catch (error) {
        throw new Error('error in user');
    }
};

const createUserByPassword = async (userInput) => {
    try {
        const user = {
            name: userInput.name,
            email: userInput.email,
            password: userInput.password,
            socialMedia: 'email_password'
        };

        let userDetails = await User.findOne({ where: { email: user.email } });
        if (userDetails) {
            if (userDetails.socialMedia !== 'email_password') {
                return { errorMsg: 'User already created account using social media' };
            }
            return { errorMsg: 'User already exists' };
        }

        user.password = Sha512Encryption(
            user.password,
            process.env.PASSWORD_ENCRYPTION,
            process.env.PASSWORD_ENCRYPTION_ROUND
        );

        userDetails = await User.create(user);
        const userData = userDetails.toJSON();
        return removeItemFromUserData(userData);
    } catch (error) {
        throw new Error(error.message);
    }
};
module.exports = { findOrCreateUserBySocialMedia, createUserByPassword };
