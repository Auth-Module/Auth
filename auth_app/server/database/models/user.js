const { DataTypes, Op } = require('sequelize');
const sequelize = require('../config');
const {
    Sha512Encryption,
    encryptDataAES256,
    decryptDataAES256
} = require('../../auth/helper/encryption');

const User = sequelize.define(
    'User',
    {
        name: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        email: {
            type: DataTypes.TEXT,
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
            defaultValue: JSON.stringify(['general'])
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
            name: encryptDataAES256(userInput.name.trim()),
            email: encryptDataAES256(userInput.email.trim()),
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
        return {
            name: decryptDataAES256(userDetails.name),
            email: decryptDataAES256(userDetails.email)
        };
    } catch (error) {
        console.log('error');
        throw new Error(error.message);
    }
};

const findOrCreateUserBySocialMedia = async (userInputData) => {
    try {
        if ((userInputData.email || userInputData.socialId) && !userInputData.password) {
            const user = {
                name: userInputData.name ? encryptDataAES256(userInputData.name.trim()) : '',
                email: encryptDataAES256(userInputData.email.trim()),
                socialMedia: userInputData.socialMedia,
                socialId: userInputData.socialId,
                validated: true
            };
            console.log(user);

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
            userData.email = decryptDataAES256(userData.email);
            userData.name = userData.name ? decryptDataAES256(userData.name) : '';
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
            name: encryptDataAES256(userInput.name.trim()),
            email: encryptDataAES256(userInput.email.trim()),
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
        userData.email = decryptDataAES256(userData.email);
        userData.name = decryptDataAES256(userData.name);
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
        userData.email = decryptDataAES256(userData.email);
        userData.name = decryptDataAES256(userData.name);
        return modifyUserDataMiddleware(userData);
    } catch (error) {
        throw new Error(error.message);
    }
};

const findAllUser = async () => {
    try {
        const userDetails = await User.findAll();
        const allUsers = userDetails.map((v) => {
            return {
                id: v.id,
                name: decryptDataAES256(v.name),
                email: decryptDataAES256(v.email),
                role: v.role
            };
        });
        return allUsers;
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

const updateUserRole = async (id, role) => {
    try {
        const userDetails = await User.findByPk(id);
        if (!userDetails) {
            return { errorMsg: 'user error' };
        }
        userDetails.role = JSON.stringify(role);
        await userDetails.save();
        const userData = userDetails.toJSON();
        userData.email = decryptDataAES256(userData.email);
        userData.name = decryptDataAES256(userData.name);
        return modifyUserDataMiddleware(userData);
    } catch (error) {
        throw new Error(error.message);
    }
};

const checkUserEmailPass = async (userInput) => {
    try {
        const email = encryptDataAES256(userInput.email.trim());
        console.log(email);
        const userDetails = await User.findOne({ where: { email } });
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
            userData.email = decryptDataAES256(userData.email);
            userData.name = decryptDataAES256(userData.name);
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
    findAllUser,
    updateUserRole,
    markUservalidated,
    checkUserEmailPass
};
