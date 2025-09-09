const { FORBIDDEN_ACCESS } = require('../utils/Messages');
const { AuthResponse } = require('../service/AuthService');
const { UserRole } = require('../utils/Enum');

const AuthorizationMiddleware = (...allowedRoles) => {
    return async (req, res, next) => {
        const user = req.user;
        if (!user) return res.status(403).json(AuthResponse(FORBIDDEN_ACCESS, true));

        if (allowedRoles.includes(UserRole.ADMIN))allowedRoles.push(UserRole.SUPER_ADMIN)

        try {
            const hasAccess = allowedRoles.includes(user.role);
            if (!hasAccess) {
                return res.status(403).json(AuthResponse(FORBIDDEN_ACCESS, true));
            }

            next();
        } catch (error) {
            console.error("Role check failed", error);
            return res.status(500).json(AuthResponse("Internal error", true));
        }
    };
};

module.exports = AuthorizationMiddleware;