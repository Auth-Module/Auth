const sequelize = require('./config');

async function connectDB() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        await sequelize.sync();
        console.log('DB sync is successfull');
    } catch (error) {
        console.error('Unable to connect  or sync to the database:', error);
    }
}

module.exports = connectDB;