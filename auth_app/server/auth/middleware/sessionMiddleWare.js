const session = require('../../session/index');

const sessioMiddleware = async (req, res, next) => {
    const sessionCookie = req.cookies.auth_session;
    const sessionUser = session.getSessionUser(sessionCookie);
    if (sessionUser) {
        res.locals.user = { ...sessionUser };
        next();
    } else {
        res.status(401).send({ error: 'auth invalid' });
    }
};

module.exports = { sessioMiddleware };
