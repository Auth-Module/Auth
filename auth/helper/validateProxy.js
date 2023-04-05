function isUrl(str) {
    const pattern = new RegExp(
        '^(https?:\\/\\/)?' + // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR IP (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$', // fragment locator
        'i'
    );
    return pattern.test(str);
}

function isRoute(s) {
    const regexp = /^[a-zA-Z0-9_\-/]+$/;
    return regexp.test(s);
}

const proxyURLError = {
    checkProxy: (data) => {
        const errorMsg = [];
        if (Array.isArray(data)) {
            data.forEach((v) => {
                if (!v.source || !v.destination) {
                    errorMsg.push(
                        `${v.source} , ${v.destination} , source and destination mandetory`
                    );
                } else if (isRoute(v.source)) {
                    errorMsg.push(`${v.source} is not a Route, allowed a-z,0-9,_,-,/`);
                } else if (!isUrl(v.destination)) {
                    errorMsg.push(`${v.destination} is not a  proper url`);
                }
            });
        } else {
            errorMsg.push('send data in array format [{source: xxx, destination: yyy},{}]');
        }
        if (errorMsg.length > 0) {
            return errorMsg;
        }
        return null;
    }
};
module.exports = proxyURLError;
