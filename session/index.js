const sha512Encryption = require('./helper/encryption');

const sessionData = {
    sessionKey: {},
    userIds: {}
};

const createSessionUser = ({ userId, userEmail, userName }) => {
    if (userId) {
        const user = {
            id: userId,
            email: userEmail,
            name: userName
        };
        const hash = sha512Encryption(
            user,
            process.env.SESSION_ENCRYPTION,
            process.env.SESSION_ENCRYPTION_ROUND
        );
        sessionData.sessionKey[hash] = { ...user };
        sessionData.userIds[user.id] = hash;

        return hash;
    }
    throw new Error('userId is needed');
};

const getSessionUser = (sessionId) => {
    if (!sessionId) {
        return null;
    }
    const userdata = sessionData.sessionKey[sessionId];
    if (userdata) {
        console.log(userdata);
        return userdata;
    }
    return null;
};

const modifySessionUser = (userDetails) => {
    return userDetails;
};

const session = {
    createSessionUser,
    getSessionUser,
    modifySessionUser
};

// const saveSessionOnDisk = () => {
//     console.log('---- saving ----');
// };
// const yourFunction = () => {
//     setInterval(saveSessionOnDisk, 2000);
// };

// yourFunction();

module.exports = session;
