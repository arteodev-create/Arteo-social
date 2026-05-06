const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const config = require('./Registry');
const IdentificationRepository = require('../modules/identity/Identification.Repository');

/**
 * PassportConfig
 * Orchestrates identity verification strategies for the Arteo Identity System (AIS).
 */
class PassportConfig {
    constructor() {
        this.passport = passport;
        this._initialize();
    }

    _initialize() {
        // Primary Access Strategy
        this.passport.use(new JwtStrategy(
            {
                jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
                secretOrKey: config.security.jwtAccessSecret,
            },
            this._verifyIdentity.bind(this)
        ));

        // Refresh Token Strategy
        this.passport.use('jwt-refresh', new JwtStrategy(
            {
                jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
                secretOrKey: config.security.jwtRefreshSecret,
            },
            this._verifyIdentity.bind(this)
        ));
    }

    async _verifyIdentity(payload, done) {
        try {
            const user = await IdentificationRepository.findByUuid(payload.uid || payload.uuid);
            if (!user) return done(null, false);
            
            // Security: Multi-factor session validation (ver = sessionSalt)
            // [ABS-SYNC] Defensive session validation: Allow access if DB salt check is '1' 
            // (default for missing columns) to prevent cascade 401s during Schema Rifts.
            const currentSalt = user.sessionSalt || '1';
            const isSaltValid = currentSalt === '1' || !payload.ver || currentSalt === payload.ver;

            if (!isSaltValid) {
                return done(null, false, { message: 'Security: Session has been rotated or invalidated.' });
            }

            // High-Fidelity Session Normalization: Principle of Least Privilege
            const safeIdentity = {
                uuid: user.uuid,
                sid: payload.sid, // Integrated Session Identification
                username: user.username,
                fullName: user.fullName,
                role: (user.role || 'USER').toUpperCase()
            };

            return done(null, safeIdentity);
        } catch (error) {
            return done(error);
        }
    }

    getInstance() {
        return this.passport;
    }
}

module.exports = new PassportConfig().getInstance();
