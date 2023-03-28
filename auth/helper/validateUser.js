const validateNumber = (num) => {
    if (parseInt(num, 10).toString() !== num.toString()) {
        return 'not a valid number';
    }
    return null;
};

const isEmail = (input) => {
    // eslint-disable-next-line no-useless-escape
    const regex = /^([a-zA-Z0-9\.-]+)@([a-zA-Z0-9-]+)\.([a-z\.]{2,12})$/;
    if (regex.test(input) === false) {
        return false;
    }
    return true;
};

const validationError = {
    isNumber: validateNumber,
    login: (userdata) => {
        const errorMsg = [];
        // email validation
        if (!userdata.email) {
            errorMsg.push('Email is mandetory');
        } else if (!isEmail(userdata.email)) {
            errorMsg.push('Email is not valid');
        }
        // validate password
        if (!userdata.password) {
            errorMsg.push('Password is mandetory');
        } else if (userdata.password.length >= 20 || userdata.password.length <= 8) {
            errorMsg.push('Password should be alteast 8 and max 20 charecter');
        }

        if (errorMsg.length > 0) {
            return errorMsg;
        }
        return null;
    },
    registration: (userdata) => {
        const errorMsg = [];

        // email validation
        if (!userdata.email) {
            errorMsg.push('Email is mandetory');
        } else if (!isEmail(userdata.email)) {
            errorMsg.push('Email is not valid');
        }

        // validate name
        if (!userdata.name) {
            errorMsg.push('Name is mandetory');
        } else if (userdata.name.length >= 20 || userdata.name.length <= 5) {
            errorMsg.push('Name should be alteast 5 and max 20 charecter');
        }

        // validate password
        if (!userdata.password) {
            errorMsg.push('Password is mandetory');
        } else if (userdata.password.length >= 20 || userdata.password.length <= 8) {
            errorMsg.push('Password should be alteast 8 and max 20 charecter');
        }

        if (errorMsg.length > 0) {
            return errorMsg;
        }
        return null;
    }
};

module.exports = validationError;
