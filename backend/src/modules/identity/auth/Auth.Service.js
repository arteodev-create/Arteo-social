const Logger = require('../../../infra/logging/Logger.Service');
const Repository = require('../Identification.Repository');
const Security = require('../../../infra/security/SecurityEngine');
const Token = require('../../../infra/security/TokenEngine');
const CacheService = require('../../../infra/cache/Cache.Service');
const SupabaseAuth = require('../../../infra/security/SupabaseAuth.Provider');
const { AuthorizationError, ErrorCodes } = require('../../../core/Errors');
const TransformUtils = require('../../../utils/Transform.Utils');
const { DEFAULT_DOMAIN, parseHandle, isEmail } = require('../IdentityHandle');

class AuthService {
    async authenticate({ identifier, domain, credential, ip, ua }) {
        const parsed = isEmail(identifier) ? null : parseHandle(identifier, domain || DEFAULT_DOMAIN);
        const lookup = parsed ? `@${parsed.username}@${parsed.domain}` : identifier;
        let user = await Repository.findByIdentifier(lookup);
        
        if (!user) {
            throw new AuthorizationError('Mật mã định danh không trùng khớp với dữ liệu mạng lưới Arteo.', { code: ErrorCodes.AUTH_INVALID_CREDS });
        }

        // --- Enforcement: Chỉ cho phép đăng nhập nếu đã xác thực Email ---
        if (!user.emailVerified) {
            throw new AuthorizationError('Danh tính của bạn đang chờ được xác thực để kích hoạt đầy đủ đặc quyền.', { 
                code: ErrorCodes.AUTH_NOT_VERIFIED,
                email: user.email 
            });
        }

        if (SupabaseAuth.isEnabled() && user.supabaseAuthId) {
            await SupabaseAuth.authenticate(user.email, credential);
        } else if (!(await Security.verifyCredential(credential, user.password))) {
            await Repository.recordHistory({ 
                userId: user.uuid, 
                ipAddress: ip, 
                userAgent: ua, 
                isSuccessful: false, 
                failureReason: 'INVALID_CREDENTIALS' 
            });
            throw new AuthorizationError('Mật mã định danh không trùng khớp với dữ liệu mạng lưới Arteo.', { code: ErrorCodes.AUTH_INVALID_CREDS });
        }

        if (SupabaseAuth.isEnabled() && !user.supabaseAuthId) {
            Logger.info('[AuthService] Migrating legacy identity into Supabase Auth.', { userId: user.uuid, email: user.email });
            const supabaseAuthId = await SupabaseAuth.ensureUserForLegacyAccount(user, credential);
            if (supabaseAuthId) user = await Repository.update(user.uuid, { supabaseAuthId });
        }

        const sessionId = Security.generateSecureToken(20);
        await Repository.recordHistory({ 
            userId: user.uuid, 
            ipAddress: ip, 
            userAgent: ua, 
            sessionId, 
            isActive: true, 
            isSuccessful: true 
        });

        if (ip) await CacheService.del(`lockdown:LOGIN:${ip}`);

        const tokens = Token.issueTokenSet(user, sessionId);
        return { user: TransformUtils.formatUser(user), tokens };
    }

    async refreshToken(token) {
        const decoded = Token.verifyRefresh(token);
        if (!decoded) throw new AuthorizationError('Phiên làm việc không hợp lệ hoặc đã hết hạn truy cập.');

        const user = await Repository.findByUuid(decoded.uuid);
        const session = await Repository.findBySessionId(decoded.sid);

        if (!user || !session || !session.isActive) throw new AuthorizationError('Phiên danh tính đã bị thu hồi hoặc không còn hiệu lực trên mạng lưới.');

        const tokens = Token.issueTokenSet(user, decoded.sid);
        return { tokens, user: TransformUtils.formatUser(user) };
    }
}

module.exports = new AuthService();
