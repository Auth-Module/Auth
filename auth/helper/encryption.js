const crypto = require('crypto');

const Sha512Encryption = (data, key, passwordRound = 1) => {
    const round = parseInt(passwordRound, 10);
    let hashString = crypto
        .createHash('sha256')
        .update(JSON.stringify(data) + key)
        .digest('hex');
    const i = 2;
    while (i <= round) {
        hashString = crypto
            .createHash('sha256')
            .update(hashString + key)
            .digest('hex');
    }
    console.log(hashString);
    return hashString;
};

module.exports = { Sha512Encryption };
