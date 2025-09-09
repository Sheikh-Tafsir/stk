const jwt = require('jsonwebtoken');
const { ACCESS_TOKEN_REQUIRED } = require('../utils/Messages');
const { AuthResponse } = require('../service/AuthService');

const AuthenticationMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(401).json(AuthResponse(ACCESS_TOKEN_REQUIRED, true));
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY, (err, user) => {
        if (err) {
            console.log("error: Access token expired")
            return res.status(401).json(AuthResponse(ACCESS_TOKEN_REQUIRED, true));
        }
        
        req.user = user;
        next();
    });
};

module.exports = AuthenticationMiddleware;