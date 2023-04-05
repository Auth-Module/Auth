const editProxy = (data) => {
    const newData = [];
    if (Array.isArray(data)) {
        data.forEach((v) => {
            // edit source
            let source = v.source.trim();
            source = source.endsWith('/') ? source.slice(0, -1) : source;
            source = source.startsWith('/') ? source.slice(1) : source;
            // edit destination
            let destination = v.destination.trim();
            destination = destination.endsWith('/') ? destination.slice(0, -1) : destination;
            destination = destination.startsWith('/') ? destination.slice(1) : destination;
            // return value
            newData.push({ source, destination });
        });
    }
    return newData;
};

module.exports = editProxy;
