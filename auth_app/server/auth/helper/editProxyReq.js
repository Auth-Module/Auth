/* eslint-disable no-shadow */
const editProxy = (data) => {
    const newData = [];
    if (Array.isArray(data)) {
        // console.log(data);
        data.forEach((v) => {
            // edit source
            let source = v.source.trim();
            source = source.endsWith('/') ? source.slice(0, -1) : source;
            source = source.startsWith('/') ? source.slice(1) : source;
            source = source || '/';
            // edit destination
            let destination = v.destination.trim();
            destination = destination.endsWith('/') ? destination.slice(0, -1) : destination;
            destination = destination.startsWith('/') ? destination.slice(1) : destination;
            // edit scope
            const scope = [];
            if (v.scope && !Array.isArray(v.scope)) {
                // eslint-disable-next-line no-shadow
                v.scope
                    .trim()
                    .split(',')
                    .forEach((v) => {
                        scope.push(v.trim().toLowerCase());
                    });
            }
            // return value
            newData.push({ source, destination, scope });
        });
    }
    return newData;
};

module.exports = editProxy;
