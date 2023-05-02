const Sequelize = require('sequelize');

const dbString = `mariadb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
// console.log('dbString', dbString);

const sequelize = new Sequelize(dbString, {
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    logging: false
});

module.exports = sequelize;
