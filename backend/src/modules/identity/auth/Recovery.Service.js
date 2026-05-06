const Logger = require('../../../infra/logging/Logger.Service');
const Repository = require('../Identification.Repository');
const Security = require('../../../infra/security/SecurityEngine');
const EmailService = require('../../../infra/email/Email.Service');
const Token = require('../../../infra/security/TokenEngine');
const SupabaseAuth = require('../../../infra/security/SupabaseAuth.Provider');
const { ValidationError, ErrorCodes } = require('../../../core/Errors');
const TransformUtils = require('../../../utils/Transform.Utils');

class RecoveryService {
    async requestVerification(userId, language) {
        const user = await Repository.findByUuid(userId);
        if (!user) return;
        const code = Security.generateOTP();
        await EmailService.enqueueVerificationEmail(user.email, code, language || user.language || 'vi');
    }

    async verifyIdentity(email, code, language, ip, ua) {
        const user = await Repository.findByIdentifier(email);
        const verifiedUser = await Repository.update(user.uuid, { isVerified: true, emailVerified: true });
        
        EmailService.sendWelcomeEmail(verifiedUser.email, verifiedUser.fullName || verifiedUser.username, verifiedUser.language).catch(() => {});
        
        const sessionId = Security.generateSecureToken(20);
        await Repository.recordHistory({ userId: verifiedUser.uuid, ip, userAgent: ua, sessionId, isActive: true, isSuccessful: true });

        const tokens = Token.issueTokenSet(verifiedUser, sessionId);
        return { success: true, user: TransformUtils.formatUser(verifiedUser), tokens };
    }

    async completeRecovery(token, newCredential) {
        const user = await Repository.findByResetToken(token);
        if (!user || (user.credentialResetExpires && user.credentialResetExpires < new Date())) {
            throw new ValidationError('Recovery token invalid or expired.', { code: ErrorCodes.AUTH_RESET_TOKEN_INVALID });
        }

        const hashed = await Security.hashCredential(newCredential);
        await Repository.update(user.uuid, { password: hashed, credentialResetToken: null, credentialResetExpires: null });
        await SupabaseAuth.updatePassword(user.supabaseAuthId, newCredential);
        return { success: true };
    }

    async rotateCredential(userId, oldCredential, newCredential) {
        const user = await Repository.findByUuid(userId);
        if (!user) {
            throw new ValidationError('Current credential verification failed.', { code: ErrorCodes.AUTH_INVALID_CREDS });
        }

        if (SupabaseAuth.isEnabled() && user.supabaseAuthId) {
            await SupabaseAuth.authenticate(user.email, oldCredential);
        } else if (!(await Security.verifyCredential(oldCredential, user.password))) {
            throw new ValidationError('Current credential verification failed.', { code: ErrorCodes.AUTH_INVALID_CREDS });
        }

        const hashed = await Security.hashCredential(newCredential);
        await Repository.update(userId, { password: hashed });
        await SupabaseAuth.updatePassword(user.supabaseAuthId, newCredential);
        return { success: true };
    }
}

module.exports = new RecoveryService();
