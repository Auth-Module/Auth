const { getAllProxys, saveProxy } = require('../database/models/proxy');

const proxyServers = {
    settings: {}
};

const updateProxy = async (proxy) => {
    const temp = {};
    if (Array.isArray(proxy)) {
        proxy.forEach(async (v) => {
            const source = v.source.trim();
            const destination = v.destination.trim();
            const scope = v.scope || [];
            if (source && destination) {
                temp[source] = { destination, scope };
            }
            const proxySavingStatus = await saveProxy({ source, destination, scope });
            console.log('proxySavingStatus', source, proxySavingStatus);
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
    let urlDestination = null;
    if (currentURL.includes('favicon.ico')) {
        return null;
    }
    // eslint-disable-next-line consistent-return
    Object.keys(proxyServers.settings).forEach((subURL) => {
        if (currentURL.includes(subURL)) {
            let remainingURL = currentURL.split(subURL)[1];
            if (remainingURL.charAt(0) !== '/') {
                remainingURL = `/${remainingURL}`;
            }
            urlDestination = {
                url: proxyServers.settings[subURL].destination + remainingURL,
                scope: proxyServers.settings[subURL].scope
            };
        }
    });
    return urlDestination;
};

const loadProxyDataFromDB = async () => {
    try {
        const allProxies = await getAllProxys();
        if (allProxies.length > 0) {
            allProxies.forEach((v) => {
                const { source, destination, scope } = v;
                proxyServers.settings[source] = { destination, scope };
            });
        }
    } catch (err) {
        console.error('Error occurred while reading/writing directory!', err.message);
    }
};

const proxy = {
    loadProxyDataFromDB,
    updateProxy,
    getProxy,
    proxyURLRewrite
};
module.exports = proxy;
