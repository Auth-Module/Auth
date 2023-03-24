const crypto = require('crypto');

const Sha512Encryption = async (data, key, passwordRound = 1) => {
    const round = parseInt(passwordRound, 10);
    let hashString = crypto.createHash(data).update(key).digest('hex');
    const i = 2;
    while (i <= round) {
        hashString = crypto.createHash(hashString).update(key).digest('hex');
    }
    return hashString;
};

module.exports = { Sha512Encryption };
