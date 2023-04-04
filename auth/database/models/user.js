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
        },
        validated: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        role: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: JSON.stringify(['basic'])
        }
    },
    {
        freezeTableName: true
    }
);

const modifyUserDataMiddleware = (user) => {
    const userData = { ...user };
    if (userData.role) {
        userData.role = JSON.parse(userData.role);
    }
    const deleteParams = ['password', 'updatedAt', 'createdAt'];
    deleteParams.forEach((v) => {
        if (userData[v]) {
            delete userData[v];
        }
    });
    return userData;
};

const createAdminUserByPassword = async (userInput) => {
    try {
        const user = {
            name: userInput.name,
            email: userInput.email,
            password: userInput.password,
            socialMedia: 'email_password',
            validated: true,
            role: JSON.stringify(['admin'])
        };
        let userDetails = await User.findOne({ where: { email: user.email } });
        if (userDetails) {
            if (userDetails.socialMedia !== 'email_password') {
                return { status: 'Admin already created account using social media' };
            }
            return { status: 'Admin already exists' };
        }

        user.password = Sha512Encryption(
            user.password,
            process.env.PASSWORD_ENCRYPTION,
            process.env.PASSWORD_ENCRYPTION_ROUND
        );

        userDetails = await User.create(user);
        return { name: userDetails.name, email: userDetails.email };
    } catch (error) {
        console.log('error');
        throw new Error(error.message);
    }
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
            return modifyUserDataMiddleware(userData);
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
        return modifyUserDataMiddleware(userData);
    } catch (error) {
        console.log('error');
        throw new Error(error.message);
    }
};

const findUserById = async (id) => {
    try {
        const userDetails = await User.findByPk(id);
        if (!userDetails) {
            return { errorMsg: 'validation error' };
        }
        const userData = userDetails.toJSON();
        return modifyUserDataMiddleware(userData);
    } catch (error) {
        throw new Error(error.message);
    }
};

const markUservalidated = async (id) => {
    try {
        const userDetails = await User.findByPk(id);
        if (!userDetails) {
            return { errorMsg: 'validation error' };
        }
        userDetails.validated = true;
        await userDetails.save();
        return true;
    } catch (error) {
        throw new Error(error.message);
    }
};

const checkUserEmailPass = async (userInput) => {
    try {
        const userDetails = await User.findOne({ where: { email: userInput.email } });
        if (!userDetails) {
            return { errorMsg: 'User not exists' };
        }
        if (userDetails.socialMedia !== 'email_password') {
            return { errorMsg: 'login using social media' };
        }
        if (!userDetails.validated) {
            return { invalidMsg: 'Validate account before login', userid: userDetails.id };
        }

        const userInputPassHash = Sha512Encryption(
            userInput.password,
            process.env.PASSWORD_ENCRYPTION,
            process.env.PASSWORD_ENCRYPTION_ROUND
        );
        if (userDetails.password === userInputPassHash) {
            const userData = userDetails.toJSON();
            return modifyUserDataMiddleware(userData);
        }
        return { errorMsg: 'email or password not matched' };
    } catch (error) {
        console.log('error');
        throw new Error(error.message);
    }
};

module.exports = {
    User,
    createAdminUserByPassword,
    findOrCreateUserBySocialMedia,
    createUserByPassword,
    findUserById,
    markUservalidated,
    checkUserEmailPass
};
