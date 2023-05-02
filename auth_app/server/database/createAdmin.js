const { createAdminUserByPassword } = require('./models/user');

const createAdmin = async () => {
    try {
        if (
            process.env.ADMIN_LOGIN_NAME &&
            process.env.ADMIN_LOGIN_EMAIL &&
            process.env.ADMIN_LOGIN_PASSWORD
        ) {
            const adminUser = {
                name: process.env.ADMIN_LOGIN_NAME,
                email: process.env.ADMIN_LOGIN_EMAIL,
                password: process.env.ADMIN_LOGIN_PASSWORD,
                role: '[admin]'
            };
            const admin = await createAdminUserByPassword(adminUser);
            console.log('ADMIN USER : ', admin);
        } else {
            console.log('please setup ADMIN details');
        }
    } catch (err) {
        console.log(err);
    }
};

module.exports = createAdmin;
