const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../../config');

/**
 * TokenEngine
 * Industry-standard JWT orchestration for the Arteo Identity System (AIS).
 * Purified for ABS v14.1 Platinum.
 */
class TokenEngine {
    /**
     * Issues a dual token set (Access + Refresh) for a verified identity.
     */
    static issueTokenSet(user, sessionId) {
        // [ABS-14.1] Lean payload for single-server auth efficiency
        const payload = {
            uuid: user.uuid,
            sub: user.username,
            sid: sessionId
        };

        const accessSecret = jwtConfig.getAccessTokenSecret();
        const refreshSecret = jwtConfig.getRefreshTokenSecret();

        const accessToken = jwt.sign(payload, accessSecret, {
            expiresIn: jwtConfig.expiresIn
        });

        // Refresh token contains minimal identifying info
        const refreshToken = jwt.sign({ 
            uuid: user.uuid, 
            sid: sessionId 
        }, refreshSecret, {
            expiresIn: '30d' 
        });

        return { accessToken, refreshToken };
    }

    /**
     * Verifies an access token and returns the decoded payload.
     */
    static verifyAccess(token) {
        try {
            return jwt.verify(token, jwtConfig.getAccessTokenSecret());
        } catch (error) {
            return null;
        }
    }

    /**
     * Verifies a refresh token.
     */
    static verifyRefresh(token) {
        try {
            return jwt.verify(token, jwtConfig.getRefreshTokenSecret());
        } catch (error) {
            return null;
        }
    }
}

module.exports = TokenEngine;
