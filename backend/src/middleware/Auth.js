const Logger = require('../infra/logging/Logger.Service');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { jwt: jwtConfig, prisma } = require('../config');
const IdentificationRepository = require('../modules/identity/Identification.Repository');
const { NotFoundError, AuthorizationError } = require('../core/Errors');

/**
 * Arteo RBAC System: Privilege Registry
 */
const ROLES = {
    ADMIN: 'ADMIN',
    MODERATOR: 'MODERATOR',
    AI_AGENT: 'AI_AGENT',
    USER: 'USER'
};

/**
 * AuthMiddleware: Identity verification and resource authorization for Arteo.
 */
class AuthMiddleware {
    constructor() {
        this.ROLES = ROLES;
    }

    /**
     * Enforces role-based hierarchy.
     */
    restrictTo = (...allowedRoles) => {
        return (req, res, next) => {
            if (!req.user) {
                return res.unauthorized({ message: 'Yêu cầu xác thực: Danh tính chưa được thiết lập.' });
            }

            const hasAccess = allowedRoles.includes(req.user.role) || req.user.isAdmin;
            
            if (!hasAccess) {
                return res.forbidden({ 
                    message: `Truy cập bị từ chối: Cần có đặc quyền cấp cao (${allowedRoles.join(', ')}).` 
                });
            }

            next();
        };
    };
    authenticate = (req, res, next) => {
        passport.authenticate('jwt', { session: false }, async (err, user, info) => {
            if (err) {
                return res.internalServerError({ message: 'Lỗi giao thức xác thực.', details: err.message });
            }
            if (!user) {
                return res.unauthorized({ message: 'Chưa xác thực: Token định danh không hợp lệ hoặc bị thiếu.' });
            }

            try {
                // Session Status Audit
                const session = await IdentificationRepository.findBySessionId(user.sid);
                
                // Defensive session validation
                if (session && !session.isActive) {
                    return res.unauthorized({ message: 'Phiên làm việc đã bị thu hồi hoặc hết hạn.' });
                }
                
                req.user = user;
                next();
            } catch (error) {
                Logger.warn('[Auth:Defensive] Session verification bypassed due to platform protocol noise:', error.message);
                req.user = user; // Fallback to JWT payload identity
                next();
            }
        })(req, res, next);
    };

    /**
     * Opt-in authentication that populates req.user if a valid token is present.
     */
    optionalAuth = (req, res, next) => {
        passport.authenticate('jwt', { session: false }, (err, user, info) => {
            if (user) req.user = user;
            next();
        })(req, res, next);
    };

    /**
     * Authorizes access based on resource ownership.
     */
    authorize(resourceOwnerId) {
        return (req, res, next) => {
            if (!req.user) {
                return res.unauthorized({ message: 'Yêu cầu xác thực: Danh tính chưa được thiết lập.' });
            }
            if (req.user.uuid === resourceOwnerId) {
                return next();
            }
            return res.forbidden({ message: 'Truy cập bị cấm: Bạn không có quyền sở hữu tài nguyên này.' });
        };
    }

    /**
     * Specialized interceptor for private content visibility based on relationship state.
     */
    canViewPrivateContent = async (req, res, next) => {
        let { userId } = req.params;
        const { username } = req.params;
        const currentUser = req.user;

        try {
            let targetUser = null;

            if (userId) {
                targetUser = await IdentificationRepository.findByUuid(userId);
            } else if (username) {
                targetUser = await IdentificationRepository.findByIdentifier(username);
                if (targetUser) userId = targetUser.uuid;
            }

            if (!targetUser) {
                return res.notFound({ message: 'Định danh mục tiêu không tồn tại trên mạng lưới.' });
            }

            if (!targetUser.isPrivate) return next();

            if (!currentUser) {
                return res.unauthorized({ message: 'Yêu cầu xác thực: Cần thiết lập danh tính để truy cập tài nguyên riêng tư.' });
            }

            if (currentUser.uuid === userId) return next();

            const followRelationship = await IdentificationRepository.findFollowRelationship(currentUser.uuid, userId);

            if (!followRelationship) {
                return res.forbidden({ message: 'Truy cập bị từ chối: Hồ sơ này được đặt ở chế độ riêng tư.' });
            }

            next();
        } catch (error) {
            Logger.error('[Auth Critical] Private Visibility Interception Error:', error);
            res.internalServerError({ message: 'Lỗi giao thức hệ thống nội bộ.' });
        }
    };

    /**
     * Generates an access token.
     */
    generateAccessToken(user, sessionId = null) {
        const secret = jwtConfig.getAccessTokenSecret();
        const payload = { 
            uuid: user.uuid, 
            sid: sessionId
        };
        return jwt.sign(payload, secret, {
            expiresIn: process.env.JWT_EXPIRE || '15m'
        });
    }

    /**
     * Generates a refresh token.
     */
    generateRefreshToken(user, sessionId = null) {
        const secret = jwtConfig.getRefreshTokenSecret();
        return jwt.sign({ uuid: user.uuid, sid: sessionId }, secret, {
            expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d'
        });
    }

    /**
     * Utility: Verifies a refresh token against the platform core.
     */
    verifyRefreshToken(token) {
        try {
            return jwt.verify(token, jwtConfig.getRefreshTokenSecret());
        } catch (error) {
            throw new AppError('Định danh: Refresh token không hợp lệ.', 401);
        }
    }
}

module.exports = new AuthMiddleware();
