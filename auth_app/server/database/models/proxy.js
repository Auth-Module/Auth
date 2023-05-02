const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const Proxy = sequelize.define(
    'Proxy',
    {
        source: {
            type: DataTypes.CHAR,
            allowNull: true
        },
        destination: {
            type: DataTypes.CHAR,
            allowNull: true
        },
        scope: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },
    {
        freezeTableName: true
    }
);

const saveProxy = async (setup) => {
    try {
        const proxySession = {
            source: setup.source,
            destination: setup.destination,
            scope: JSON.stringify(setup.scope)
        };

        let proxyDetails = await Proxy.findOne({ where: { source: proxySession.source } });
        if (proxyDetails) {
            proxyDetails.destination = proxySession.destination;
            proxyDetails.scope = proxySession.scope;
            await proxyDetails.save();
        } else {
            proxyDetails = await Proxy.create(proxySession);
        }
        return true;
    } catch (error) {
        console.log('error');
        throw new Error(error.message);
    }
};

const getAllProxys = async () => {
    try {
        const proxySessions = await Proxy.findAll();
        const proxys = proxySessions.map((v) => {
            return {
                source: v.source,
                destination: v.destination,
                scope: v.scope ? JSON.parse(v.scope) : []
            };
        });
        return proxys;
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports = {
    saveProxy,
    getAllProxys
};
