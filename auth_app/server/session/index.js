const fs = require('fs');
const sha512Encryption = require('./helper/encryption');

const sessionData = {
    sessionKey: {},
    userIds: {}
};

const createSessionUser = (userDetails) => {
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

const session = {
    createSessionUser,
    getSessionUser,
    modifySessionUser,
    endSession,
    allLoggedinUsers
};

const getSessionDataFromFile = async () => {
    try {
        // reading file and saving the file sesion into variable
        const sessionString = await fs.promises.readFile('session.json');
        if (sessionString) {
            const sessionValue = JSON.parse(sessionString);
            sessionData.sessionKey = sessionValue.sessionKey;
            sessionData.userIds = sessionValue.userIds;
        }
    } catch (err) {
        console.error('Error occurred while reading/writing directory!', err);
    }
};
getSessionDataFromFile();

const saveSessionOnDisk = async () => {
    try {
        // writing teh session data into json file
        setInterval(async () => {
            await fs.promises.writeFile('session.json', JSON.stringify(sessionData));
        }, 5000);
    } catch (err) {
        console.error('Error occurred while reading/writing directory!', err);
    }
};

saveSessionOnDisk();

module.exports = session;
