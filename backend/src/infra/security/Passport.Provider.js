const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { config } = require('../../config');
const IdentificationRepository = require('../../modules/identity/Identification.Repository');

/**
 * PassportProvider
 * High-fidelity identity verification orchestration (AIS).
 */
class PassportProvider {
    constructor() {
        this.passport = passport;
        this._initialize();
    }

    _initialize() {
        // Access Strategy
        this.passport.use(new JwtStrategy(
            {
                jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
                secretOrKey: config.security.jwtAccessSecret,
            },
            this._verifyIdentity.bind(this)
        ));

        // Refresh Strategy
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
            
            const currentSalt = user.sessionSalt || '1';
            const isSaltValid = currentSalt === '1' || !payload.ver || currentSalt === payload.ver;

            if (!isSaltValid) return done(null, false, { message: 'Security: Session invalidated.' });

            return done(null, {
                uuid: user.uuid,
                sid: payload.sid,
                username: user.username,
                role: (user.role || 'USER').toUpperCase(),
                isAdmin: user.isAdmin
            });
        } catch (error) {
            return done(error);
        }
    }

    getInstance() {
        return this.passport;
    }
}

module.exports = new PassportProvider().getInstance();
