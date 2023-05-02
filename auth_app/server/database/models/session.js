const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const Session = sequelize.define(
    'Session',
    {
        userid: {
            type: DataTypes.CHAR,
            allowNull: true
        },
        userDetails: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        sessioKey: {
            type: DataTypes.CHAR,
            allowNull: true
        },
        validtill: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    },
    {
        freezeTableName: true
    }
);

const saveSession = async (session) => {
    try {
        const userSession = {
            userid: session.userid,
            sessioKey: session.sessioKey,
            userDetails: JSON.stringify(session.userDetails),
            validtill: new Date(session.validtill * 1000)
        };

        let sessionDetails = await Session.findOne({ where: { userid: userSession.userid } });
        if (sessionDetails) {
            sessionDetails.sessioKey = userSession.sessioKey;
            sessionDetails.validtill = userSession.validtill;
            sessionDetails.userDetails = userSession.userDetails;
            await sessionDetails.save();
        } else {
            sessionDetails = await Session.create(userSession);
        }

        return true;
    } catch (error) {
        console.log('error');
        throw new Error(error.message);
    }
};

const getAllSessions = async () => {
    try {
        const userSessions = await Session.findAll();
        const sessions = userSessions.map((v) => {
            return {
                userid: v.userid,
                sessioKey: v.sessioKey,
                userDetails: v.userDetails ? JSON.parse(v.userDetails) : '',
                validtill: Math.floor(new Date(v.validtill) / 1000)
            };
        });
        return sessions;
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = {
    saveSession,
    getAllSessions
};
