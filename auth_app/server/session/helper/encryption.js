const crypto = require('crypto');

const sha512Encryption = (data, key, passwordRound = 1) => {
    try {
        const round = parseInt(passwordRound, 10);
        let hashString = crypto
            .createHash('sha256')
            .update(JSON.stringify(data) + key)
            .digest('hex');

        let i = 2;
        while (i <= round) {
            hashString = crypto
                .createHash('sha256')
                .update(hashString.toString() + key)
                .digest('hex');
            i += 1;
        }
        return hashString;
    } catch (error) {
        console.log('error in hash function');
        throw new Error(error.message);
    }
};

module.exports = sha512Encryption;
