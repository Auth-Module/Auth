const sha512Encryption = require('./helper/encryption');
const { getAllSessions, saveSession } = require('../database/models/session');

const sessionData = {
    sessionKey: {},
    userIds: {}
};

const createSessionUser = async (userDetails) => {
    if (userDetails.id || userDetails.userId) {
        const sessionDuration = process.env.SESSION_DURATION_MINUTES || 600;
        const sessionEndTime = Math.floor(Date.now() / 1000) + parseInt(sessionDuration, 10) * 60;

        const user = {
            userid: userDetails.id || userDetails.userId,
            role: userDetails.role || '',
            userName: userDetails.userName || '',
            userEmail: userDetails.userEmail || '',
            validtill: sessionEndTime
        };

        const hash = sha512Encryption(
            user,
            process.env.SESSION_ENCRYPTION,
            process.env.SESSION_ENCRYPTION_ROUND
        );

        sessionData.sessionKey[hash] = { ...user };
        sessionData.userIds[user.userid] = hash;

        const isSesssionSaaved = await saveSession({ ...user, sessioKey: hash });
        console.log('Sesssion Saved', isSesssionSaaved);
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
        const { userid, validtill, userDetails } = userdata;
        return { userid, validtill, ...userDetails };
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

const modifySessionUser = async (userDetails) => {
    let status = false;
    const userid = parseInt(userDetails.id || userDetails.userId || 0, 10);
    if (userid) {
        const sessionHash = sessionData.userIds[userid];
        if (parseInt(sessionData.sessionKey[sessionHash].userid, 10) === userid) {
            const userSessionDetails = sessionData.sessionKey[sessionHash];
            if (userSessionDetails.role) {
                userSessionDetails.role = userDetails.role;
                status = await saveSession({ ...userSessionDetails, role: userDetails.role });
                console.log(status);
            }
        }
    }
    return status;
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
