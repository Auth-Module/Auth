const fs = require('fs');
const sha512Encryption = require('./helper/encryption');
const { getAllSessions, saveSession } = require('../database/models/session');

const sessionData = {
    sessionKey: {},
    userIds: {}
};

const createSessionUser = async (userDetails) => {
    if (userDetails.id || userDetails.userId) {
        const sessionDuration = process.env.SESSION_DURATION_MINUTES || 600;
        const currentTime = Math.floor(Date.now() / 1000);
        const sessionEndTime = currentTime + parseInt(sessionDuration, 10) * 60;
        const user = { ...userDetails, validtill: sessionEndTime };
        const hash = sha512Encryption(
            user,
            process.env.SESSION_ENCRYPTION,
            process.env.SESSION_ENCRYPTION_ROUND
        );
        sessionData.sessionKey[hash] = { ...user };
        const userId = userDetails.id || userDetails.userId;
        sessionData.userIds[userId] = hash;
        const isSesssionSaaved = await saveSession({
            userid: userId,
            sessioKey: hash,
            userDetails: {
                role: user.role || '',
                userName: user.userName || '',
                userEmail: user.userEmail || ''
            },
            validtill: sessionEndTime
        });
        console.log('Sesssion Saved', hash, isSesssionSaaved);
        return hash;
    }
    throw new Error('userId is needed');
};

const getSessionUser = (sessionId) => {
    if (!sessionId) {
        return null;
    }
    const currentTime = Math.floor(Date.now() / 1000);
    const userdata = sessionData.sessionKey[sessionId];
    if (userdata && parseInt(userdata.validtill, 10) > currentTime) {
        return userdata;
    }
    return null;
};

const endSession = (sessionId) => {
    if (sessionData.sessionKey[sessionId]) {
        const userdata = sessionData.sessionKey[sessionId];
        delete sessionData.userIds[userdata.id];
        delete sessionData.sessionKey[sessionId];
    }
};

const modifySessionUser = (userDetails) => {
    return userDetails;
};
const allLoggedinUsers = () => {
    return Object.keys(sessionData.userIds);
};

const getSessionDataFromDB = async () => {
    try {
        const savedSessions = await getAllSessions();
        if (savedSessions.length > 0) {
            savedSessions.forEach((v) => {
                const { sessioKey, userid, userDetails, validtill } = v;
                sessionData.sessionKey[sessioKey] = { userid, validtill, ...userDetails };
                sessionData.userIds[userid] = sessioKey;
            });
        }
    } catch (err) {
        console.error('Error occurred while reading/writing directory!', err);
    }
};

const session = {
    getSessionDataFromDB,
    createSessionUser,
    getSessionUser,
    modifySessionUser,
    endSession,
    allLoggedinUsers
};

module.exports = session;
