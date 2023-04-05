const fs = require('fs');

const proxyServers = {
    settings: {}
};

const updateProxy = (proxy) => {
    const temp = {};
    if (Array.isArray(proxy)) {
        proxy.forEach((v) => {
            const source = v.source.trim();
            const destination = v.destination.trim();
            if (source && destination) {
                temp[source] = destination;
            }
        });
    } else {
        console.log('proxy is not an Array', proxy);
    }
    if (Object.keys(temp).length) {
        proxyServers.settings = { ...temp };
        return true;
    }
    return false;
};

const getProxy = () => {
    return proxyServers.settings;
};

const proxyURLRewrite = (currentURL) => {
    let urlDestination = '';
    if (currentURL.includes('favicon.ico')) {
        return '';
    }
    // eslint-disable-next-line consistent-return
    Object.keys(proxyServers.settings).forEach((subURL) => {
        if (currentURL.includes(subURL)) {
            const remainingURL = currentURL.split(subURL)[1];
            urlDestination = proxyServers.settings[subURL] + remainingURL;
        }
    });
    return urlDestination;
};

const getProxyDataFromFile = async () => {
    try {
        // reading file and saving the file sesion into variable
        const proxyString = await fs.promises.readFile('proxy.json');
        if (proxyString) {
            const proxyValue = JSON.parse(proxyString);
            proxyServers.settings = proxyValue;
        }
    } catch (err) {
        console.error('Error occurred while reading/writing directory!', err.message);
    }
};
getProxyDataFromFile();

const saveProxyDataOnDisk = async () => {
    try {
        // writing teh session data into json file
        setInterval(async () => {
            await fs.promises.writeFile('proxy.json', JSON.stringify(proxyServers.settings));
        }, 5000);
    } catch (err) {
        console.error('Error occurred while reading/writing directory!', err);
    }
};

saveProxyDataOnDisk();

const proxy = {
    updateProxy,
    getProxy,
    proxyURLRewrite
};
module.exports = proxy;
