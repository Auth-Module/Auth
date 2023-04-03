const fs = require('fs');

const proxyServers = {
    settings: {}
};

const updateProxy = (proxy) => {
    const temp = {};
    if (Array.isArray(proxy)) {
        proxy.forEach((v) => {
            if (v.source && v.destination) {
                temp[v.source] = v.destination;
            }
        });
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
    getProxy
};
module.exports = proxy;
