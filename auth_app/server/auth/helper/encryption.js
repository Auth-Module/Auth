const crypto = require('crypto');

const secretKey = process.env.AES_SECRET_KEY;
const secretIV = process.env.AES_SECRET_IV;

const Sha512Encryption = (data, key, passwordRound = 1) => {
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

if (!secretKey || !secretIV) {
    throw new Error('secretKey, secretIV are required');
}

// Generate secret hash with crypto to use for encryption
const key = crypto.createHash('sha256').update(secretKey).digest('hex').substring(0, 32);
const encryptionIV = crypto.createHash('sha256').update(secretIV).digest('hex').substring(0, 16);

// Encrypt data
function encryptDataAES256(data) {
    try {
        const cipher = crypto.createCipheriv('aes-256-cbc', key, encryptionIV);
        return Buffer.from(cipher.update(data, 'utf8', 'hex') + cipher.final('hex')).toString(
            'base64'
        );
    } catch (err) {
        console.log('AES256 Encryption error', err);
        return err;
    }
}

// Decrypt data
function decryptDataAES256(encryptedData) {
    try {
        const buff = Buffer.from(encryptedData, 'base64');
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, encryptionIV);
        return decipher.update(buff.toString('utf8'), 'hex', 'utf8') + decipher.final('utf8'); // Decrypts data and converts to utf8
    } catch (err) {
        console.log('AES256 Decryption error', err);
        return err;
    }
}

module.exports = { Sha512Encryption, encryptDataAES256, decryptDataAES256 };
